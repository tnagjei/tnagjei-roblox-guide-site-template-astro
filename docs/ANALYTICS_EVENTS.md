# Analytics Events

This template includes a minimal GA4 event tracking layer for reusable Roblox guide sites.

## Default event names

| Event name | Purpose |
|---|---|
| `copy_action` | A copy button completed a successful copy action. |
| `outbound_link_click` | A user clicked an external link. |
| `tool_input_change` | A user changed a tool input after debounce. |
| `tool_result_view` | A tool result became visible. |
| `related_guide_click` | A user clicked a related guide entry. |

Project-specific sites may override event names:

| Template event | Example project event |
|---|---|
| `copy_action` | `copy_code` |
| `outbound_link_click` | `outbound_roblox_click` |
| `tool_input_change` | `calculator_input_change` |
| `tool_result_view` | `calculator_result_view` |
| `related_guide_click` | `home_related_guide_click` |

## Supported event parameters

Only these parameter keys should be sent:

```text
page_path
event_source
item_type
item_name
link_url
tool_name
field_name
```

## Privacy boundary

Do not send personal or sensitive data to GA4.

Never send:

```text
email addresses
usernames
IP addresses
phone numbers
passwords
private account data
raw user input that may contain personal data
```

The helper sanitizes known risky values and ignores unsupported parameter keys, but projects should still avoid passing private user input.

## Production behavior

Events are sent only when Astro runs in production mode.

In local development:

```text
trackEvent logs to console.debug only.
```

If `window.gtag` is missing, no error is thrown.

## Usage examples

### Track a generic event

```ts
import { trackEvent } from "../lib/analytics";

trackEvent("related_guide_click", {
  page_path: window.location.pathname,
  event_source: "home",
  item_type: "guide",
  item_name: "Codes"
});
```

### Track an outbound link

```astro
---
import TrackedLink from "../components/TrackedLink.astro";
---

<TrackedLink href="https://www.roblox.com/" external eventName="outbound_roblox_click" itemName="Roblox game page">
  Open Roblox
</TrackedLink>
```

### Track a copy action

```astro
---
import CopyButton from "../components/CopyButton.astro";
---

<CopyButton value="PLACEHOLDER-CODE" eventName="copy_code" itemType="code" itemName="placeholder-code" />
```

### Track tool input and result views

```astro
---
import ToolEventTracker from "../components/ToolEventTracker.astro";
---

<input data-tool-input name="amount" />
<div data-tool-result>Result</div>
<ToolEventTracker toolName="example_calculator" debounceMs={1000} />
```

## GA4 reporting

In GA4, open:

```text
Reports > Engagement > Events
```

For custom exploration:

```text
Explore > Free form
```

Use event name as the primary dimension and add supported parameters such as `page_path`, `event_source`, `item_type`, `item_name`, `link_url`, `tool_name`, or `field_name`.
