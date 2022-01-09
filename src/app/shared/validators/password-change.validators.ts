import {AbstractControl, FormGroup, ValidationErrors} from '@angular/forms';

// eslint-disable-next-line @typescript-eslint/naming-convention,prefer-arrow/prefer-arrow-functions
export function ConfirmPasswordValidator(controlName: string, matchingControlName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
        const input = control.get(controlName);
        const matchingInput = control.get(matchingControlName);

        if (input === null || matchingInput === null) {
            return null;
        }

        if (matchingInput?.errors && !matchingInput.errors.confirmedValidator) {
            return null;
        }

        if (String(input.value ?? '').trim() === '' &&
                String(matchingInput.value ?? '').trim() === '') {
            return null;
        }
        else if(String(input.value ?? '').trim() !== String(matchingInput.value ?? '').trim()) {
            matchingInput.setErrors({ confirmedValidator: true });
            return ({ confirmedValidator: true });
        } else {
            matchingInput.setErrors(null);
            return null;
        }
    };
}
