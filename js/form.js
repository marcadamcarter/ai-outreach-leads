/**
 * Generic form handler for City Lead sign-up and AAR forms.
 * Collects all named inputs, POSTs JSON to the given endpoint,
 * and shows a success or error alert.
 */
function initForm({ formId, endpoint, submitBtnId, successId, errorId }) {
  const form    = document.getElementById(formId);
  const btn     = document.getElementById(submitBtnId);
  const success = document.getElementById(successId);
  const error   = document.getElementById(errorId);

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous alerts
    success.classList.remove('show');
    error.classList.remove('show');

    // Basic HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Collect all named form fields
    const data = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      if (key.endsWith('[]')) {
        // Multi-value fields (e.g. preferred-modes[]) → array
        if (!Array.isArray(data[key])) data[key] = [];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    });

    // Single checkboxes not checked won't appear in FormData — add them explicitly
    // (skip array-style checkbox groups handled above)
    form.querySelectorAll('input[type="checkbox"]:not([name$="[]"])').forEach((cb) => {
      if (!(cb.name in data)) data[cb.name] = cb.checked;
    });

    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        form.reset();
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const body = await res.json().catch(() => ({}));
        console.error('Submission error:', body);
        error.classList.add('show');
        error.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('Network error:', err);
      error.classList.add('show');
      error.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      btn.disabled = false;
      btn.textContent = btn.dataset.label || 'Submit';
    }
  });

  // Store original button label
  if (btn) btn.dataset.label = btn.textContent;
}
