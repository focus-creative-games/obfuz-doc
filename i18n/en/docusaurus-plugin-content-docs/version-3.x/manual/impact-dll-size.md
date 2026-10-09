# Impact on Assembly Size

Since obfuscation modifies dll code, the assembly size will change after obfuscation. Generally speaking, except for Symbol Obfus which reduces assembly size, all other obfuscation passes will increase assembly size, but each pass has different impacts.

We measured the impact of each pass on final dll size on our internal test assembly Tests.

## Test Data

|Status|Final Size (KB)|Size Increase Percentage|
|-|-|-|
|Original file|698|0%|
|All passes disabled|681|-2.4%|
|Const Encryption enabled|941|34.8%|
|Field Encryption enabled|683|-2.1%|
|Symbol Obfus enabled|652|-6.6%|
|Call Obfus enabled, Proxy Mode is Dispatch|794|13.8%|
|Call Obfus enabled, Proxy Mode is Delegate|1001|43.4%|
|Expr Obfus enabled|752|7.7%|
|Eval Stack Obfus enabled, obfuscationPercentage=0.05|794|26.4%|
|**Eval Stack Obfus enabled, obfuscationPercentage=1.0**|**3672**|**426%**|
|Control Flow Obfus enabled|819|17.3%|
|All passes enabled except Eval Stack Obfus, Call Obfus Proxy Mode is dispatch|938|34.4%|
|All passes enabled, Call Obfus Proxy Mode is dispatch, Eval Stack Obfus obfuscationPercentage=0.05|1464|109%|
|All passes enabled, Call Obfus Proxy Mode is dispatch, Eval Stack Obfus obfuscationPercentage=0.5|2797|300%|

Several notes:

- When all passes are disabled, the output assembly size is 17k smaller than when unobfuscated. We suspect this is due to different dll layout when re-exporting dll using dnlib compared to the original dll.
- Field Encryption has almost no impact on obfuscated file size because by default no fields are encrypted. Field encryption only takes effect when explicitly specified for certain fields in rule files.

## Conclusion

- Eval Stack Obfus, Const Encryption, and Call Obfus (Delegate) passes have significant impact on final file size, while others have relatively small impact
- If Eval Stack Obfus obfuscationPercentage=1.0, it will **drastically** affect final dll size. Therefore, the global default value of obfuscationPercentage (i.e., the obfuscationPercentage value configured in global in rule files) **should not exceed 0.1**.
- Call Obfus choosing Proxy Mode as Dispatch generates significantly 30% smaller dll files compared to Delegate.
- Symbol Obfus can slightly reduce final dll size in most cases, as obfuscated names are generally shorter than original names.
