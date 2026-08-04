import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import nodemailer from "nodemailer"; 

// 1. Nodemailer Transporter Setup (Gmail configuration)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// 2. Apni Email Configuration set karein
const OWNER_EMAIL = "suiikala.creations@gmail.com"; 

const AddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  country: z.string().default("India"),
});

const ItemSchema = z.object({
  product_slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
  image: z.string().optional().nullable(),
});

const OrderInputSchema = z.object({
  items: z.array(ItemSchema).min(1),
  shipping_address: AddressSchema,
  billing_same: z.boolean().default(true),
  billing_address: AddressSchema.optional().nullable(),
  shipping_method: z.enum(["standard", "express"]).default("standard"),
  coupon_code: z.string().optional().nullable(),
  payment_method: z.enum(["cod", "razorpay"]),
  notes: z.string().optional().nullable(),
});

const TAX_RATE = 0.03; // 3% GST placeholder
const SHIPPING = { standard: 79, express: 199 };
const FREE_SHIPPING_MIN = 999;

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrderInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);

    let discount = 0;
    let couponCode: string | null = null;
    if (data.coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("code, discount_percent, min_subtotal, active")
        .eq("code", data.coupon_code.toUpperCase())
        .eq("active", true)
        .maybeSingle();
      if (coupon && subtotal >= coupon.min_subtotal) {
        discount = Math.round((subtotal * coupon.discount_percent) / 100);
        couponCode = coupon.code;
      }
    }

    const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING[data.shipping_method];
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * TAX_RATE);
    const total = taxable + shipping + tax;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        coupon_code: couponCode,
        payment_method: data.payment_method,
        payment_status: "pending",
        status: "order_placed",
        shipping_address: data.shipping_address,
        notes: data.notes ?? null,
      })
      .select("id, order_number, total")
      .single();

    if (error || !order) throw new Error(error?.message || "Failed to place order");

    const { error: itemsErr } = await supabase.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_slug: i.product_slug,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image ?? null,
      })),
    );
    if (itemsErr) throw new Error(itemsErr.message);

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "order_placed",
      note: "Order placed via checkout",
    });

    
    try {
      // Current customer ka email context session se fetch kiya (permission issue se bachne ke liye safe method)
      const { data: { user } } = await supabase.auth.getUser();
      const customerEmail = user?.email;

      // Items list ko email format table me map kiya
      const itemsHtml = data.items
        .map(
          (it) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; font-size: 14px; color: #334155;">${it.name} <strong>(x${it.qty})</strong></td>
          <td style="padding: 12px 0; font-size: 14px; color: #0f172a; font-family: monospace; text-align: right;">₹${(it.price * it.qty).toLocaleString("en-IN")}</td>
        </tr>
      `
        )
        .join("");

      // Beautiful Custom HTML Email Template
      const emailContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h1 style="color: #064E3B; font-style: italic; text-align: center; margin: 0; font-size: 28px;">Suiikala</h1>
          <p style="text-align: center; font-size: 10px; letter-spacing: 3px; color: #64748b; text-transform: uppercase; margin: 4px 0 20px 0;">Handmade With Love</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Order Details (#${order.order_number})</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Hi <strong>${data.shipping_address.name}</strong>, thank you for choosing Suiikala! We have successfully registered your order.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="border-bottom: 2px solid #064E3B; color: #064E3B; font-size: 12px; text-transform: uppercase; font-weight: 700;">
                <th style="padding-bottom: 8px; text-align: left;">Product</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; background-color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 14px; color: #334155;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Subtotal:</span> <span style="font-family: monospace;">₹${subtotal.toLocaleString("en-IN")}</span>
            </div>
            ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #10b981;">
              <span>Discount Applied:</span> <span style="font-family: monospace;">-₹${discount.toLocaleString("en-IN")}</span>
            </div>` : ""}
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Shipping Charge:</span> <span style="font-family: monospace;">₹${shipping.toLocaleString("en-IN")}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Estimated GST (3%):</span> <span style="font-family: monospace;">₹${tax.toLocaleString("en-IN")}</span>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 8px 0;" />
            <div style="display: flex; justify-content: space-between; color: #064E3B; font-size: 16px; font-weight: bold;">
              <span>Total Paid Amount:</span> <span style="font-family: monospace;">₹${total.toLocaleString("en-IN")}</span>
            </div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Payment via: ${data.payment_method.toUpperCase()}</p>
          </div>

          <div style="margin-top: 24px; font-size: 13px; color: #475569; line-height: 1.5; background-color: #fffdfa; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px;">
            <strong style="color: #92400e;">Delivery Address:</strong><br/>
            ${data.shipping_address.name}<br/>
            ${data.shipping_address.line1}${data.shipping_address.line2 ? `, ${data.shipping_address.line2}` : ""}<br/>
            ${data.shipping_address.city}, ${data.shipping_address.state} - ${data.shipping_address.pincode}<br/>
            Contact Number: ${data.shipping_address.phone}
          </div>
        </div>
      `;

      // 3. Customer Email Trigger via Nodemailer
      if (customerEmail) {
        await transporter.sendMail({
          from: `"Suiikala" <${process.env.GMAIL_USER}>`,
          to: customerEmail,
          subject: `Order Confirmed! Suiikala #${order.order_number}`,
          html: emailContent,
        });
      }

      // 4. Store Owner Notification Email Trigger via Nodemailer
      await transporter.sendMail({
        from: `"Suiikala" <${process.env.GMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `Alert: New Order Placed #${order.order_number}`,
        html: `<h3 style="font-family:sans-serif; margin-left: 20px;">New order request submitted by ${data.shipping_address.name}</h3>` + emailContent,
      });

    } catch (emailError) {
      console.error("Nodemailer delivery failed:", emailError);
    }
   

    return { order_id: order.id, order_number: order.order_number, total: order.total };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, order_number, total, status, payment_status, payment_method, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");
    const [{ data: items }, { data: history }] = await Promise.all([
      context.supabase.from("order_items").select("*").eq("order_id", data.id),
      context.supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    return { order, items: items ?? [], history: history ?? [] };
  });
  