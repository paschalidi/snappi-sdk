import{j as n}from"./jsx-runtime-BjG_zV1W.js";const f=({variant:x="primary",size:b="md",isLoading:t=!1,children:S})=>{const k="rounded font-medium transition-colors",C={sm:"px-3 py-1 text-sm",md:"px-4 py-2",lg:"px-6 py-3 text-lg"},L={primary:"bg-blue-600 hover:bg-blue-700 text-white",secondary:"bg-gray-200 hover:bg-gray-300 text-gray-800",ghost:"hover:bg-gray-100 text-gray-800"};return n.jsxs("button",{className:`${k} ${C[b]} ${L[x]} ${t?"opacity-50 cursor-wait":""}`,disabled:t,children:[t?n.jsx("span",{className:"inline-block animate-spin mr-2",children:"⚪"}):null,S]})};f.__docgenInfo={description:"",methods:[],displayName:"Button",props:{variant:{defaultValue:{value:"'primary'",computed:!1},required:!1},size:{defaultValue:{value:"'md'",computed:!1},required:!1},isLoading:{defaultValue:{value:"false",computed:!1},required:!1}}};const _={title:"Components/Button",component:f,parameters:{layout:"centered"}},e={args:{variant:"primary",children:"Click me"}},r={args:{variant:"secondary",children:"Click me"}},a={args:{variant:"ghost",children:"Click me"}},s={args:{variant:"primary",children:"Loading...",isLoading:!0}};var o,i,c;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Click me'
  }
}`,...(c=(i=e.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var d,l,m;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Click me'
  }
}`,...(m=(l=r.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var p,u,g;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    children: 'Click me'
  }
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var y,h,v;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Loading...',
    isLoading: true
  }
}`,...(v=(h=s.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const $=["Primary","Secondary","Ghost","Loading"];export{a as Ghost,s as Loading,e as Primary,r as Secondary,$ as __namedExportsOrder,_ as default};
