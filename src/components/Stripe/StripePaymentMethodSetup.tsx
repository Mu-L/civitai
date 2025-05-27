import { useStripePromise } from '~/providers/StripeProvider';
import { trpc } from '~/utils/trpc';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import React from 'react';
import { useStripePaymentMethodSetup } from '~/components/Buzz/useStripePaymentMethodSetup';
import type { StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { Button, Center, Group, Loader, Stack, Text, useComputedColorScheme } from '@mantine/core';

type Props = {
  redirectUrl?: string;
  paymentMethodTypes?: string[];
  onCancel?: () => void;
  cancelLabel?: string;
};
export const StripePaymentMethodSetup = ({ paymentMethodTypes, ...props }: Props) => {
  const stripePromise = useStripePromise();
  const colorScheme = useComputedColorScheme('dark');

  const { data, isLoading, isFetching } = trpc.stripe.getSetupIntent.useQuery(
    { paymentMethodTypes },
    { refetchOnMount: 'always', cacheTime: 0, trpc: { context: { skipBatch: true } } }
  );

  const clientSecret = data?.clientSecret;

  if (isLoading || isFetching) {
    return (
      <Center>
        <Loader type="bars" />
      </Center>
    );
  }

  if (!clientSecret) {
    return (
      <Center>
        <Text c="red" size="sm">
          There was an error attempting to setup a payment method. Please try again later.
        </Text>
      </Center>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: colorScheme === 'dark' ? 'night' : 'stripe' },
    locale: 'en',
  };

  return (
    <Elements stripe={stripePromise} key={clientSecret} options={options}>
      <SetupPaymentMethod {...props} />
    </Elements>
  );
};

const SetupPaymentMethod = ({ redirectUrl, onCancel, cancelLabel }: Props) => {
  const { processingSetup, onConfirmSetup, errorMessage } = useStripePaymentMethodSetup({
    redirectUrl,
  });

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  const handleSubmit = () => {
    onConfirmSetup();
  };

  return (
    <form
      id="stripe-payment-form"
      onSubmit={async (e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Stack gap="md">
        <PaymentElement id="payment-element" options={paymentElementOptions} />
        {errorMessage && (
          <Text c="red" size="sm">
            {errorMessage}
          </Text>
        )}
        <Group justify="flex-end">
          {onCancel && (
            <Button
              component="button"
              variant="outline"
              color="gray"
              onClick={onCancel}
              disabled={processingSetup}
            >
              {cancelLabel ?? 'Cancel'}
            </Button>
          )}
          <Button
            component="button"
            disabled={processingSetup}
            loading={processingSetup}
            type="submit"
          >
            {processingSetup ? 'Processing...' : `Add payment method`}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
