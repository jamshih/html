// AI 或動態資料只要進入一般文字 UI，就再套一次臺灣用語正規化。
if(typeof esc==='function'&&typeof twTaiwanizeString==='function'){
 const __baseEsc=esc;
 esc=function(value=''){return __baseEsc(twTaiwanizeString(String(value)))};
}
