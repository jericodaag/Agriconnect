// utils/receiptGenerator.js
import moment from 'moment';

export const generateReceipt = (withdrawData) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 800;
    
    // Set background and border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Add logo/header area
    ctx.fillStyle = '#059473';
    ctx.fillRect(10, 10, canvas.width - 20, 100);
    
    // Add header text
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('AGRICONNECT', canvas.width / 2, 65);
    
    // Add receipt type
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('WITHDRAWAL RECEIPT', canvas.width / 2, 150);
    
    // Add separator line
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(canvas.width - 50, 170);
    ctx.strokeStyle = '#059473';
    ctx.stroke();
    
    // Add receipt details
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    
    const details = [
        { label: 'Date:', value: moment(withdrawData.createdAt).format('MMMM D, YYYY, h:mm A') },
        { label: 'Reference No:', value: withdrawData._id },
        { label: 'Amount:', value: `₱${withdrawData.amount.toLocaleString('en-PH')}` },
        { label: 'Payment Method:', value: withdrawData.payment_method.toUpperCase() },
        { label: 'Status:', value: withdrawData.status },
    ];

    let yPos = 220;
    details.forEach(detail => {
        ctx.fillStyle = '#666666';
        ctx.fillText(detail.label, 50, yPos);
        ctx.fillStyle = '#000000';
        ctx.fillText(detail.value, 200, yPos);
        yPos += 40;
    });

    if (withdrawData.payment_method === 'cod' && withdrawData.withdrawalCode) {
        ctx.fillStyle = '#059473';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Withdrawal Code:', 50, yPos + 40);
        ctx.fillText(withdrawData.withdrawalCode, 200, yPos + 40);
    }
    
    // Add footer
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for using Agriconnect!', canvas.width / 2, canvas.height - 100);
    ctx.fillText('This is an electronic receipt.', canvas.width / 2, canvas.height - 70);
    
    return canvas.toDataURL('image/png');
};

export const generateWithdrawalCode = (withdrawData) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 400;
    
    // Set background and border
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#059473';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Add header
    ctx.fillStyle = '#059473';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WITHDRAWAL CODE', canvas.width / 2, 60);
    
    // Add code in a box
    const codeBoxY = 120;
    ctx.strokeStyle = '#059473';
    ctx.strokeRect(100, codeBoxY, canvas.width - 200, 80);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#059473';
    ctx.fillText(withdrawData.withdrawalCode, canvas.width / 2, codeBoxY + 50);
    
    // Add details
    ctx.font = '18px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`Amount: ₱${withdrawData.amount.toLocaleString('en-PH')}`, canvas.width / 2, codeBoxY + 120);
    ctx.fillText(`Date: ${moment(withdrawData.createdAt).format('MMMM D, YYYY')}`, canvas.width / 2, codeBoxY + 150);
    ctx.fillText(`Reference: ${withdrawData._id}`, canvas.width / 2, codeBoxY + 180);
    
    // Add footer
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Please keep this code safe - you\'ll need it for verification', canvas.width / 2, canvas.height - 40);
    
    return canvas.toDataURL('image/png');
};

export const downloadReceipt = (withdrawData) => {
    const receiptImage = generateReceipt(withdrawData);
    const a = document.createElement('a');
    a.href = receiptImage;
    a.download = `withdrawal-receipt-${moment(withdrawData.createdAt).format('YYYY-MM-DD')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const downloadWithdrawalCode = (withdrawData) => {
    const codeImage = generateWithdrawalCode(withdrawData);
    const a = document.createElement('a');
    a.href = codeImage;
    a.download = `withdrawal-code-${moment(withdrawData.createdAt).format('YYYY-MM-DD')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};