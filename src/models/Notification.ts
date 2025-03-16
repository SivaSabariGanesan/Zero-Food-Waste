export interface Notification {
    _id: string;
    recipient: string;
    type: 
      | 'food_listed' 
      | 'food_booked' 
      | 'food_booked_ngo' 
      | 'food_claimed' 
      | 'food_claimed_for_orphanage'
      | 'food_completed' 
      | 'food_delivery_completed'
      | 'food_expired' 
      | 'food_cancelled' 
      | 'food_claim_cancelled' 
      | 'food_claim_cancelled_orphanage'
      | 'food_booking_cancelled'
      | 'food_available_for_claim'
      | 'account_verified' 
      | 'account_rejected' 
      | 'message_received';
    title: string;
    message: string;
    relatedFood?: string;
    relatedUser?: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
  }