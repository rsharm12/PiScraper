interface IAvailability {
  availability_status: string;
}

interface ITargetStoreOptions {
  location_address: string;
  location_id: string;
  ship_to_store: IAvailability;
}

interface ITargetFulfillment {
  is_out_of_stock_in_all_store_locations: boolean;
  product_id: string;
  scheduled_delivery: IAvailability;
  shipping_options: IAvailability;
  store_options: ITargetStoreOptions[];
}

interface ITargetObject {
  fulfillment: ITargetFulfillment;
  notify_me_enabled: boolean;
  tcin: string;
}

interface ITargetProduct {
  product: ITargetObject;
}

export interface ITargetData {
  data: ITargetProduct;
}
