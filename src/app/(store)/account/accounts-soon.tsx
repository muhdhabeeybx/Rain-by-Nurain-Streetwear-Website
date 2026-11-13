import { PreviewNotice } from "@/components/store/preview-notice";

/** Shown instead of sign-in and the account page in preview mode. */
export function AccountsSoon() {
  return (
    <PreviewNotice title="Accounts open with the shop">
      Sign in to track orders and check out faster once the store opens. For now, this is a preview.
    </PreviewNotice>
  );
}
