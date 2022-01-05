import {FormGroup} from '@angular/forms';

// eslint-disable-next-line @typescript-eslint/naming-convention,prefer-arrow/prefer-arrow-functions
export function ConfirmPasswordValidator(controlName: string, matchingControlName: string) {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
            return;
        }
        if (String(control.value ?? '').trim() !== String(matchingControl.value ?? '').trim()) {
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}
