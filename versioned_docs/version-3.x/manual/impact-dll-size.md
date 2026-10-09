# 对程序集大小的影响

由于混淆修改了dll代码，混淆后程序集大小会发生改变。一般来说，除了Symbol Obfus会减少程序集大小外，其余混淆Pass都会增加程序集大小，但每种Pass的影响不一样。

我们在内部的测试程序集Tests上测量了各个Pass对最终dll大小的影响。

## 测试数据

|状态|最终大小（单位k）|大小增加百分比|
|-|-|-|
|原始文件|698|0%|
|禁用所有Pass|681|-2.4%|
|开启Const Encryption|941|34.8%|
|开启 Field Encryption|683|-2.1%|
|开启 Symbol Obfus|652|-6.6%|
|开启 Call Obfus, Proxy Mode为Dispatch|794|13.8%|
|开启 Call Obfus，Proxy Mode为Delegate|1001|43.4%|
|开启Expr Obfus|752|7.7%|
|开启Eval Stack Obfus, obfuscationPercentage=0.05|794|26.4%|
|**开启Eval Stack Obfus, obfuscationPercentage=1.0**|**3672**|**426%**|
|开启 Control Flow Obufs|819|17.3%|
|开启除了Eval Stack Obufs以外的所有Pass，Call Obfus Proxy Mode为dispatch|938|34.4%|
|开启所有Pass，Call Obfus Proxy Mode为dispatch，Eval Stack Obufs obfuscationPercentage=0.05|1464|109%|
|开启所有Pass，Call Obfus Proxy Mode为dispatch，Eval Stack Obufs obfuscationPercentage=0.5|2797|300%|

有几个注意点：

- 禁用所有Pass时输出的程序集大小比未混淆时减少了17k。我们猜测是使用dnlib重新导出dll后由于dll布局与原始dll不一样导致的。
- Field Encryption 对混淆后文件大小几乎没有影响，是因为默认不会对任何字段执行加密，必须显式在规则文件中指定某个字段需要字段加密后才会生效。

## 结论

- Eval Stack Obfus、Const Encryption、Call Obfus(Delegate) Pass对最终的文件大小影响比较大，其他影响都比较小
- Eval Stack Obfus 如果obfuscationPercentage=1.0，会**巨幅**影响最终的dll大小。因此obfuscationPercentage的全局默认值（即规则文件中global中配置的obfuscationPercentage值）**建议不要超过0.1**。
- Call Obfus的Proxy Mode选择Dispatch，相比于Delegate，最终生成的dll文件要显著减少30%。
- Symbol Obfus 大多数情况下可以稍微减少最终的dll大小，因为混淆名一般要比原始名更短。
