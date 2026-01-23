"use client";

export function NoteTestComponent() {
  // Test data from your example
  const testContent = `<p>I&nbsp;visited&nbsp;Lubbe&nbsp;\\trusts&nbsp;that&nbsp;has&nbsp;the&nbsp;Kandao&nbsp;unit&nbsp;we&nbsp;are&nbsp;interested&nbsp;in,&nbsp;and&nbsp;met&nbsp;up&nbsp;with&nbsp;Kimon&nbsp;and&nbsp;Jaco&nbsp;at&nbsp;Uvirco&nbsp;for&nbsp;a&nbsp;test&nbsp;drive.&nbsp;</p><p>They&nbsp;had&nbsp;some&nbsp;internet&nbsp;problems&nbsp;and&nbsp;i&nbsp;had&nbsp;to&nbsp;use&nbsp;my&nbsp;phone&nbsp;as&nbsp;connection.</p><p>The&nbsp;device&nbsp;works&nbsp;well&nbsp;picking&nbsp;up&nbsp;the&nbsp;speaker&nbsp;and&nbsp;following&nbsp;him.</p><p>Kimon&nbsp;noted&nbsp;that&nbsp;the&nbsp;audio&nbsp;and&nbsp;video&nbsp;quality&nbsp;was&nbsp;not&nbsp;that&nbsp;great.&nbsp;</p><p></p><p></p>`;

  // Test approach 1: Direct with replace
  const approach1 = testContent.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

  // Test approach 2: Using textarea decode
  const decodeUsingTextarea = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Test approach 3: Parse as HTML
  const approach3 = testContent
    .split('&nbsp;').join(' ')
    .split('&lt;').join('<')
    .split('&gt;').join('>')
    .split('&amp;').join('&');

  console.log('=== ORIGINAL ===');
  console.log(testContent);
  console.log('');

  console.log('=== APPROACH 1 (replace) ===');
  console.log(approach1);
  console.log('');

  console.log('=== APPROACH 3 (split/join) ===');
  console.log(approach3);
  console.log('');

  return (
    <div className="p-4 bg-slate-800 rounded m-4">
      <h2 className="text-white mb-4">Note Test Component</h2>
      
      <div className="mb-6 p-4 bg-slate-900 rounded">
        <h3 className="text-red-400 mb-2">ORIGINAL (BROKEN - Raw HTML entities showing):</h3>
        <div 
          className="text-sm text-zinc-300 prose prose-invert prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: testContent }}
        />
      </div>

      <div className="mb-6 p-4 bg-slate-900 rounded">
        <h3 className="text-yellow-400 mb-2">APPROACH 1 (with replace):</h3>
        <div 
          className="text-sm text-zinc-300 prose prose-invert prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: approach1 }}
        />
      </div>

      <div className="mb-6 p-4 bg-slate-900 rounded">
        <h3 className="text-green-400 mb-2">APPROACH 3 (split/join):</h3>
        <div 
          className="text-sm text-zinc-300 prose prose-invert prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: approach3 }}
        />
      </div>
    </div>
  );
}
