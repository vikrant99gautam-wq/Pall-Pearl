import { supabase } from './supabase-config.js';

// Update this to the seller's actual WhatsApp number (include country code without + or 00)
const SELLER_WHATSAPP = "918077021923"; 

document.addEventListener('DOMContentLoaded', () => {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutTotal = document.getElementById('checkout-total');
    const btnWhatsappCheckout = document.getElementById('btn-whatsapp-checkout');
    
    // Load items for checkout (either from direct buy now or from cart)
    let checkoutCart = [];
    try {
        checkoutCart = JSON.parse(localStorage.getItem('checkout_cart')) || [];
    } catch (e) {
        checkoutCart = [];
    }

    if (checkoutCart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p class="text-on-surface-variant font-body-md py-4">No items to checkout.</p>';
        btnWhatsappCheckout.disabled = true;
        btnWhatsappCheckout.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    // Render items and calculate totals
    let totalAmount = 0;
    let itemsHtml = '';
    
    checkoutCart.forEach(item => {
        let price = parseFloat(String(item.price || '0').replace('₹', '').replace(/,/g, '')) || 0;
        let itemTotal = price * (item.quantity || 1);
        totalAmount += itemTotal;
        
        let details = [];
        if(item.size) details.push(`Size: ${item.size}`);
        if(item.color) details.push(`Color: ${item.color}`);
        if(item.sleeve) details.push(`Style: ${item.sleeve}`);
        const detailsStr = details.length > 0 ? `<p class="text-xs text-on-surface-variant mt-1">${details.join(' | ')}</p>` : '';

        const imgUrl = item.image ? item.image.split(',')[0].trim() : 'https://placehold.co/100x120/f1dee1/a43560?text=P+&+P';

        itemsHtml += `
            <div class="flex gap-4 items-start pb-4 mb-4 border-b border-outline-variant/30 last:border-0 last:pb-0 last:mb-0">
                <img src="${imgUrl}" alt="${item.name}" class="w-16 h-20 object-cover rounded-md bg-surface-container-highest flex-shrink-0">
                <div class="flex-grow min-w-0">
                    <h4 class="font-body-md text-on-surface font-medium truncate">${item.name}</h4>
                    ${detailsStr}
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-sm text-on-surface-variant">Qty: ${item.quantity}</span>
                        <span class="font-medium text-primary">₹${itemTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        `;
    });

    checkoutItemsContainer.innerHTML = itemsHtml;
    
    let finalTotal = totalAmount + 60; // Initial total with shipping
    const subtotalFormatted = '₹' + totalAmount.toLocaleString('en-IN');
    checkoutSubtotal.textContent = subtotalFormatted;
    checkoutTotal.textContent = '₹' + finalTotal.toLocaleString('en-IN');

    // Coupon Logic
    let appliedCoupon = null;
    let discountAmount = 0;
    
    const btnShowCoupon = document.getElementById('btn-show-coupon');
    const couponInputContainer = document.getElementById('coupon-input-container');
    const btnApplyCoupon = document.getElementById('btn-apply-coupon');
    const couponCodeInput = document.getElementById('coupon-code');
    const couponMessage = document.getElementById('coupon-message');
    const discountRow = document.getElementById('discount-row');
    const discountAmountDisplay = document.getElementById('discount-amount');
    const appliedCouponNameDisplay = document.getElementById('applied-coupon-name');

    if (btnShowCoupon) {
        btnShowCoupon.addEventListener('click', () => {
            couponInputContainer.classList.toggle('hidden');
        });
    }

    if (btnApplyCoupon) {
        btnApplyCoupon.addEventListener('click', async () => {
            const code = couponCodeInput.value.trim().toUpperCase();
            if (!code) return;

            btnApplyCoupon.disabled = true;
            btnApplyCoupon.textContent = '...';
            couponMessage.classList.add('hidden');

            try {
                const { data, error } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('code', code)
                    .eq('is_active', true)
                    .single();

                if (error || !data) {
                    couponMessage.textContent = 'Invalid or expired coupon code.';
                    couponMessage.classList.remove('hidden', 'text-primary');
                    couponMessage.classList.add('text-error');
                    
                    // Reset discount
                    appliedCoupon = null;
                    discountAmount = 0;
                    finalTotal = totalAmount + 60;
                    discountRow.classList.add('hidden');
                    discountRow.classList.remove('flex');
                } else {
                    // Valid Coupon
                    appliedCoupon = data;
                    discountAmount = (totalAmount * (data.discount_percentage / 100));
                    finalTotal = (totalAmount - discountAmount) + 60;
                    
                    couponMessage.textContent = `${data.discount_percentage}% discount applied!`;
                    couponMessage.classList.remove('hidden', 'text-error');
                    couponMessage.classList.add('text-primary');
                    
                    appliedCouponNameDisplay.textContent = data.code;
                    discountAmountDisplay.textContent = '-₹' + discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                    discountRow.classList.remove('hidden');
                    discountRow.classList.add('flex');
                }
                
                checkoutTotal.textContent = '₹' + finalTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                
            } catch (e) {
                console.error("Coupon error", e);
            } finally {
                btnApplyCoupon.disabled = false;
                btnApplyCoupon.textContent = 'Apply';
            }
        });
    }

    // Handle WhatsApp Checkout
    btnWhatsappCheckout.addEventListener('click', async (e) => {
        e.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const pincode = document.getElementById('pincode').value.trim();

        // Basic validation
        if (!fullName || !phone || !address || !city || !state || !pincode) {
            alert('Please fill in all required fields (marked with *).');
            return;
        }

        // Change button state
        const originalBtnText = btnWhatsappCheckout.innerHTML;
        btnWhatsappCheckout.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Processing...';
        btnWhatsappCheckout.disabled = true;

        try {
            // Bundle shipping info into the items array for the admin dashboard
            const itemsWithShipping = [...checkoutCart, {
                type: 'shipping_info',
                phone: phone,
                address: address,
                city: city,
                state: state,
                pincode: pincode
            }];

            if (appliedCoupon) {
                itemsWithShipping.push({
                    type: 'discount_info',
                    code: appliedCoupon.code,
                    percentage: appliedCoupon.discount_percentage,
                    amount: discountAmount
                });
            }

            // Try to get logged in user
            let customerEmail = email || 'N/A';
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.email) {
                    customerEmail = user.email;
                }
            } catch (e) {
                console.warn("Could not get auth user for checkout", e);
            }

            // Save to Supabase
            const { data: orderData, error } = await supabase
                .from('orders')
                .insert([
                    {
                        customername: fullName,
                        customeremail: customerEmail,
                        total: finalTotal,
                        items: JSON.stringify(itemsWithShipping),
                        status: 'Pending'
                    }
                ])
                .select();

            if (error) throw error;
            
            const orderId = orderData[0].id;

            // Save locally for quick invoice access
            const localOrderData = {
                id: orderId,
                customer: { fullName, phone, email, address, city, state, pincode },
                items: checkoutCart,
                discount: appliedCoupon ? { code: appliedCoupon.code, amount: discountAmount, percentage: appliedCoupon.discount_percentage } : null,
                totalAmount: finalTotal,
                date: new Date().toISOString()
            };
            localStorage.setItem('latest_invoice', JSON.stringify(localOrderData));

            // Build short WhatsApp Message
            let message = '\uD83C\uDF38 *Namaste from Pall & Pearl!* \u2728\n\n';
            message += 'Thank you for shopping with us! \uD83D\uDC96\n';
            message += 'I have placed a new order. Please find my order invoice here:\n\n';
            
            // Assuming site runs on the current origin
            const invoiceLink = window.location.origin + '/invoice.html?id=' + orderId;
            message += `\uD83D\uDC49 ${invoiceLink}\n\n`;
            message += '*The seller will contact you soon regarding the payment and shipping details.*\n\n';
            message += 'Chatpate Tops for Chatpati Girls \u2728';

            // Encode and open WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP}?text=${encodedMessage}`;
            
            // Clear carts
            localStorage.removeItem('checkout_cart');
            localStorage.setItem('pall_and_pearl_cart', JSON.stringify([]));

            // Open Whatsapp
            window.open(whatsappUrl, '_blank');
            
            // Redirect to order details page
            setTimeout(() => {
                window.location.href = `order-details.html?id=${orderId}`;
            }, 1000);
            
        } catch (err) {
            console.error("Order error:", err);
            alert("There was an error processing your order. Please try again.");
            btnWhatsappCheckout.innerHTML = originalBtnText;
            btnWhatsappCheckout.disabled = false;
        }
    });
});
