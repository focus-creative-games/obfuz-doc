# 代码水印

Obfuz往混淆后的程序集元数据中注入特殊的元数据及特定指令序列，形成可标识的水印特征。

## 代码水印的目标

- 版权标识：证明该代码是由你生成或授权发布的。
- 溯源追踪：用于标记不同用户或不同授权方生成的代码，若泄露可追查来源。
- 抗混淆还原：即使代码经过再次混淆或部分还原，水印仍可在某种程度上保留。

## 设置

`ObfuzSettings.WatermarkSettings`中包含相关设置，详细见文档[设置](./configuration)。

## 水印标识类别

注入以下特殊水印标识：

- rva数据中注入水印Hash签名
- 生成特殊规则的类型及函数及字段
- 代码体中注入特定指令序列
