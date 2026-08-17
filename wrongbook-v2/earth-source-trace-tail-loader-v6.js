// Source-trace tail loader. Keep page-specific implementations isolated and ordered.
document.write('<link rel="stylesheet" href="./earth-source-trace-p250-v6.css"/>');
document.write('<script src="./earth-source-trace-p250-v6.js"><\/script>');
document.write('<link rel="stylesheet" href="./earth-source-trace-p251-v6.css"/>');
document.write('<script src="./earth-source-trace-p251-v6.js"><\/script>');
document.write('<link rel="stylesheet" href="./earth-source-trace-p252-v6.css"/>');
document.write('<script src="./earth-source-trace-p252-v6.js"><\/script>');
document.write('<link rel="stylesheet" href="./earth-source-trace-p253-v6.css"/>');
document.write('<script src="./earth-source-trace-p253-v6.js"><\/script>');
document.write('<link rel="stylesheet" href="./earth-source-trace-p253-correct-v6.css"/>');
document.write('<script src="./earth-source-trace-p253-correct-v6.js"><\/script>');
// v9 styling can load with source pages; the ownership JS itself is deliberately loaded after
// the v7 prompt renderer in index.html so no later renderer can re-globalize its cluster children.
document.write('<link rel="stylesheet" href="./earth-cluster-layout-v9.css"/>');
document.write('<link rel="stylesheet" href="./earth-cluster-layout-v9-guards.css"/>');