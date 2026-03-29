# Phân quyền người dùng

## Tổng quan các Role

| Role | Mô tả | Số lượng |
|------|-------|----------|
| Admin | Quản trị viên hệ thống | 1-2 |
| Sales Manager | Quản lý bán hàng | 2-5 |
| Sales Staff | Nhân viên bán hàng | 10-50 |
| Customer Service | Chăm sóc khách hàng | 5-10 |
| Warehouse Staff | Nhân viên kho | 5-10 |
| Accountant | Kế toán | 2-5 |
| Delivery Staff | Nhân viên giao hàng | 10-20 |
| Director | Giám đốc | 1-3 |

## Chi tiết phân quyền

### 1. Admin (Quản trị viên)

**Quyền hạn:**
- ✅ Toàn quyền truy cập hệ thống
- ✅ Quản lý tài khoản người dùng (CRUD)
- ✅ Phân quyền cho người dùng
- ✅ Cấu hình hệ thống
- ✅ Xem tất cả logs và audit trail
- ✅ Backup và restore database
- ✅ Quản lý danh mục sản phẩm
- ✅ Xem tất cả báo cáo

**Không được:**
- ❌ Không can thiệp vào quy trình nghiệp vụ (để các role chuyên môn xử lý)

---

### 2. Sales Manager (Quản lý bán hàng)

**Quyền hạn:**
- ✅ Xem toàn bộ đơn hàng, báo giá của team
- ✅ Phê duyệt báo giá có chiết khấu cao
- ✅ Phê duyệt đơn hàng giá trị lớn
- ✅ Phân bổ khách hàng cho sales staff
- ✅ Xem và quản lý thông tin tất cả khách hàng
- ✅ Tạo và chỉnh sửa đơn hàng
- ✅ Xem báo cáo doanh số toàn team
- ✅ Xem KPI của từng nhân viên
- ✅ Thiết lập mục tiêu doanh số
- ✅ Quản lý giá sản phẩm và chính sách chiết khấu

**Không được:**
- ❌ Xóa đơn hàng đã hoàn thành
- ❌ Quản lý tài khoản người dùng
- ❌ Thay đổi cấu hình hệ thống

---

### 3. Sales Staff (Nhân viên bán hàng)

**Quyền hạn:**
- ✅ Xem danh sách khách hàng được phân công
- ✅ Tạo và cập nhật thông tin khách hàng của mình
- ✅ Tạo báo giá cho khách hàng
- ✅ Tạo đơn hàng từ báo giá
- ✅ Cập nhật trạng thái đơn hàng của mình
- ✅ Xem lịch sử giao dịch khách hàng
- ✅ Xem tồn kho sản phẩm
- ✅ Xem báo cáo doanh số cá nhân
- ✅ Ghi chú và theo dõi khách hàng
- ✅ Áp dụng chiết khấu trong giới hạn cho phép

**Không được:**
- ❌ Xem đơn hàng của sales khác
- ❌ Phê duyệt đơn hàng
- ❌ Xóa đơn hàng
- ❌ Thay đổi giá sản phẩm
- ❌ Áp dụng chiết khấu vượt giới hạn (cần phê duyệt)
- ❌ Xem báo cáo toàn team

---

### 4. Customer Service (Chăm sóc khách hàng)

**Quyền hạn:**
- ✅ Xem thông tin tất cả khách hàng
- ✅ Cập nhật thông tin khách hàng
- ✅ Xem tất cả đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xử lý khiếu nại và yêu cầu hỗ trợ
- ✅ Ghi chú tương tác với khách hàng
- ✅ Xem lịch sử giao dịch
- ✅ Tạo ticket hỗ trợ
- ✅ Theo dõi giao hàng

**Không được:**
- ❌ Tạo đơn hàng mới
- ❌ Thay đổi giá hoặc chiết khấu
- ❌ Xóa đơn hàng
- ❌ Phê duyệt đơn hàng
- ❌ Xem báo cáo doanh số chi tiết

---

### 5. Warehouse Staff (Nhân viên kho)

**Quyền hạn:**
- ✅ Xem đơn hàng cần xuất kho
- ✅ Cập nhật trạng thái xuất kho
- ✅ Xem và cập nhật tồn kho
- ✅ Tạo phiếu xuất kho
- ✅ Kiểm tra số lượng sản phẩm
- ✅ Ghi nhận sản phẩm lỗi/hỏng
- ✅ Xem thông tin sản phẩm

