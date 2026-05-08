# TODO

## Deliveries Archive Action
- [x] Update `client/src/pages/Deliveries/DeliveriesMainPage.tsx`:
  - [x] Add Archive modal state (open/selected/loading)
  - [x] Add handler to call `DeliveryService.archiveDelivery` and refresh deliveries
  - [x] Add Archive button visible only for `delivery_status === "Delivered"`
  - [x] Show confirmation modal and toast message on success/failure
- [x] Run TypeScript / lint (if available) and quick sanity check


