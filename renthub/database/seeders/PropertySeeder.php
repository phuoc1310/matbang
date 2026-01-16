<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy user đầu tiên hoặc tạo mới
        $user = User::first();

        $properties = [
            [
                'title' => 'Văn phòng cho thuê tại Quận 1 - 50m²',
                'description' => 'Văn phòng đẹp, hiện đại tại trung tâm Quận 1. Vị trí đắc địa, gần các trung tâm thương mại, ngân hàng. Phù hợp cho công ty vừa và nhỏ. Có đầy đủ tiện ích: điều hòa, internet, thang máy, bảo vệ 24/7.',
                'address' => '123 Nguyễn Huệ, Quận 1, TP.HCM',
                'price' => 15000000,
                'area' => 50,
                'type' => 'Văn phòng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Cửa hàng mặt tiền đường Lê Lợi - 30m²',
                'description' => 'Cửa hàng mặt tiền đẹp, vị trí đông khách. Phù hợp kinh doanh thời trang, mỹ phẩm, quà tặng. Có sẵn tủ kệ, bàn ghế. Giá thuê hợp lý, có thể thương lượng.',
                'address' => '456 Lê Lợi, Quận 1, TP.HCM',
                'price' => 25000000,
                'area' => 30,
                'type' => 'Cửa hàng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Mặt bằng cho thuê tại Quận 3 - 80m²',
                'description' => 'Mặt bằng rộng rãi, thoáng mát. Có thể sử dụng làm văn phòng, showroom, hoặc kho bãi. Có chỗ đậu xe, gần chợ, trường học. Giá thuê ưu đãi cho khách thuê dài hạn.',
                'address' => '789 Võ Văn Tần, Quận 3, TP.HCM',
                'price' => 20000000,
                'area' => 80,
                'type' => 'Đất',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Văn phòng cao cấp tại Quận 7 - 100m²',
                'description' => 'Văn phòng cao cấp trong tòa nhà hiện đại. View đẹp, nội thất sang trọng. Có phòng họp riêng, khu vực tiếp khách. Phù hợp cho công ty lớn, đại diện thương mại. Giá bao gồm điện nước, internet, bảo vệ.',
                'address' => '321 Nguyễn Thị Thập, Quận 7, TP.HCM',
                'price' => 35000000,
                'area' => 100,
                'type' => 'Văn phòng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Cửa hàng tiện lợi tại Quận 10 - 25m²',
                'description' => 'Cửa hàng nhỏ gọn, vị trí đẹp gần trường học, bệnh viện. Phù hợp kinh doanh tạp hóa, đồ ăn nhanh, cà phê takeaway. Có sẵn tủ lạnh, máy lạnh. Giá thuê phù hợp.',
                'address' => '654 3 Tháng 2, Quận 10, TP.HCM',
                'price' => 12000000,
                'area' => 25,
                'type' => 'Cửa hàng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Mặt bằng kinh doanh tại Quận Bình Thạnh - 60m²',
                'description' => 'Mặt bằng rộng, có thể ngăn chia thành nhiều phòng. Phù hợp mở quán cà phê, nhà hàng nhỏ, hoặc văn phòng. Có sân sau, chỗ đậu xe. Gần trung tâm thương mại, dễ tiếp cận.',
                'address' => '987 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
                'price' => 18000000,
                'area' => 60,
                'type' => 'Đất',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Văn phòng cho thuê tại Quận 2 - 70m²',
                'description' => 'Văn phòng mới, đẹp tại khu đô thị mới. Không gian hiện đại, yên tĩnh. Phù hợp cho startup, công ty công nghệ. Có đầy đủ tiện ích: wifi tốc độ cao, điều hòa, phòng họp chung.',
                'address' => '147 Nguyễn Duy Trinh, Quận 2, TP.HCM',
                'price' => 22000000,
                'area' => 70,
                'type' => 'Văn phòng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Showroom ô tô tại Quận Tân Bình - 200m²',
                'description' => 'Mặt bằng rộng lớn, phù hợp làm showroom, showroom xe, hoặc kho bãi. Có cửa lớn, sân rộng, chỗ đậu xe nhiều. Vị trí gần sân bay, đường lớn, dễ tiếp cận. Giá thuê ưu đãi.',
                'address' => '258 Trường Chinh, Tân Bình, TP.HCM',
                'price' => 50000000,
                'area' => 200,
                'type' => 'Đất',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Cửa hàng thời trang tại Quận 5 - 40m²',
                'description' => 'Cửa hàng đẹp, vị trí đông khách tại khu vực buôn bán sầm uất. Phù hợp bán quần áo, giày dép, phụ kiện. Có sẵn tủ kệ, gương, đèn chiếu sáng. Giá thuê hợp lý.',
                'address' => '369 Nguyễn Trãi, Quận 5, TP.HCM',
                'price' => 20000000,
                'area' => 40,
                'type' => 'Cửa hàng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
                ],
            ],
            [
                'title' => 'Văn phòng co-working tại Quận 4 - 120m²',
                'description' => 'Không gian làm việc chung hiện đại, đầy đủ tiện ích. Có bàn làm việc riêng, phòng họp, khu vực giải trí, cà phê miễn phí. Phù hợp cho freelancer, nhóm nhỏ. Giá thuê theo tháng hoặc theo ngày.',
                'address' => '741 Khánh Hội, Quận 4, TP.HCM',
                'price' => 30000000,
                'area' => 120,
                'type' => 'Văn phòng',
                'status' => 'approved',
                'is_visible' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
                ],
            ],
        ];

        foreach ($properties as $propertyData) {
            Property::create([
                'user_id' => $user?->id,
                'title' => $propertyData['title'],
                'description' => $propertyData['description'],
                'address' => $propertyData['address'],
                'price' => $propertyData['price'],
                'area' => $propertyData['area'],
                'type' => $propertyData['type'],
                'status' => $propertyData['status'],
                'is_visible' => $propertyData['is_visible'],
                'images' => $propertyData['images'],
            ]);
        }

        $this->command->info('Đã tạo 10 mặt bằng cho thuê với hình ảnh!');
    }
}
