$desiredDeliveryMediums = "EMAIL"
$userPoolId = "blah"
$username = "justindallas+admin@gmail.com"
$temporaryPassword = 'abc123dE!'
$permanentPassword = '12abc123dE!'
$userAttributes = @(
    @{Name="email"; Value="justindallas+admin@gmail.com"},
    @{Name="custom:tenant_id"; Value="dev"}
)

$user = New-CGIPUserAdmin -UserPoolId $userPoolId -DesiredDeliveryMedium $desiredDeliveryMediums -Username $username -TemporaryPassword $temporaryPassword -UserAttribute $userAttributes
Set-CGIPUserPasswordAdmin -Username $username -UserPoolId $userPoolId -Password $permanentPassword -Permanent $true
