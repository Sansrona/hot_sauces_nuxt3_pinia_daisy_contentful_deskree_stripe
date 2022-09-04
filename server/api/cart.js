import Stripe from "stripe";
export default defineEventHandler(async (event) => {
  const body = await useBody(event);
  const ids = body.products.map((product) => product.item.sys.id);
  const stripeSecret = useRuntimeConfig().stripeSecret;
  const stripe = new Stripe(stripeSecret);
  const res = await stripe.products.list({
    ids,
  });
  const products = res.data;
 
  const lineItems = res.data.map((product) => ({
    price: product.default_price,
    quantity: body.products.find((p) => p.item.sys.id === product.id)?.amount,
  }));

  const session = await stripe.checkout.sessions.create({
    cancel_url: "http://localhost:3000/cart",
    success_url: "http://localhost:3000/checkout/success",
    mode: "payment",
    line_items: lineItems,
  });

  return session;
});