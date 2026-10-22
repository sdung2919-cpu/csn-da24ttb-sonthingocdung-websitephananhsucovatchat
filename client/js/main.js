document.getElementById('reportForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('building', document.getElementById('building').value);
  formData.append('room', document.getElementById('room').value);
  formData.append('category_id', document.getElementById('category_id').value);
  formData.append('priority', document.getElementById('priority').value);
  formData.append('description', document.getElementById('description').value);
  
  const files = document.getElementById('images').files;
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      alert(`Gửi phản ánh thành công! Mã tra cứu của bạn là: #${data.code}`);
      document.getElementById('reportForm').reset();
    } else {
      alert('Có lỗi xảy ra: ' + data.message);
    }
  } catch (err) {
    console.error('Lỗi kết nối:', err);
    alert('Không thể kết nối đến máy chủ!');
  }
});