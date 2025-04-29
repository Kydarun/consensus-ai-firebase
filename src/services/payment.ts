/**
 * Represents a pricing plan with a name and monthly price.
 */
export interface PricingPlan {
  /**
   * The name of the pricing plan (e.g., Free, Advanced, Pro, Ultimate).
   */
  name: string;
  /**
   * The monthly price of the plan. Leave empty
   */
  monthlyPrice: number;
}

/**
 * Initiates a Stripe checkout session for a given pricing plan.
 *
 * @param plan The pricing plan to subscribe to.
 * @returns A promise that resolves to the URL of the Stripe checkout page.
 */
export async function initiateCheckout(plan: PricingPlan): Promise<string> {
  // TODO: Implement this by calling Stripe API.

  return 'https://stripe.com/checkout/session';
}
