// public/asset/js/listingService.js
// Service de xu ly CRUD operations cho listings

export async function createListing(listingData) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const data = {
      ...listingData,
      userId: currentUser.uid || '',
      userName: currentUser.displayName || currentUser.email || 'Chinh chu'
    };

    console.log('Sending to server:', data);

    const response = await fetch('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorMessage = 'Loi tao tin dang';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
}

export async function getListings(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.featured) params.append('featured', 'true');
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.businessType) params.append('businessType', filters.businessType);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);

    const url = `/api/listings${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Fetching listings from:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      let errorMessage = 'Loi lay danh sach tin dang';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        if (errorData.details) {
          console.error('Server error details:', errorData.details);
        }
      } catch (e) {
        const text = await response.text();
        console.error('Server error response:', text);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Received listings:', data.listings?.length || 0, 'items');
    return data.listings || [];
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

export async function getListingById(id) {
  try {
    const response = await fetch(`/api/listings/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Khong tim thay tin dang');
      }
      throw new Error('Loi lay tin dang');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
}

export async function updateListing(id, updateData) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const response = await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.uid || ''
      },
      body: JSON.stringify({
        ...updateData,
        changedBy: currentUser.uid || 'system'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Loi cap nhat tin dang');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

export async function deleteListing(id) {
  try {
    const response = await fetch(`/api/listings/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Loi xoa tin dang');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}

export async function getFeaturedListings(limit = 12) {
  try {
    const response = await fetch(`/api/listings?featured=true&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Loi lay danh sach tin noi bat');
    }

    const data = await response.json();
    return data.listings || [];
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    throw error;
  }
}

export async function toggleListingVisibility(id) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const response = await fetch(`/api/listings/${id}/toggle-visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.uid || ''
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Loi thay doi trang thai hien thi');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling visibility:', error);
    throw error;
  }
}

export async function updateListingStatus(id, status, reason = '') {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const response = await fetch(`/api/listings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.uid || ''
      },
      body: JSON.stringify({ status, reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Loi cap nhat trang thai');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
}

export async function getListingHistory(id) {
  try {
    const response = await fetch(`/api/listings/${id}/history`);
    
    if (!response.ok) {
      throw new Error('Loi lay lich su chinh sua');
    }

    const data = await response.json();
    return data.histories || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

export function normalizeListing(listing) {
  return {
    id: listing.id || '',
    ad_id: listing.id || '',
    title: listing.title || 'Khong co tieu de',
    images: Array.isArray(listing.images) ? listing.images : (listing.images ? [listing.images] : ['https://placehold.co/600x400?text=RentalSpace']),
    image: Array.isArray(listing.images) ? listing.images[0] : (listing.images || 'https://placehold.co/600x400?text=RentalSpace'),
    price: Number(listing.price) || 0,
    price_string: listing.price_string || (listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Thoa thuan'),
    area_m2: Number(listing.area) || 0,
    district: listing.district || '',
    ward: listing.ward || '',
    region: listing.region || '',
    street: '',
    address: listing.address || [listing.street, listing.ward, listing.district, listing.region].filter(Boolean).join(', '),
    seller: listing.userName || 'Chinh chu',
    rating: 0,
    lat: listing.lat || null,
    lng: listing.lng || null,
    date: listing.createdAt || new Date().toISOString(),
    category: listing.businessType || '',
    description: listing.description || '',
    businessType: listing.businessType || '',
    featured: listing.featured || false,
    status: listing.status || 'pending',
    isVisible: listing.isVisible !== undefined ? listing.isVisible : true,
    views: listing.views || 0
  };
}