**Không được:**
- ❌ Xem thông tin giá bán
- ❌ Xem thông tin khách hàng chi tiết
- ❌ Thay đổi đơn hàng
- ❌ Xem báo cáo doanh số
- ❌ Tạo hoặc sửa đơn hàng

---

### 6. Accountant (Kế toán)

**Quyền hạn:**
- ✅ Xem tất cả đơn hàng và giá trị
- ✅ Tạo và xuất hóa đơn
- ✅ Theo dõi công nợ khách hàng
- ✅ Ghi nhận thanh toán
- ✅ Xem lịch sử thanh toán
- ✅ Tạo báo cáo tài chính
- ✅ Xem báo cáo doanh thu
- ✅ Đối chiếu công nợ
- ✅ Nhắc nhở thanh toán

**Không được:**
- ❌ Tạo hoặc sửa đơn hàng
- ❌ Thay đổi giá sản phẩm
- ❌ Xóa hóa đơn đã xuất
- ❌ Quản lý khách hàng
- ❌ Phê duyệt đơn hàng

---

### 7. Delivery Staff (Nhân viên giao hàng)

**Quyền hạn:**
- ✅ Xem đơn hàng được phân công giao
- ✅ Xem thông tin giao hàng (địa chỉ, SĐT khách hàng)
- ✅ Cập nhật trạng thái giao hàng
- ✅ Xác nhận giao hàng thành công
- ✅ Báo cáo giao hàng thất bại
- ✅ Xem lịch trình giao hàng
- ✅ Chụp ảnh xác nhận giao hàng

**Không được:**
- ❌ Xem giá trị đơn hàng
- ❌ Xem thông tin thanh toán
- ❌ Thay đổi đơn hàng
- ❌ Xem đơn hàng không được phân công
- ❌ Xem báo cáo doanh số

---

### 8. Director (Giám đốc)

**Quyền hạn:**
- ✅ Xem tất cả dashboard và báo cáo
- ✅ Xem báo cáo doanh số tổng hợp
- ✅ Xem KPI toàn công ty
- ✅ Xem báo cáo tài chính
- ✅ Xem xu hướng và dự báo
- ✅ Xem hiệu suất từng phòng ban
- ✅ Export báo cáo

**Không được:**
- ❌ Thay đổi dữ liệu (chỉ xem - read-only)
- ❌ Tạo hoặc sửa đơn hàng
- ❌ Quản lý người dùng
- ❌ Cấu hình hệ thống

---

## Ma trận phân quyền

| Chức năng | Admin | Sales Manager | Sales Staff | Customer Service | Warehouse | Accountant | Delivery | Director |
|-----------|-------|---------------|-------------|------------------|-----------|------------|----------|----------|
| Quản lý user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý khách hàng | ✅ | ✅ | 🔸 | ✅ | ❌ | 🔸 | 🔸 | 🔸 |
| Tạo báo giá | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Phê duyệt báo giá | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tạo đơn hàng | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Xem đơn hàng | ✅ | ✅ | 🔸 | ✅ | 🔸 | ✅ | 🔸 | ✅ |
| Sửa đơn hàng | ✅ | ✅ | 🔸 | 🔸 | ❌ | ❌ | ❌ | ❌ |
| Xóa đơn hàng | ✅ | 🔸 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Quản lý kho | ✅ | 🔸 | 🔸 | ❌ | ✅ | ❌ | ❌ | 🔸 |
| Xuất hóa đơn | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Quản lý công nợ | ✅ | 🔸 | ❌ | ❌ | ❌ | ✅ | ❌ | 🔸 |
| Giao hàng | ✅ | 🔸 | ❌ | 🔸 | ❌ | ❌ | ✅ | ❌ |
| Báo cáo doanh số | ✅ | ✅ | 🔸 | ❌ | ❌ | ✅ | ❌ | ✅ |
| Dashboard | ✅ | ✅ | 🔸 | 🔸 | 🔸 | ✅ | 🔸 | ✅ |

**Chú thích:**
- ✅ Toàn quyền
- 🔸 Quyền hạn chế (chỉ xem hoặc chỉ dữ liệu của mình)
- ❌ Không có quyền
