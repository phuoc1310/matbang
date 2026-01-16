<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\PropertyHistory;
use App\Services\AutoModerationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    protected $moderationService;

    public function __construct(AutoModerationService $moderationService)
    {
        $this->moderationService = $moderationService;
    }

    public function indexView()
    {
        $properties = Property::where('status', 'approved')
            ->where('is_visible', 1)
            ->latest()
            ->take(6)
            ->get();

        return view('trangchu', compact('properties'));
    }

    /**
     * Hiển thị form đăng tin
     */
    public function create()
    {
        return view('property.create');
    }

    /**
     * Lưu tin đăng mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string|max:500',
            'price' => 'required|numeric|min:0',
            'area' => 'nullable|numeric|min:0',
            'type' => 'required|string|in:Đất,Văn phòng,Cửa hàng',
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề',
            'description.required' => 'Vui lòng nhập mô tả',
            'address.required' => 'Vui lòng nhập địa chỉ',
            'price.required' => 'Vui lòng nhập giá',
            'price.numeric' => 'Giá phải là số',
            'price.min' => 'Giá phải lớn hơn 0',
            'area.numeric' => 'Diện tích phải là số',
            'type.required' => 'Vui lòng chọn loại hình',
            'type.in' => 'Loại hình không hợp lệ',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $property = Property::create([
            'user_id' => Auth::id() ?? null,
            'title' => $request->title,
            'description' => $request->description,
            'address' => $request->address,
            'price' => $request->price,
            'area' => $request->area,
            'type' => $request->type,
            'status' => 'pending',
            'is_visible' => 1,
        ]);

        // Lưu lịch sử tạo mới
        PropertyHistory::create([
            'property_id' => $property->id,
            'changed_by' => Auth::id() ?? null,
            'old_data' => null,
            'new_data' => $property->toArray(),
            'reason' => 'Tạo tin đăng mới',
        ]);

        // Gửi webhook đến n8n (async, không block response)
        try {
            $this->moderationService->sendToN8n($property, 'property.created');
        } catch (\Exception $e) {
            // Log error nhưng không làm gián đoạn flow
            \Log::error('Failed to send webhook to n8n', [
                'property_id' => $property->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Tự động kiểm duyệt nếu được bật
        $autoModerate = config('moderation.auto_approve', false);
        if ($autoModerate) {
            try {
                $moderationResult = $this->moderationService->moderateProperty($property);
                if ($moderationResult['auto_processed'] && $moderationResult['status'] !== 'pending') {
                    $oldData = $property->toArray();
                    $property->update([
                        'status' => $moderationResult['status'],
                        'is_visible' => $moderationResult['status'] === 'approved' ? 1 : 0,
                    ]);

                    PropertyHistory::create([
                        'property_id' => $property->id,
                        'changed_by' => null,
                        'old_data' => $oldData,
                        'new_data' => $property->toArray(),
                        'reason' => $moderationResult['reason'],
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Auto moderation failed', [
                    'property_id' => $property->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Nếu user đã đăng nhập, redirect đến trang quản lý
        // Nếu chưa đăng nhập, redirect về trang chủ với thông báo
        if (Auth::check()) {
            return redirect()->route('property.manage')
                ->with('success', 'Đăng tin thành công! Tin của bạn đang chờ duyệt.');
        } else {
            return redirect()->route('home')
                ->with('success', 'Đăng tin thành công! Tin của bạn đang chờ duyệt. Vui lòng đăng nhập để quản lý tin đăng của bạn.');
        }
    }

    /**
     * Tìm kiếm mặt bằng
     */
    public function search(Request $request)
    {
        $query = Property::where('status', 'approved')
            ->where('is_visible', 1);

        if ($request->keyword) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->keyword . '%')
                  ->orWhere('address', 'like', '%' . $request->keyword . '%')
                  ->orWhere('description', 'like', '%' . $request->keyword . '%');
            });
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->price) {
            $prices = explode('-', $request->price);
            if (count($prices) == 2) {
                $query->whereBetween('price', [(float)$prices[0], (float)$prices[1]]);
            }
        }

        if ($request->area) {
            $areas = explode('-', $request->area);
            if (count($areas) == 2) {
                $query->whereBetween('area', [(float)$areas[0], (float)$areas[1]]);
            }
        }

        $properties = $query->latest()->paginate(12);

        return view('timkiem', compact('properties'));
    }

    /**
     * Chi tiết tin đăng
     */
    public function detail($id)
    {
        try {
            $property = Property::findOrFail($id);
            
            // Cho phép xem nếu:
            // 1. Đã được duyệt và visible (public) - ai cũng xem được
            // 2. Hoặc là chủ sở hữu - xem được tin của mình
            // 3. Hoặc là admin - xem được tất cả
            $userId = Auth::id();
            $isOwner = $userId && $property->user_id == $userId;
            $isAdmin = $userId && Auth::user() && Auth::user()->email === 'admin@test.com';
            $isPublic = $property->status === 'approved' && $property->is_visible;
            
            // Nếu không public, chỉ cho phép owner hoặc admin xem
            if (!$isPublic) {
                if (!$isOwner && !$isAdmin) {
                    abort(404, 'Tin đăng không tồn tại hoặc đã bị ẩn');
                }
            }

            return view('chitet', compact('property'));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Tin đăng không tồn tại');
        }
    }

    /**
     * Quản lý tin đăng của user
     */
    public function manage()
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return redirect()->route('home')
                ->with('error', 'Vui lòng đăng nhập để quản lý tin đăng của bạn.');
        }
        
        $properties = Property::where('user_id', $userId)
            ->latest()
            ->get();

        return view('property.manage', compact('properties'));
    }

    /**
     * Hiển thị form chỉnh sửa
     */
    public function edit($id)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return redirect()->route('home')
                ->with('error', 'Vui lòng đăng nhập để chỉnh sửa tin đăng.');
        }

        $property = Property::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        return view('property.edit', compact('property'));
    }

    /**
     * Cập nhật tin đăng
     */
    public function update(Request $request, $id)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return redirect()->route('home')
                ->with('error', 'Vui lòng đăng nhập để cập nhật tin đăng.');
        }

        $property = Property::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string|max:500',
            'price' => 'required|numeric|min:0',
            'area' => 'nullable|numeric|min:0',
            'type' => 'required|string|in:Đất,Văn phòng,Cửa hàng',
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề',
            'description.required' => 'Vui lòng nhập mô tả',
            'address.required' => 'Vui lòng nhập địa chỉ',
            'price.required' => 'Vui lòng nhập giá',
            'price.numeric' => 'Giá phải là số',
            'price.min' => 'Giá phải lớn hơn 0',
            'area.numeric' => 'Diện tích phải là số',
            'type.required' => 'Vui lòng chọn loại hình',
            'type.in' => 'Loại hình không hợp lệ',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $oldData = $property->toArray();

        $property->update([
            'title' => $request->title,
            'description' => $request->description,
            'address' => $request->address,
            'price' => $request->price,
            'area' => $request->area,
            'type' => $request->type,
            'status' => 'pending', // Reset về pending sau khi chỉnh sửa
        ]);

        // Lưu lịch sử thay đổi
        PropertyHistory::create([
            'property_id' => $property->id,
            'changed_by' => Auth::id() ?? null,
            'old_data' => $oldData,
            'new_data' => $property->toArray(),
            'reason' => 'Cập nhật thông tin',
        ]);

        return redirect()->route('property.manage')
            ->with('success', 'Cập nhật tin đăng thành công!');
    }

    /**
     * Xóa tin đăng
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return redirect()->route('home')
                ->with('error', 'Vui lòng đăng nhập để xóa tin đăng.');
        }

        $property = Property::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $property->delete();

        return redirect()->route('property.manage')
            ->with('success', 'Xóa tin đăng thành công!');
    }

    /**
     * Bật/tắt hiển thị tin đăng
     */
    public function toggle($id)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return redirect()->route('home')
                ->with('error', 'Vui lòng đăng nhập để thay đổi trạng thái tin đăng.');
        }

        $property = Property::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $oldData = $property->toArray();
        $property->update([
            'is_visible' => !$property->is_visible
        ]);

        // Lưu lịch sử thay đổi
        PropertyHistory::create([
            'property_id' => $property->id,
            'changed_by' => $userId,
            'old_data' => $oldData,
            'new_data' => $property->toArray(),
            'reason' => $property->is_visible ? 'Hiển thị tin đăng' : 'Ẩn tin đăng',
        ]);

        return redirect()->route('property.manage')
            ->with('success', $property->is_visible ? 'Tin đăng đã được hiển thị' : 'Tin đăng đã được ẩn');
    }

    /**
     * Danh sách tất cả mặt bằng cho thuê
     */
    public function list()
    {
        $properties = Property::where('status', 'approved')
            ->where('is_visible', 1)
            ->latest()
            ->paginate(12);

        return view('pages.thue-mat-bang', compact('properties'));
    }

    /**
     * Trang cho thuê mặt bằng
     */
    public function choThue()
    {
        $properties = Property::where('status', 'approved')
            ->where('is_visible', 1)
            ->latest()
            ->paginate(12);

        return view('pages.cho-thue', compact('properties'));
    }

    /**
     * Trang quản lý trạng thái tin đăng (Admin)
     */
    public function adminIndex(Request $request)
    {
        $query = Property::with('user')->latest();

        // Lọc theo trạng thái
        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            // Mặc định hiển thị tin chờ duyệt
            $query->where('status', 'pending');
        }

        $properties = $query->paginate(15);

        // Thống kê
        $stats = [
            'pending' => Property::where('status', 'pending')->count(),
            'approved' => Property::where('status', 'approved')->count(),
            'rejected' => Property::where('status', 'rejected')->count(),
        ];

        return view('admin.properties', compact('properties', 'stats'));
    }

    /**
     * Phê duyệt tin đăng
     */
    public function approve(Request $request, $id)
    {
        $property = Property::findOrFail($id);
        $oldData = $property->toArray();
        $oldStatus = $property->status;

        $property->update([
            'status' => 'approved',
            'is_visible' => 1,
        ]);

        // Lưu lịch sử
        PropertyHistory::create([
            'property_id' => $property->id,
            'changed_by' => Auth::id() ?? null,
            'old_data' => $oldData,
            'new_data' => $property->toArray(),
            'reason' => $request->reason ?? 'Admin phê duyệt tin đăng',
        ]);

        return redirect()->route('admin.properties')
            ->with('success', "Đã phê duyệt tin đăng #{$property->id}: {$property->title}");
    }

    /**
     * Từ chối tin đăng
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ], [
            'reason.required' => 'Vui lòng nhập lý do từ chối',
        ]);

        $property = Property::findOrFail($id);
        $oldData = $property->toArray();

        $property->update([
            'status' => 'rejected',
            'is_visible' => 0,
        ]);

        // Lưu lịch sử
        PropertyHistory::create([
            'property_id' => $property->id,
            'changed_by' => Auth::id() ?? null,
            'old_data' => $oldData,
            'new_data' => $property->toArray(),
            'reason' => 'Từ chối: ' . $request->reason,
        ]);

        return redirect()->route('admin.properties')
            ->with('success', "Đã từ chối tin đăng #{$property->id}: {$property->title}");
    }

    /**
     * Xem lịch sử chỉnh sửa của tin đăng
     */
    public function history($id)
    {
        $property = Property::with('user')->findOrFail($id);
        $histories = PropertyHistory::where('property_id', $id)
            ->with('changedByUser')
            ->latest()
            ->get();

        return view('property.history', compact('property', 'histories'));
    }
}
