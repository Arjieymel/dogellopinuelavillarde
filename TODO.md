# TODO - Total Sales Fix (Cancelled + Archived Exclusion)

- [ ] Update `server/app/Http/Controllers/Api/DashboardController.php` to exclude:
  - cancelled orders (`tbl_orders.status = 'Cancelled'`)
  - cancelled deliveries (`tbl_deliveries.delivery_status = 'Cancelled'`)
  - archived orders/deliveries (`is_archived = true`)
- [ ] Include only successfully completed/delivered orders in dashboard totals:
  - count orders whose `status IN ('Delivered','Completed')`
- [ ] Fix dashboard metrics that depend on totals:
  - `todaySales`
  - 7-day `salesChart`
- [ ] Fix dashboard lists/cards:
  - `recentOrders` should exclude cancelled/archived
  - `deliveryStatusSummary` should exclude cancelled/archived
- [ ] Keep response shape unchanged
- [x] Validate by running a quick API check (optional: run unit tests / build)

