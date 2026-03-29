const { PurchaseOrder } = require('../src/models');
const { sequelize } = require('../src/config/database');

async function checkOrderImages() {
  try {
    await sequelize.authenticate();
    
    const order = await PurchaseOrder.findOne({
      where: { poNumber: 'PO20260001' },
      attributes: ['poNumber', 'status', 'receiptImages', 'rejectionImages', 'rejectedAt', 'receivedAt', 'notes']
    });
    
    if (order) {
      console.log('📋 Đơn hàng:', order.poNumber);
      console.log('📊 Trạng thái:', order.status);
      console.log('📅 Ngày từ chối:', order.rejectedAt);
      console.log('🚫 Rejection images:', order.rejectionImages);
      console.log('📸 Receipt images:', order.receiptImages);
      
      if (order.rejectedAt && order.rejectionImages) {
        console.log('✅ Nên hiển thị hình ảnh từ chối');
        try {
          const images = JSON.parse(order.rejectionImages);
          console.log('🖼️ Danh sách hình ảnh:', images);
        } catch (e) {
          console.log('❌ Lỗi parse rejection images');
        }
      } else {
        console.log('❌ Không đủ điều kiện hiển thị hình ảnh');
        console.log('   - Có rejectedAt?', !!order.rejectedAt);
        console.log('   - Có rejectionImages?', !!order.rejectionImages);
      }
    } else {
      console.log('❌ Không tìm thấy đơn hàng PO20260001');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

checkOrderImages();