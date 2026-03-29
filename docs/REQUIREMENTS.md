# Yêu cầu chức năng hệ thống

## 1. Quản lý người dùng và phân quyền

### 1.1 Đăng nhập/Đăng xuất
- Đăng nhập bằng username/password
- Xác thực JWT token
- Quên mật khẩu và reset password
- Đăng xuất và vô hiệu hóa token

### 1.2 Quản lý tài khoản
- Tạo, sửa, xóa tài khoản người dùng
- Phân quyền theo role
- Quản lý thông tin cá nhân
- Đổi mật khẩu

## 2. Quản lý khách hàng (CRM)

### 2.1 Thông tin khách hàng
- Tạo mới khách hàng (tên, địa chỉ, email, SĐT, mã số thuế)
- Cập nhật thông tin khách hàng
- Phân loại khách hàng (VIP, thường, mới)
- Ghi chú và lịch sử tương tác

### 2.2 Quản lý liên hệ
- Danh sách người liên hệ của khách hàng
- Thông tin chi tiết người liên hệ
- Lịch sử giao dịch với khách hàng

## 3. Quản lý sản phẩm

### 3.1 Danh mục sản phẩm
- Danh sách sản phẩm điện tử
- Thông tin chi tiết (mã SP, tên, mô tả, đơn vị tính)
- Giá bán và giá vốn
- Hình ảnh sản phẩm

### 3.2 Tồn kho
- Số lượng tồn kho hiện tại
- Cảnh báo tồn kho thấp
- Lịch sử xuất nhập kho

## 4. Quản lý báo giá

### 4.1 Tạo báo giá
- Tạo báo giá cho khách hàng
- Chọn sản phẩm và số lượng
- Áp dụng chiết khấu
- Thời hạn hiệu lực báo giá

### 4.2 Theo dõi báo giá
- Danh sách báo giá (draft, sent, approved, rejected)
- Chuyển báo giá thành đơn hàng
- Lịch sử báo giá

## 5. Quản lý đơn hàng

### 5.1 Tạo đơn hàng
- Tạo đơn hàng từ báo giá hoặc mới
- Thông tin khách hàng và sản phẩm
- Tính tổng tiền, thuế, chiết khấu
- Điều khoản thanh toán

### 5.2 Xử lý đơn hàng
- Trạng thái đơn hàng (pending, confirmed, processing, shipped, delivered, cancelled)
- Phê duyệt đơn hàng
- Cập nhật trạng thái
- Hủy đơn hàng

### 5.3 Theo dõi đơn hàng
- Danh sách đơn hàng theo trạng thái
- Tìm kiếm và lọc đơn hàng
- Chi tiết đơn hàng
- Lịch sử thay đổi

## 6. Quản lý giao hàng

### 6.1 Lên kế hoạch giao hàng
- Tạo phiếu giao hàng từ đơn hàng
- Chọn nhân viên giao hàng
- Lịch trình giao hàng

### 6.2 Theo dõi giao hàng
- Trạng thái giao hàng (preparing, in_transit, delivered, failed)
- Cập nhật vị trí giao hàng
- Xác nhận giao hàng thành công
- Xử lý giao hàng thất bại

## 7. Quản lý thanh toán

### 7.1 Hóa đơn
- Tạo hóa đơn từ đơn hàng
- Xuất hóa đơn điện tử
- Danh sách hóa đơn

### 7.2 Công nợ
- Theo dõi công nợ khách hàng
- Lịch sử thanh toán
- Nhắc nhở thanh toán
- Báo cáo công nợ

## 8. Báo cáo và thống kê

### 8.1 Báo cáo doanh số
- Doanh số theo ngày/tuần/tháng/năm
- Doanh số theo sản phẩm
- Doanh số theo khách hàng
- Doanh số theo nhân viên sales

### 8.2 Báo cáo hiệu suất
- KPI nhân viên sales
- Tỷ lệ chuyển đổi từ báo giá sang đơn hàng
- Thời gian xử lý đơn hàng trung bình
- Tỷ lệ giao hàng thành công

### 8.3 Dashboard
- Tổng quan doanh số
- Đơn hàng cần xử lý
- Công nợ cần thu
- Biểu đồ xu hướng

## 9. Yêu cầu phi chức năng

### 9.1 Hiệu năng
- Thời gian tải trang < 2 giây
- Hỗ trợ 100+ người dùng đồng thời
- Database query optimization

### 9.2 Bảo mật
- Mã hóa mật khẩu (bcrypt)
- JWT authentication
- Role-based access control
- SQL injection prevention
- XSS protection

### 9.3 Khả năng mở rộng
- Kiến trúc modular
- API RESTful chuẩn
- Dễ dàng thêm module mới
- Tích hợp với hệ thống khác

### 9.4 Giao diện người dùng
- Responsive design
- Thân thiện với người dùng
- Hỗ trợ tiếng Việt
- Hướng dẫn sử dụng
