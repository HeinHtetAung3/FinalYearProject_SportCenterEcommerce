import { useParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/feedback/EmptyState';

function OrderSuccessPage() {
  const { orderId } = useParams();
  const id = orderId != null ? String(orderId).trim() : '';

  if (!id) {
    return (
      <Container>
        <EmptyState
          title="Order not found"
          description="Something went wrong and we couldn't show your order confirmation. Please check your checkout email or confirmation link."
          action={<Button to="/checkout">Return to checkout</Button>}
        />
      </Container>
    );
  }

  return (
    <Container className="max-w-lg py-16">
      <div className="card-base p-8 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Thank you</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950 md:text-4xl">
          Your order has been placed
        </h1>
        <p className="mt-3 text-ink-600">
          We've received your payment details and confirmed your shipment address. We'll email updates as your order progresses.
        </p>
        <p className="mt-8 font-display text-2xl font-bold text-ink-950">Order #{id}</p>
        <p className="mt-2 text-sm text-ink-500">Save this number for receipts and tracking.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button to={`/orders/${encodeURIComponent(id)}`} variant="primary">
            Track order
          </Button>
          <Button to="/products" variant="secondary">
            Continue shopping
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default OrderSuccessPage;
