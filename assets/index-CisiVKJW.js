const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./browserAll-DX-s6WCw.js","./CanvasPool-BPP-9-fH.js","./Filter-YX2vTQ9N.js","./init-BkCYL3gF.js","./canvasUtils-OK1mIOJS.js","./webworkerAll-CyBJwmWH.js"])))=>i.map(i=>d[i]);
import{C as e,D as t,E as n,G as r,I as i,J as a,K as o,L as s,M as c,N as l,O as u,R as d,S as f,U as p,W as m,_ as h,a as g,c as _,d as v,f as y,h as b,i as x,j as S,l as C,m as w,n as T,o as E,q as D,r as ee,s as te,t as ne,u as re,v as ie,w as O,x as k,y as ae,z as A}from"./CanvasPool-BPP-9-fH.js";import{_ as oe,a as se,b as j,c as ce,d as le,f as M,g as ue,h as de,i as N,l as P,n as fe,o as pe,p as me,r as he,s as F,t as I,x as ge}from"./Filter-YX2vTQ9N.js";import{n as _e,r as L,t as ve}from"./canvasUtils-OK1mIOJS.js";import{n as ye,t as R}from"./Cache-DdDYvMtE.js";import{a as be,c as z,d as xe,f as Se,i as Ce,l as we,m as Te,n as Ee,o as De,p as B,r as Oe,s as ke,t as Ae,u as je}from"./RenderTargetSystem-DOMZnN5E.js";import{a as Me,c as Ne,i as Pe,l as Fe,n as Ie,o as Le,r as Re,s as ze,t as Be,u as Ve}from"./GraphicsContext-CyedCWP_.js";import{t as He}from"./getTextureBatchBindGroup-CdUOMQK9.js";import{a as Ue,c as We,d as Ge,f as Ke,i as qe,l as Je,m as Ye,o as Xe,p as Ze,r as Qe,s as $e,t as et,u as tt}from"./GCManagedHash-J8Tro_b9.js";import{a as nt,c as rt,d as it,f as at,i as ot,l as st,n as ct,o as lt,p as ut,r as dt,s as ft,t as pt,u as mt}from"./BufferResource-BZf5U7QS.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ht=`modulepreload`,gt=function(e,t){return new URL(e,t).href},_t={},vt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=gt(t,n),t=s(t),t in _t)return;_t[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:ht,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},yt={extension:{type:m.Environment,name:`browser`,priority:-1},test:()=>!0,load:async()=>{await vt(()=>import(`./browserAll-DX-s6WCw.js`),__vite__mapDeps([0,1,2,3,4]),import.meta.url)}},bt={extension:{type:m.Environment,name:`webworker`,priority:0},test:()=>typeof self<`u`&&self.WorkerGlobalScope!==void 0,load:async()=>{await vt(()=>import(`./webworkerAll-CyBJwmWH.js`),__vite__mapDeps([5,3,1,2,4]),import.meta.url)}},xt=new e;function St(e,t,n){let r=xt;e.measurable=!0,de(e,n,r),t.addBoundsMask(r),e.measurable=!1}function Ct(e,t,n){let r=ue.get();e.measurable=!0;let i=oe.get().identity(),a=wt(e,n,i);M(e,r,a),e.measurable=!1,t.addBoundsMask(r),oe.return(i),ue.return(r)}function wt(e,t,n){return e?(e!==t&&(wt(e.parent,t,n),e.updateLocalTransform(),n.append(e.localTransform)),n):(k(`Mask bounds, renderable is not inside the root container`),n)}var Tt=class{constructor(e){this.priority=0,this.inverse=!1,this.channel=`red`,this.pipe=`alphaMask`,e?.mask&&this.init(e.mask)}init(e){this.mask=e,this.renderMaskToTexture=!(e instanceof F),this.mask.renderable=this.renderMaskToTexture,this.mask.includeInBuild=!this.renderMaskToTexture,this.mask.measurable=!1}reset(){this.mask!==null&&(this.mask.measurable=!0,this.mask=null)}addBounds(e,t){this.inverse||St(this.mask,e,t)}addLocalBounds(e,t){Ct(this.mask,e,t)}containsPoint(e,t){let n=this.mask;return t(n,e)}destroy(){this.reset()}static test(e){return e instanceof F}};Tt.extension=m.MaskEffect;var Et=class{constructor(e){this.priority=0,this.pipe=`colorMask`,e?.mask&&this.init(e.mask)}init(e){this.mask=e}destroy(){}static test(e){return typeof e==`number`}};Et.extension=m.MaskEffect;var Dt=class{constructor(e){this.priority=0,this.pipe=`stencilMask`,e?.mask&&this.init(e.mask)}init(e){this.mask=e,this.mask.includeInBuild=!1,this.mask.measurable=!1}reset(){this.mask!==null&&(this.mask.measurable=!0,this.mask.includeInBuild=!0,this.mask=null)}addBounds(e,t){St(this.mask,e,t)}addLocalBounds(e,t){Ct(this.mask,e,t)}containsPoint(e,t){let n=this.mask;return t(n,e)}destroy(){this.reset()}static test(e){return e instanceof P}};Dt.extension=m.MaskEffect;var Ot;async function kt(){return Ot??(Ot=(async()=>{let e=b.get().createCanvas(1,1).getContext(`webgl`);if(!e)return`premultiply-alpha-on-upload`;let t=await new Promise(e=>{let t=document.createElement(`video`);t.onloadeddata=()=>e(t),t.onerror=()=>e(null),t.autoplay=!1,t.crossOrigin=`anonymous`,t.preload=`auto`,t.src=`data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=`,t.load()});if(!t)return`premultiply-alpha-on-upload`;let n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n);let r=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t);let i=new Uint8Array(4);return e.readPixels(0,0,1,1,e.RGBA,e.UNSIGNED_BYTE,i),e.deleteFramebuffer(r),e.deleteTexture(n),e.getExtension(`WEBGL_lose_context`)?.loseContext(),i[0]<=i[3]?`premultiplied-alpha`:`premultiply-alpha-on-upload`})()),Ot}var At=class e extends t{constructor(t){super(t),this.isReady=!1,this.uploadMethodId=`video`,t={...e.defaultOptions,...t},this._autoUpdate=!0,this._isConnectedToTicker=!1,this._updateFPS=t.updateFPS||0,this._msToNextUpdate=0,this.autoPlay=t.autoPlay!==!1,this.alphaMode=t.alphaMode??`premultiply-alpha-on-upload`,this._videoFrameRequestCallback=this._videoFrameRequestCallback.bind(this),this._videoFrameRequestCallbackHandle=null,this._load=null,this._resolve=null,this._reject=null,this._onCanPlay=this._onCanPlay.bind(this),this._onCanPlayThrough=this._onCanPlayThrough.bind(this),this._onError=this._onError.bind(this),this._onPlayStart=this._onPlayStart.bind(this),this._onPlayStop=this._onPlayStop.bind(this),this._onSeeked=this._onSeeked.bind(this),this._onLoadedMetadata=this._onLoadedMetadata.bind(this),t.autoLoad!==!1&&this.load()}updateFrame(){if(!this.destroyed){if(this._updateFPS){let e=N.shared.elapsedMS*this.resource.playbackRate;this._msToNextUpdate=Math.floor(this._msToNextUpdate-e)}(!this._updateFPS||this._msToNextUpdate<=0)&&(this._msToNextUpdate=this._updateFPS?Math.floor(1e3/this._updateFPS):0),this.isValid&&this.update()}}_videoFrameRequestCallback(){this.updateFrame(),this._videoFrameRequestCallbackHandle=this.destroyed?null:this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback)}get isValid(){return!!this.resource.videoWidth&&!!this.resource.videoHeight}async load(){if(this._load)return this._load;let e=this.resource,t=this.options;return(e.readyState===e.HAVE_ENOUGH_DATA||e.readyState===e.HAVE_FUTURE_DATA)&&e.width&&e.height&&(e.complete=!0),e.addEventListener(`play`,this._onPlayStart),e.addEventListener(`pause`,this._onPlayStop),e.addEventListener(`seeked`,this._onSeeked),this._isSourceReady()?this._mediaReady():(t.preload||e.addEventListener(`canplay`,this._onCanPlay),e.addEventListener(`canplaythrough`,this._onCanPlayThrough),e.addEventListener(`error`,this._onError,!0)),this.isValid||e.addEventListener(`loadedmetadata`,this._onLoadedMetadata),this.alphaMode=await kt(),this._load=new Promise((n,r)=>{this.isValid?n(this):(this._resolve=n,this._reject=r,t.preloadTimeoutMs!==void 0&&(this._preloadTimeout=setTimeout(()=>{this._onError(new ErrorEvent(`Preload exceeded timeout of ${t.preloadTimeoutMs}ms`))})),e.load())}),this._load}_onError(e){this.resource.removeEventListener(`error`,this._onError,!0),this.emit(`error`,e),this._reject&&(this._reject(e),this._reject=null,this._resolve=null)}_isSourcePlaying(){let e=this.resource;return!e.paused&&!e.ended}_isSourceReady(){return this.resource.readyState>2}_onPlayStart(){this._configureAutoUpdate()}_onPlayStop(){this._configureAutoUpdate()}_onSeeked(){this._autoUpdate&&!this._isSourcePlaying()&&(this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0)}_onLoadedMetadata(){this.isValid&&this._mediaReady()}_onCanPlay(){this.resource.removeEventListener(`canplay`,this._onCanPlay),this._mediaReady()}_onCanPlayThrough(){this.resource.removeEventListener(`canplaythrough`,this._onCanPlayThrough),this._preloadTimeout&&(clearTimeout(this._preloadTimeout),this._preloadTimeout=void 0),this._mediaReady()}_mediaReady(){let e=this.resource;this.isValid&&(this.isReady=!0,this.resize(e.videoWidth,e.videoHeight)),this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0,this._resolve&&this.isValid&&(this._resolve(this),this._resolve=null,this._reject=null),this._isSourcePlaying()?this._onPlayStart():this.autoPlay&&this.resource.play()}destroy(){this._configureAutoUpdate();let e=this.resource;e&&(e.removeEventListener(`play`,this._onPlayStart),e.removeEventListener(`pause`,this._onPlayStop),e.removeEventListener(`seeked`,this._onSeeked),e.removeEventListener(`canplay`,this._onCanPlay),e.removeEventListener(`canplaythrough`,this._onCanPlayThrough),e.removeEventListener(`loadedmetadata`,this._onLoadedMetadata),e.removeEventListener(`error`,this._onError,!0),e.pause(),e.src=``,e.load()),super.destroy()}get autoUpdate(){return this._autoUpdate}set autoUpdate(e){e!==this._autoUpdate&&(this._autoUpdate=e,this._configureAutoUpdate())}get updateFPS(){return this._updateFPS}set updateFPS(e){e!==this._updateFPS&&(this._updateFPS=e,this._configureAutoUpdate())}_configureAutoUpdate(){this._autoUpdate&&this._isSourcePlaying()?!this._updateFPS&&this.resource.requestVideoFrameCallback?(this._isConnectedToTicker&&(N.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0),this._videoFrameRequestCallbackHandle===null&&(this._videoFrameRequestCallbackHandle=this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback))):(this._videoFrameRequestCallbackHandle!==null&&(this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null),this._isConnectedToTicker||(N.shared.add(this.updateFrame,this),this._isConnectedToTicker=!0,this._msToNextUpdate=0)):(this._videoFrameRequestCallbackHandle!==null&&(this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null),this._isConnectedToTicker&&(N.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0))}static test(e){return globalThis.HTMLVideoElement&&e instanceof HTMLVideoElement}};At.extension=m.TextureSource,At.defaultOptions={...t.defaultOptions,autoLoad:!0,autoPlay:!0,updateFPS:0,crossorigin:!0,loop:!1,muted:!0,playsinline:!0,preload:!1},At.MIME_TYPES={ogv:`video/ogg`,mov:`video/quicktime`,m4v:`video/mp4`};var jt=At,Mt=[];r.handleByList(m.TextureSource,Mt);function Nt(e={}){let t=e&&e.resource,n=t?e.resource:e,r=t?e:{resource:e};for(let e=0;e<Mt.length;e++){let t=Mt[e];if(t.test(n))return new t(r)}throw Error(`Could not find a source type for resource: ${r.resource}`)}function Pt(e={},t=!1){let n=e&&e.resource,r=n?e.resource:e,i=n?e:{resource:e};if(!t&&R.has(r))return R.get(r);let a=new O({source:Nt(i)});return a.on(`destroy`,()=>{R.has(r)&&R.remove(r)}),t||R.set(r,a),a}function Ft(e,n=!1){return typeof e==`string`?R.get(e):e instanceof t?new O({source:e}):Pt(e,n)}O.from=Ft,t.from=Nt,r.add(Tt,Et,Dt,jt,L,pe,n);var It=(e=>(e[e.Low=0]=`Low`,e[e.Normal=1]=`Normal`,e[e.High=2]=`High`,e))(It||{});function Lt(e){if(typeof e!=`string`)throw TypeError(`Path must be a string. Received ${JSON.stringify(e)}`)}function Rt(e){return e.split(`?`)[0].split(`#`)[0]}function zt(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function Bt(e,t,n){return e.replace(new RegExp(zt(t),`g`),n)}function Vt(e,t){let n=``,r=0,i=-1,a=0,o=-1;for(let s=0;s<=e.length;++s){if(s<e.length)o=e.charCodeAt(s);else if(o===47)break;else o=47;if(o===47){if(i!==s-1&&a!==1){if(i!==s-1&&a===2){if(n.length<2||r!==2||n.charCodeAt(n.length-1)!==46||n.charCodeAt(n.length-2)!==46){if(n.length>2){let e=n.lastIndexOf(`/`);if(e!==n.length-1){e===-1?(n=``,r=0):(n=n.slice(0,e),r=n.length-1-n.lastIndexOf(`/`)),i=s,a=0;continue}}else if(n.length===2||n.length===1){n=``,r=0,i=s,a=0;continue}}t&&(n.length>0?n+=`/..`:n=`..`,r=2)}else n.length>0?n+=`/${e.slice(i+1,s)}`:n=e.slice(i+1,s),r=s-i-1}i=s,a=0}else o===46&&a!==-1?++a:a=-1}return n}var Ht={toPosix(e){return Bt(e,`\\`,`/`)},isUrl(e){return/^https?:/.test(this.toPosix(e))},isDataUrl(e){return/^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(e)},isBlobUrl(e){return e.startsWith(`blob:`)},hasProtocol(e){return/^[^/:]+:/.test(this.toPosix(e))},getProtocol(e){Lt(e),e=this.toPosix(e);let t=/^file:\/\/\//.exec(e);if(t)return t[0];let n=/^[^/:]+:\/{0,2}/.exec(e);return n?n[0]:``},toAbsolute(e,t,n){if(Lt(e),this.isDataUrl(e)||this.isBlobUrl(e))return e;let r=Rt(this.toPosix(t??b.get().getBaseUrl())),i=Rt(this.toPosix(n??this.rootname(r)));return e=this.toPosix(e),e.startsWith(`/`)?Ht.join(i,e.slice(1)):this.isAbsolute(e)?e:this.join(r,e)},normalize(e){if(Lt(e),e.length===0)return`.`;if(this.isDataUrl(e)||this.isBlobUrl(e))return e;e=this.toPosix(e);let t=``,n=e.startsWith(`/`);this.hasProtocol(e)&&(t=this.rootname(e),e=e.slice(t.length));let r=e.endsWith(`/`);return e=Vt(e,!1),e.length>0&&r&&(e+=`/`),n?`/${e}`:t+e},isAbsolute(e){return Lt(e),e=this.toPosix(e),this.hasProtocol(e)?!0:e.startsWith(`/`)},join(...e){if(e.length===0)return`.`;let t;for(let n=0;n<e.length;++n){let r=e[n];if(Lt(r),r.length>0){if(t===void 0)t=r;else{let i=e[n-1]??``;this.joinExtensions.includes(this.extname(i).toLowerCase())?t+=`/../${r}`:t+=`/${r}`}}}return t===void 0?`.`:this.normalize(t)},dirname(e){if(Lt(e),e.length===0)return`.`;e=this.toPosix(e);let t=e.charCodeAt(0),n=t===47,r=-1,i=!0,a=this.getProtocol(e),o=e;e=e.slice(a.length);for(let n=e.length-1;n>=1;--n)if(t=e.charCodeAt(n),t===47){if(!i){r=n;break}}else i=!1;return r===-1?n?`/`:this.isUrl(o)?a+e:a:n&&r===1?`//`:a+e.slice(0,r)},rootname(e){Lt(e),e=this.toPosix(e);let t=``;if(t=e.startsWith(`/`)?`/`:this.getProtocol(e),this.isUrl(e)){let n=e.indexOf(`/`,t.length);t=n===-1?e:e.slice(0,n),t.endsWith(`/`)||(t+=`/`)}return t},basename(e,t){Lt(e),t&&Lt(t),e=Rt(this.toPosix(e));let n=0,r=-1,i=!0,a;if(t!==void 0&&t.length>0&&t.length<=e.length){if(t.length===e.length&&t===e)return``;let o=t.length-1,s=-1;for(a=e.length-1;a>=0;--a){let c=e.charCodeAt(a);if(c===47){if(!i){n=a+1;break}}else s===-1&&(i=!1,s=a+1),o>=0&&(c===t.charCodeAt(o)?--o===-1&&(r=a):(o=-1,r=s))}return n===r?r=s:r===-1&&(r=e.length),e.slice(n,r)}for(a=e.length-1;a>=0;--a)if(e.charCodeAt(a)===47){if(!i){n=a+1;break}}else r===-1&&(i=!1,r=a+1);return r===-1?``:e.slice(n,r)},extname(e){Lt(e),e=Rt(this.toPosix(e));let t=-1,n=0,r=-1,i=!0,a=0;for(let o=e.length-1;o>=0;--o){let s=e.charCodeAt(o);if(s===47){if(!i){n=o+1;break}continue}r===-1&&(i=!1,r=o+1),s===46?t===-1?t=o:a!==1&&(a=1):t!==-1&&(a=-1)}return t===-1||r===-1||a===0||a===1&&t===r-1&&t===n+1?``:e.slice(t,r)},parse(e){Lt(e);let t={root:``,dir:``,base:``,ext:``,name:``};if(e.length===0)return t;e=Rt(this.toPosix(e));let n=e.charCodeAt(0),r=this.isAbsolute(e),i;t.root=this.rootname(e),i=r||this.hasProtocol(e)?1:0;let a=-1,o=0,s=-1,c=!0,l=e.length-1,u=0;for(;l>=i;--l){if(n=e.charCodeAt(l),n===47){if(!c){o=l+1;break}continue}s===-1&&(c=!1,s=l+1),n===46?a===-1?a=l:u!==1&&(u=1):a!==-1&&(u=-1)}return a===-1||s===-1||u===0||u===1&&a===s-1&&a===o+1?s!==-1&&(t.base=t.name=o===0&&r?e.slice(1,s):e.slice(o,s)):(o===0&&r?(t.name=e.slice(1,a),t.base=e.slice(1,s)):(t.name=e.slice(o,a),t.base=e.slice(o,s)),t.ext=e.slice(a,s)),t.dir=this.dirname(e),t},sep:`/`,delimiter:`:`,joinExtensions:[`.html`]};function Ut(e,t,n,r,i){let a=t[n];for(let o=0;o<a.length;o++){let s=a[o];n<t.length-1?Ut(e.replace(r[n],s),t,n+1,r,i):i.push(e.replace(r[n],s))}}function Wt(e){let t=e.match(/\{(.*?)\}/g),n=[];if(t){let r=[];t.forEach(e=>{let t=e.substring(1,e.length-1).split(`,`);r.push(t)}),Ut(e,r,0,t,n)}else n.push(e);return n}var Gt=e=>!Array.isArray(e),Kt=class{constructor(){this._defaultBundleIdentifierOptions={connector:`-`,createBundleAssetId:(e,t)=>`${e}${this._bundleIdConnector}${t}`,extractAssetIdFromBundle:(e,t)=>t.replace(`${e}${this._bundleIdConnector}`,``)},this._bundleIdConnector=this._defaultBundleIdentifierOptions.connector,this._createBundleAssetId=this._defaultBundleIdentifierOptions.createBundleAssetId,this._extractAssetIdFromBundle=this._defaultBundleIdentifierOptions.extractAssetIdFromBundle,this._assetMap={},this._preferredOrder=[],this._parsers=[],this._resolverHash={},this._bundles={}}setBundleIdentifier(e){if(this._bundleIdConnector=e.connector??this._bundleIdConnector,this._createBundleAssetId=e.createBundleAssetId??this._createBundleAssetId,this._extractAssetIdFromBundle=e.extractAssetIdFromBundle??this._extractAssetIdFromBundle,this._extractAssetIdFromBundle(`foo`,this._createBundleAssetId(`foo`,`bar`))!==`bar`)throw Error(`[Resolver] GenerateBundleAssetId are not working correctly`)}prefer(...e){e.forEach(e=>{this._preferredOrder.push(e),e.priority||(e.priority=Object.keys(e.params))}),this._resolverHash={}}set basePath(e){this._basePath=e}get basePath(){return this._basePath}set rootPath(e){this._rootPath=e}get rootPath(){return this._rootPath}get parsers(){return this._parsers}reset(){this.setBundleIdentifier(this._defaultBundleIdentifierOptions),this._assetMap={},this._preferredOrder=[],this._resolverHash={},this._rootPath=null,this._basePath=null,this._manifest=null,this._bundles={},this._defaultSearchParams=null}setDefaultSearchParams(e){if(typeof e==`string`)this._defaultSearchParams=e;else{let t=e;this._defaultSearchParams=Object.keys(t).map(e=>`${encodeURIComponent(e)}=${encodeURIComponent(t[e])}`).join(`&`)}}getAlias(e){let{alias:t,src:n}=e;return ye(t||n,e=>typeof e==`string`?e:Array.isArray(e)?e.map(e=>e?.src??e):e?.src?e.src:e,!0)}removeAlias(e,t){this._assetMap[e]&&(t&&t!==this._resolverHash[e]||(delete this._resolverHash[e],delete this._assetMap[e]))}addManifest(e){this._manifest&&k(`[Resolver] Manifest already exists, this will be overwritten`),this._manifest=e,e.bundles.forEach(e=>{this.addBundle(e.name,e.assets)})}addBundle(e,t){let n=[],r=t;Array.isArray(t)||(r=Object.entries(t).map(([e,t])=>typeof t==`string`||Array.isArray(t)?{alias:e,src:t}:{alias:e,...t})),r.forEach(t=>{let r=t.src,i=t.alias,a;if(typeof i==`string`){let t=this._createBundleAssetId(e,i);n.push(t),a=[i,t]}else{let t=i.map(t=>this._createBundleAssetId(e,t));n.push(...t),a=[...i,...t]}this.add({...t,alias:a,src:r})}),this._bundles[e]=n}add(e){let t=[];Array.isArray(e)?t.push(...e):t.push(e);let n=e=>{this.hasKey(e)&&k(`[Resolver] already has key: ${e} overwriting`)};ye(t).forEach(e=>{let{src:t}=e,{data:r,format:i,loadParser:a,parser:o}=e,s=ye(t).map(e=>typeof e==`string`?Wt(e):Array.isArray(e)?e:[e]),c=this.getAlias(e);Array.isArray(c)?c.forEach(n):n(c);let l=[],u=e=>({src:e,...this._parsers.find(t=>t.test(e))?.parse(e)});s.forEach(t=>{t.forEach(t=>{let n={};if(typeof t==`object`?(r=t.data??r,i=t.format??i,(t.loadParser||t.parser)&&(a=t.loadParser??a,o=t.parser??o),n={...u(t.src),...t}):n=u(t),!c)throw Error(`[Resolver] alias is undefined for this asset: ${n.src}`);n=this._buildResolvedAsset(n,{aliases:c,data:r,format:i,loadParser:a,parser:o,progressSize:e.progressSize}),l.push(n)})}),c.forEach(e=>{this._assetMap[e]=l})})}resolveBundle(e){let t=Gt(e);e=ye(e);let n={};return e.forEach(e=>{let t=this._bundles[e];if(t){let r=this.resolve(t),i={};for(let t in r){let n=r[t];i[this._extractAssetIdFromBundle(e,t)]=n}n[e]=i}}),t?n[e[0]]:n}resolveUrl(e){let t=this.resolve(e);if(typeof e!=`string`){let e={};for(let n in t)e[n]=t[n].src;return e}return t.src}resolve(e){let t=Gt(e);e=ye(e);let n={};return e.forEach(e=>{if(!this._resolverHash[e]){if(this._assetMap[e]){let t=this._assetMap[e],n=this._getPreferredOrder(t);n?.priority.forEach(e=>{n.params[e].forEach(n=>{let r=t.filter(t=>t[e]?t[e]===n:!1);r.length&&(t=r)})}),this._resolverHash[e]=t[0]}else this._resolverHash[e]=this._buildResolvedAsset({alias:[e],src:e},{})}n[e]=this._resolverHash[e]}),t?n[e[0]]:n}hasKey(e){return!!this._assetMap[e]}hasBundle(e){return!!this._bundles[e]}_getPreferredOrder(e){for(let t=0;t<e.length;t++){let n=e[t],r=this._preferredOrder.find(e=>e.params.format.includes(n.format));if(r)return r}return this._preferredOrder[0]}_appendDefaultSearchParams(e){return this._defaultSearchParams?`${e}${/\?/.test(e)?`&`:`?`}${this._defaultSearchParams}`:e}_buildResolvedAsset(e,t){let{aliases:n,data:r,loadParser:i,parser:a,format:o,progressSize:s}=t;return(this._basePath||this._rootPath)&&(e.src=Ht.toAbsolute(e.src,this._basePath,this._rootPath)),e.alias=n??e.alias??[e.src],e.src=this._appendDefaultSearchParams(e.src),e.data={...r||{},...e.data},e.loadParser=i??e.loadParser,e.parser=a??e.parser,e.format=o??e.format??qt(e.src),s!==void 0&&(e.progressSize=s),e}};Kt.RETINA_PREFIX=/@([0-9\.]+)x/;function qt(e){return e.split(`.`).pop().split(`?`).shift().split(`#`).shift()}var Jt=(e,t)=>{let n=t.split(`?`)[1];return n&&(e+=`?${n}`),e},Yt=class e{constructor(e,n){this.linkedSheets=[];let r=e;e?.source instanceof t&&(r={texture:e,data:n});let{texture:i,data:a,cachePrefix:o=``}=r;this.cachePrefix=o,this._texture=i instanceof O?i:null,this.textureSource=i.source,this.textures={},this.animations={},this.data=a;let s=parseFloat(a.meta.scale);s?(this.resolution=s,i.source.resolution=this.resolution):this.resolution=i.source._resolution,this._frames=this.data.frames,this._frameKeys=Object.keys(this._frames),this._batchIndex=0,this._callback=null}parse(){return new Promise(t=>{this._callback=t,this._batchIndex=0,this._frameKeys.length<=e.BATCH_SIZE?(this._processFrames(0),this._processAnimations(),this._parseComplete()):this._nextBatch()})}parseSync(){return this._processFrames(0,!0),this._processAnimations(),this.textures}_processFrames(t,n=!1){let r=t,i=n?1/0:e.BATCH_SIZE;for(;r-t<i&&r<this._frameKeys.length;){let e=this._frameKeys[r],t=this._frames[e],n=t.frame;if(n){let r=null,i=null,a=t.trimmed!==!1&&t.sourceSize?t.sourceSize:t.frame,o=new s(0,0,Math.floor(a.w)/this.resolution,Math.floor(a.h)/this.resolution);r=t.rotated?new s(Math.floor(n.x)/this.resolution,Math.floor(n.y)/this.resolution,Math.floor(n.h)/this.resolution,Math.floor(n.w)/this.resolution):new s(Math.floor(n.x)/this.resolution,Math.floor(n.y)/this.resolution,Math.floor(n.w)/this.resolution,Math.floor(n.h)/this.resolution),t.trimmed!==!1&&t.spriteSourceSize&&(i=new s(Math.floor(t.spriteSourceSize.x)/this.resolution,Math.floor(t.spriteSourceSize.y)/this.resolution,Math.floor(n.w)/this.resolution,Math.floor(n.h)/this.resolution)),this.textures[e]=new O({source:this.textureSource,frame:r,orig:o,trim:i,rotate:t.rotated?2:0,defaultAnchor:t.anchor,defaultBorders:t.borders,label:e.toString()})}r++}}_processAnimations(){let e=this.data.animations||{};for(let t in e){this.animations[t]=[];for(let n=0;n<e[t].length;n++){let r=e[t][n];this.animations[t].push(this.textures[r])}}}_parseComplete(){let e=this._callback;this._callback=null,this._batchIndex=0,e.call(this,this.textures)}_nextBatch(){this._processFrames(this._batchIndex*e.BATCH_SIZE),this._batchIndex++,setTimeout(()=>{this._batchIndex*e.BATCH_SIZE<this._frameKeys.length?this._nextBatch():(this._processAnimations(),this._parseComplete())},0)}destroy(e=!1){for(let e in this.textures)this.textures[e].destroy();this._frames=null,this._frameKeys=null,this.data=null,this.textures=null,e&&(this._texture?.destroy(),this.textureSource.destroy()),this._texture=null,this.textureSource=null,this.linkedSheets=[]}};Yt.BATCH_SIZE=1e3;var Xt=Yt,Zt=[`jpg`,`png`,`jpeg`,`avif`,`webp`,`basis`,`etc2`,`bc7`,`bc6h`,`bc5`,`bc4`,`bc3`,`bc2`,`bc1`,`eac`,`astc`];function Qt(e,t,n){let r={};if(e.forEach(e=>{r[e]=t}),Object.keys(t.textures).forEach(e=>{r[`${t.cachePrefix}${e}`]=t.textures[e]}),!n){let n=Ht.dirname(e[0]);t.linkedSheets.forEach((e,i)=>{let a=Qt([`${n}/${t.data.meta.related_multi_packs[i]}`],e,!0);Object.assign(r,a)})}return r}var $t={extension:m.Asset,cache:{test:e=>e instanceof Xt,getCacheableAssets:(e,t)=>Qt(e,t,!1)},resolver:{extension:{type:m.ResolveParser,name:`resolveSpritesheet`},test:e=>{let t=e.split(`?`)[0].split(`.`),n=t.pop(),r=t.pop();return n===`json`&&Zt.includes(r)},parse:e=>{let t=e.split(`.`);return{resolution:parseFloat(Kt.RETINA_PREFIX.exec(e)?.[1]??`1`),format:t[t.length-2],src:e}}},loader:{name:`spritesheetLoader`,id:`spritesheet`,extension:{type:m.LoadParser,priority:It.Normal,name:`spritesheetLoader`},async testParse(e,t){return Ht.extname(t.src).toLowerCase()===`.json`&&!!e.frames},async parse(e,t,n){let{texture:r,imageFilename:i,textureOptions:a,cachePrefix:o}=t?.data??{},s=Ht.dirname(t.src);s&&s.lastIndexOf(`/`)!==s.length-1&&(s+=`/`);let c;if(r instanceof O)c=r;else{let r=Jt(s+(i??e.meta.image),t.src);c=(await n.load([{src:r,data:a}]))[r]}let l=new Xt({texture:c.source,data:e,cachePrefix:o});await l.parse();let u=e?.meta?.related_multi_packs;if(Array.isArray(u)){let e=[];for(let r of u){if(typeof r!=`string`)continue;let i=s+r;t.data?.ignoreMultiPack||(i=Jt(i,t.src),e.push(n.load({src:i,data:{textureOptions:a,ignoreMultiPack:!0}})))}let r=await Promise.all(e);l.linkedSheets=r,r.forEach(e=>{e.linkedSheets=[l].concat(l.linkedSheets.filter(t=>t!==e))})}return l},async unload(e,t,n){await n.unload(e.textureSource._sourceOrigin),e.destroy(!1)}}};r.add($t);var en;function tn(e){return en===void 0&&(en=(()=>{let t={stencil:!0,failIfMajorPerformanceCaveat:e??B.defaultOptions.failIfMajorPerformanceCaveat};try{if(!b.get().getWebGLRenderingContext())return!1;let e=b.get().createCanvas().getContext(`webgl`,t),n=!!e?.getContextAttributes()?.stencil;if(e){let t=e.getExtension(`WEBGL_lose_context`);t&&t.loseContext()}return e=null,n}catch{return!1}})()),en}var nn;async function rn(e={}){return nn===void 0&&(nn=await(async()=>{let t=b.get().getNavigator().gpu;if(!t)return!1;try{return await(await t.requestAdapter(e)).requestDevice(),!0}catch{return!1}})()),nn}var an=[`webgl`,`webgpu`,`canvas`];async function on(e){let t=[];e.preference?Array.isArray(e.preference)?t=e.preference.slice():(t.push(e.preference),an.forEach(n=>{n!==e.preference&&t.push(n)})):t=an.slice();let n,r={};for(let i=0;i<t.length;i++){let a=t[i];if(a===`webgpu`&&await rn()){let{WebGPURenderer:t}=await vt(async()=>{let{WebGPURenderer:e}=await Promise.resolve().then(()=>wc);return{WebGPURenderer:e}},void 0,import.meta.url);n=t,r={...e,...e.webgpu};break}if(a===`webgl`&&tn(e.failIfMajorPerformanceCaveat??B.defaultOptions.failIfMajorPerformanceCaveat)){let{WebGLRenderer:t}=await vt(async()=>{let{WebGLRenderer:e}=await Promise.resolve().then(()=>gs);return{WebGLRenderer:e}},void 0,import.meta.url);n=t,r={...e,...e.webgl};break}if(a===`canvas`){let{CanvasRenderer:t}=await vt(async()=>{let{CanvasRenderer:e}=await Promise.resolve().then(()=>Aa);return{CanvasRenderer:e}},void 0,import.meta.url);n=t,r={...e,...e.canvasOptions};break}}if(delete r.webgpu,delete r.webgl,delete r.canvasOptions,!n)throw Error(`No available renderer for the current environment`);let i=new n;return await i.init(r),i}var sn=class{static init(e){Object.defineProperty(this,"resizeTo",{configurable:!0,set(e){globalThis.removeEventListener(`resize`,this.queueResize),this._resizeTo=e,e&&(globalThis.addEventListener(`resize`,this.queueResize),this.resize())},get(){return this._resizeTo}}),this.queueResize=()=>{this._resizeTo&&(this._cancelResize(),this._resizeId=requestAnimationFrame(()=>this.resize()))},this._cancelResize=()=>{this._resizeId&&(cancelAnimationFrame(this._resizeId),this._resizeId=null)},this.resize=()=>{if(!this._resizeTo)return;this._cancelResize();let e,t;if(this._resizeTo===globalThis.window)e=globalThis.innerWidth,t=globalThis.innerHeight;else{let{clientWidth:n,clientHeight:r}=this._resizeTo;e=n,t=r}this.renderer.resize(e,t),this.render()},this._resizeId=null,this._resizeTo=null,this.resizeTo=e.resizeTo||null}static destroy(){globalThis.removeEventListener(`resize`,this.queueResize),this._cancelResize(),this._cancelResize=null,this.queueResize=null,this.resizeTo=null,this.resize=null}};sn.extension=m.Application;var cn=class{static init(e){e=Object.assign({autoStart:!0,sharedTicker:!1},e),Object.defineProperty(this,"ticker",{configurable:!0,set(e){this._ticker&&this._ticker.remove(this.render,this),this._ticker=e,e&&e.add(this.render,this,se.LOW)},get(){return this._ticker}}),this.stop=()=>{this._ticker.stop()},this.start=()=>{this._ticker.start()},this._ticker=null,this.ticker=e.sharedTicker?N.shared:new N,e.autoStart&&this.start()}static destroy(){if(this._ticker){let e=this._ticker;this.ticker=null,e.destroy()}}};cn.extension=m.Application,r.add(sn),r.add(cn);var ln=class e{constructor(...e){this.stage=new P,e[0]!==void 0&&c(l,`Application constructor options are deprecated, please use Application.init() instead.`)}async init(t){t={...t},this.stage||(this.stage=new P),this.renderer=await on(t),e._plugins.forEach(e=>{e.init.call(this,t)})}render(){this.renderer.render({container:this.stage})}get canvas(){return this.renderer.canvas}get view(){return c(l,`Application.view is deprecated, please use Application.canvas instead.`),this.renderer.canvas}get screen(){return this.renderer.screen}get domContainerRoot(){return this.renderer.renderPipes.dom?._domElement}destroy(t=!1,n=!1){let r=e._plugins.slice(0);r.reverse(),r.forEach(e=>{e.destroy.call(this)}),this.stage.destroy(n),this.stage=null,this.renderer.destroy(t),this.renderer=null}};ln._plugins=[];var un=ln;r.handleByList(m.Application,un._plugins),r.add(Se);var dn={test(e){return typeof e==`string`&&e.startsWith(`info face=`)},parse(e){let t=e.match(/^[a-z]+\s+.+$/gm),n={info:[],common:[],page:[],char:[],chars:[],kerning:[],kernings:[],distanceField:[]};for(let e in t){let r=t[e].match(/^[a-z]+/gm)[0],i=t[e].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm),a={};for(let e in i){let t=i[e].split(`=`),n=t[0],r=t[1].replace(/"/gm,``),o=parseFloat(r);a[n]=isNaN(o)?r:o}n[r].push(a)}let r={chars:{},pages:[],lineHeight:0,fontSize:0,fontFamily:``,distanceField:null,baseLineOffset:0},[i]=n.info,[a]=n.common,[o]=n.distanceField??[];o&&(r.distanceField={range:parseInt(o.distanceRange,10),type:o.fieldType}),r.fontSize=parseInt(i.size,10),r.fontFamily=i.face,r.lineHeight=parseInt(a.lineHeight,10);let s=n.page;for(let e=0;e<s.length;e++)r.pages.push({id:parseInt(s[e].id,10)||0,file:s[e].file});let c={};r.baseLineOffset=a.base===void 0?0:r.lineHeight-parseInt(a.base,10);let l=n.char;for(let e=0;e<l.length;e++){let t=l[e],n=parseInt(t.id,10),i=t.letter??t.char??String.fromCharCode(n);i===`space`&&(i=` `),c[n]=i,r.chars[i]={id:n,page:parseInt(t.page,10)||0,x:parseInt(t.x,10),y:parseInt(t.y,10),width:parseInt(t.width,10),height:parseInt(t.height,10),xOffset:parseInt(t.xoffset,10),yOffset:parseInt(t.yoffset,10),xAdvance:parseInt(t.xadvance,10),kerning:{}}}let u=n.kerning||[];for(let e=0;e<u.length;e++){let t=parseInt(u[e].first,10),n=parseInt(u[e].second,10),i=parseInt(u[e].amount,10);r.chars[c[n]]&&(r.chars[c[n]].kerning[c[t]]=i)}return r}},fn={test(e){let t=e;return typeof t!=`string`&&`getElementsByTagName`in t&&t.getElementsByTagName(`page`).length&&t.getElementsByTagName(`info`)[0].getAttribute(`face`)!==null},parse(e){let t={chars:{},pages:[],lineHeight:0,fontSize:0,fontFamily:``,distanceField:null,baseLineOffset:0},n=e.getElementsByTagName(`info`)[0],r=e.getElementsByTagName(`common`)[0],i=e.getElementsByTagName(`distanceField`)[0];i&&(t.distanceField={type:i.getAttribute(`fieldType`),range:parseInt(i.getAttribute(`distanceRange`),10)});let a=e.getElementsByTagName(`page`),o=e.getElementsByTagName(`char`),s=e.getElementsByTagName(`kerning`);t.fontSize=parseInt(n.getAttribute(`size`),10),t.fontFamily=n.getAttribute(`face`),t.lineHeight=parseInt(r.getAttribute(`lineHeight`),10);for(let e=0;e<a.length;e++)t.pages.push({id:parseInt(a[e].getAttribute(`id`),10)||0,file:a[e].getAttribute(`file`)});let c={},l=r.getAttribute(`base`);t.baseLineOffset=l===null?0:t.lineHeight-parseInt(l,10);for(let e=0;e<o.length;e++){let n=o[e],r=parseInt(n.getAttribute(`id`),10),i=n.getAttribute(`letter`)??n.getAttribute(`char`)??String.fromCharCode(r);i===`space`&&(i=` `),c[r]=i,t.chars[i]={id:r,page:parseInt(n.getAttribute(`page`),10)||0,x:parseInt(n.getAttribute(`x`),10),y:parseInt(n.getAttribute(`y`),10),width:parseInt(n.getAttribute(`width`),10),height:parseInt(n.getAttribute(`height`),10),xOffset:parseInt(n.getAttribute(`xoffset`),10),yOffset:parseInt(n.getAttribute(`yoffset`),10),xAdvance:parseInt(n.getAttribute(`xadvance`),10),kerning:{}}}for(let e=0;e<s.length;e++){let n=parseInt(s[e].getAttribute(`first`),10),r=parseInt(s[e].getAttribute(`second`),10),i=parseInt(s[e].getAttribute(`amount`),10);t.chars[c[r]]&&(t.chars[c[r]].kerning[c[n]]=i)}return t}},pn={test(e){return typeof e==`string`&&e.match(/<font(\s|>)/)?fn.test(b.get().parseXML(e)):!1},parse(e){return fn.parse(b.get().parseXML(e))}},mn=[`.xml`,`.fnt`],hn={extension:{type:m.CacheParser,name:`cacheBitmapFont`},test:e=>!!e?.pages&&!!e?.chars&&typeof e?.fontFamily==`string`&&e.fontFamily!==``,getCacheableAssets(e,t){let n={};return e.forEach(e=>{n[e]=t,n[`${e}-bitmap`]=t}),n[`${t.fontFamily}-bitmap`]=t,n}},gn={extension:{type:m.LoadParser,priority:It.Normal},name:`loadBitmapFont`,id:`bitmap-font`,test(e){return mn.includes(Ht.extname(e).toLowerCase())},async testParse(e){return dn.test(e)||pn.test(e)},async parse(e,t,n){let r=dn.test(e)?dn.parse(e):pn.parse(e),{src:i}=t,{pages:a}=r,o=[],s=r.distanceField?{scaleMode:`linear`,alphaMode:`premultiply-alpha-on-upload`,autoGenerateMipmaps:!1,resolution:1}:{};for(let e=0;e<a.length;++e){let t=a[e].file,n=Ht.join(Ht.dirname(i),t);n=Jt(n,i),o.push({src:n,data:s})}let[c,{BitmapFont:l}]=await Promise.all([n.load(o),vt(()=>Promise.resolve().then(()=>Nc),void 0,import.meta.url)]);return new l({data:r,textures:o.map(e=>c[e.src])},i)},async load(e,t){return await(await b.get().fetch(e)).text()},async unload(e,t,n){await Promise.all(e.pages.map(e=>n.unload(e.texture.source._sourceOrigin))),e.destroy()}},_n=class{constructor(e,t=!1){this._loader=e,this._assetList=[],this._isLoading=!1,this._maxConcurrent=1,this.verbose=t}add(e){e.forEach(e=>{this._assetList.push(e)}),this.verbose&&console.log(`[BackgroundLoader] assets: `,this._assetList),this._isActive&&!this._isLoading&&this._next()}async _next(){if(this._assetList.length&&this._isActive){this._isLoading=!0;let e=[],t=Math.min(this._assetList.length,this._maxConcurrent);for(let n=0;n<t;n++)e.push(this._assetList.pop());await this._loader.load(e),this._isLoading=!1,this._next()}}get active(){return this._isActive}set active(e){this._isActive!==e&&(this._isActive=e,e&&!this._isLoading&&this._next())}},vn={extension:{type:m.CacheParser,name:`cacheTextureArray`},test:e=>Array.isArray(e)&&e.every(e=>e instanceof O),getCacheableAssets:(e,t)=>{let n={};return e.forEach(e=>{t.forEach((t,r)=>{n[e+(r===0?``:r+1)]=t})}),n}};async function yn(e){if(`Image`in globalThis)return new Promise(t=>{let n=new Image;n.onload=()=>{t(!0)},n.onerror=()=>{t(!1)},n.src=e});if(`createImageBitmap`in globalThis&&`fetch`in globalThis){try{let t=await(await fetch(e)).blob();await createImageBitmap(t)}catch{return!1}return!0}return!1}var bn={extension:{type:m.DetectionParser,priority:1},test:async()=>yn(`data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=`),add:async e=>[...e,`avif`],remove:async e=>e.filter(e=>e!==`avif`)},xn=[`png`,`jpg`,`jpeg`],Sn={extension:{type:m.DetectionParser,priority:-1},test:()=>Promise.resolve(!0),add:async e=>[...e,...xn],remove:async e=>e.filter(e=>!xn.includes(e))},Cn=`WorkerGlobalScope`in globalThis&&globalThis instanceof globalThis.WorkerGlobalScope;function wn(e){return!Cn&&document.createElement(`video`).canPlayType(e)!==``}var Tn={extension:{type:m.DetectionParser,priority:0},test:async()=>wn(`video/mp4`),add:async e=>[...e,`mp4`,`m4v`],remove:async e=>e.filter(e=>e!==`mp4`&&e!==`m4v`)},En={extension:{type:m.DetectionParser,priority:0},test:async()=>wn(`video/ogg`),add:async e=>[...e,`ogv`],remove:async e=>e.filter(e=>e!==`ogv`)},Dn={extension:{type:m.DetectionParser,priority:0},test:async()=>wn(`video/webm`),add:async e=>[...e,`webm`],remove:async e=>e.filter(e=>e!==`webm`)},On={extension:{type:m.DetectionParser,priority:0},test:async()=>yn(`data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=`),add:async e=>[...e,`webp`],remove:async e=>e.filter(e=>e!==`webp`)},kn=class e{constructor(){this.loadOptions={...e.defaultOptions},this._parsers=[],this._parsersValidated=!1,this.parsers=new Proxy(this._parsers,{set:(e,t,n)=>(this._parsersValidated=!1,e[t]=n,!0)}),this.promiseCache={}}reset(){this._parsersValidated=!1,this.promiseCache={}}_getLoadPromiseAndParser(e,t){let n={promise:null,parser:null};return n.promise=(async()=>{let r=null,i=null;if((t.parser||t.loadParser)&&(i=this._parserHash[t.parser||t.loadParser],t.loadParser&&k(`[Assets] "loadParser" is deprecated, use "parser" instead for ${e}`),i||k(`[Assets] specified load parser "${t.parser||t.loadParser}" not found while loading ${e}`)),!i){for(let n=0;n<this.parsers.length;n++){let r=this.parsers[n];if(r.load&&r.test?.(e,t,this)){i=r;break}}if(!i)return k(`[Assets] ${e} could not be loaded as we don't know how to parse it, ensure the correct parser has been added`),null}r=await i.load(e,t,this),n.parser=i;for(let e=0;e<this.parsers.length;e++){let i=this.parsers[e];i.parse&&i.parse&&await i.testParse?.(r,t,this)&&(r=await i.parse(r,t,this)||r,n.parser=i)}return r})(),n}async load(t,n){this._parsersValidated||this._validateParsers();let{onProgress:r,onError:i,strategy:a,retryCount:o,retryDelay:s}=typeof n==`function`?{...e.defaultOptions,...this.loadOptions,onProgress:n}:{...e.defaultOptions,...this.loadOptions,...n||{}},c=0,l={},u=Gt(t),d=ye(t,e=>({alias:[e],src:e,data:{}})),f=d.reduce((e,t)=>e+(t.progressSize||1),0),p=d.map(async e=>{let t=Ht.toAbsolute(e.src);l[e.src]||(await this._loadAssetWithRetry(t,e,{onProgress:r,onError:i,strategy:a,retryCount:o,retryDelay:s},l),c+=e.progressSize||1,r&&r(c/f))});return await Promise.all(p),u?l[d[0].src]:l}async unload(e){let t=ye(e,e=>({alias:[e],src:e})).map(async e=>{let t=Ht.toAbsolute(e.src),n=this.promiseCache[t];if(n){let r=await n.promise;delete this.promiseCache[t],await n.parser?.unload?.(r,e,this)}});await Promise.all(t)}_validateParsers(){this._parsersValidated=!0,this._parserHash=this._parsers.filter(e=>e.name||e.id).reduce((e,t)=>(!t.name&&!t.id?k(`[Assets] parser should have an id`):(e[t.name]||e[t.id])&&k(`[Assets] parser id conflict "${t.id}"`),e[t.name]=t,t.id&&(e[t.id]=t),e),{})}async _loadAssetWithRetry(e,t,n,r){let i=0,{onError:a,strategy:o,retryCount:s,retryDelay:c}=n,l=e=>new Promise(t=>setTimeout(t,e));for(;;)try{this.promiseCache[e]||(this.promiseCache[e]=this._getLoadPromiseAndParser(e,t)),r[t.src]=await this.promiseCache[e].promise;return}catch(n){if(delete this.promiseCache[e],delete r[t.src],i++,o===`retry`&&!(o!==`retry`||i>s)){a&&a(n,t),await l(c);continue}if(o===`skip`){a&&a(n,t);return}a&&a(n,t);let u=Error(`[Loader.load] Failed to load ${e}.
${n}`);throw n instanceof Error&&n.stack&&(u.stack=n.stack),u}}};kn.defaultOptions={onProgress:void 0,onError:void 0,strategy:`throw`,retryCount:3,retryDelay:250};var An=kn;function jn(e,t){if(Array.isArray(t)){for(let n of t)if(e.startsWith(`data:${n}`))return!0;return!1}return e.startsWith(`data:${t}`)}function Mn(e,t){let n=e.split(`?`)[0],r=Ht.extname(n).toLowerCase();return Array.isArray(t)?t.includes(r):r===t}var Nn=`.json`,Pn=`application/json`,Fn={extension:{type:m.LoadParser,priority:It.Low},name:`loadJson`,id:`json`,test(e){return jn(e,Pn)||Mn(e,Nn)},async load(e){return await(await b.get().fetch(e)).json()}},In=`.txt`,Ln=`text/plain`,Rn={name:`loadTxt`,id:`text`,extension:{type:m.LoadParser,priority:It.Low,name:`loadTxt`},test(e){return jn(e,Ln)||Mn(e,In)},async load(e){return await(await b.get().fetch(e)).text()}},zn=[`normal`,`bold`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`],Bn=[`.ttf`,`.otf`,`.woff`,`.woff2`],Vn=[`font/ttf`,`font/otf`,`font/woff`,`font/woff2`],Hn=/^(--|-?[A-Z_])[0-9A-Z_-]*$/i;function Un(e){let t=Ht.extname(e),n=Ht.basename(e,t).replace(/(-|_)/g,` `).toLowerCase().split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)),r=n.length>0;for(let e of n)if(!e.match(Hn)){r=!1;break}let i=n.join(` `);return r||(i=`"${i.replace(/[\\"]/g,`\\$&`)}"`),i}var Wn=/^[0-9A-Za-z%:/?#\[\]@!\$&'()\*\+,;=\-._~]*$/;function Gn(e){return Wn.test(e)?e:encodeURI(e)}var Kn={extension:{type:m.LoadParser,priority:It.Low},name:`loadWebFont`,id:`web-font`,test(e){return jn(e,Vn)||Mn(e,Bn)},async load(e,t){let n=b.get().getFontFaceSet();if(n){let r=[],i=t.data?.family??Un(e),a=t.data?.weights?.filter(e=>zn.includes(e))??[`normal`],o=t.data??{};for(let t=0;t<a.length;t++){let s=a[t],c=new FontFace(i,`url('${Gn(e)}')`,{...o,weight:s});await c.load(),n.add(c),r.push(c)}return R.has(`${i}-and-url`)?R.get(`${i}-and-url`).entries.push({url:e,faces:r}):R.set(`${i}-and-url`,{entries:[{url:e,faces:r}]}),r.length===1?r[0]:r}return k(`[loadWebFont] FontFace API is not supported. Skipping loading font`),null},unload(e){let t=Array.isArray(e)?e:[e],n=t[0].family,r=R.get(`${n}-and-url`),i=r.entries.find(e=>e.faces.some(e=>t.indexOf(e)!==-1));i.faces=i.faces.filter(e=>t.indexOf(e)===-1),i.faces.length===0&&(r.entries=r.entries.filter(e=>e!==i)),t.forEach(e=>{b.get().getFontFaceSet().delete(e)}),r.entries.length===0&&R.remove(`${n}-and-url`)}};function qn(e,t=1){let n=Kt.RETINA_PREFIX?.exec(e);return n?parseFloat(n[1]):t}function Jn(e,t,n){e.label=n,e._sourceOrigin=n;let r=new O({source:e,label:n}),i=()=>{delete t.promiseCache[n],R.has(n)&&R.remove(n)};return r.source.once(`destroy`,()=>{t.promiseCache[n]&&(k(`[Assets] A TextureSource managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the TextureSource.`),i())}),r.once(`destroy`,()=>{e.destroyed||(k(`[Assets] A Texture managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the Texture.`),i())}),r}var Yn=`.svg`,Xn=`image/svg+xml`,Zn={extension:{type:m.LoadParser,priority:It.Low,name:`loadSVG`},name:`loadSVG`,id:`svg`,config:{crossOrigin:`anonymous`,parseAsGraphicsContext:!1},test(e){return jn(e,Xn)||Mn(e,Yn)},async load(e,t,n){return t.data?.parseAsGraphicsContext??this.config.parseAsGraphicsContext?$n(e):Qn(e,t,n,this.config.crossOrigin)},unload(e){e.destroy(!0)}};async function Qn(e,t,n,r){let i=await b.get().fetch(e),a=b.get().createImage();a.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(await i.text())}`,a.crossOrigin=r,await a.decode();let o=t.data?.width??a.width,s=t.data?.height??a.height,c=t.data?.resolution||qn(e),l=Math.ceil(o*c),u=Math.ceil(s*c),d=b.get().createCanvas(l,u),f=d.getContext(`2d`);f.imageSmoothingEnabled=!0,f.imageSmoothingQuality=`high`,f.drawImage(a,0,0,o*c,s*c);let{parseAsGraphicsContext:p,...m}=t.data??{};return Jn(new L({resource:d,alphaMode:`premultiply-alpha-on-upload`,resolution:c,...m}),n,e)}async function $n(e){let t=await(await b.get().fetch(e)).text(),n=new Be;return n.svg(t),n}var er=`(function () {
    'use strict';

    const WHITE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
    async function checkImageBitmap() {
      try {
        if (typeof createImageBitmap !== "function") return false;
        const response = await fetch(WHITE_PNG);
        const imageBlob = await response.blob();
        const imageBitmap = await createImageBitmap(imageBlob);
        return imageBitmap.width === 1 && imageBitmap.height === 1;
      } catch (_e) {
        return false;
      }
    }
    void checkImageBitmap().then((result) => {
      self.postMessage(result);
    });

})();
`,tr=null,nr=class{constructor(){tr||(tr=URL.createObjectURL(new Blob([er],{type:`application/javascript`}))),this.worker=new Worker(tr)}};nr.revokeObjectURL=function(){tr&&(URL.revokeObjectURL(tr),tr=null)};var rr=`(function () {
    'use strict';

    async function loadImageBitmap(url, alphaMode) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`[WorkerManager.loadImageBitmap] Failed to fetch \${url}: \${response.status} \${response.statusText}\`);
      }
      const imageBlob = await response.blob();
      return alphaMode === "premultiplied-alpha" ? createImageBitmap(imageBlob, { premultiplyAlpha: "none" }) : createImageBitmap(imageBlob);
    }
    self.onmessage = async (event) => {
      try {
        const imageBitmap = await loadImageBitmap(event.data.data[0], event.data.data[1]);
        self.postMessage({
          data: imageBitmap,
          uuid: event.data.uuid,
          id: event.data.id
        }, [imageBitmap]);
      } catch (e) {
        self.postMessage({
          error: e,
          uuid: event.data.uuid,
          id: event.data.id
        });
      }
    };

})();
`,ir=null,ar=class{constructor(){ir||(ir=URL.createObjectURL(new Blob([rr],{type:`application/javascript`}))),this.worker=new Worker(ir)}};ar.revokeObjectURL=function(){ir&&(URL.revokeObjectURL(ir),ir=null)};var or=0,sr,cr=new class{constructor(){this._initialized=!1,this._createdWorkers=0,this._workerPool=[],this._queue=[],this._resolveHash={}}isImageBitmapSupported(){return this._isImageBitmapSupported===void 0&&(this._isImageBitmapSupported=new Promise(e=>{let{worker:t}=new nr;t.addEventListener(`message`,n=>{t.terminate(),nr.revokeObjectURL(),e(n.data)})})),this._isImageBitmapSupported}loadImageBitmap(e,t){return this._run(`loadImageBitmap`,[e,t?.data?.alphaMode])}async _initWorkers(){this._initialized||(this._initialized=!0)}_getWorker(){sr===void 0&&(sr=navigator.hardwareConcurrency||4);let e=this._workerPool.pop();return!e&&this._createdWorkers<sr&&(this._createdWorkers++,e=new ar().worker,e.addEventListener(`message`,e=>{this._complete(e.data),this._returnWorker(e.target),this._next()})),e}_returnWorker(e){this._workerPool.push(e)}_complete(e){this._resolveHash[e.uuid]&&(e.error===void 0?this._resolveHash[e.uuid].resolve(e.data):this._resolveHash[e.uuid].reject(e.error),delete this._resolveHash[e.uuid])}async _run(e,t){await this._initWorkers();let n=new Promise((n,r)=>{this._queue.push({id:e,arguments:t,resolve:n,reject:r})});return this._next(),n}_next(){if(!this._queue.length)return;let e=this._getWorker();if(!e)return;let t=this._queue.pop(),n=t.id;this._resolveHash[or]={resolve:t.resolve,reject:t.reject},e.postMessage({data:t.arguments,uuid:or++,id:n})}reset(){this._workerPool.forEach(e=>e.terminate()),this._workerPool.length=0,Object.values(this._resolveHash).forEach(({reject:e})=>{e?.(Error(`WorkerManager has been reset before completion`))}),this._resolveHash={},this._queue.length=0,this._initialized=!1,this._createdWorkers=0}},lr=[`.jpeg`,`.jpg`,`.png`,`.webp`,`.avif`],ur=[`image/jpeg`,`image/png`,`image/webp`,`image/avif`];async function dr(e,t){let n=await b.get().fetch(e);if(!n.ok)throw Error(`[loadImageBitmap] Failed to fetch ${e}: ${n.status} ${n.statusText}`);let r=await n.blob();return t?.data?.alphaMode===`premultiplied-alpha`?createImageBitmap(r,{premultiplyAlpha:`none`}):createImageBitmap(r)}var fr={name:`loadTextures`,id:`texture`,extension:{type:m.LoadParser,priority:It.High,name:`loadTextures`},config:{preferWorkers:!0,preferCreateImageBitmap:!0,crossOrigin:`anonymous`},test(e){return jn(e,ur)||Mn(e,lr)},async load(e,t,n){let r=null;return r=globalThis.createImageBitmap&&this.config.preferCreateImageBitmap?this.config.preferWorkers&&await cr.isImageBitmapSupported()?await cr.loadImageBitmap(e,t):await dr(e,t):await new Promise((t,n)=>{r=b.get().createImage(),r.crossOrigin=this.config.crossOrigin,r.src=e,r.complete?t(r):(r.onload=()=>{t(r)},r.onerror=n)}),Jn(new L({resource:r,alphaMode:`premultiply-alpha-on-upload`,resolution:t.data?.resolution||qn(e),...t.data}),n,e)},unload(e){e.destroy(!0)}},pr=[`.mp4`,`.m4v`,`.webm`,`.ogg`,`.ogv`,`.h264`,`.avi`,`.mov`],mr,hr;function gr(e,t,n){n===void 0&&!t.startsWith(`data:`)?e.crossOrigin=vr(t):n!==!1&&(e.crossOrigin=typeof n==`string`?n:`anonymous`)}function _r(e){return new Promise((t,n)=>{e.addEventListener(`canplaythrough`,r),e.addEventListener(`error`,i),e.load();function r(){a(),t()}function i(e){a(),n(e)}function a(){e.removeEventListener(`canplaythrough`,r),e.removeEventListener(`error`,i)}})}function vr(e,t=globalThis.location){if(e.startsWith(`data:`))return``;t||(t=globalThis.location);let n=new URL(e,document.baseURI);return n.hostname!==t.hostname||n.port!==t.port||n.protocol!==t.protocol?`anonymous`:``}function yr(){let e=[],t=[];for(let n of pr){let r=jt.MIME_TYPES[n.substring(1)]||`video/${n.substring(1)}`;wn(r)&&(e.push(n),t.includes(r)||t.push(r))}return{validVideoExtensions:e,validVideoMime:t}}var br={name:`loadVideo`,id:`video`,extension:{type:m.LoadParser,name:`loadVideo`},test(e){if(!mr||!hr){let{validVideoExtensions:e,validVideoMime:t}=yr();mr=e,hr=t}let t=jn(e,hr),n=Mn(e,mr);return t||n},async load(e,t,n){let r={...jt.defaultOptions,resolution:t.data?.resolution||qn(e),alphaMode:t.data?.alphaMode||await kt(),...t.data},i=document.createElement(`video`),a={preload:r.autoLoad===!1?void 0:`auto`,"webkit-playsinline":r.playsinline===!1?void 0:``,playsinline:r.playsinline===!1?void 0:``,muted:r.muted===!0?``:void 0,loop:r.loop===!0?``:void 0,autoplay:r.autoPlay===!1?void 0:``};Object.keys(a).forEach(e=>{let t=a[e];t!==void 0&&i.setAttribute(e,t)}),r.muted===!0&&(i.muted=!0),gr(i,e,r.crossorigin);let o=document.createElement(`source`),s;if(r.mime)s=r.mime;else if(e.startsWith(`data:`))s=e.slice(5,e.indexOf(`;`));else if(!e.startsWith(`blob:`)){let t=e.split(`?`)[0].slice(e.lastIndexOf(`.`)+1).toLowerCase();s=jt.MIME_TYPES[t]||`video/${t}`}return o.src=e,s&&(o.type=s),new Promise((a,s)=>{r.preload&&!r.autoPlay&&i.load(),i.addEventListener(`canplay`,c),i.addEventListener(`error`,l),o.addEventListener(`error`,l),i.appendChild(o);async function c(){let o=new jt({...r,resource:i});u(),t.data.preload&&await _r(i),a(Jn(o,n,e))}function l(e){u(),s(e)}function u(){i.removeEventListener(`canplay`,c),i.removeEventListener(`error`,l),o.removeEventListener(`error`,l)}})},unload(e){e.destroy(!0)}},xr={extension:{type:m.ResolveParser,name:`resolveTexture`},test:fr.test,parse:e=>({resolution:parseFloat(Kt.RETINA_PREFIX.exec(e)?.[1]??`1`),format:e.split(`.`).pop(),src:e})},Sr={extension:{type:m.ResolveParser,priority:-2,name:`resolveJson`},test:e=>Kt.RETINA_PREFIX.test(e)&&e.endsWith(`.json`),parse:xr.parse},Cr=new class{constructor(){this._detections=[],this._initialized=!1,this.resolver=new Kt,this.loader=new An,this.cache=R,this._backgroundLoader=new _n(this.loader),this._backgroundLoader.active=!0,this.reset()}async init(e={}){if(this._initialized){k(`[Assets]AssetManager already initialized, did you load before calling this Assets.init()?`);return}if(this._initialized=!0,e.defaultSearchParams&&this.resolver.setDefaultSearchParams(e.defaultSearchParams),e.basePath&&(this.resolver.basePath=e.basePath),e.bundleIdentifier&&this.resolver.setBundleIdentifier(e.bundleIdentifier),e.manifest){let t=e.manifest;typeof t==`string`&&(t=await this.load(t)),this.resolver.addManifest(t)}let t=e.texturePreference?.resolution??1,n=typeof t==`number`?[t]:t,r=await this._detectFormats({preferredFormats:e.texturePreference?.format,skipDetections:e.skipDetections,detections:this._detections});this.resolver.prefer({params:{format:r,resolution:n}}),e.preferences&&this.setPreferences(e.preferences),e.loadOptions&&(this.loader.loadOptions={...this.loader.loadOptions,...e.loadOptions})}add(e){this.resolver.add(e)}async load(e,t){this._initialized||await this.init();let n=Gt(e),r=ye(e).map(e=>{if(typeof e!=`string`){let t=this.resolver.getAlias(e);return t.some(e=>!this.resolver.hasKey(e))&&this.add(e),Array.isArray(t)?t[0]:t}return this.resolver.hasKey(e)||this.add({alias:e,src:e}),e}),i=this.resolver.resolve(r),a=await this._mapLoadToResolve(i,t);return n?a[r[0]]:a}addBundle(e,t){this.resolver.addBundle(e,t)}async loadBundle(e,t){this._initialized||await this.init();let n=!1;typeof e==`string`&&(n=!0,e=[e]);let r=this.resolver.resolveBundle(e),i={},a=Object.keys(r),o=0,s=[],c=()=>{t?.(s.reduce((e,t)=>e+t,0)/o)},l=a.map((e,t)=>{let n=r[e],a=Object.values(n),l=[...new Set(a.flat())].reduce((e,t)=>e+(t.progressSize||1),0);return s.push(0),o+=l,this._mapLoadToResolve(n,e=>{s[t]=e*l,c()}).then(t=>{i[e]=t})});return await Promise.all(l),n?i[e[0]]:i}async backgroundLoad(e){this._initialized||await this.init(),typeof e==`string`&&(e=[e]);let t=this.resolver.resolve(e);this._backgroundLoader.add(Object.values(t))}async backgroundLoadBundle(e){this._initialized||await this.init(),typeof e==`string`&&(e=[e]);let t=this.resolver.resolveBundle(e);Object.values(t).forEach(e=>{this._backgroundLoader.add(Object.values(e))})}reset(){this.resolver.reset(),this.loader.reset(),this.cache.reset(),this._initialized=!1}get(e){if(typeof e==`string`)return R.get(e);let t={};for(let n=0;n<e.length;n++)t[n]=R.get(e[n]);return t}async _mapLoadToResolve(e,t){let n=[...new Set(Object.values(e))];this._backgroundLoader.active=!1;let r=await this.loader.load(n,t);this._backgroundLoader.active=!0;let i={};return n.forEach(e=>{let t=r[e.src],n=[e.src];e.alias&&n.push(...e.alias),n.forEach(e=>{i[e]=t}),R.set(n,t)}),i}async unload(e){this._initialized||await this.init();let t=ye(e).map(e=>typeof e==`string`?e:e.src),n=this.resolver.resolve(t);await this._unloadFromResolved(n)}async unloadBundle(e){this._initialized||await this.init(),e=ye(e);let t=this.resolver.resolveBundle(e),n=Object.keys(t).map(e=>this._unloadFromResolved(t[e]));await Promise.all(n)}async _unloadFromResolved(e){let t=Object.values(e);t.forEach(e=>{R.remove(e.src)}),await this.loader.unload(t)}async _detectFormats(e){let t=[];e.preferredFormats&&(t=Array.isArray(e.preferredFormats)?e.preferredFormats:[e.preferredFormats]);for(let n of e.detections)e.skipDetections||await n.test()?t=await n.add(t):e.skipDetections||(t=await n.remove(t));return t=t.filter((e,n)=>t.indexOf(e)===n),t}get detections(){return this._detections}setPreferences(e){this.loader.parsers.forEach(t=>{t.config&&Object.keys(t.config).filter(t=>t in e).forEach(n=>{t.config[n]=e[n]})})}};r.handleByList(m.LoadParser,Cr.loader.parsers).handleByList(m.ResolveParser,Cr.resolver.parsers).handleByList(m.CacheParser,Cr.cache.parsers).handleByList(m.DetectionParser,Cr.detections),r.add(vn,Sn,bn,On,Tn,En,Dn,Fn,Rn,Kn,Zn,fr,br,gn,hn,xr,Sr);var wr={loader:m.LoadParser,resolver:m.ResolveParser,cache:m.CacheParser,detection:m.DetectionParser};r.handle(m.Asset,e=>{let t=e.ref;Object.entries(wr).filter(([e])=>!!t[e]).forEach(([e,n])=>r.add(Object.assign(t[e],{extension:t[e].extension??n})))},e=>{let t=e.ref;Object.keys(wr).filter(e=>!!t[e]).forEach(e=>r.remove(t[e]))});var Tr=new e;function Er(e,t,n,r,i=!1,a){let o=Tr;o.minX=0,o.minY=0,o.maxX=e.width/r|0,o.maxY=e.height/r|0;let s=le.getOptimalTexture({width:o.width,height:o.height,resolution:r,autoGenerateMipmaps:i,scaleMode:a});return s.source.uploadMethodId=`image`,s.source.resource=e,s.source.alphaMode=`premultiply-alpha-on-upload`,s.frame.width=t/r,s.frame.height=n/r,s.source.emit(`update`,s.source),s.updateUvs(),s}var Dr=`in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`,Or=`
in vec2 vTextureCoord;
in vec4 vColor;

out vec4 finalColor;

uniform float uColorMatrix[20];
uniform float uAlpha;

uniform sampler2D uTexture;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    vec4 color = texture(uTexture, vTextureCoord);
    float randomValue = rand(gl_FragCoord.xy * 0.2);
    float diff = (randomValue - 0.5) *  0.5;

    if (uAlpha == 0.0) {
        finalColor = color;
        return;
    }

    if (color.a > 0.0) {
        color.rgb /= color.a;
    }

    vec4 result;

    result.r = (uColorMatrix[0] * color.r);
        result.r += (uColorMatrix[1] * color.g);
        result.r += (uColorMatrix[2] * color.b);
        result.r += (uColorMatrix[3] * color.a);
        result.r += uColorMatrix[4];

    result.g = (uColorMatrix[5] * color.r);
        result.g += (uColorMatrix[6] * color.g);
        result.g += (uColorMatrix[7] * color.b);
        result.g += (uColorMatrix[8] * color.a);
        result.g += uColorMatrix[9];

    result.b = (uColorMatrix[10] * color.r);
       result.b += (uColorMatrix[11] * color.g);
       result.b += (uColorMatrix[12] * color.b);
       result.b += (uColorMatrix[13] * color.a);
       result.b += uColorMatrix[14];

    result.a = (uColorMatrix[15] * color.r);
       result.a += (uColorMatrix[16] * color.g);
       result.a += (uColorMatrix[17] * color.b);
       result.a += (uColorMatrix[18] * color.a);
       result.a += uColorMatrix[19];

    vec3 rgb = mix(color.rgb, result.rgb, uAlpha);

    // Premultiply alpha again.
    rgb *= result.a;

    finalColor = vec4(rgb, result.a);
}
`,kr=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct ColorMatrixUniforms {
  uColorMatrix:array<vec4<f32>, 5>,
  uAlpha:f32,
};


@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;
@group(1) @binding(0) var<uniform> colorMatrixUniforms : ColorMatrixUniforms;


struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
  };
  
fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
  );
}


@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {


  var c = textureSample(uTexture, uSampler, uv);
  
  if (colorMatrixUniforms.uAlpha == 0.0) {
    return c;
  }

 
    // Un-premultiply alpha before applying the color matrix. See issue #3539.
    if (c.a > 0.0) {
      c.r /= c.a;
      c.g /= c.a;
      c.b /= c.a;
    }

    var cm = colorMatrixUniforms.uColorMatrix;


    var result = vec4<f32>(0.);

    result.r = (cm[0][0] * c.r);
    result.r += (cm[0][1] * c.g);
    result.r += (cm[0][2] * c.b);
    result.r += (cm[0][3] * c.a);
    result.r += cm[1][0];

    result.g = (cm[1][1] * c.r);
    result.g += (cm[1][2] * c.g);
    result.g += (cm[1][3] * c.b);
    result.g += (cm[2][0] * c.a);
    result.g += cm[2][1];

    result.b = (cm[2][2] * c.r);
    result.b += (cm[2][3] * c.g);
    result.b += (cm[3][0] * c.b);
    result.b += (cm[3][1] * c.a);
    result.b += cm[3][2];

    result.a = (cm[3][3] * c.r);
    result.a += (cm[4][0] * c.g);
    result.a += (cm[4][1] * c.b);
    result.a += (cm[4][2] * c.a);
    result.a += cm[4][3];

    var rgb = mix(c.rgb, result.rgb, colorMatrixUniforms.uAlpha);

    rgb.r *= result.a;
    rgb.g *= result.a;
    rgb.b *= result.a;

    return vec4(rgb, result.a);
}`,Ar=class extends I{constructor(e={}){let t=new C({uColorMatrix:{value:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],type:`f32`,size:20},uAlpha:{value:1,type:`f32`}}),n=re.from({vertex:{source:kr,entryPoint:`mainVertex`},fragment:{source:kr,entryPoint:`mainFragment`}}),r=y.from({vertex:Dr,fragment:Or,name:`color-matrix-filter`});super({...e,gpuProgram:n,glProgram:r,resources:{colorMatrixUniforms:t}}),this.alpha=1}_loadMatrix(e,t=!1){if(t){let t=[...e];this._multiply(t,this.matrix,e),this.resources.colorMatrixUniforms.uniforms.uColorMatrix=t}else this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e;this.resources.colorMatrixUniforms.update()}_multiply(e,t,n){return e[0]=t[0]*n[0]+t[1]*n[5]+t[2]*n[10]+t[3]*n[15],e[1]=t[0]*n[1]+t[1]*n[6]+t[2]*n[11]+t[3]*n[16],e[2]=t[0]*n[2]+t[1]*n[7]+t[2]*n[12]+t[3]*n[17],e[3]=t[0]*n[3]+t[1]*n[8]+t[2]*n[13]+t[3]*n[18],e[4]=t[0]*n[4]+t[1]*n[9]+t[2]*n[14]+t[3]*n[19]+t[4],e[5]=t[5]*n[0]+t[6]*n[5]+t[7]*n[10]+t[8]*n[15],e[6]=t[5]*n[1]+t[6]*n[6]+t[7]*n[11]+t[8]*n[16],e[7]=t[5]*n[2]+t[6]*n[7]+t[7]*n[12]+t[8]*n[17],e[8]=t[5]*n[3]+t[6]*n[8]+t[7]*n[13]+t[8]*n[18],e[9]=t[5]*n[4]+t[6]*n[9]+t[7]*n[14]+t[8]*n[19]+t[9],e[10]=t[10]*n[0]+t[11]*n[5]+t[12]*n[10]+t[13]*n[15],e[11]=t[10]*n[1]+t[11]*n[6]+t[12]*n[11]+t[13]*n[16],e[12]=t[10]*n[2]+t[11]*n[7]+t[12]*n[12]+t[13]*n[17],e[13]=t[10]*n[3]+t[11]*n[8]+t[12]*n[13]+t[13]*n[18],e[14]=t[10]*n[4]+t[11]*n[9]+t[12]*n[14]+t[13]*n[19]+t[14],e[15]=t[15]*n[0]+t[16]*n[5]+t[17]*n[10]+t[18]*n[15],e[16]=t[15]*n[1]+t[16]*n[6]+t[17]*n[11]+t[18]*n[16],e[17]=t[15]*n[2]+t[16]*n[7]+t[17]*n[12]+t[18]*n[17],e[18]=t[15]*n[3]+t[16]*n[8]+t[17]*n[13]+t[18]*n[18],e[19]=t[15]*n[4]+t[16]*n[9]+t[17]*n[14]+t[18]*n[19]+t[19],e}brightness(e,t){let n=[e,0,0,0,0,0,e,0,0,0,0,0,e,0,0,0,0,0,1,0];this._loadMatrix(n,t)}tint(e,t){let[n,r,i]=f.shared.setValue(e).toArray(),a=[n,0,0,0,0,0,r,0,0,0,0,0,i,0,0,0,0,0,1,0];this._loadMatrix(a,t)}greyscale(e,t){let n=[e,e,e,0,0,e,e,e,0,0,e,e,e,0,0,0,0,0,1,0];this._loadMatrix(n,t)}grayscale(e,t){this.greyscale(e,t)}blackAndWhite(e){this._loadMatrix([.3,.6,.1,0,0,.3,.6,.1,0,0,.3,.6,.1,0,0,0,0,0,1,0],e)}hue(e,t){e=(e||0)/180*Math.PI;let n=Math.cos(e),r=Math.sin(e),i=Math.sqrt,a=1/3,o=i(a),s=[n+(1-n)*a,a*(1-n)-o*r,a*(1-n)+o*r,0,0,a*(1-n)+o*r,n+a*(1-n),a*(1-n)-o*r,0,0,a*(1-n)-o*r,a*(1-n)+o*r,n+a*(1-n),0,0,0,0,0,1,0];this._loadMatrix(s,t)}contrast(e,t){let n=(e||0)+1,r=-.5*(n-1),i=[n,0,0,0,r,0,n,0,0,r,0,0,n,0,r,0,0,0,1,0];this._loadMatrix(i,t)}saturate(e=0,t){let n=e*2/3+1,r=(n-1)*-.5,i=[n,r,r,0,0,r,n,r,0,0,r,r,n,0,0,0,0,0,1,0];this._loadMatrix(i,t)}desaturate(){this.saturate(-1)}negative(e){this._loadMatrix([-1,0,0,1,0,0,-1,0,1,0,0,0,-1,1,0,0,0,0,1,0],e)}sepia(e){this._loadMatrix([.393,.7689999,.18899999,0,0,.349,.6859999,.16799999,0,0,.272,.5339999,.13099999,0,0,0,0,0,1,0],e)}technicolor(e){this._loadMatrix([1.9125277891456083,-.8545344976951645,-.09155508482755585,0,.046249425232852304,-.3087833385928097,1.7658908555458428,-.10601743074722245,0,-.2758903984886823,-.231103377548616,-.7501899197440212,1.847597816108189,0,.12137623870388682,0,0,0,1,0],e)}polaroid(e){this._loadMatrix([1.438,-.062,-.062,0,0,-.122,1.378,-.122,0,0,-.016,-.016,1.483,0,0,0,0,0,1,0],e)}toBGR(e){this._loadMatrix([0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0],e)}kodachrome(e){this._loadMatrix([1.1285582396593525,-.3967382283601348,-.03992559172921793,0,.24991995145868634,-.16404339962244616,1.0835251566291304,-.05498805115633132,0,.09698983488904393,-.16786010706155763,-.5603416277695248,1.6014850761964943,0,.13972481597886063,0,0,0,1,0],e)}browni(e){this._loadMatrix([.5997023498159715,.34553243048391263,-.2708298674538042,0,.1860075629647401,-.037703249837783157,.8609577587992641,.15059552388459913,0,-.14497417640467167,.24113635128153335,-.07441037908422492,.44972182064877153,0,-.029655197167024642,0,0,0,1,0],e)}vintage(e){this._loadMatrix([.6279345635605994,.3202183420819367,-.03965408211312453,0,.037848179746251466,.02578397704808868,.6441188644374771,.03259127616149294,0,.029265996770472907,.0466055556782719,-.0851232987247891,.5241648018700465,0,.020232119953863904,0,0,0,1,0],e)}colorTone(e,t,n,r,i){e||(e=.2),t||(t=.15),n||(n=16770432),r||(r=3375104);let a=f.shared,[o,s,c]=a.setValue(n).toArray(),[l,u,d]=a.setValue(r).toArray(),p=[.3,.59,.11,0,0,o,s,c,e,0,l,u,d,t,0,o-l,s-u,c-d,0,0];this._loadMatrix(p,i)}night(e,t){e||(e=.1);let n=[e*-2,-e,0,0,0,-e,0,e,0,0,0,e,e*2,0,0,0,0,0,1,0];this._loadMatrix(n,t)}predator(e,t){let n=[11.224130630493164*e,-4.794486999511719*e,-2.8746118545532227*e,0*e,.40342438220977783*e,-3.6330697536468506*e,9.193157196044922*e,-2.951810836791992*e,0*e,-1.316135048866272*e,-3.2184197902679443*e,-4.2375030517578125*e,7.476448059082031*e,0*e,.8044459223747253*e,0,0,0,1,0];this._loadMatrix(n,t)}lsd(e){this._loadMatrix([2,-.4,.5,0,0,-.5,2,-.4,0,0,-.4,-.5,3,0,0,0,0,0,1,0],e)}reset(){this._loadMatrix([1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],!1)}get matrix(){return this.resources.colorMatrixUniforms.uniforms.uColorMatrix}set matrix(e){this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e}get alpha(){return this.resources.colorMatrixUniforms.uniforms.uAlpha}set alpha(e){this.resources.colorMatrixUniforms.uniforms.uAlpha=e}},jr=class{constructor(){this.isBatchable=!1}reset(){this.isBatchable=!1,this.context=null,this.graphicsData&&(this.graphicsData.destroy(),this.graphicsData=null)}destroy(){this.reset()}},Mr=class{constructor(){this.instructions=new h}init(){this.instructions.reset()}destroy(){this.instructions.destroy(),this.instructions=null}},Nr=class e{constructor(e){this._renderer=e,this._managedContexts=new et({renderer:e,type:`resource`,name:`graphicsContext`})}init(t){e.defaultOptions.bezierSmoothness=t?.bezierSmoothness??e.defaultOptions.bezierSmoothness}getContextRenderData(e){return this.getGpuContext(e).graphicsData||this._initContextRenderData(e)}updateGpuContext(e){let t=e._gpuData,n=!!t[this._renderer.uid],r=t[this._renderer.uid]||this._initContext(e);return(e.dirty||!n)&&(n&&r.reset(),r.isBatchable=!1,e.dirty=!1),r}getGpuContext(e){return e._gpuData[this._renderer.uid]||this._initContext(e)}_initContextRenderData(e){let t=new Mr,n=this.getGpuContext(e);return n.graphicsData=t,t.init(),t}_initContext(e){let t=new jr;return t.context=e,e._gpuData[this._renderer.uid]=t,this._managedContexts.add(e),t}destroy(){this._managedContexts.destroy(),this._renderer=null}};Nr.extension={type:[m.CanvasSystem],name:`graphicsContext`},Nr.defaultOptions={bezierSmoothness:.5};var Pr=Nr,Fr=class{constructor(e,t){this.state=he.for2d(),this.renderer=e,this._adaptor=t,this.renderer.runners.contextChange.add(this),this._managedGraphics=new et({renderer:e,type:`renderable`,priority:-1,name:`graphics`})}contextChange(){this._adaptor.contextChange(this.renderer)}validateRenderable(e){return!1}addRenderable(e,t){this._managedGraphics.add(e),this.renderer.renderPipes.batch.break(t),t.add(e)}updateRenderable(e){}execute(e){e.isRenderable&&this._adaptor.execute(this,e)}destroy(){this._managedGraphics.destroy(),this.renderer=null,this._adaptor.destroy(),this._adaptor=null}};Fr.extension={type:[m.CanvasPipes],name:`graphics`};var Ir=class{constructor(){this.batches=[],this.batched=!1}destroy(){this.batches.forEach(e=>{ae.return(e)}),this.batches.length=0}},Lr=class{constructor(e,t){this.state=he.for2d(),this.renderer=e,this._adaptor=t,this.renderer.runners.contextChange.add(this),this._managedGraphics=new et({renderer:e,type:`renderable`,priority:-1,name:`graphics`})}contextChange(){this._adaptor.contextChange(this.renderer)}validateRenderable(e){let t=e.context,n=!!e._gpuData,r=this.renderer.graphicsContext.updateGpuContext(t);return!!(r.isBatchable||n!==r.isBatchable)}addRenderable(e,t){let n=this.renderer.graphicsContext.updateGpuContext(e.context);(e.didViewUpdate||!e._gpuData[this.renderer.uid])&&this._rebuild(e),n.isBatchable?this._addToBatcher(e,t):(this.renderer.renderPipes.batch.break(t),t.add(e))}updateRenderable(e){let t=this._getGpuDataForRenderable(e).batches;for(let e=0;e<t.length;e++){let n=t[e];n._batcher.updateElement(n)}}execute(e){if(!e.isRenderable)return;let t=this.renderer,n=e.context;if(!t.graphicsContext.getGpuContext(n).batches.length)return;let r=n.customShader||this._adaptor.shader;this.state.blendMode=e.groupBlendMode;let i=r.resources.localUniforms.uniforms;i.uTransformMatrix=e.groupTransform,i.uRound=t._roundPixels|e._roundPixels,xe(e.groupColorAlpha,i.uColor,0),this._adaptor.execute(this,e)}_rebuild(e){let t=this._getGpuDataForRenderable(e),n=this.renderer.graphicsContext.updateGpuContext(e.context);t.destroy(),n.isBatchable&&this._updateBatchesForRenderable(e,t)}_addToBatcher(e,t){let n=this.renderer.renderPipes.batch,r=this._getGpuDataForRenderable(e).batches;for(let e=0;e<r.length;e++){let i=r[e];n.addToBatch(i,t)}}_getGpuDataForRenderable(e){return e._gpuData[this.renderer.uid]||this._initGpuDataForRenderable(e)}_initGpuDataForRenderable(e){let t=new Ir;return e._gpuData[this.renderer.uid]=t,this._managedGraphics.add(e),t}_updateBatchesForRenderable(e,t){let n=e.context,r=this.renderer.graphicsContext.getGpuContext(n),i=this.renderer._roundPixels|e._roundPixels;t.batches=r.batches.map(t=>{let n=ae.get(Ve);return t.copyTo(n),n.renderable=e,n.roundPixels=i,n})}destroy(){this._managedGraphics.destroy(),this.renderer=null,this._adaptor.destroy(),this._adaptor=null,this.state=null}};Lr.extension={type:[m.WebGLPipes,m.WebGPUPipes],name:`graphics`},r.add(Fr),r.add(Lr),r.add(Pr),r.add(Me);var V=class e extends ce{constructor(e){e instanceof Be&&(e={context:e});let{context:t,roundPixels:n,...r}=e||{};super({label:`Graphics`,...r}),this.renderPipeId=`graphics`,t?this.context=t:(this.context=this._ownedContext=new Be,this.context.autoGarbageCollect=this.autoGarbageCollect),this.didViewUpdate=!0,this.allowChildren=!1,this.roundPixels=n??!1}set context(e){e!==this._context&&(this._context&&(this._context.off(`update`,this.onViewUpdate,this),this._context.off(`unload`,this.unload,this)),this._context=e,this._context.on(`update`,this.onViewUpdate,this),this._context.on(`unload`,this.unload,this),this.onViewUpdate())}get context(){return this._context}get bounds(){return this._context.bounds}updateBounds(){}containsPoint(e){return this._context.containsPoint(e)}destroy(e){this._ownedContext&&!e?this._ownedContext.destroy(e):(e===!0||e?.context===!0)&&this._context.destroy(e),this._context?.off(`update`,this.onViewUpdate,this),this._context?.off(`unload`,this.unload,this),this._ownedContext=null,this._context=null,super.destroy(e)}_onTouch(e){this._gcLastUsed=e,this._context._gcLastUsed=e}_callContextMethod(e,t){return this.context[e](...t),this}setFillStyle(...e){return this._callContextMethod(`setFillStyle`,e)}setStrokeStyle(...e){return this._callContextMethod(`setStrokeStyle`,e)}fill(...e){return this._callContextMethod(`fill`,e)}stroke(...e){return this._callContextMethod(`stroke`,e)}texture(...e){return this._callContextMethod(`texture`,e)}beginPath(){return this._callContextMethod(`beginPath`,[])}cut(){return this._callContextMethod(`cut`,[])}arc(...e){return this._callContextMethod(`arc`,e)}arcTo(...e){return this._callContextMethod(`arcTo`,e)}arcToSvg(...e){return this._callContextMethod(`arcToSvg`,e)}bezierCurveTo(...e){return this._callContextMethod(`bezierCurveTo`,e)}closePath(){return this._callContextMethod(`closePath`,[])}ellipse(...e){return this._callContextMethod(`ellipse`,e)}circle(...e){return this._callContextMethod(`circle`,e)}path(...e){return this._callContextMethod(`path`,e)}lineTo(...e){return this._callContextMethod(`lineTo`,e)}moveTo(...e){return this._callContextMethod(`moveTo`,e)}quadraticCurveTo(...e){return this._callContextMethod(`quadraticCurveTo`,e)}rect(...e){return this._callContextMethod(`rect`,e)}roundRect(...e){return this._callContextMethod(`roundRect`,e)}poly(...e){return this._callContextMethod(`poly`,e)}regularPoly(...e){return this._callContextMethod(`regularPoly`,e)}roundPoly(...e){return this._callContextMethod(`roundPoly`,e)}roundShape(...e){return this._callContextMethod(`roundShape`,e)}filletRect(...e){return this._callContextMethod(`filletRect`,e)}chamferRect(...e){return this._callContextMethod(`chamferRect`,e)}star(...e){return this._callContextMethod(`star`,e)}svg(...e){return this._callContextMethod(`svg`,e)}restore(...e){return this._callContextMethod(`restore`,e)}save(){return this._callContextMethod(`save`,[])}getTransform(){return this.context.getTransform()}resetTransform(){return this._callContextMethod(`resetTransform`,[])}rotateTransform(...e){return this._callContextMethod(`rotate`,e)}scaleTransform(...e){return this._callContextMethod(`scale`,e)}setTransform(...e){return this._callContextMethod(`setTransform`,e)}transform(...e){return this._callContextMethod(`transform`,e)}translateTransform(...e){return this._callContextMethod(`translate`,e)}clear(){return this._callContextMethod(`clear`,[])}get fillStyle(){return this._context.fillStyle}set fillStyle(e){this._context.fillStyle=e}get strokeStyle(){return this._context.strokeStyle}set strokeStyle(e){this._context.strokeStyle=e}clone(t=!1){return t?new e(this._context.clone()):(this._ownedContext=null,new e(this._context))}lineStyle(e,t,n){c(l,`Graphics#lineStyle is no longer needed. Use Graphics#setStrokeStyle to set the stroke style.`);let r={};return e&&(r.width=e),t&&(r.color=t),n&&(r.alpha=n),this.context.strokeStyle=r,this}beginFill(e,t){c(l,`Graphics#beginFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.`);let n={};return e!==void 0&&(n.color=e),t!==void 0&&(n.alpha=t),this.context.fillStyle=n,this}endFill(){c(l,`Graphics#endFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.`),this.context.fill();let e=this.context.strokeStyle;return(e.width!==Be.defaultStrokeStyle.width||e.color!==Be.defaultStrokeStyle.color||e.alpha!==Be.defaultStrokeStyle.alpha)&&this.context.stroke(),this}drawCircle(...e){return c(l,`Graphics#drawCircle has been renamed to Graphics#circle`),this._callContextMethod(`circle`,e)}drawEllipse(...e){return c(l,`Graphics#drawEllipse has been renamed to Graphics#ellipse`),this._callContextMethod(`ellipse`,e)}drawPolygon(...e){return c(l,`Graphics#drawPolygon has been renamed to Graphics#poly`),this._callContextMethod(`poly`,e)}drawRect(...e){return c(l,`Graphics#drawRect has been renamed to Graphics#rect`),this._callContextMethod(`rect`,e)}drawRoundedRect(...e){return c(l,`Graphics#drawRoundedRect has been renamed to Graphics#roundRect`),this._callContextMethod(`roundRect`,e)}drawStar(...e){return c(l,`Graphics#drawStar has been renamed to Graphics#star`),this._callContextMethod(`star`,e)}},Rr=class extends ce{constructor(e,t){let{text:n,resolution:r,style:i,anchor:a,width:o,height:s,roundPixels:c,...l}=e;super({...l}),this.batched=!0,this._resolution=null,this._autoResolution=!0,this._didTextUpdate=!0,this._styleClass=t,this.text=n??``,this.style=i,this.resolution=r??null,this.allowChildren=!1,this._anchor=new ge({_onUpdate:()=>{this.onViewUpdate()}}),a&&(this.anchor=a),this.roundPixels=c??!1,o!==void 0&&(this.width=o),s!==void 0&&(this.height=s)}get anchor(){return this._anchor}set anchor(e){typeof e==`number`?this._anchor.set(e):this._anchor.copyFrom(e)}set text(e){e=e.toString(),this._text!==e&&(this._text=e,this.onViewUpdate())}get text(){return this._text}set resolution(e){this._autoResolution=e===null,this._resolution=e,this.onViewUpdate()}get resolution(){return this._resolution}get style(){return this._style}set style(e){e||(e={}),this._style?.off(`update`,this.onViewUpdate,this),this._style=e instanceof this._styleClass?e:new this._styleClass(e),this._style.on(`update`,this.onViewUpdate,this),this.onViewUpdate()}get width(){return Math.abs(this.scale.x)*this.bounds.width}set width(e){this._setWidth(e,this.bounds.width)}get height(){return Math.abs(this.scale.y)*this.bounds.height}set height(e){this._setHeight(e,this.bounds.height)}getSize(e){return e||(e={}),e.width=Math.abs(this.scale.x)*this.bounds.width,e.height=Math.abs(this.scale.y)*this.bounds.height,e}setSize(e,t){typeof e==`object`?(t=e.height??e.width,e=e.width):t??(t=e),e!==void 0&&this._setWidth(e,this.bounds.width),t!==void 0&&this._setHeight(t,this.bounds.height)}containsPoint(e){let t=this.bounds.width,n=this.bounds.height,r=-t*this.anchor.x,i=0;return e.x>=r&&e.x<=r+t&&(i=-n*this.anchor.y,e.y>=i&&e.y<=i+n)}onViewUpdate(){this.didViewUpdate||(this._didTextUpdate=!0),super.onViewUpdate()}destroy(e=!1){this._style?.off(`update`,this.onViewUpdate,this),super.destroy(e),this.owner=null,this._bounds=null,this._anchor=null,(typeof e==`boolean`?e:e?.style)&&this._style.destroy(e),this._style=null,this._text=null}get styleKey(){return`${this._text}:${this._style.styleKey}:${this._resolution}`}};function zr(e,t){let n=e[0]??{};return(typeof n==`string`||e[1])&&(c(l,`use new ${t}({ text: "hi!", style }) instead`),n={text:n,style:e[1]}),n}var Br=null,Vr=null;function Hr(e,t){Br||(Br=b.get().createCanvas(256,128),Vr=Br.getContext(`2d`,{willReadFrequently:!0}),Vr.globalCompositeOperation=`copy`,Vr.globalAlpha=1),(Br.width<e||Br.height<t)&&(Br.width=S(e),Br.height=S(t))}function Ur(e,t,n){for(let r=0,i=4*n*t;r<t;++r,i+=4)if(e[i+3]!==0)return!1;return!0}function Wr(e,t,n,r,i){let a=4*t;for(let t=r,o=r*a+4*n;t<=i;++t,o+=a)if(e[o+3]!==0)return!1;return!0}function Gr(...e){let t=e[0];t.canvas||(t={canvas:e[0],resolution:e[1]});let{canvas:n}=t,r=Math.min(t.resolution??1,1),i=t.width??n.width,a=t.height??n.height,o=t.output;if(Hr(i,a),!Vr)throw TypeError(`Failed to get canvas 2D context`);Vr.drawImage(n,0,0,i,a,0,0,i*r,a*r);let c=Vr.getImageData(0,0,i,a).data,l=0,u=0,d=i-1,f=a-1;for(;u<a&&Ur(c,i,u);)++u;if(u===a)return s.EMPTY;for(;Ur(c,i,f);)--f;for(;Wr(c,i,l,u,f);)++l;for(;Wr(c,i,d,u,f);)--d;return++d,++f,Vr.globalCompositeOperation=`source-over`,Vr.strokeRect(l,u,d-l,f-u),Vr.globalCompositeOperation=`copy`,o??(o=new s),o.set(l/r,u/r,(d-l)/r,(f-u)/r),o}var Kr=class{constructor(e=0,t=0,n=!1){this.first=null,this.items=Object.create(null),this.last=null,this.max=e,this.resetTtl=n,this.size=0,this.ttl=t}clear(){return this.first=null,this.items=Object.create(null),this.last=null,this.size=0,this}delete(e){if(this.has(e)){let t=this.items[e];delete this.items[e],this.size--,t.prev!==null&&(t.prev.next=t.next),t.next!==null&&(t.next.prev=t.prev),this.first===t&&(this.first=t.next),this.last===t&&(this.last=t.prev)}return this}entries(e=this.keys()){let t=Array(e.length);for(let n=0;n<e.length;n++){let r=e[n];t[n]=[r,this.get(r)]}return t}evict(e=!1){if(e||this.size>0){let e=this.first;delete this.items[e.key],--this.size===0?(this.first=null,this.last=null):(this.first=e.next,this.first.prev=null)}return this}expiresAt(e){let t;return this.has(e)&&(t=this.items[e].expiry),t}get(e){let t=this.items[e];if(t!==void 0){if(this.ttl>0&&t.expiry<=Date.now()){this.delete(e);return}return this.moveToEnd(t),t.value}}has(e){return e in this.items}moveToEnd(e){this.last!==e&&(e.prev!==null&&(e.prev.next=e.next),e.next!==null&&(e.next.prev=e.prev),this.first===e&&(this.first=e.next),e.prev=this.last,e.next=null,this.last!==null&&(this.last.next=e),this.last=e,this.first===null&&(this.first=e))}keys(){let e=Array(this.size),t=this.first,n=0;for(;t!==null;)e[n++]=t.key,t=t.next;return e}setWithEvicted(e,t,n=this.resetTtl){let r=null;if(this.has(e))this.set(e,t,!0,n);else{this.max>0&&this.size===this.max&&(r={...this.first},this.evict(!0));let n=this.items[e]={expiry:this.ttl>0?Date.now()+this.ttl:this.ttl,key:e,prev:this.last,next:null,value:t};++this.size===1?this.first=n:this.last.next=n,this.last=n}return r}set(e,t,n=!1,r=this.resetTtl){let i=this.items[e];return n||i!==void 0?(i.value=t,n===!1&&r&&(i.expiry=this.ttl>0?Date.now()+this.ttl:this.ttl),this.moveToEnd(i)):(this.max>0&&this.size===this.max&&this.evict(!0),i=this.items[e]={expiry:this.ttl>0?Date.now()+this.ttl:this.ttl,key:e,prev:this.last,next:null,value:t},++this.size===1?this.first=i:this.last.next=i,this.last=i),this}values(e=this.keys()){let t=Array(e.length);for(let n=0;n<e.length;n++)t[n]=this.get(e[n]);return t}};function qr(e=1e3,t=0,n=!1){if(isNaN(e)||e<0)throw TypeError(`Invalid max value`);if(isNaN(t)||t<0)throw TypeError(`Invalid ttl value`);if(typeof n!=`boolean`)throw TypeError(`Invalid resetTtl value`);return new Kr(e,t,n)}function Jr(e){return!!e.tagStyles&&Object.keys(e.tagStyles).length>0}function Yr(e){return e.includes(`<`)}function Xr(e,t){return e.clone().assign(t)}function Zr(e,t){let n=[],r=t.tagStyles;if(!Jr(t)||!Yr(e))return n.push({text:e,style:t}),n;let i=[t],a=[],o=``,s=0;for(;s<e.length;){let t=e[s];if(t===`<`){let c=e.indexOf(`>`,s);if(c===-1){o+=t,s++;continue}let l=e.indexOf(`<`,s+1);if(l!==-1&&l<c){o+=t,s++;continue}let u=e.slice(s+1,c);if(u.startsWith(`/`)){let t=u.slice(1).trim();if(a.length>0&&a[a.length-1]===t){o.length>0&&(n.push({text:o,style:i[i.length-1]}),o=``),i.pop(),a.pop(),s=c+1;continue}o+=e.slice(s,c+1),s=c+1;continue}{let t=u.trim();if(r[t]){o.length>0&&(n.push({text:o,style:i[i.length-1]}),o=``);let e=i[i.length-1],l=Xr(e,r[t]);i.push(l),a.push(t),s=c+1;continue}o+=e.slice(s,c+1),s=c+1;continue}}o+=t,s++}return o.length>0&&n.push({text:o,style:i[i.length-1]}),n}var Qr=new Set([10,13]),$r=new Set([9,32,8192,8193,8194,8195,8196,8197,8198,8200,8201,8202,8287,12288]),ei=new Set([9,32]),ti=new Set([45,8208,8211,8212,173]),ni=/(\r\n|\r|\n)/,ri=/(?:\r\n|\r|\n)/;function ii(e){return typeof e==`string`&&Qr.has(e.charCodeAt(0))}function ai(e,t){return typeof e==`string`&&$r.has(e.charCodeAt(0))}function oi(e){return typeof e==`string`&&ei.has(e.charCodeAt(0))}function si(e){return typeof e==`string`&&ti.has(e.charCodeAt(0))}function ci(e){return e===`normal`||e===`pre-line`}function li(e){return e===`normal`}function ui(e){if(typeof e!=`string`)return``;let t=e.length-1;for(;t>=0&&ai(e[t]);)t--;return t<e.length-1?e.slice(0,t+1):e}function di(e){let t=[],n=[];if(typeof e!=`string`)return t;for(let r=0;r<e.length;r++){let i=e[r],a=e[r+1];if(ai(i,a)||ii(i)){n.length>0&&(t.push(n.join(``)),n.length=0),i===`\r`&&a===`
`?(t.push(`\r
`),r++):t.push(i);continue}n.push(i),si(i)&&a&&!ai(a)&&!ii(a)&&(t.push(n.join(``)),n.length=0)}return n.length>0&&t.push(n.join(``)),t}function fi(e,t,n,r){let i=n(e),a=[];for(let n=0;n<i.length;n++){let o=i[n],s=o,c=1;for(;i[n+c];){let a=i[n+c];if(!r(s,a,e,n,t))o+=a,s=a,c++;else break}n+=c-1,a.push(o)}return a}var pi=/\r\n|\r|\n/g;function mi(e,t,n,r,i,a,o,s,c){let l=Zr(e,t);if(li(t.whiteSpace))for(let e=0;e<l.length;e++){let t=l[e];l[e]={text:t.text.replace(pi,` `),style:t.style}}let u=[],d=[];for(let e of l){let t=e.text.split(ni);for(let n=0;n<t.length;n++){let r=t[n];r===`\r
`||r===`\r`||r===`
`?(u.push(d),d=[]):r.length>0&&d.push({text:r,style:e.style})}}(d.length>0||u.length===0)&&u.push(d);let f=n?hi(u,t,r,a,s,c):u,p=[],m=[],h=[],g=[],_=[],v=0,y=t._fontString,b=o(y);b.fontSize===0&&(b.fontSize=t.fontSize,b.ascent=t.fontSize);let x=``,S=!!t.dropShadow,C=t._stroke?.width||0;for(let e of f){let n=0,a=b.ascent,s=b.descent,c=``;for(let t of e){let e=t.style._fontString,l=o(e);e!==x&&(r.font=e,x=e);let u=i(t.text,t.style.letterSpacing,r);n+=u,a=Math.max(a,l.ascent),s=Math.max(s,l.descent),c+=t.text;let d=t.style._stroke?.width||0;d>C&&(C=d),!S&&t.style.dropShadow&&(S=!0)}e.length===0&&(a=b.ascent,s=b.descent),p.push(n),m.push(a),h.push(s),_.push(c);let l=t.lineHeight||a+s;g.push(l+t.leading),v=Math.max(v,n)}let w=C,T=v+w+(t.dropShadow?t.dropShadow.distance:0),E=0;for(let e=0;e<g.length;e++)E+=g[e];return E=Math.max(E,g[0]+w),{width:T,height:E+(t.dropShadow?t.dropShadow.distance:0),lines:_,lineWidths:p,lineHeight:(t.lineHeight||b.fontSize)+t.leading,maxLineWidth:v,fontProperties:b,runsByLine:f,lineAscents:m,lineDescents:h,lineHeights:g,hasDropShadow:S}}function hi(e,t,n,r,i,a){let{letterSpacing:o,whiteSpace:s,wordWrapWidth:c,breakWords:l}=t,u=ci(s),d=c+o,f={},p=``,m=(e,t)=>{let i=`${e}|${t.styleKey}`,a=f[i];if(a===void 0){let o=t._fontString;o!==p&&(n.font=o,p=o),a=r(e,t.letterSpacing,n)+t.letterSpacing,f[i]=a}return a},h=[];for(let t of e){let e=gi(t),n=h.length,r=t=>{let n=0,r=t;do{let{token:t,style:i}=e[r];n+=m(t,i),r++}while(r<e.length&&e[r].continuesFromPrevious);return n},o=t=>{let n=[],r=t;do n.push({token:e[r].token,style:e[r].style}),r++;while(r<e.length&&e[r].continuesFromPrevious);return n},s=[],c=0,f=!u,p=null,g=()=>{p&&p.text.length>0&&s.push(p),p=null},_=()=>{if(g(),s.length>0){let e=s[s.length-1];e.text=ui(e.text),e.text.length===0&&s.pop()}h.push(s),s=[],c=0,f=!1};for(let t=0;t<e.length;t++){let{token:n,style:v,continuesFromPrevious:y}=e[t],b=m(n,v);if(u){let e=ai(n),t=p?.text[p.text.length-1]??s[s.length-1]?.text.slice(-1)??``,r=t?ai(t):!1;if(e&&r)continue}let x=!y,S=x?r(t):b;if(S>d&&x){if(c>0&&_(),l){let e=o(t);for(let t=0;t<e.length;t++){let n=e[t].token,r=e[t].style,o=fi(n,l,a,i);for(let e of o){let t=m(e,r);t+c>d&&_(),!p||p.style!==r?(g(),p={text:e,style:r}):p.text+=e,c+=t}}t+=e.length-1}else{let e=o(t);g(),h.push(e.map(e=>({text:e.token,style:e.style}))),f=!1,t+=e.length-1}}else if(S+c>d&&x){if(ai(n)){f=!1;continue}_(),p={text:n,style:v},c=b}else if(y&&!l)!p||p.style!==v?(g(),p={text:n,style:v}):p.text+=n,c+=b;else{let e=ai(n);if(c===0&&e&&!f)continue;!p||p.style!==v?(g(),p={text:n,style:v}):p.text+=n,c+=b}}if(g(),s.length>0){let e=s[s.length-1];e.text=ui(e.text),e.text.length===0&&s.pop()}(s.length>0||h.length===n)&&h.push(s)}return h}function gi(e){let t=[],n=!1;for(let r of e){let e=di(r.text),i=!0;for(let a of e){let e=ai(a)||ii(a),o=i&&n&&!e;t.push({token:a,style:r.style,continuesFromPrevious:o}),n=!e,i=!1}}return t}var _i={willReadFrequently:!0};function vi(e,t,n,r,i){let a=n[e];return typeof a!=`number`&&(a=i(e,t,r)+t,n[e]=a),a}function yi(e,t,n,r,i,a,o){let s=n.getContext(`2d`,_i);s.font=t._fontString;let c=0,l=``,u=[],d=Object.create(null),{letterSpacing:f,whiteSpace:p}=t,m=ci(p),h=li(p),g=!m,_=t.wordWrapWidth+f,v=di(e);for(let e=0;e<v.length;e++){let n=v[e];if(ii(n)){if(!h){u.push(ui(l)),g=!m,l=``,c=0;continue}n=` `}if(m){let e=ai(n),t=ai(l[l.length-1]);if(e&&t)continue}let p=vi(n,f,d,s,r);if(p>_){if(l!==``&&(u.push(ui(l)),l=``,c=0),i(n,t.breakWords)){let e=fi(n,t.breakWords,o,a);for(let t of e){let e=vi(t,f,d,s,r);e+c>_&&(u.push(ui(l)),g=!1,l=``,c=0),l+=t,c+=e}}else l.length>0&&(u.push(ui(l)),l=``,c=0),u.push(ui(n)),g=!1,l=``,c=0}else p+c>_&&(g=!1,u.push(ui(l)),l=``,c=0),(l.length>0||!ai(n)||g)&&(l+=n,c+=p)}let y=ui(l);return y.length>0&&u.push(y),u.join(`
`)}var bi={willReadFrequently:!0},xi=class e{static get experimentalLetterSpacingSupported(){let t=e._experimentalLetterSpacingSupported;if(t===void 0){let n=b.get().getCanvasRenderingContext2D().prototype;t=e._experimentalLetterSpacingSupported=`letterSpacing`in n||`textLetterSpacing`in n}return t}constructor(e,t,n,r,i,a,o,s,c,l){this.text=e,this.style=t,this.width=n,this.height=r,this.lines=i,this.lineWidths=a,this.lineHeight=o,this.maxLineWidth=s,this.fontProperties=c,l&&(this.runsByLine=l.runsByLine,this.lineAscents=l.lineAscents,this.lineDescents=l.lineDescents,this.lineHeights=l.lineHeights,this.hasDropShadow=l.hasDropShadow)}static measureText(t=` `,n,r=e._canvas,i=n.wordWrap){let a=`${t}-${n.styleKey}-wordWrap-${i}`;if(e._measurementCache.has(a))return e._measurementCache.get(a);if(Jr(n)&&Yr(t)){let r=mi(t,n,i,e._context,e._measureText,e._measureTextAdvance,e.measureFont,e.canBreakChars,e.wordWrapSplit),o=new e(t,n,r.width,r.height,r.lines,r.lineWidths,r.lineHeight,r.maxLineWidth,r.fontProperties,{runsByLine:r.runsByLine,lineAscents:r.lineAscents,lineDescents:r.lineDescents,lineHeights:r.lineHeights,hasDropShadow:r.hasDropShadow});return e._measurementCache.set(a,o),o}let o=n._fontString,s=e.measureFont(o);s.fontSize===0&&(s.fontSize=n.fontSize,s.ascent=n.fontSize,s.descent=0);let c=e._context;c.font=o;let l=(i?e._wordWrap(t,n,r):t).split(ri),u=Array(l.length),d=0;for(let t=0;t<l.length;t++){let r=e._measureText(l[t],n.letterSpacing,c);u[t]=r,d=Math.max(d,r)}let f=n._stroke?.width??0,p=n.lineHeight||s.fontSize,m=e._adjustWidthForStyle(d,n),h=Math.max(p,s.fontSize+f)+(l.length-1)*(p+n.leading),g=e._adjustHeightForStyle(h,n),_=new e(t,n,m,g,l,u,p+n.leading,d,s);return e._measurementCache.set(a,_),_}static _adjustWidthForStyle(e,t){let n=e+(t._stroke?.width||0);return t.dropShadow&&(n+=t.dropShadow.distance),n}static _adjustHeightForStyle(e,t){let n=e;return t.dropShadow&&(n+=t.dropShadow.distance),n}static _measureText(t,n,r){let{metricWidth:i,metrics:a,letterSpacingVal:o}=e._measureTextCore(t,n,r),s=-(a.actualBoundingBoxLeft??0),c=(a.actualBoundingBoxRight??0)-s;return a.width>0&&(c+=o),Math.max(i,c)}static _measureTextAdvance(t,n,r){return e._measureTextCore(t,n,r).metricWidth}static _measureTextCore(t,n,r){let i=!1;e.experimentalLetterSpacingSupported&&(e.experimentalLetterSpacing?(r.letterSpacing=`${n}px`,r.textLetterSpacing=`${n}px`,i=!0):(r.letterSpacing=`0px`,r.textLetterSpacing=`0px`));let a=r.measureText(t),o=a.width,s=0;return o>0&&(s=i?-n:(e.graphemeSegmenter(t).length-1)*n,o+=s),{metricWidth:o,metrics:a,letterSpacingVal:s}}static _wordWrap(t,n,r=e._canvas){return yi(t,n,r,e._measureTextAdvance,e.canBreakWords,e.canBreakChars,e.wordWrapSplit)}static isBreakingSpace(e,t){return ai(e,t)}static canBreakWords(e,t){return t}static canBreakChars(e,t,n,r,i){return!0}static wordWrapSplit(t){return e.graphemeSegmenter(t)}static measureFont(t){if(e._fonts[t])return e._fonts[t];let n=e._context;n.font=t;let r=n.measureText(e.METRICS_STRING+e.BASELINE_SYMBOL),i=r.actualBoundingBoxAscent??0,a=r.actualBoundingBoxDescent??0,o={ascent:i,descent:a,fontSize:i+a};return e._fonts[t]=o,o}static clearMetrics(t=``){t?delete e._fonts[t]:e._fonts={}}static get _canvas(){if(!e.__canvas){let t;try{let n=new OffscreenCanvas(0,0);if(n.getContext(`2d`,bi)?.measureText)return e.__canvas=n,n;t=b.get().createCanvas()}catch{t=b.get().createCanvas()}t.width=t.height=10,e.__canvas=t}return e.__canvas}static get _context(){return e.__context||(e.__context=e._canvas.getContext(`2d`,bi)),e.__context}};xi.METRICS_STRING=`|ÉqÅ`,xi.BASELINE_SYMBOL=`M`,xi.BASELINE_MULTIPLIER=1.4,xi.HEIGHT_MULTIPLIER=2,xi.graphemeSegmenter=(()=>{if(typeof Intl?.Segmenter==`function`){let e=new Intl.Segmenter;return t=>{let n=e.segment(t),r=[],i=0;for(let e of n)r[i++]=e.segment;return r}}return e=>[...e]})(),xi.experimentalLetterSpacing=!1,xi._fonts={},xi._measurementCache=qr(1e3);var Si=xi,Ci=[`serif`,`sans-serif`,`monospace`,`cursive`,`fantasy`,`system-ui`];function wi(e){let t=typeof e.fontSize==`number`?`${e.fontSize}px`:e.fontSize,n=e.fontFamily;Array.isArray(e.fontFamily)||(n=e.fontFamily.split(`,`));for(let e=n.length-1;e>=0;e--){let t=n[e].trim();!/([\"\'])[^\'\"]+\1/.test(t)&&!Ci.includes(t)&&(t=`"${t}"`),n[e]=t}return`${e.fontStyle} ${e.fontVariant} ${e.fontWeight} ${t} ${n.join(`,`)}`}var Ti=1e5;function Ei(e,t,n,r=0,i=0,a=0){if(e.texture===O.WHITE&&!e.fill)return f.shared.setValue(e.color).setAlpha(e.alpha??1).toHexa();if(!e.fill){let n=t.createPattern(e.texture.source.resource,`repeat`),r=e.matrix.copyTo(A.shared);return r.scale(e.texture.source.pixelWidth,e.texture.source.pixelHeight),n.setTransform(r),n}if(e.fill instanceof Pe){let n=e.fill,r=t.createPattern(n.texture.source.resource,`repeat`);return ve.applyPatternTransform(r,n.transform,!1),r}if(e.fill instanceof Ne){let o=e.fill,s=o.type===`linear`,c=o.textureSpace===`local`,l=1,u=1;c&&n&&(l=n.width+r,u=n.height+r);let d,p=!1;if(s){let{start:e,end:n}=o;d=t.createLinearGradient(e.x*l+i,e.y*u+a,n.x*l+i,n.y*u+a),p=Math.abs(n.x-e.x)<Math.abs((n.y-e.y)*.1)}else{let{center:e,innerRadius:n,outerCenter:r,outerRadius:s}=o;d=t.createRadialGradient(e.x*l+i,e.y*u+a,n*l,r.x*l+i,r.y*u+a,s*l)}if(p&&c&&n){let e=n.lineHeight/u;for(let t=0;t<n.lines.length;t++){let i=(t*n.lineHeight+r/2)/u;o.colorStops.forEach(t=>{let n=i+t.offset*e;n=Math.max(0,Math.min(1,n)),d.addColorStop(Math.floor(n*Ti)/Ti,f.shared.setValue(t.color).toHex())})}}else o.colorStops.forEach(e=>{d.addColorStop(e.offset,f.shared.setValue(e.color).toHex())});return d}return k(`FillStyle not recognised`,e),`red`}var Di=new s;function Oi(e){let t=0;for(let n=0;n<e.length;n++)e.charCodeAt(n)===32&&t++;return t}var ki=new class{getCanvasAndContext(e){let{text:t,style:n,resolution:r=1}=e,i=n._getFinalPadding(),a=Si.measureText(t||` `,n),o=Math.ceil(Math.ceil(Math.max(1,a.width)+i*2)*r),s=Math.ceil(Math.ceil(Math.max(1,a.height)+i*2)*r),c=ne.getOptimalCanvasAndContext(o,s);return this._renderTextToCanvas(n,i,r,c,a),{canvasAndContext:c,frame:n.trim?Gr({canvas:c.canvas,width:o,height:s,resolution:1,output:Di}):Di.set(0,0,o,s)}}returnCanvasAndContext(e){ne.returnCanvasAndContext(e)}_renderTextToCanvas(e,t,n,r,i){if(i.runsByLine&&i.runsByLine.length>0){this._renderTaggedTextToCanvas(i,e,t,n,r);return}let{canvas:a,context:o}=r,s=wi(e),c=i.lines,l=i.lineHeight,u=i.lineWidths,d=i.maxLineWidth,f=i.fontProperties,p=a.height;if(o.resetTransform(),o.scale(n,n),o.textBaseline=e.textBaseline,e._stroke?.width){let t=e._stroke;o.lineWidth=t.width,o.miterLimit=t.miterLimit,o.lineJoin=t.join,o.lineCap=t.cap}o.font=s;let m,h,g=e.dropShadow?2:1,_=(e._stroke?.width??0)/2,v=(l-f.fontSize)/2;l-f.fontSize<0&&(v=0);for(let a=0;a<g;++a){let s=e.dropShadow&&a===0,g=s?Math.ceil(Math.max(1,p)+t*2):0,y=g*n;if(s)this._setupDropShadow(o,e,n,y);else{let n=e._gradientBounds,r=e._gradientOffset;if(n){let a={width:n.width,height:n.height,lineHeight:n.height,lines:i.lines};this._setFillAndStrokeStyles(o,e,a,t,_,r?.x??0,r?.y??0)}else r?this._setFillAndStrokeStyles(o,e,i,t,_,r.x,r.y):this._setFillAndStrokeStyles(o,e,i,t,_);o.shadowColor=`rgba(0,0,0,0)`}for(let n=0;n<c.length;n++){m=_,h=_+n*l+f.ascent+v,m+=this._getAlignmentOffset(u[n],d,e.align);let i=0;if(e.align===`justify`&&e.wordWrap&&n<c.length-1){let e=Oi(c[n]);e>0&&(i=(d-u[n])/e)}e._stroke?.width&&this._drawLetterSpacing(c[n],e,r,m+t,h+t-g,!0,i),e._fill!==void 0&&this._drawLetterSpacing(c[n],e,r,m+t,h+t-g,!1,i)}}}_renderTaggedTextToCanvas(e,t,n,r,i){let{canvas:a,context:o}=i,{runsByLine:s,lineWidths:c,maxLineWidth:l,lineAscents:u,lineHeights:d,hasDropShadow:f}=e,p=a.height;o.resetTransform(),o.scale(r,r),o.textBaseline=t.textBaseline;let m=f?2:1,h=t._stroke?.width??0;for(let e of s)for(let t of e){let e=t.style._stroke?.width??0;e>h&&(h=e)}let g=h/2,_=[];for(let e=0;e<s.length;e++){let t=s[e],n=[];for(let e of t){let t=wi(e.style);o.font=t,n.push({width:Si._measureText(e.text,e.style.letterSpacing,o),font:t})}_.push(n)}for(let e=0;e<m;++e){let a=f&&e===0,m=a?Math.ceil(Math.max(1,p)+n*2):0,h=m*r;a||(o.shadowColor=`rgba(0,0,0,0)`);let v=g;for(let e=0;e<s.length;e++){let f=s[e],p=c[e],y=u[e],b=d[e],x=_[e],S=g;S+=this._getAlignmentOffset(p,l,t.align);let C=0;if(t.align===`justify`&&t.wordWrap&&e<s.length-1){let e=0;for(let t of f)e+=Oi(t.text);e>0&&(C=(l-p)/e)}let w=v+y,T=S+n;for(let e=0;e<f.length;e++){let t=f[e],{width:s,font:c}=x[e];if(o.font=c,o.textBaseline=t.style.textBaseline,t.style._stroke?.width){let e=t.style._stroke;if(o.lineWidth=e.width,o.miterLimit=e.miterLimit,o.lineJoin=e.join,o.lineCap=e.cap,a){if(t.style.dropShadow)this._setupDropShadow(o,t.style,r,h);else{let e=Oi(t.text);T+=s+e*C;continue}}else{let r=Si.measureFont(c),i=t.style.lineHeight||r.fontSize;o.strokeStyle=Ei(e,o,{width:s,height:i,lineHeight:i,lines:[t.text]},n*2,T-n,v)}this._drawLetterSpacing(t.text,t.style,i,T,w+n-m,!0,C)}let l=Oi(t.text);T+=s+l*C}T=S+n;for(let e=0;e<f.length;e++){let t=f[e],{width:s,font:c}=x[e];if(o.font=c,o.textBaseline=t.style.textBaseline,t.style._fill!==void 0){if(a){if(t.style.dropShadow)this._setupDropShadow(o,t.style,r,h);else{let e=Oi(t.text);T+=s+e*C;continue}}else{let e=Si.measureFont(c),r=t.style.lineHeight||e.fontSize,i={width:s,height:r,lineHeight:r,lines:[t.text]};o.fillStyle=Ei(t.style._fill,o,i,n*2,T-n,v)}this._drawLetterSpacing(t.text,t.style,i,T,w+n-m,!1,C)}let l=Oi(t.text);T+=s+l*C}v+=b}}}_setFillAndStrokeStyles(e,t,n,r,i,a=0,o=0){if(e.fillStyle=t._fill?Ei(t._fill,e,n,r*2,a,o):null,t._stroke?.width){let s=i+r*2;e.strokeStyle=Ei(t._stroke,e,n,s,a,o)}}_setupDropShadow(e,t,n,r){e.fillStyle=`black`,e.strokeStyle=`black`;let i=t.dropShadow,a=i.color,o=i.alpha;e.shadowColor=f.shared.setValue(a).setAlpha(o).toRgbaString();let s=i.blur*n,c=i.distance*n;e.shadowBlur=s,e.shadowOffsetX=Math.cos(i.angle)*c,e.shadowOffsetY=Math.sin(i.angle)*c+r}_getAlignmentOffset(e,t,n){return n===`right`?t-e:n===`center`?(t-e)/2:0}_drawLetterSpacing(e,t,n,r,i,a=!1,o=0){let{context:s}=n,c=t.letterSpacing,l=!1;if(Si.experimentalLetterSpacingSupported&&(Si.experimentalLetterSpacing?(s.letterSpacing=`${c}px`,s.textLetterSpacing=`${c}px`,l=!0):(s.letterSpacing=`0px`,s.textLetterSpacing=`0px`)),(c===0||l)&&o===0){a?s.strokeText(e,r,i):s.fillText(e,r,i);return}if(o!==0&&(c===0||l)){let t=e.split(` `),n=r,c=s.measureText(` `).width;for(let e=0;e<t.length;e++)a?s.strokeText(t[e],n,i):s.fillText(t[e],n,i),n+=s.measureText(t[e]).width+c+o;return}let u=r,d=Si.graphemeSegmenter(e),f=s.measureText(e).width,p=0;for(let e=0;e<d.length;++e){let t=d[e];a?s.strokeText(t,u,i):s.fillText(t,u,i);let n=``;for(let t=e+1;t<d.length;++t)n+=d[t];p=s.measureText(n).width,u+=f-p+c,t===` `&&(u+=o),f=p}}},Ai=class e extends p{constructor(t={}){super(),this.uid=i(`textStyle`),this._tick=0,this._cachedFontString=null,Mi(t),t instanceof e&&(t=t._toObject());let n={...e.defaultTextStyle,...t};for(let e in n){let t=e;this[t]=n[e]}this._tagStyles=t.tagStyles??void 0,this.update(),this._tick=0}get align(){return this._align}set align(e){this._align!==e&&(this._align=e,this.update())}get breakWords(){return this._breakWords}set breakWords(e){this._breakWords!==e&&(this._breakWords=e,this.update())}get dropShadow(){return this._dropShadow}set dropShadow(t){this._dropShadow!==t&&(this._dropShadow=typeof t==`object`&&t?this._createProxy({...e.defaultDropShadow,...t}):t?this._createProxy({...e.defaultDropShadow}):null,this.update())}get fontFamily(){return this._fontFamily}set fontFamily(e){this._fontFamily!==e&&(this._fontFamily=e,this.update())}get fontSize(){return this._fontSize}set fontSize(e){this._fontSize!==e&&(this._fontSize=typeof e==`string`?parseInt(e,10):e,this.update())}get fontStyle(){return this._fontStyle}set fontStyle(e){this._fontStyle!==e&&(this._fontStyle=e.toLowerCase(),this.update())}get fontVariant(){return this._fontVariant}set fontVariant(e){this._fontVariant!==e&&(this._fontVariant=e,this.update())}get fontWeight(){return this._fontWeight}set fontWeight(e){this._fontWeight!==e&&(this._fontWeight=e,this.update())}get leading(){return this._leading}set leading(e){this._leading!==e&&(this._leading=e,this.update())}get letterSpacing(){return this._letterSpacing}set letterSpacing(e){this._letterSpacing!==e&&(this._letterSpacing=e,this.update())}get lineHeight(){return this._lineHeight}set lineHeight(e){this._lineHeight!==e&&(this._lineHeight=e,this.update())}get padding(){return this._padding}set padding(e){this._padding!==e&&(this._padding=e,this.update())}get filters(){return this._filters}set filters(e){this._filters!==e&&(this._filters=Object.freeze(e),this.update())}get trim(){return this._trim}set trim(e){this._trim!==e&&(this._trim=e,this.update())}get textBaseline(){return this._textBaseline}set textBaseline(e){this._textBaseline!==e&&(this._textBaseline=e,this.update())}get whiteSpace(){return this._whiteSpace}set whiteSpace(e){this._whiteSpace!==e&&(this._whiteSpace=e,this.update())}get wordWrap(){return this._wordWrap}set wordWrap(e){this._wordWrap!==e&&(this._wordWrap=e,this.update())}get wordWrapWidth(){return this._wordWrapWidth}set wordWrapWidth(e){this._wordWrapWidth!==e&&(this._wordWrapWidth=e,this.update())}get fill(){return this._originalFill}set fill(e){e!==this._originalFill&&(this._originalFill=e,this._isFillStyle(e)&&(this._originalFill=this._createProxy({...Be.defaultFillStyle,...e},()=>{this._fill=Ie({...this._originalFill},Be.defaultFillStyle)})),this._fill=Ie(e===0?`black`:e,Be.defaultFillStyle),this.update())}get stroke(){return this._originalStroke}set stroke(e){e!==this._originalStroke&&(this._originalStroke=e,this._isFillStyle(e)&&(this._originalStroke=this._createProxy({...Be.defaultStrokeStyle,...e},()=>{this._stroke=Re({...this._originalStroke},Be.defaultStrokeStyle)})),this._stroke=Re(e,Be.defaultStrokeStyle),this.update())}get tagStyles(){return this._tagStyles}set tagStyles(e){this._tagStyles!==e&&(this._tagStyles=e??void 0,this.update())}update(){this._tick++,this._cachedFontString=null,this.emit(`update`,this)}reset(){let t=e.defaultTextStyle;for(let e in t)this[e]=t[e]}assign(e){for(let t in e){let n=t;this[n]=e[t]}return this}get styleKey(){return`${this.uid}-${this._tick}`}get _fontString(){return this._cachedFontString===null&&(this._cachedFontString=wi(this)),this._cachedFontString}_toObject(){return{align:this.align,breakWords:this.breakWords,dropShadow:this._dropShadow?{...this._dropShadow}:null,fill:this._fill?{...this._fill}:void 0,fontFamily:this.fontFamily,fontSize:this.fontSize,fontStyle:this.fontStyle,fontVariant:this.fontVariant,fontWeight:this.fontWeight,leading:this.leading,letterSpacing:this.letterSpacing,lineHeight:this.lineHeight,padding:this.padding,stroke:this._stroke?{...this._stroke}:void 0,textBaseline:this.textBaseline,trim:this.trim,whiteSpace:this.whiteSpace,wordWrap:this.wordWrap,wordWrapWidth:this.wordWrapWidth,filters:this._filters?[...this._filters]:void 0,tagStyles:this._tagStyles?{...this._tagStyles}:void 0}}clone(){return new e(this._toObject())}_getFinalPadding(){let e=0;if(this._filters)for(let t=0;t<this._filters.length;t++)e+=this._filters[t].padding;return Math.max(this._padding,e)}destroy(e=!1){if(this.removeAllListeners(),typeof e==`boolean`?e:e?.texture){let t=typeof e==`boolean`?e:e?.textureSource;this._fill?.texture&&this._fill.texture.destroy(t),this._originalFill?.texture&&this._originalFill.texture.destroy(t),this._stroke?.texture&&this._stroke.texture.destroy(t),this._originalStroke?.texture&&this._originalStroke.texture.destroy(t)}this._fill=null,this._stroke=null,this.dropShadow=null,this._originalStroke=null,this._originalFill=null}_createProxy(e,t){return new Proxy(e,{set:(e,n,r)=>e[n]===r||(e[n]=r,t?.(n,r),this.update(),!0)})}_isFillStyle(e){return(e??null)!==null&&!(f.isColorLike(e)||e instanceof Ne||e instanceof Pe)}};Ai.defaultDropShadow={alpha:1,angle:Math.PI/6,blur:0,color:`black`,distance:5},Ai.defaultTextStyle={align:`left`,breakWords:!1,dropShadow:null,fill:`black`,fontFamily:`Arial`,fontSize:26,fontStyle:`normal`,fontVariant:`normal`,fontWeight:`normal`,leading:0,letterSpacing:0,lineHeight:0,padding:0,stroke:null,textBaseline:`alphabetic`,trim:!1,whiteSpace:`pre`,wordWrap:!1,wordWrapWidth:100};var ji=Ai;function Mi(e){let t=e;if(typeof t.dropShadow==`boolean`&&t.dropShadow){let n=ji.defaultDropShadow;e.dropShadow={alpha:t.dropShadowAlpha??n.alpha,angle:t.dropShadowAngle??n.angle,blur:t.dropShadowBlur??n.blur,color:t.dropShadowColor??n.color,distance:t.dropShadowDistance??n.distance}}if(t.strokeThickness!==void 0){c(l,`strokeThickness is now a part of stroke`);let n=t.stroke,r={};if(f.isColorLike(n))r.color=n;else if(n instanceof Ne||n instanceof Pe)r.fill=n;else if(Object.hasOwnProperty.call(n,`color`)||Object.hasOwnProperty.call(n,`fill`))r=n;else throw Error(`Invalid stroke value.`);e.stroke={...r,width:t.strokeThickness}}if(Array.isArray(t.fillGradientStops)){if(c(l,"gradient fill is now a fill pattern: `new FillGradient(...)`"),!Array.isArray(t.fill)||t.fill.length===0)throw Error(`Invalid fill value. Expected an array of colors for gradient fill.`);t.fill.length!==t.fillGradientStops.length&&k(`The number of fill colors must match the number of fill gradient stops.`);let n=new Ne({start:{x:0,y:0},end:{x:0,y:1},textureSpace:`local`}),r=t.fillGradientStops.slice(),i=t.fill.map(e=>f.shared.setValue(e).toNumber());r.forEach((e,t)=>{n.addColorStop(e,i[t])}),e.fill={fill:n}}}var Ni=!1;function Pi(e){if(Ni)return;let t=new u({scaleMode:e.scaleMode});e._resourceId!==t._resourceId&&(Ni=!0,k(`Text textureStyle: only scaleMode is applied to a text texture, the other fields are ignored`))}function Fi(e,t){let{texture:n,bounds:r}=e,i=t._style._getFinalPadding();j(r,t._anchor,n);let a=t._anchor._x*i*2,o=t._anchor._y*i*2;r.minX-=i-a,r.minY-=i-o,r.maxX-=i-a,r.maxY-=i-o}var Ii=class extends je{},Li=class{constructor(e){this._renderer=e,e.runners.resolutionChange.add(this),e.runners.contextChange.add(this),this._managedTexts=new et({renderer:e,type:`renderable`,onUnload:this.onTextUnload.bind(this),name:`canvasText`})}resolutionChange(){for(let e in this._managedTexts.items){let t=this._managedTexts.items[e];t?._autoResolution&&t.onViewUpdate()}}contextChange(){for(let e in this._managedTexts.items)this._managedTexts.items[e]?.unload()}validateRenderable(e){let t=this._getGpuText(e),n=e.styleKey;return t.currentKey!==n||e._didTextUpdate}addRenderable(e,t){let n=this._getGpuText(e);if(e._didTextUpdate||n.currentKey!==e.styleKey){let t=e._autoResolution?this._renderer.resolution:e.resolution;(n.currentKey!==e.styleKey||e._resolution!==t)&&this._updateGpuText(e),e._didTextUpdate=!1,Fi(n,e)}this._renderer.renderPipes.batch.addToBatch(n,t)}updateRenderable(e){let t=this._getGpuText(e);t._batcher.updateElement(t)}_updateGpuText(e){let t=this._getGpuText(e);t.texture&&this._renderer.canvasText.decreaseReferenceCount(t.currentKey),e._resolution=e._autoResolution?this._renderer.resolution:e.resolution,t.texture=this._renderer.canvasText.getManagedTexture(e),t.currentKey=e.styleKey}_getGpuText(e){return e._gpuData[this._renderer.uid]||this.initGpuText(e)}initGpuText(e){let t=new Ii;return t.currentKey=`--`,t.renderable=e,t.transform=e.groupTransform,t.bounds={minX:0,maxX:1,minY:0,maxY:0},t.roundPixels=this._renderer._roundPixels|e._roundPixels,e._gpuData[this._renderer.uid]=t,this._managedTexts.add(e),t}onTextUnload(e){let t=e._gpuData[this._renderer.uid];if(!t)return;let{canvasText:n}=this._renderer;n.getReferenceCount(t.currentKey)>0?n.decreaseReferenceCount(t.currentKey):t.texture&&n.returnTexture(t.texture)}destroy(){this._managedTexts.destroy(),this._renderer=null}};Li.extension={type:[m.WebGLPipes,m.WebGPUPipes,m.CanvasPipes],name:`text`};var Ri=class{constructor(e,t){this._activeTextures={},this._renderer=e,this._retainCanvasContext=t}getTexture(e,t,n,r){typeof e==`string`&&(c(`8.0.0`,`CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments`),e={text:e,style:n,resolution:t}),e.style instanceof ji||(e.style=new ji(e.style)),typeof e.text!=`string`&&(e.text=e.text.toString());let{text:i,style:a,textureStyle:o,autoGenerateMipmaps:s}=e,l=e.resolution??this._renderer.resolution,{frame:u,canvasAndContext:d}=ki.getCanvasAndContext({text:i,style:a,resolution:l}),f=Er(d.canvas,u.width,u.height,l,s,o?.scaleMode);if(a.trim&&(u.pad(a.padding),f.frame.copyFrom(u),f.frame.scale(1/l),f.updateUvs()),a.filters){let e=this._applyFilters(f,a.filters);return this.returnTexture(f),ki.returnCanvasAndContext(d),e}return this._renderer.texture.initSource(f._source),this._retainCanvasContext||ki.returnCanvasAndContext(d),f}returnTexture(e){let t=e.source,n=t.resource;if(this._retainCanvasContext&&n?.getContext){let e=n.getContext(`2d`);e&&ki.returnCanvasAndContext({canvas:n,context:e})}t.resource=null,t.uploadMethodId=`unknown`,t.alphaMode=`no-premultiply-alpha`,le.returnTexture(e)}renderTextToCanvas(){c(`8.10.0`,`CanvasTextSystem.renderTextToCanvas: no longer supported, use CanvasTextSystem.getTexture instead`)}getManagedTexture(e){e._resolution=e._autoResolution?this._renderer.resolution:e.resolution;let t=e.styleKey;if(this._activeTextures[t])return this._increaseReferenceCount(t),this._activeTextures[t].texture;let n=this.getTexture({text:e.text,style:e.style,resolution:e._resolution,textureStyle:e.textureStyle,autoGenerateMipmaps:e.autoGenerateMipmaps});return this._activeTextures[t]={texture:n,usageCount:1},n}decreaseReferenceCount(e){let t=this._activeTextures[e];t&&(t.usageCount--,t.usageCount===0&&(this.returnTexture(t.texture),this._activeTextures[e]=null))}getReferenceCount(e){return this._activeTextures[e]?.usageCount??0}_increaseReferenceCount(e){this._activeTextures[e].usageCount++}_applyFilters(e,t){let n=this._renderer.renderTarget.renderTarget,r=this._renderer.filter.generateFilteredTexture({texture:e,filters:t});return this._renderer.renderTarget.bind({target:n,clear:!1}),r}destroy(){this._renderer=null;for(let e in this._activeTextures)this._activeTextures[e]&&this.returnTexture(this._activeTextures[e].texture);this._activeTextures=null}},zi=class extends Ri{constructor(e){super(e,!0)}};zi.extension={type:[m.CanvasSystem],name:`canvasText`};var Bi=class extends Ri{constructor(e){super(e,!1)}};Bi.extension={type:[m.WebGLSystem,m.WebGPUSystem],name:`canvasText`},r.add(zi),r.add(Bi),r.add(Li);var Vi=class extends Rr{constructor(...e){let n=zr(e,`Text`);super(n,ji),this.renderPipeId=`text`,n.textureStyle&&(this.textureStyle=n.textureStyle instanceof u?n.textureStyle:new u(n.textureStyle),Pi(this.textureStyle)),this.autoGenerateMipmaps=n.autoGenerateMipmaps??t.defaultOptions.autoGenerateMipmaps}updateBounds(){let e=this._bounds,t=this._anchor,n=0,r=0;if(this._style.trim){let{frame:e,canvasAndContext:t}=ki.getCanvasAndContext({text:this.text,style:this._style,resolution:1});ki.returnCanvasAndContext(t),n=e.width,r=e.height}else{let e=Si.measureText(this._text,this._style);n=e.width,r=e.height}e.minX=-t._x*n,e.maxX=e.minX+n,e.minY=-t._y*r,e.maxY=e.minY+r}},Hi=class extends p{constructor(){super(...arguments),this.chars=Object.create(null),this.lineHeight=0,this.fontFamily=``,this.fontMetrics={fontSize:0,ascent:0,descent:0},this.baseLineOffset=0,this.distanceField={type:`none`,range:0},this.pages=[],this.applyFillAsTint=!0,this.baseMeasurementFontSize=100,this.baseRenderedFontSize=100}get font(){return c(l,`BitmapFont.font is deprecated, please use BitmapFont.fontFamily instead.`),this.fontFamily}get pageTextures(){return c(l,`BitmapFont.pageTextures is deprecated, please use BitmapFont.pages instead.`),this.pages}get size(){return c(l,`BitmapFont.size is deprecated, please use BitmapFont.fontMetrics.fontSize instead.`),this.fontMetrics.fontSize}get distanceFieldRange(){return c(l,`BitmapFont.distanceFieldRange is deprecated, please use BitmapFont.distanceField.range instead.`),this.distanceField.range}get distanceFieldType(){return c(l,`BitmapFont.distanceFieldType is deprecated, please use BitmapFont.distanceField.type instead.`),this.distanceField.type}destroy(e=!1){this.emit(`destroy`,this),this.removeAllListeners();for(let e in this.chars)this.chars[e].texture?.destroy();this.chars=null,e&&(this.pages.forEach(e=>e.texture.destroy(!0)),this.pages=null)}},Ui=class e extends Hi{constructor(t){super(),this.resolution=1,this.pages=[],this._padding=0,this._measureCache=Object.create(null),this._currentChars=[],this._currentX=0,this._currentY=0,this._currentMaxCharHeight=0,this._currentPageIndex=-1,this._skipKerning=!1;let n={...e.defaultOptions,...t};this._textureSize=n.textureSize,this._mipmap=n.mipmap;let r=n.style.clone();n.overrideFill&&(r._fill.color=16777215,r._fill.alpha=1,r._fill.texture=O.WHITE,r._fill.fill=null),this.applyFillAsTint=n.overrideFill;let i=r.fontSize;r.fontSize=this.baseMeasurementFontSize;let a=wi(r);n.overrideSize?(r._stroke&&(r._stroke.width*=this.baseRenderedFontSize/i),r.dropShadow&&(r.dropShadow.blur*=this.baseRenderedFontSize/i,r.dropShadow.distance*=this.baseRenderedFontSize/i)):r.fontSize=this.baseRenderedFontSize=i,this._style=r,this._skipKerning=n.skipKerning??!1,this.resolution=n.resolution??1,this._padding=n.padding??4,n.textureStyle&&(this._textureStyle=n.textureStyle instanceof u?n.textureStyle:new u(n.textureStyle)),this.fontMetrics=Si.measureFont(a),this.lineHeight=r.lineHeight||this.fontMetrics.fontSize||r.fontSize}ensureCharacters(e){let t=Si.graphemeSegmenter(e).filter(e=>!this._currentChars.includes(e)).filter((e,t,n)=>n.indexOf(e)===t);if(!t.length)return;this._currentChars=[...this._currentChars,...t];let n;n=this._currentPageIndex===-1?this._nextPage():this.pages[this._currentPageIndex];let{canvas:r,context:i}=n.canvasAndContext,a=n.texture.source,o=this._style,c=this._currentX,l=this._currentY,u=this._currentMaxCharHeight,d=this.baseRenderedFontSize/this.baseMeasurementFontSize,f=(o.dropShadow?.distance??0)+(o._stroke?.width??0),p=this._padding+f,m=!1,h=r.width/this.resolution,g=r.height/this.resolution;for(let e=0;e<t.length;e++){let n=t[e],f=Si.measureText(n,o,r,!1);f.lineHeight=f.height;let _=f.width*d,v=Math.ceil((o.fontStyle===`italic`?2:1)*_),y=f.height*d,b=v+p*2,x=y+p*2;if(m=!1,n!==`
`&&n!==`\r`&&n!==`	`&&n!==` `&&(m=!0,u=Math.ceil(Math.max(x,u))),c+b>h&&(l+=u,u=x,c=0,l+u>g)){a.update();let e=this._nextPage();r=e.canvasAndContext.canvas,i=e.canvasAndContext.context,a=e.texture.source,c=0,l=0,u=0}let S=i.measureText(n).width/d;if(this.chars[n]={id:n.codePointAt(0),xOffset:-(p/d),yOffset:-(p/d),xAdvance:S,kerning:{}},m){this._drawGlyph(i,f,c+p,l+p,d,o);let e=a.width*d,t=a.height*d,r=new s(c/e*a.width,l/t*a.height,b/e*a.width,x/t*a.height);this.chars[n].texture=new O({source:a,frame:r}),c+=Math.ceil(b)}}a.update(),this._currentX=c,this._currentY=l,this._currentMaxCharHeight=u,this._skipKerning||this._applyKerning(t,i,d)}get pageTextures(){return c(l,`BitmapFont.pageTextures is deprecated, please use BitmapFont.pages instead.`),this.pages}_applyKerning(e,t,n){let r=this._measureCache;for(let i=0;i<e.length;i++){let a=e[i];for(let e=0;e<this._currentChars.length;e++){let i=this._currentChars[e],o=r[a];o||(o=r[a]=t.measureText(a).width);let s=r[i];s||(s=r[i]=t.measureText(i).width);let c=t.measureText(a+i).width,l=c-(o+s);l&&this.chars[a]&&(this.chars[a].kerning[i]=l/n),c=t.measureText(a+i).width,l=c-(o+s),l&&this.chars[i]&&(this.chars[i].kerning[a]=l/n)}}}_nextPage(){this._currentPageIndex++;let e=this.resolution,t=ne.getOptimalCanvasAndContext(this._textureSize,this._textureSize,e);this._setupContext(t.context,this._style,e);let n=e*(this.baseRenderedFontSize/this.baseMeasurementFontSize),r=new O({source:new L({resource:t.canvas,resolution:n,alphaMode:`premultiply-alpha-on-upload`,autoGenerateMipmaps:this._mipmap})});this._textureStyle&&(r.source.style=this._textureStyle);let i={canvasAndContext:t,texture:r};return this.pages[this._currentPageIndex]=i,i}_setupContext(e,t,n){t.fontSize=this.baseRenderedFontSize,e.scale(n,n),e.font=wi(t),t.fontSize=this.baseMeasurementFontSize,e.textBaseline=t.textBaseline;let r=t._stroke,i=r?.width??0;if(r&&(e.lineWidth=i,e.lineJoin=r.join,e.miterLimit=r.miterLimit,e.strokeStyle=Ei(r,e)),t._fill&&(e.fillStyle=Ei(t._fill,e)),t.dropShadow){let r=t.dropShadow,i=f.shared.setValue(r.color).toArray(),a=r.blur*n,o=r.distance*n;e.shadowColor=`rgba(${i[0]*255},${i[1]*255},${i[2]*255},${r.alpha})`,e.shadowBlur=a,e.shadowOffsetX=Math.cos(r.angle)*o,e.shadowOffsetY=Math.sin(r.angle)*o}else e.shadowColor=`black`,e.shadowBlur=0,e.shadowOffsetX=0,e.shadowOffsetY=0}_drawGlyph(e,t,n,r,i,a){let o=t.text,s=t.fontProperties,c=(a._stroke?.width??0)*i,l=n+c/2,u=r-c/2,d=s.descent*i,f=t.lineHeight*i,p=!1;a.stroke&&c&&(p=!0,e.strokeText(o,l,u+f-d));let{shadowBlur:m,shadowOffsetX:h,shadowOffsetY:g}=e;a._fill&&(p&&(e.shadowBlur=0,e.shadowOffsetX=0,e.shadowOffsetY=0),e.fillText(o,l,u+f-d)),p&&(e.shadowBlur=m,e.shadowOffsetX=h,e.shadowOffsetY=g)}destroy(){super.destroy();for(let e=0;e<this.pages.length;e++){let{canvasAndContext:t,texture:n}=this.pages[e];ne.returnCanvasAndContext(t),n.destroy(!0)}this.pages=null}};Ui.defaultOptions={textureSize:512,style:new ji,mipmap:!0};var Wi=Ui;function Gi(e,t,n,r){let i={width:0,height:0,offsetY:0,scale:t.fontSize/n.baseMeasurementFontSize,lines:[{width:0,charPositions:[],spaceWidth:0,spacesIndex:[],chars:[]}]};i.offsetY=n.baseLineOffset;let a=i.lines[0],o=null,s=!0,c={spaceWord:!1,width:0,start:0,index:0,positions:[],chars:[]},l=n.baseMeasurementFontSize/t.fontSize,u=t.letterSpacing*l,d=t.wordWrapWidth*l,f=t.lineHeight?t.lineHeight*l:n.lineHeight,p=t.wordWrap&&t.breakWords,m=ci(t.whiteSpace),h=li(t.whiteSpace);if(m||h){let t=[],n=m;for(let r=0;r<e.length;r++){let i=e[r];if(i===`\r`||i===`
`){if(h)i===`\r`&&e[r+1]===`
`&&r++,i=` `;else{m&&(n=!0),t.push(i);continue}}if(ai(i)){if(m&&oi(i)){if(n)continue;n=!0,t.push(` `)}else n=!1,t.push(i)}else n=!1,t.push(i)}e=t}let g=e=>{let t=a.width;for(let n=0;n<c.index;n++){let r=e.positions[n];a.chars.push(e.chars[n]),a.charPositions.push(r+t)}a.width+=e.width,(c.index>0||!m)&&(s=!1),c.width=0,c.index=0,c.chars.length=0},_=()=>{let e=a.chars.length-1;if(r){let t=a.chars[e];for(;oi(t);)a.width-=n.chars[t].xAdvance,a.spacesIndex.pop(),t=a.chars[--e]}i.width=Math.max(i.width,a.width),a={width:0,charPositions:[],chars:[],spaceWidth:0,spacesIndex:[]},s=!0,i.lines.push(a),i.height+=f},v=e=>e-u>d;for(let r=0;r<e.length+1;r++){let i,l=r===e.length;l||(i=e[r]);let d=n.chars[i];if(/(?:\s)/.test(i)||i===`\r`||i===`
`||l){if(!s&&t.wordWrap&&v(a.width+c.width)?(_(),g(c),!l&&d&&a.charPositions.push(0)):(c.start=a.width,g(c),!l&&d&&a.charPositions.push(0)),i===`\r`||i===`
`)_();else if(!l&&d){let e=d.xAdvance+(d.kerning?.[o]||0)+u;a.width+=e,a.spaceWidth=e,a.spacesIndex.push(a.charPositions.length),a.chars.push(i)}}else if(d){let e=d.kerning?.[o]||0,n=d.xAdvance+e+u;p&&v(c.width+n)&&(s||_(),g(c),_()),c.positions[c.index++]=c.width+e,c.chars.push(i),c.width+=n,si(i)&&(!s&&t.wordWrap&&v(a.width+c.width)&&_(),g(c))}o=i}return _(),t.align===`center`?Ki(i):t.align===`right`?qi(i):t.align===`justify`&&Ji(i),i}function Ki(e){for(let t=0;t<e.lines.length;t++){let n=e.lines[t],r=e.width/2-n.width/2;for(let e=0;e<n.charPositions.length;e++)n.charPositions[e]+=r}}function qi(e){for(let t=0;t<e.lines.length;t++){let n=e.lines[t],r=e.width-n.width;for(let e=0;e<n.charPositions.length;e++)n.charPositions[e]+=r}}function Ji(e){let t=e.width;for(let n=0;n<e.lines.length-2;n++){let r=e.lines[n],i=0,a=r.spacesIndex[i++],o=0,s=r.spacesIndex.length,c=(t-r.width)/s;for(let e=0;e<r.charPositions.length;e++)e===a&&(a=r.spacesIndex[i++],o+=c),r.charPositions[e]+=o}}function Yi(e){if(e===``)return[];typeof e==`string`&&(e=[e]);let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];if(Array.isArray(r)){if(r.length!==2)throw Error(`[BitmapFont]: Invalid character range length, expecting 2 got ${r.length}.`);if(r[0].length===0||r[1].length===0)throw Error(`[BitmapFont]: Invalid character delimiter.`);let e=r[0].charCodeAt(0),n=r[1].charCodeAt(0);if(n<e)throw Error(`[BitmapFont]: Invalid character range.`);for(let r=e,i=n;r<=i;r++)t.push(String.fromCharCode(r))}else t.push(...Array.from(r))}if(t.length===0)throw Error(`[BitmapFont]: Empty set when resolving characters.`);return t}var Xi=0,Zi=new class{constructor(){this.ALPHA=[[`a`,`z`],[`A`,`Z`],` `],this.NUMERIC=[[`0`,`9`]],this.ALPHANUMERIC=[[`a`,`z`],[`A`,`Z`],[`0`,`9`],` `],this.ASCII=[[` `,`~`]],this.defaultOptions={chars:this.ALPHANUMERIC,resolution:1,padding:4,skipKerning:!1,textureStyle:null},this.measureCache=qr(1e3)}getFont(e,t){let n=`${t.fontFamily}-bitmap`,r=!0;if(R.has(n)){let t=R.get(n);return t.ensureCharacters?.(e),t}if(t._fill.fill&&!t._stroke?(n+=t._fill.fill.styleKey,r=!1):(t._stroke||t.dropShadow)&&(n=`${t.styleKey}-bitmap`,r=!1),n+=`-${t.fontStyle}`,n+=`-${t.fontVariant}`,n+=`-${t.fontWeight}`,!R.has(n)){let e=Object.create(t);e._lineHeight=0;let i=new Wi({style:e,overrideFill:r,overrideSize:!0,...this.defaultOptions});Xi++,Xi>50&&k(`BitmapText`,`You have dynamically created ${Xi} bitmap fonts, this can be inefficient. Try pre installing your font styles using \`BitmapFont.install({name:"style1", style})\``),i.once(`destroy`,()=>{Xi--,R.remove(n)}),R.set(n,i)}let i=R.get(n);return i.ensureCharacters?.(e),i}getLayout(e,t,n=!0){let r=this.getFont(e,t),i=`${e}-${t.styleKey}-${n}`;if(this.measureCache.has(i))return this.measureCache.get(i);let a=Gi(Si.graphemeSegmenter(e),t,r,n);return this.measureCache.set(i,a),a}measureText(e,t,n=!0){return this.getLayout(e,t,n)}install(...e){let t=e[0];typeof t==`string`&&(t={name:t,style:e[1],chars:e[2]?.chars,resolution:e[2]?.resolution,padding:e[2]?.padding,skipKerning:e[2]?.skipKerning},c(l,`BitmapFontManager.install(name, style, options) is deprecated, use BitmapFontManager.install({name, style, ...options})`));let n=t?.name;if(!n)throw Error("[BitmapFontManager] Property `name` is required.");t={...this.defaultOptions,...t};let r=t.style,i=r instanceof ji?r:new ji(r),a=new Wi({style:i,overrideFill:t.dynamicFill??this._canUseTintForStyle(i),skipKerning:t.skipKerning,padding:t.padding,resolution:t.resolution,overrideSize:!1,textureStyle:t.textureStyle}),o=Yi(t.chars);return a.ensureCharacters(o.join(``)),R.set(`${n}-bitmap`,a),a.once(`destroy`,()=>R.remove(`${n}-bitmap`)),a}uninstall(e){let t=`${e}-bitmap`,n=R.get(t);n&&n.destroy()}_canUseTintForStyle(e){return!e._stroke&&(!e.dropShadow||e.dropShadow.color===0)&&!e._fill.fill&&e._fill.color===16777215}};function Qi(){let{userAgent:e}=b.get().getNavigator();return/^((?!chrome|android).)*safari/i.test(e)}var $i=class e{static _getPatternRepeat(e,t){let n=e&&e!==`clamp-to-edge`,r=t&&t!==`clamp-to-edge`;return n&&r?`repeat`:n?`repeat-x`:r?`repeat-y`:`no-repeat`}start(e,t,n){}execute(t,n){let r=n.elements;if(!r||!r.length)return;let i=t.renderer,a=i.canvasContext,o=a.activeContext;for(let t=0;t<r.length;t++){let s=r[t];if(!s.packAsQuad)continue;let c=s,l=c.texture,u=l?ve.getCanvasSource(l):null;if(!u)continue;let f=l.source.style,p=a.smoothProperty,m=f.scaleMode!==`nearest`;o[p]!==m&&(o[p]=m),a.setBlendMode(n.blendMode);let h=i.globalUniforms.globalUniformData?.worldColor??4294967295,g=c.color,_=(h>>>24&255)/255,v=(g>>>24&255)/255,y=i.filter?.alphaMultiplier??1,b=_*v*y;if(b<=0)continue;o.globalAlpha=b;let x=h&16777215,S=g&16777215,C=me(ie(S,x)),w=l.frame,T=f.addressModeU??f.addressMode,E=f.addressModeV??f.addressMode,D=e._getPatternRepeat(T,E),ee=l.source._resolution??l.source.resolution??1,te=c.renderable?.renderGroup?.isCachedAsTexture,ne=w.x*ee,re=w.y*ee,O=w.width*ee,k=w.height*ee,ae=c.bounds,A=i.renderTarget.renderTarget.isRoot,oe=ae.minX,se=ae.minY,j=ae.maxX-ae.minX,ce=ae.maxY-ae.minY,le=l.rotate,M=l.uvs,ue=Math.min(M.x0,M.x1,M.x2,M.x3,M.y0,M.y1,M.y2,M.y3),de=Math.max(M.x0,M.x1,M.x2,M.x3,M.y0,M.y1,M.y2,M.y3),N=D!==`no-repeat`&&(ue<0||de>1),P=le&&(!!N||C===16777215&&!le);P?(e._tempPatternMatrix.copyFrom(c.transform),d.matrixAppendRotationInv(e._tempPatternMatrix,le,oe,se,j,ce),a.setContextTransform(e._tempPatternMatrix,c.roundPixels===1,void 0,te&&A)):a.setContextTransform(c.transform,c.roundPixels===1,void 0,te&&A);let fe=j,pe=ce,he=P?0:oe,F=P?0:se;if(!P&&c.roundPixels===1&&(he|=0,F|=0),N){let t=u,n=C!==16777215&&!le,r=w.width<=l.source.width&&w.height<=l.source.height;n&&r&&(t=ve.getTintedCanvas({texture:l},C));let i=o.createPattern(t,D);if(!i)continue;let a=fe,s=pe;if(a===0||s===0)continue;let c=1/a,d=1/s,f=(M.x1-M.x0)*c,p=(M.y1-M.y0)*c,m=(M.x3-M.x0)*d,h=(M.y3-M.y0)*d,g=M.x0-f*he-m*F,_=M.y0-p*he-h*F,v=l.source.pixelWidth,y=l.source.pixelHeight;e._tempPatternMatrix.set(f*v,p*y,m*v,h*y,g*v,_*y),ve.applyPatternTransform(i,e._tempPatternMatrix),o.fillStyle=i,o.fillRect(he,F,fe,pe)}else{let e=C!==16777215||le?ve.getTintedCanvas({texture:l},C):u,t=e!==u;o.drawImage(e,t?0:ne,t?0:re,t?e.width:O,t?e.height:k,he,F,fe,pe)}}}};$i._tempPatternMatrix=new A,$i.extension={type:[m.CanvasPipesAdaptor],name:`batch`};var ea=$i,ta=class{constructor(){this._tempState=he.for2d(),this._didUploadHash={}}init(e){e.renderer.runners.contextChange.add(this)}contextChange(){this._didUploadHash={}}start(e,t,n){let r=e.renderer,i=this._didUploadHash[n.uid];r.shader.bind(n,i),i||(this._didUploadHash[n.uid]=!0),r.shader.updateUniformGroup(r.globalUniforms.uniformGroup),r.geometry.bind(t,n.glProgram)}execute(e,t){let n=e.renderer;this._tempState.blendMode=t.blendMode,n.state.set(this._tempState);let r=t.textures.textures;for(let e=0;e<t.textures.count;e++)n.texture.bind(r[e],e);n.geometry.draw(t.topology,t.size,t.start)}};ta.extension={type:[m.WebGLPipesAdaptor],name:`batch`};var na=he.for2d(),ra=class{start(e,t,n){let r=e.renderer,i=r.encoder,a=n.gpuProgram;this._shader=n,this._geometry=t,i.setGeometry(t,a),na.blendMode=`normal`,r.pipeline.getPipeline(t,a,na,void 0,n._overrides);let o=r.globalUniforms.bindGroup;i.resetBindGroup(1),i.setBindGroup(0,o,a)}execute(e,t){let n=this._shader.gpuProgram,r=e.renderer,i=r.encoder;if(!t.bindGroup){let e=t.textures;t.bindGroup=He(e.textures,e.count,r.limits.maxBatchableTextures)}na.blendMode=t.blendMode;let a=r.bindGroup.getBindGroup(t.bindGroup,n,1),o=r.pipeline.getPipeline(this._geometry,n,na,t.topology,this._shader._overrides);t.bindGroup._touch(r.gc.now),i.setPipeline(o),i.renderPassEncoder.setBindGroup(1,a),i.renderPassEncoder.drawIndexed(t.size,1,t.start)}};ra.extension={type:[m.WebGPUPipesAdaptor],name:`batch`};var ia=class{constructor(e){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=e}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(e,t,n){this._renderer.renderPipes.batch.break(n);let r=this._colorStack;r[this._colorStackIndex]=r[this._colorStackIndex-1]&e.mask;let i=this._colorStack[this._colorStackIndex];i!==this._currentColor&&(this._currentColor=i,n.add({renderPipeId:`colorMask`,colorMask:i,canBundle:!1})),this._colorStackIndex++}pop(e,t,n){this._renderer.renderPipes.batch.break(n);let r=this._colorStack;this._colorStackIndex--;let i=r[this._colorStackIndex-1];i!==this._currentColor&&(this._currentColor=i,n.add({renderPipeId:`colorMask`,colorMask:i,canBundle:!1}))}execute(e){}destroy(){this._renderer=null,this._colorStack=null}};ia.extension={type:[m.CanvasPipes],name:`colorMask`};function aa(e,t,n,r,i,a){a=Math.max(0,Math.min(a,Math.min(r,i)/2)),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.quadraticCurveTo(t+r,n,t+r,n+a),e.lineTo(t+r,n+i-a),e.quadraticCurveTo(t+r,n+i,t+r-a,n+i),e.lineTo(t+a,n+i),e.quadraticCurveTo(t,n+i,t,n+i-a),e.lineTo(t,n+a),e.quadraticCurveTo(t,n,t+a,n)}function oa(e,t){switch(t.type){case`rectangle`:{let n=t;e.rect(n.x,n.y,n.width,n.height);break}case`roundedRectangle`:{let n=t;aa(e,n.x,n.y,n.width,n.height,n.radius);break}case`circle`:{let n=t;e.moveTo(n.x+n.radius,n.y),e.arc(n.x,n.y,n.radius,0,Math.PI*2);break}case`ellipse`:{let n=t;e.ellipse?(e.moveTo(n.x+n.halfWidth,n.y),e.ellipse(n.x,n.y,n.halfWidth,n.halfHeight,0,0,Math.PI*2)):(e.save(),e.translate(n.x,n.y),e.scale(n.halfWidth,n.halfHeight),e.moveTo(1,0),e.arc(0,0,1,0,Math.PI*2),e.restore());break}case`triangle`:{let n=t;e.moveTo(n.x,n.y),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3),e.closePath();break}default:{let n=t,r=n.points;if(!r?.length)break;e.moveTo(r[0],r[1]);for(let t=2;t<r.length;t+=2)e.lineTo(r[t],r[t+1]);n.closePath&&e.closePath();break}}}function sa(e,t,n){let r=[],i=[],a=[];if(!Le[t.type]?.build(t,r))return!1;let o=t.closePath??!0;Fe(r,n,!1,o,i,a);for(let t=0;t<a.length;t+=3){let n=a[t]*2,r=a[t+1]*2,o=a[t+2]*2;e.moveTo(i[n],i[n+1]),e.lineTo(i[r],i[r+1]),e.lineTo(i[o],i[o+1]),e.closePath()}return!0}function ca(e,t){if(!t?.length)return!1;for(let n=0;n<t.length;n++){let r=t[n];if(!r?.shape)continue;let i=r.transform,a=i&&!i.isIdentity();a&&(e.save(),e.transform(i.a,i.b,i.c,i.d,i.tx,i.ty)),oa(e,r.shape),a&&e.restore()}return!0}var la=class{constructor(e){this._warnedMaskTypes=new Set,this._canvasMaskStack=[],this._renderer=e}push(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`stencilMask`,action:`pushMaskBegin`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}pop(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`stencilMask`,action:`popMaskEnd`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}execute(e){if(e.action!==`pushMaskBegin`&&e.action!==`popMaskEnd`)return;let t=this._renderer,n=t.canvasContext,r=n?.activeContext;if(!r)return;if(e.action===`popMaskEnd`){this._canvasMaskStack.pop()&&r.restore();return}e.inverse&&this._warnOnce(`inverse`,`CanvasRenderer: inverse masks are not supported on Canvas2D; ignoring inverse flag.`);let i=e.mask.mask;if(!(i instanceof V)){this._warnOnce(`nonGraphics`,`CanvasRenderer: only Graphics masks are supported in Canvas2D; skipping mask.`),this._canvasMaskStack.push(!1);return}let a=i,o=a.context?.instructions;if(!o?.length){this._canvasMaskStack.push(!1);return}r.save(),n.setContextTransform(a.groupTransform,(t._roundPixels|a._roundPixels)===1),r.beginPath();let s=!1,c=!1;for(let e=0;e<o.length;e++){let t=o[e],n=t.action;if(n!==`fill`&&n!==`stroke`)continue;let i=t.data,a=i?.path?.shapePath;if(!a?.shapePrimitives?.length)continue;let l=n===`stroke`,u=a.shapePrimitives;for(let e=0;e<u.length;e++){let t=u[e];if(!t?.shape)continue;let n=t.transform,a=n&&!n.isIdentity();a&&(r.save(),r.transform(n.a,n.b,n.c,n.d,n.tx,n.ty)),l&&i.style?s=sa(r,t.shape,i.style)||s:(oa(r,t.shape),c=ca(r,t.holes)||c,s=!0),a&&r.restore()}}if(!s){r.restore(),this._canvasMaskStack.push(!1);return}c?r.clip(`evenodd`):r.clip(),this._canvasMaskStack.push(!0)}destroy(){this._renderer=null,this._warnedMaskTypes=null,this._canvasMaskStack=null}_warnOnce(e,t){this._warnedMaskTypes.has(e)||(this._warnedMaskTypes.add(e),k(t))}};la.extension={type:[m.CanvasPipes],name:`stencilMask`};var H=`source-over`;function ua(){let e=_e(),t=Object.create(null);return t.inherit=H,t.none=H,t.normal=`source-over`,t.add=`lighter`,t.multiply=e?`multiply`:H,t.screen=e?`screen`:H,t.overlay=e?`overlay`:H,t.darken=e?`darken`:H,t.lighten=e?`lighten`:H,t[`color-dodge`]=e?`color-dodge`:H,t[`color-burn`]=e?`color-burn`:H,t[`hard-light`]=e?`hard-light`:H,t[`soft-light`]=e?`soft-light`:H,t.difference=e?`difference`:H,t.exclusion=e?`exclusion`:H,t.saturation=e?`saturation`:H,t.color=e?`color`:H,t.luminosity=e?`luminosity`:H,t[`linear-burn`]=e?`color-burn`:H,t[`linear-dodge`]=e?`color-dodge`:H,t[`linear-light`]=e?`hard-light`:H,t[`pin-light`]=e?`hard-light`:H,t[`vivid-light`]=e?`hard-light`:H,t[`hard-mix`]=H,t.negation=e?`difference`:H,t[`normal-npm`]=t.normal,t[`add-npm`]=t.add,t[`screen-npm`]=t.screen,t.erase=`destination-out`,t.subtract=H,t.divide=H,t.min=H,t.max=H,t}var da=new A,fa=class{constructor(e){this.activeResolution=1,this.smoothProperty=`imageSmoothingEnabled`,this.blendModes=ua(),this._activeBlendMode=`normal`,this._projTransform=null,this._outerBlend=!1,this._warnedBlendModes=new Set,this._renderer=e}resolutionChange(e){this.activeResolution=e}init(){let e=this._renderer.background.alpha<1;if(this.rootContext=this._renderer.canvas.getContext(`2d`,{alpha:e}),this.activeContext=this.rootContext,this.activeResolution=this._renderer.resolution,!this.rootContext.imageSmoothingEnabled){let e=this.rootContext;e.webkitImageSmoothingEnabled?this.smoothProperty=`webkitImageSmoothingEnabled`:e.mozImageSmoothingEnabled?this.smoothProperty=`mozImageSmoothingEnabled`:e.oImageSmoothingEnabled?this.smoothProperty=`oImageSmoothingEnabled`:e.msImageSmoothingEnabled&&(this.smoothProperty=`msImageSmoothingEnabled`)}}setContextTransform(e,t,n,r){let i=r?A.IDENTITY:this._renderer.globalUniforms.globalUniformData?.worldTransformMatrix||A.IDENTITY,a=da;a.copyFrom(i),a.append(e);let o=this._projTransform,s=this.activeResolution;if(n=n||s,o){let e=A.shared;e.copyFrom(a),e.prepend(o),a=e}t?this.activeContext.setTransform(a.a*n,a.b*n,a.c*n,a.d*n,a.tx*s|0,a.ty*s|0):this.activeContext.setTransform(a.a*n,a.b*n,a.c*n,a.d*n,a.tx*s,a.ty*s)}clear(e,t){let n=this.activeContext,r=this._renderer;if(n.clearRect(0,0,r.width,r.height),e){let i=f.shared.setValue(e);n.globalAlpha=t??i.alpha,n.fillStyle=i.toHex(),n.fillRect(0,0,r.width,r.height),n.globalAlpha=1}}setBlendMode(e){if(this._activeBlendMode===e)return;this._activeBlendMode=e,this._outerBlend=!1;let t=this.blendModes[e];if(!t){this._warnedBlendModes.has(e)||(console.warn(`CanvasRenderer: blend mode "${e}" is not supported in Canvas2D; falling back to "source-over".`),this._warnedBlendModes.add(e)),this.activeContext.globalCompositeOperation=`source-over`;return}this.activeContext.globalCompositeOperation=t}destroy(){this.rootContext=null,this.activeContext=null,this._warnedBlendModes.clear()}};fa.extension={type:[m.CanvasSystem],name:`canvasContext`};var pa=class{constructor(){this.maxTextures=16,this.maxBatchableTextures=16,this.maxUniformBindings=0}init(){}};pa.extension={type:[m.CanvasSystem],name:`limits`};var ma=`#808080`,ha=new A,ga=new A,_a=new A,va=new A,ya=new A;function ba(e,t,n){e.beginPath();for(let r=0;r<n.length;r+=3){let i=n[r]*2,a=n[r+1]*2,o=n[r+2]*2;e.moveTo(t[i],t[i+1]),e.lineTo(t[a],t[a+1]),e.lineTo(t[o],t[o+1]),e.closePath()}e.fill()}function xa(e){return`#${(e&16777215).toString(16).padStart(6,`0`)}`}function Sa(e,t,n,r,i,a){a=Math.max(0,Math.min(a,Math.min(r,i)/2)),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.quadraticCurveTo(t+r,n,t+r,n+a),e.lineTo(t+r,n+i-a),e.quadraticCurveTo(t+r,n+i,t+r-a,n+i),e.lineTo(t+a,n+i),e.quadraticCurveTo(t,n+i,t,n+i-a),e.lineTo(t,n+a),e.quadraticCurveTo(t,n,t+a,n)}function Ca(e,t){switch(t.type){case`rectangle`:{let n=t;e.rect(n.x,n.y,n.width,n.height);break}case`roundedRectangle`:{let n=t;Sa(e,n.x,n.y,n.width,n.height,n.radius);break}case`circle`:{let n=t;e.arc(n.x,n.y,n.radius,0,Math.PI*2);break}case`ellipse`:{let n=t;e.ellipse?e.ellipse(n.x,n.y,n.halfWidth,n.halfHeight,0,0,Math.PI*2):(e.save(),e.translate(n.x,n.y),e.scale(n.halfWidth,n.halfHeight),e.arc(0,0,1,0,Math.PI*2),e.restore());break}case`triangle`:{let n=t;e.moveTo(n.x,n.y),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3),e.closePath();break}default:{let n=t,r=n.points;if(!r?.length)break;e.moveTo(r[0],r[1]);for(let t=2;t<r.length;t+=2)e.lineTo(r[t],r[t+1]);n.closePath&&e.closePath();break}}}function wa(e,t){if(!t?.length)return!1;for(let n=0;n<t.length;n++){let r=t[n];if(!r?.shape)continue;let i=r.transform,a=i&&!i.isIdentity();a&&(e.save(),e.transform(i.a,i.b,i.c,i.d,i.tx,i.ty)),Ca(e,r.shape),a&&e.restore()}return!0}function Ta(e,t,n,r){let i=e.fill;if(i instanceof Ne){i.buildGradient();let a=i.texture;if(a){let o=ve.getTintedPattern(a,t),s=n?va.copyFrom(n).scale(a.source.pixelWidth,a.source.pixelHeight):va.copyFrom(i.transform);return r&&!e.textureSpace&&s.append(r),ve.applyPatternTransform(o,s),o}}if(i instanceof Pe){let e=ve.getTintedPattern(i.texture,t);return ve.applyPatternTransform(e,i.transform,!1),e}let a=e.texture;if(a&&a!==O.WHITE){if(!a.source.resource)return ma;let r=ve.getTintedPattern(a,t),i=e.matrix;if(n){let{resolution:e}=a.source;if(i=va.copyFrom(n),a.rotate){let{uvs:t,orig:n}=a;i.prepend(ya.set(t.x1-t.x0,t.y1-t.y0,t.x3-t.x0,t.y3-t.y0,t.x0,t.y0).invert()).scale(n.width*e,n.height*e)}else i.scale(a.source.pixelWidth,a.source.pixelHeight).translate(-a.frame.x*e,-a.frame.y*e)}return ve.applyPatternTransform(r,i),r}return xa(t)}var Ea=class{constructor(){this.shader=null}contextChange(e){}execute(e,t){let n=e.renderer,r=n.canvasContext,i=r.activeContext,a=t.groupTransform,o=n.globalUniforms.globalUniformData?.worldColor??4294967295,s=t.groupColorAlpha,c=(o>>>24&255)/255,l=(s>>>24&255)/255,u=n.filter?.alphaMultiplier??1,f=c*l*u;if(f<=0)return;let p=o&16777215,m=s&16777215,h=me(ie(m,p)),g=n._roundPixels|t._roundPixels;i.save(),r.setContextTransform(a,g===1),r.setBlendMode(t.groupBlendMode);let _=t.context.instructions;for(let e=0;e<_.length;e++){let t=_[e];if(t.action===`texture`){let e=t.data,n=e.image,o=n?ve.getCanvasSource(n):null;if(!o)continue;let s=e.alpha*f;if(s<=0)continue;let c=ie(e.style,h);i.globalAlpha=s;let l=o;c!==16777215&&(l=ve.getTintedCanvas({texture:n},c));let u=n.frame,p=n.source._resolution??n.source.resolution??1,m=u.x*p,_=u.y*p,v=u.width*p,y=u.height*p;l!==o&&(m=0,_=0);let b=e.transform,x=b&&!b.isIdentity(),S=n.rotate;x||S?(ha.copyFrom(a),x&&ha.append(b),S&&d.matrixAppendRotationInv(ha,S,e.dx,e.dy,e.dw,e.dh),r.setContextTransform(ha,g===1)):r.setContextTransform(a,g===1),i.drawImage(l,m,_,l===o?v:l.width,l===o?y:l.height,S?0:e.dx,S?0:e.dy,e.dw,e.dh),(x||S)&&r.setContextTransform(a,g===1);continue}let n=t.data,o=n?.path?.shapePath;if(!o?.shapePrimitives?.length)continue;let s=n.style,c=ie(s.color,h),l=s.alpha*f;if(l<=0)continue;let u=t.action===`stroke`;if(i.globalAlpha=l,u){let e=s;i.lineWidth=e.width,i.lineCap=e.cap,i.lineJoin=e.join,i.miterLimit=e.miterLimit}let p=o.shapePrimitives;if(!u&&n.hole?.shapePath?.shapePrimitives?.length){let e=p[p.length-1];e.holes=n.hole.shapePath.shapePrimitives}for(let e=0;e<p.length;e++){let t=p[e];if(!t?.shape)continue;let n=t.transform,r=n&&!n.isIdentity(),o=s.texture&&s.texture!==O.WHITE,l=s.textureSpace===`global`?n:null,d=Ta(s,c,o?ze(ga,s,t.shape,l):null,r?_a.copyFrom(a).append(n):a);if(r&&(i.save(),i.transform(n.a,n.b,n.c,n.d,n.tx,n.ty)),u){let e=s;if(e.alignment!==.5&&!e.pixelLine){let n=[],r=[],a=[];if(Le[t.shape.type]?.build(t.shape,n)){let o=t.shape.closePath??!0;Fe(n,e,!1,o,r,a),i.fillStyle=d,ba(i,r,a)}else i.strokeStyle=d,i.beginPath(),Ca(i,t.shape),i.stroke()}else i.strokeStyle=d,i.beginPath(),Ca(i,t.shape),i.stroke()}else i.fillStyle=d,i.beginPath(),Ca(i,t.shape),wa(i,t.holes)?i.fill(`evenodd`):i.fill();r&&i.restore()}}i.restore()}destroy(){this.shader=null}};Ea.extension={type:[m.CanvasPipesAdaptor],name:`graphics`};var Da=class{init(e,t){this._renderer=e,this._renderTargetSystem=t}initGpuRenderTarget(e){let t=e.colorTexture,{canvas:n,context:r}=this._ensureCanvas(t);return{canvas:n,context:r,width:n.width,height:n.height}}resizeGpuRenderTarget(e){let t=e.colorTexture,{canvas:n}=this._ensureCanvas(t);n.width=e.pixelWidth,n.height=e.pixelHeight}startRenderPass(e,t,n,r){let i=this._renderTargetSystem.getGpuRenderTarget(e);this._renderer.canvasContext.activeContext=i.context,this._renderer.canvasContext.activeResolution=e.resolution,t&&this.clear(e,t,n,r)}clear(e,t,n,r){let i=this._renderTargetSystem.getGpuRenderTarget(e).context,a=r||{x:0,y:0,width:e.pixelWidth,height:e.pixelHeight};if(i.setTransform(1,0,0,1,0,0),i.clearRect(a.x,a.y,a.width,a.height),n){let e=f.shared.setValue(n);e.alpha>0&&(i.globalAlpha=e.alpha,i.fillStyle=e.toHex(),i.fillRect(a.x,a.y,a.width,a.height),i.globalAlpha=1)}}finishRenderPass(){}copyToTexture(e,t,n,r,i){let a=this._renderTargetSystem.getGpuRenderTarget(e).canvas,o=t.source,{context:s}=this._ensureCanvas(o),c=i?.x??0,l=i?.y??0;return s.drawImage(a,n.x,n.y,r.width,r.height,c,l,r.width,r.height),o.update(),t}copyDepthTexture(e,t,n,r,i){k(`[CanvasRenderTargetAdaptor] copyDepthTexture is not supported in the canvas renderer`)}destroyGpuRenderTarget(e){}_ensureCanvas(e){let t=e.resource;(!t||!pe.test(t))&&(t=b.get().createCanvas(e.pixelWidth,e.pixelHeight),e.resource=t),(t.width!==e.pixelWidth||t.height!==e.pixelHeight)&&(t.width=e.pixelWidth,t.height=e.pixelHeight);let n=t.getContext(`2d`);return{canvas:t,context:n}}},Oa=class extends Ae{constructor(e){super(e),this.adaptor=new Da,this.adaptor.init(e,this)}};Oa.extension={type:[m.CanvasSystem],name:`renderTarget`};var ka=class{constructor(e){}init(){}initSource(e){}generateCanvas(e){let t=b.get().createCanvas(),n=t.getContext(`2d`),r=ve.getCanvasSource(e);if(!r)return t;let i=e.frame,a=e.source._resolution??e.source.resolution??1,o=i.x*a,s=i.y*a,c=i.width*a,l=i.height*a;return t.width=Math.ceil(c),t.height=Math.ceil(l),n.drawImage(r,o,s,c,l,0,0,c,l),t}getPixels(e){let t=this.generateCanvas(e);return{pixels:t.getContext(`2d`,{willReadFrequently:!0}).getImageData(0,0,t.width,t.height).data,width:t.width,height:t.height}}destroy(){}};ka.extension={type:[m.CanvasSystem],name:`texture`};var Aa=D({CanvasRenderer:()=>Ra}),ja=[...Oe,fa,pa,ka,Oa],Ma=[Ce,we,be,De,z,la,ia,ke],Na=[ea,Ea],Pa=[],Fa=[],Ia=[],La=[];r.handleByNamedList(m.CanvasSystem,Pa),r.handleByNamedList(m.CanvasPipes,Fa),r.handleByNamedList(m.CanvasPipesAdaptor,Ia),r.handleByNamedList(m.CanvasLoader,La),r.add(...ja,...Ma,...Na);var Ra=class extends B{constructor(){let e={name:`canvas`,type:te.CANVAS,systems:Pa,renderPipes:Fa,renderPipeAdaptors:Ia,loaders:La};super(e)}},za=(e=>(e[e.ELEMENT_ARRAY_BUFFER=34963]=`ELEMENT_ARRAY_BUFFER`,e[e.ARRAY_BUFFER=34962]=`ARRAY_BUFFER`,e[e.UNIFORM_BUFFER=35345]=`UNIFORM_BUFFER`,e))(za||{}),Ba=class{constructor(e,t){this._lastBindBaseLocation=-1,this._lastBindCallId=-1,this.buffer=e||null,this.updateID=-1,this.byteLength=-1,this.type=t}destroy(){this.buffer=null,this.updateID=-1,this.byteLength=-1,this.type=-1,this._lastBindBaseLocation=-1,this._lastBindCallId=-1}},Va=class{constructor(e){this._boundBufferBases=Object.create(null),this._minBaseLocation=0,this._nextBindBaseIndex=this._minBaseLocation,this._bindCallId=0,this._renderer=e,this._managedBuffers=new et({renderer:e,type:`resource`,onUnload:this.onBufferUnload.bind(this),name:`glBuffer`})}destroy(){this._managedBuffers.destroy(),this._renderer=null,this._gl=null,this._boundBufferBases={}}contextChange(){this._gl=this._renderer.gl,this.destroyAll(!0),this._maxBindings=this._renderer.limits.maxUniformBindings}getGlBuffer(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]||this.createGLBuffer(e)}bind(e){let{_gl:t}=this,n=this.getGlBuffer(e);t.bindBuffer(n.type,n.buffer)}bindBufferBase(e,t){let{_gl:n}=this;this._boundBufferBases[t]!==e&&(this._boundBufferBases[t]=e,e._lastBindBaseLocation=t,n.bindBufferBase(n.UNIFORM_BUFFER,t,e.buffer))}nextBindBase(e){this._bindCallId++,this._minBaseLocation=0,e&&(this._boundBufferBases[0]=null,this._minBaseLocation=1,this._nextBindBaseIndex<1&&(this._nextBindBaseIndex=1))}freeLocationForBufferBase(e){let t=this.getLastBindBaseLocation(e);if(t>=this._minBaseLocation)return e._lastBindCallId=this._bindCallId,t;let n=0,r=this._nextBindBaseIndex;for(;n<2;){r>=this._maxBindings&&(r=this._minBaseLocation,n++);let e=this._boundBufferBases[r];if(e&&e._lastBindCallId===this._bindCallId){r++;continue}break}return t=r,this._nextBindBaseIndex=r+1,n>=2?-1:(e._lastBindCallId=this._bindCallId,this._boundBufferBases[t]=null,t)}getLastBindBaseLocation(e){let t=e._lastBindBaseLocation;return this._boundBufferBases[t]===e?t:-1}bindBufferRange(e,t,n,r){let{_gl:i}=this;n||(n=0),t||(t=0),this._boundBufferBases[t]=null,i.bindBufferRange(i.UNIFORM_BUFFER,t||0,e.buffer,n*256,r||256)}updateBuffer(e){let{_gl:t}=this,n=this.getGlBuffer(e);if(e._updateID===n.updateID)return n;n.updateID=e._updateID,t.bindBuffer(n.type,n.buffer);let r=e.data,i=e.descriptor.usage&x.STATIC?t.STATIC_DRAW:t.DYNAMIC_DRAW;return r?n.byteLength>=r.byteLength?t.bufferSubData(n.type,e._updateOffset,r,e._updateOffset/r.BYTES_PER_ELEMENT,(e._updateSize||r.byteLength)/r.BYTES_PER_ELEMENT):(n.byteLength=r.byteLength,t.bufferData(n.type,r,i)):(n.byteLength=e.descriptor.size,t.bufferData(n.type,n.byteLength,i)),n}destroyAll(e=!1){this._managedBuffers.removeAll(e)}onBufferUnload(e,t=!1){let n=e._gpuData[this._renderer.uid];n&&(t||this._gl.deleteBuffer(n.buffer))}createGLBuffer(e){let{_gl:t}=this,n=za.ARRAY_BUFFER;e.descriptor.usage&x.INDEX?n=za.ELEMENT_ARRAY_BUFFER:e.descriptor.usage&x.UNIFORM&&(n=za.UNIFORM_BUFFER);let r=new Ba(t.createBuffer(),n);return e._gpuData[this._renderer.uid]=r,this._managedBuffers.add(e),r}resetState(){this._boundBufferBases=Object.create(null)}};Va.extension={type:[m.WebGLSystem],name:`buffer`};var Ha=class e{constructor(e){this.supports={uint32Indices:!0,uniformBufferObject:!0,vertexArrayObject:!0,srgbTextures:!0,nonPowOf2wrapping:!0,msaa:!0,nonPowOf2mipmaps:!0},this._renderer=e,this.extensions=Object.create(null),this.handleContextLost=this.handleContextLost.bind(this),this.handleContextRestored=this.handleContextRestored.bind(this)}get isLost(){return!this.gl||this.gl.isContextLost()}contextChange(e){this.gl=e,this._renderer.gl=e}init(t){t={...e.defaultOptions,...t};let n=this.multiView=t.multiView;if(t.context&&n&&(k(`Renderer created with both a context and multiview enabled. Disabling multiView as both cannot work together.`),n=!1),this.canvas=n?b.get().createCanvas(this._renderer.canvas.width,this._renderer.canvas.height):this._renderer.view.canvas,t.context)this.initFromContext(t.context);else{let e=this._renderer.background.alpha<1,n=t.premultipliedAlpha??!0,r=t.antialias&&!this._renderer.backBuffer.useBackBuffer;this.createContext(t.preferWebGLVersion,{alpha:e,premultipliedAlpha:n,antialias:r,stencil:!0,preserveDrawingBuffer:t.preserveDrawingBuffer,powerPreference:t.powerPreference??`default`})}}ensureCanvasSize(e){if(!this.multiView){e!==this.canvas&&k(`multiView is disabled, but targetCanvas is not the main canvas`);return}let{canvas:t}=this;(t.width<e.width||t.height<e.height)&&(t.width=Math.max(e.width,e.width),t.height=Math.max(e.height,e.height))}initFromContext(e){this.gl=e,this.webGLVersion=e instanceof b.get().getWebGLRenderingContext()?1:2,this.getExtensions(),this.validateContext(e),this._renderer.runners.contextChange.emit(e);let t=this._renderer.view.canvas;t.addEventListener(`webglcontextlost`,this.handleContextLost,!1),t.addEventListener(`webglcontextrestored`,this.handleContextRestored,!1)}createContext(e,t){let n,r=this.canvas;if(e===2&&(n=r.getContext(`webgl2`,t)),!n&&(n=r.getContext(`webgl`,t),!n))throw Error(`This browser does not support WebGL. Try using the canvas renderer`);this.gl=n,this.initFromContext(this.gl)}getExtensions(){let{gl:e}=this,t={anisotropicFiltering:e.getExtension(`EXT_texture_filter_anisotropic`),floatTextureLinear:e.getExtension(`OES_texture_float_linear`),s3tc:e.getExtension(`WEBGL_compressed_texture_s3tc`),s3tc_sRGB:e.getExtension(`WEBGL_compressed_texture_s3tc_srgb`),etc:e.getExtension(`WEBGL_compressed_texture_etc`),etc1:e.getExtension(`WEBGL_compressed_texture_etc1`),pvrtc:e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`),atc:e.getExtension(`WEBGL_compressed_texture_atc`),astc:e.getExtension(`WEBGL_compressed_texture_astc`),bptc:e.getExtension(`EXT_texture_compression_bptc`),rgtc:e.getExtension(`EXT_texture_compression_rgtc`),loseContext:e.getExtension(`WEBGL_lose_context`)};if(this.webGLVersion===1)this.extensions={...t,drawBuffers:e.getExtension(`WEBGL_draw_buffers`),depthTexture:e.getExtension(`WEBGL_depth_texture`),vertexArrayObject:e.getExtension(`OES_vertex_array_object`)||e.getExtension(`MOZ_OES_vertex_array_object`)||e.getExtension(`WEBKIT_OES_vertex_array_object`),uint32ElementIndex:e.getExtension(`OES_element_index_uint`),floatTexture:e.getExtension(`OES_texture_float`),floatTextureLinear:e.getExtension(`OES_texture_float_linear`),textureHalfFloat:e.getExtension(`OES_texture_half_float`),textureHalfFloatLinear:e.getExtension(`OES_texture_half_float_linear`),vertexAttribDivisorANGLE:e.getExtension(`ANGLE_instanced_arrays`),srgb:e.getExtension(`EXT_sRGB`)};else{this.extensions={...t,colorBufferFloat:e.getExtension(`EXT_color_buffer_float`)};let n=e.getExtension(`WEBGL_provoking_vertex`);n&&n.provokingVertexWEBGL(n.FIRST_VERTEX_CONVENTION_WEBGL)}}handleContextLost(e){e.preventDefault(),this._contextLossForced&&(this._contextLossForced=!1,setTimeout(()=>{this.gl.isContextLost()&&this.extensions.loseContext?.restoreContext()},0))}handleContextRestored(){this.getExtensions(),this._renderer.runners.contextChange.emit(this.gl)}destroy(){let e=this._renderer.view.canvas;this._renderer=null,e.removeEventListener(`webglcontextlost`,this.handleContextLost),e.removeEventListener(`webglcontextrestored`,this.handleContextRestored),this.gl.useProgram(null),this.extensions.loseContext?.loseContext()}forceContextLoss(){this.extensions.loseContext?.loseContext(),this._contextLossForced=!0}validateContext(e){let t=e.getContextAttributes();t&&!t.stencil&&k(`Provided WebGL context does not have a stencil buffer, masks may not render correctly`);let n=this.supports,r=this.webGLVersion===2,i=this.extensions;n.uint32Indices=r||!!i.uint32ElementIndex,n.uniformBufferObject=r,n.vertexArrayObject=r||!!i.vertexArrayObject,n.srgbTextures=r||!!i.srgb,n.nonPowOf2wrapping=r,n.nonPowOf2mipmaps=r,n.msaa=r,n.uint32Indices||k(`Provided WebGL context does not support 32 index buffer, large scenes may not render correctly`)}};Ha.extension={type:[m.WebGLSystem],name:`context`},Ha.defaultOptions={context:null,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:void 0,preferWebGLVersion:2,multiView:!1};var Ua=Ha,Wa=(e=>(e[e.RGBA=6408]=`RGBA`,e[e.RGB=6407]=`RGB`,e[e.RG=33319]=`RG`,e[e.RED=6403]=`RED`,e[e.RGBA_INTEGER=36249]=`RGBA_INTEGER`,e[e.RGB_INTEGER=36248]=`RGB_INTEGER`,e[e.RG_INTEGER=33320]=`RG_INTEGER`,e[e.RED_INTEGER=36244]=`RED_INTEGER`,e[e.ALPHA=6406]=`ALPHA`,e[e.LUMINANCE=6409]=`LUMINANCE`,e[e.LUMINANCE_ALPHA=6410]=`LUMINANCE_ALPHA`,e[e.DEPTH_COMPONENT=6402]=`DEPTH_COMPONENT`,e[e.DEPTH_STENCIL=34041]=`DEPTH_STENCIL`,e))(Wa||{}),Ga=(e=>(e[e.TEXTURE_2D=3553]=`TEXTURE_2D`,e[e.TEXTURE_CUBE_MAP=34067]=`TEXTURE_CUBE_MAP`,e[e.TEXTURE_2D_ARRAY=35866]=`TEXTURE_2D_ARRAY`,e[e.TEXTURE_CUBE_MAP_POSITIVE_X=34069]=`TEXTURE_CUBE_MAP_POSITIVE_X`,e[e.TEXTURE_CUBE_MAP_NEGATIVE_X=34070]=`TEXTURE_CUBE_MAP_NEGATIVE_X`,e[e.TEXTURE_CUBE_MAP_POSITIVE_Y=34071]=`TEXTURE_CUBE_MAP_POSITIVE_Y`,e[e.TEXTURE_CUBE_MAP_NEGATIVE_Y=34072]=`TEXTURE_CUBE_MAP_NEGATIVE_Y`,e[e.TEXTURE_CUBE_MAP_POSITIVE_Z=34073]=`TEXTURE_CUBE_MAP_POSITIVE_Z`,e[e.TEXTURE_CUBE_MAP_NEGATIVE_Z=34074]=`TEXTURE_CUBE_MAP_NEGATIVE_Z`,e))(Ga||{}),U=(e=>(e[e.UNSIGNED_BYTE=5121]=`UNSIGNED_BYTE`,e[e.UNSIGNED_SHORT=5123]=`UNSIGNED_SHORT`,e[e.UNSIGNED_SHORT_5_6_5=33635]=`UNSIGNED_SHORT_5_6_5`,e[e.UNSIGNED_SHORT_4_4_4_4=32819]=`UNSIGNED_SHORT_4_4_4_4`,e[e.UNSIGNED_SHORT_5_5_5_1=32820]=`UNSIGNED_SHORT_5_5_5_1`,e[e.UNSIGNED_INT=5125]=`UNSIGNED_INT`,e[e.UNSIGNED_INT_10F_11F_11F_REV=35899]=`UNSIGNED_INT_10F_11F_11F_REV`,e[e.UNSIGNED_INT_2_10_10_10_REV=33640]=`UNSIGNED_INT_2_10_10_10_REV`,e[e.UNSIGNED_INT_24_8=34042]=`UNSIGNED_INT_24_8`,e[e.UNSIGNED_INT_5_9_9_9_REV=35902]=`UNSIGNED_INT_5_9_9_9_REV`,e[e.BYTE=5120]=`BYTE`,e[e.SHORT=5122]=`SHORT`,e[e.INT=5124]=`INT`,e[e.FLOAT=5126]=`FLOAT`,e[e.FLOAT_32_UNSIGNED_INT_24_8_REV=36269]=`FLOAT_32_UNSIGNED_INT_24_8_REV`,e[e.HALF_FLOAT=36193]=`HALF_FLOAT`,e))(U||{}),Ka={uint8x2:U.UNSIGNED_BYTE,uint8x4:U.UNSIGNED_BYTE,sint8x2:U.BYTE,sint8x4:U.BYTE,unorm8x2:U.UNSIGNED_BYTE,unorm8x4:U.UNSIGNED_BYTE,snorm8x2:U.BYTE,snorm8x4:U.BYTE,uint16x2:U.UNSIGNED_SHORT,uint16x4:U.UNSIGNED_SHORT,sint16x2:U.SHORT,sint16x4:U.SHORT,unorm16x2:U.UNSIGNED_SHORT,unorm16x4:U.UNSIGNED_SHORT,snorm16x2:U.SHORT,snorm16x4:U.SHORT,float16x2:U.HALF_FLOAT,float16x4:U.HALF_FLOAT,float32:U.FLOAT,float32x2:U.FLOAT,float32x3:U.FLOAT,float32x4:U.FLOAT,uint32:U.UNSIGNED_INT,uint32x2:U.UNSIGNED_INT,uint32x3:U.UNSIGNED_INT,uint32x4:U.UNSIGNED_INT,sint32:U.INT,sint32x2:U.INT,sint32x3:U.INT,sint32x4:U.INT};function qa(e){return Ka[e]??Ka.float32}var Ja={"point-list":0,"line-list":1,"line-strip":3,"triangle-list":4,"triangle-strip":5},Ya=class{constructor(){this.vaoCache=Object.create(null)}destroy(){this.vaoCache=Object.create(null)}},Xa=class{constructor(e){this._renderer=e,this._activeGeometry=null,this._activeVao=null,this.hasVao=!0,this.hasInstance=!0,this._managedGeometries=new et({renderer:e,type:`resource`,onUnload:this.onGeometryUnload.bind(this),name:`glGeometry`})}contextChange(){let e=this.gl=this._renderer.gl;if(!this._renderer.context.supports.vertexArrayObject)throw Error(`[PixiJS] Vertex Array Objects are not supported on this device`);this.destroyAll(!0);let t=this._renderer.context.extensions.vertexArrayObject;t&&(e.createVertexArray=()=>t.createVertexArrayOES(),e.bindVertexArray=e=>t.bindVertexArrayOES(e),e.deleteVertexArray=e=>t.deleteVertexArrayOES(e));let n=this._renderer.context.extensions.vertexAttribDivisorANGLE;n&&(e.drawArraysInstanced=(e,t,r,i)=>{n.drawArraysInstancedANGLE(e,t,r,i)},e.drawElementsInstanced=(e,t,r,i,a)=>{n.drawElementsInstancedANGLE(e,t,r,i,a)},e.vertexAttribDivisor=(e,t)=>n.vertexAttribDivisorANGLE(e,t)),this._activeGeometry=null,this._activeVao=null}bind(e,t){let n=this.gl;this._activeGeometry=e;let r=this.getVao(e,t);this._activeVao!==r&&(this._activeVao=r,n.bindVertexArray(r)),this.updateBuffers()}resetState(){this.unbind()}updateBuffers(){let e=this._activeGeometry,t=this._renderer.buffer;for(let n=0;n<e.buffers.length;n++){let r=e.buffers[n];t.updateBuffer(r)}e._gcLastUsed=this._renderer.gc.now}checkCompatibility(e,t){let n=e.attributes,r=t._attributeData;for(let e in r)if(!n[e])throw Error(`shader and geometry incompatible, geometry missing the "${e}" attribute`)}getSignature(e,t){let n=e.attributes,r=t._attributeData,i=[`g`,e.uid];for(let e in n)r[e]&&i.push(e,r[e].location);return i.join(`-`)}getVao(e,t){return e._gpuData[this._renderer.uid]?.vaoCache[t._key]||this.initGeometryVao(e,t)}initGeometryVao(e,t,n=!0){let r=this._renderer.gl,i=this._renderer.buffer;this._renderer.shader._getProgramData(t),this.checkCompatibility(e,t);let a=this.getSignature(e,t),o=e._gpuData[this._renderer.uid];o||(o=new Ya,e._gpuData[this._renderer.uid]=o,this._managedGeometries.add(e));let s=o.vaoCache,c=s[a];if(c)return s[t._key]=c,c;rt(e,t._attributeData);let l=e.buffers;c=r.createVertexArray(),r.bindVertexArray(c);for(let e=0;e<l.length;e++){let t=l[e];i.bind(t)}return this.activateVao(e,t),s[t._key]=c,s[a]=c,r.bindVertexArray(null),c}onGeometryUnload(e,t=!1){let n=e._gpuData[this._renderer.uid];if(!n)return;let r=n.vaoCache;if(!t)for(let e in r)this._activeVao===r[e]&&this.resetState(),this.gl.deleteVertexArray(r[e])}destroyAll(e=!1){this._managedGeometries.removeAll(e)}activateVao(e,t){let n=this._renderer.gl,r=this._renderer.buffer,i=e.attributes;e.indexBuffer&&r.bind(e.indexBuffer);let a=null;for(let e in i){let o=i[e],s=o.buffer,c=r.getGlBuffer(s),l=t._attributeData[e];if(l){a!==c&&(r.bind(s),a=c);let e=l.location;n.enableVertexAttribArray(e);let t=v(o.format),i=qa(o.format);if(l.format?.substring(1,4)===`int`?n.vertexAttribIPointer(e,t.size,i,o.stride,o.offset):n.vertexAttribPointer(e,t.size,i,t.normalised,o.stride,o.offset),o.instance){if(this.hasInstance){let t=o.divisor??1;n.vertexAttribDivisor(e,t)}else throw Error(`geometry error, GPU Instancing is not supported on this device`)}}}}draw(e,t,n,r){let{gl:i}=this._renderer,a=this._activeGeometry,o=Ja[e||a.topology];if(r??(r=a.instanceCount),a.indexBuffer){let e=a.indexBuffer.data.BYTES_PER_ELEMENT,s=e===2?i.UNSIGNED_SHORT:i.UNSIGNED_INT,c=t||a.indexCount||a.indexBuffer.data.length,l=(n||0)*e;r===1?i.drawElements(o,c,s,l):i.drawElementsInstanced(o,c,s,l,r)}else r===1?i.drawArrays(o,n||0,t||a.vertexCount):i.drawArraysInstanced(o,n||0,t||a.vertexCount,r);return this}unbind(){this.gl.bindVertexArray(null),this._activeVao=null,this._activeGeometry=null}destroy(){this._managedGeometries.destroy(),this._renderer=null,this.gl=null,this._activeVao=null,this._activeGeometry=null}};Xa.extension={type:[m.WebGLSystem],name:`geometry`};var Za=new T({attributes:{aPosition:[-1,-1,3,-1,-1,3]}}),Qa=class e{constructor(e){this.useBackBuffer=!1,this._useBackBufferThisRender=!1,this._renderer=e}init(t={}){let{useBackBuffer:n,antialias:r}={...e.defaultOptions,...t};this.useBackBuffer=n,this._antialias=r,this._renderer.context.supports.msaa||(k(`antialiasing, is not supported on when using the back buffer`),this._antialias=!1),this._state=he.for2d();let i=new y({vertex:`
                attribute vec2 aPosition;
                out vec2 vUv;

                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);

                    vUv = (aPosition + 1.0) / 2.0;

                    // flip dem UVs
                    vUv.y = 1.0 - vUv.y;
                }`,fragment:`
                in vec2 vUv;
                out vec4 finalColor;

                uniform sampler2D uTexture;

                void main() {
                    finalColor = texture(uTexture, vUv);
                }`,name:`big-triangle`});this._bigTriangleShader=new g({glProgram:i,resources:{uTexture:O.WHITE.source}})}renderStart(e){let t=this._renderer.renderTarget.getRenderTarget(e.target);if(this._useBackBufferThisRender=this.useBackBuffer&&!!t.isRoot,this._useBackBufferThisRender){let t=this._renderer.renderTarget.getRenderTarget(e.target);this._targetTexture=t.colorTexture,e.target=this._getBackBufferTexture(t.colorTexture)}}renderEnd(){this._presentBackBuffer()}_presentBackBuffer(){let e=this._renderer;e.renderTarget.finishRenderPass(),this._useBackBufferThisRender&&(e.renderTarget.bind({target:this._targetTexture,clear:!1}),this._bigTriangleShader.resources.uTexture=this._backBufferTexture.source,e.encoder.draw({geometry:Za,shader:this._bigTriangleShader,state:this._state}))}_getBackBufferTexture(e){return this._backBufferTexture=this._backBufferTexture||new O({source:new t({width:e.width,height:e.height,resolution:e._resolution,antialias:this._antialias})}),this._backBufferTexture.source.resize(e.width,e.height,e._resolution),this._backBufferTexture}destroy(){this._backBufferTexture&&(this._backBufferTexture.destroy(),this._backBufferTexture=null)}};Qa.extension={type:[m.WebGLSystem],name:`backBuffer`,priority:1},Qa.defaultOptions={useBackBuffer:!1};var $a=Qa,eo=class{constructor(e){this._colorMaskCache=15,this._renderer=e}setMask(e){this._colorMaskCache!==e&&(this._colorMaskCache=e,this._renderer.gl.colorMask(!!(e&8),!!(e&4),!!(e&2),!!(e&1)))}};eo.extension={type:[m.WebGLSystem],name:`colorMask`};var to=class{constructor(e){this.commandFinished=Promise.resolve(),this._renderer=e}setGeometry(e,t){this._renderer.geometry.bind(e,t.glProgram)}finishRenderPass(){}draw(e){let t=this._renderer,{geometry:n,shader:r,state:i,skipSync:a,topology:o,size:s,start:c,instanceCount:l}=e;t.shader.bind(r,a),t.geometry.bind(n,t.shader._activeProgram),i&&t.state.set(i),t.geometry.draw(o,s,c,l??n.instanceCount)}destroy(){this._renderer=null}};to.extension={type:[m.WebGLSystem],name:`encoder`};var no=class{constructor(e){this._renderer=e}contextChange(){let e=this._renderer.gl;this.maxTextures=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),this.maxBatchableTextures=Ke(this.maxTextures,e);let t=this._renderer.context.webGLVersion===2;this.maxUniformBindings=t?e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS):0}destroy(){}};no.extension={type:[m.WebGLSystem],name:`limits`};var ro=class{constructor(){this.width=-1,this.height=-1,this.msaa=!1,this._attachedMipLevel=0,this._attachedLayer=0,this.msaaRenderBuffer=[],this.stencilMode=Ze.DISABLED,this.stencilReference=0,this.maskStackIndex=0}},io=class{constructor(e){this._stencilCache={enabled:!1,stencilReference:0,stencilMode:Ze.NONE},this._renderer=e,e.renderTarget.onRenderTargetChange.add(this)}contextChange(e){this._gl=e,this._comparisonFuncMapping={always:e.ALWAYS,never:e.NEVER,equal:e.EQUAL,"not-equal":e.NOTEQUAL,less:e.LESS,"less-equal":e.LEQUAL,greater:e.GREATER,"greater-equal":e.GEQUAL},this._stencilOpsMapping={keep:e.KEEP,zero:e.ZERO,replace:e.REPLACE,invert:e.INVERT,"increment-clamp":e.INCR,"decrement-clamp":e.DECR,"increment-wrap":e.INCR_WRAP,"decrement-wrap":e.DECR_WRAP},this._activeGpuRenderTarget=null,this.resetState()}onRenderTargetChange(e){if(this._activeRenderTarget===e)return;this._activeRenderTarget=e;let t=this._renderer.renderTarget.getGpuRenderTarget(e);this._activeGpuRenderTarget=t,this.setStencilMode(t.stencilMode,t.stencilReference)}resetState(){this._stencilCache.enabled=!1,this._stencilCache.stencilMode=Ze.NONE,this._stencilCache.stencilReference=0}setStencilMode(e,t){let n=this._activeGpuRenderTarget??(this._activeGpuRenderTarget=this._renderer.renderTarget.getGpuRenderTarget(this._activeRenderTarget)),r=this._gl,i=ft[e],a=this._stencilCache;if(n.stencilMode=e,n.stencilReference=t,e===Ze.DISABLED){this._stencilCache.enabled&&(this._stencilCache.enabled=!1,r.disable(r.STENCIL_TEST));return}this._stencilCache.enabled||(this._stencilCache.enabled=!0,r.enable(r.STENCIL_TEST)),(e!==a.stencilMode||a.stencilReference!==t)&&(a.stencilMode=e,a.stencilReference=t,r.stencilFunc(this._comparisonFuncMapping[i.stencilBack.compare],t,255),r.stencilOp(r.KEEP,r.KEEP,this._stencilOpsMapping[i.stencilBack.passOp]))}destroy(){this._renderer.renderTarget.onRenderTargetChange.remove(this),this._renderer=null,this._gl=null,this._activeRenderTarget=null,this._activeGpuRenderTarget=null}};io.extension={type:[m.WebGLSystem],name:`stencil`};var ao={f32:4,i32:4,"vec2<f32>":8,"vec3<f32>":12,"vec4<f32>":16,"vec2<i32>":8,"vec3<i32>":12,"vec4<i32>":16,u32:4,"vec2<u32>":8,"vec3<u32>":12,"vec4<u32>":16,"mat2x2<f32>":32,"mat3x3<f32>":48,"mat4x4<f32>":64};function oo(e){let t=e.map(e=>({data:e,offset:0,size:0})),n=0,r=0;for(let e=0;e<t.length;e++){let i=t[e];if(n=ao[i.data.type],!n)throw Error(`Unknown type ${i.data.type}`);i.data.size>1&&(n=Math.max(n,16)*i.data.size);let a=n===12?16:n;i.size=n;let o=r%16;o>0&&16-o<a?r+=(16-o)%16:r+=(n-o%n)%n,i.offset=r,r+=n}return r=Math.ceil(r/16)*16,{uboElements:t,size:r}}function so(e,t){let n=Math.max(ao[e.data.type]/16,1),r=e.data.value.length/e.data.size,i=(4-r%4)%4,a=e.data.type.indexOf(`i32`)>=0?`dataInt32`:`data`;return`
        v = uv.${e.data.name};
        offset += ${t};

        arrayOffset = offset;

        t = 0;

        for(var i=0; i < ${e.data.size*n}; i++)
        {
            for(var j = 0; j < ${r}; j++)
            {
                ${a}[arrayOffset++] = v[t++];
            }
            ${i===0?``:`arrayOffset += ${i};`}
        }
    `}function co(e){return ot(e,ct,so)}var lo=class extends lt{constructor(){super({createUboElements:oo,generateUboSync:co})}};lo.extension={type:[m.WebGLSystem],name:`ubo`};var uo=class{constructor(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new s,this._boundFramebuffer=void 0}init(e,t){this._renderer=e,this._renderTargetSystem=t,e.runners.contextChange.add(this)}contextChange(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new s,this._boundFramebuffer=void 0;let e=this._renderer.gl;this._drawBuffersCache=[];for(let t=1;t<=16;t++)this._drawBuffersCache[t]=Array.from({length:t},(t,n)=>e.COLOR_ATTACHMENT0+n)}copyToTexture(e,t,n,r,i){let a=this._renderTargetSystem,o=this._renderer,s=a.getGpuRenderTarget(e),c=o.gl;return this.finishRenderPass(e),c.bindFramebuffer(c.FRAMEBUFFER,s.resolveTargetFramebuffer),this._boundFramebuffer=s.resolveTargetFramebuffer,o.texture.bind(t,0),c.copyTexSubImage2D(c.TEXTURE_2D,0,i.x,i.y,n.x,n.y,r.width,r.height),t}copyDepthTexture(e,t,n,r,i){let a=this._renderTargetSystem,o=this._renderer.gl;this.finishRenderPass(e);let s=a.getRenderTarget(t),c=a.getGpuRenderTarget(e),l=a.getGpuRenderTarget(s);o.bindFramebuffer(o.READ_FRAMEBUFFER,c.framebuffer),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,l.framebuffer),this._boundFramebuffer=void 0,o.blitFramebuffer(n.x,n.y,n.x+r.width,n.y+r.height,i.x,i.y,i.x+r.width,i.y+r.height,o.DEPTH_BUFFER_BIT,o.NEAREST)}startRenderPass(e,t=!0,n,r,i=0,a=0){let o=this._renderTargetSystem.getGpuRenderTarget(e);if(a!==0&&this._renderer.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Rendering to array layers requires WebGL2.`);if(i>0){if(o.msaa)throw Error(`[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.`);if(this._renderer.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Rendering to mip levels requires WebGL2.`)}e.colorAttachments.forEach(e=>{this._renderer.texture.unbind(e.texture)});let s=this._renderer.gl;this.bindFramebuffer(o.framebuffer),!e.isRoot&&e.colorAttachments.length>0&&(o._attachedMipLevel!==i||o._attachedLayer!==a)&&(e.colorAttachments.forEach((e,t)=>{let n=e.texture,r=this._renderer.texture.getGlSource(n);if(r.target===s.TEXTURE_2D){if(a!==0)throw Error(`[RenderTargetSystem] layer must be 0 when rendering to 2D textures in WebGL.`);s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+t,s.TEXTURE_2D,r.texture,i)}else if(r.target===s.TEXTURE_2D_ARRAY){if(this._renderer.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Rendering to 2D array textures requires WebGL2.`);s.framebufferTextureLayer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+t,r.texture,i,a)}else if(r.target===s.TEXTURE_CUBE_MAP){if(a<0||a>5)throw Error(`[RenderTargetSystem] Cube map layer must be between 0 and 5.`);s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+t,s.TEXTURE_CUBE_MAP_POSITIVE_X+a,r.texture,i)}else throw Error(`[RenderTargetSystem] Unsupported texture target for render-to-layer in WebGL.`)}),o._attachedMipLevel=i,o._attachedLayer=a),o.framebuffer&&(e.depthStencilAttachment?this._attachDepthStencilTexture(e,i,a):!o.depthStencilRenderBuffer&&(e.stencil||e.depth)&&this._initStencil(o)),e.colorAttachments.length>1&&this._setDrawBuffers(e,s);let c=r.y;e.isRoot&&(c=e.pixelHeight-r.height-r.y);let l=this._viewPortCache;(l.x!==r.x||l.y!==c||l.width!==r.width||l.height!==r.height)&&(l.x=r.x,l.y=c,l.width=r.width,l.height=r.height,s.viewport(r.x,c,r.width,r.height)),this.clear(e,t,n)}finishRenderPass(e){let t=this._renderTargetSystem.getGpuRenderTarget(e);if(!t.msaa||e.colorAttachments.length===0)return;let n=this._renderer.gl;n.bindFramebuffer(n.FRAMEBUFFER,t.resolveTargetFramebuffer),n.bindFramebuffer(n.READ_FRAMEBUFFER,t.framebuffer),n.blitFramebuffer(0,0,t.width,t.height,0,0,t.width,t.height,n.COLOR_BUFFER_BIT,n.NEAREST),n.bindFramebuffer(n.FRAMEBUFFER,t.framebuffer),this._boundFramebuffer=t.framebuffer}initGpuRenderTarget(e){let t=this._renderer.gl,n=new ro;n._attachedMipLevel=0,n._attachedLayer=0;let r=e.colorTexture;return r instanceof pe?(this._renderer.context.ensureCanvasSize(r.resource),n.framebuffer=null,n):(n.width=e.pixelWidth,n.height=e.pixelHeight,e.colorAttachments.length===0?this._initDepth(e,n):this._initColor(e,n),e.depthStencilAttachment&&this._attachDepthStencilTexture(e,0,0),t.bindFramebuffer(t.FRAMEBUFFER,null),this._boundFramebuffer=null,n)}destroyGpuRenderTarget(e){let t=this._renderer.gl;e.framebuffer&&(t.deleteFramebuffer(e.framebuffer),e.framebuffer=null),e.resolveTargetFramebuffer&&(t.deleteFramebuffer(e.resolveTargetFramebuffer),e.resolveTargetFramebuffer=null),e.depthStencilRenderBuffer&&(t.deleteRenderbuffer(e.depthStencilRenderBuffer),e.depthStencilRenderBuffer=null),e.msaaRenderBuffer.forEach(e=>{t.deleteRenderbuffer(e)}),e.msaaRenderBuffer.length=0}clear(e,t,n,r,i=0,a=0){if(!t)return;if(a!==0)throw Error(`[RenderTargetSystem] Clearing array layers is not supported in WebGL renderer.`);let o=this._renderTargetSystem;if(typeof t==`boolean`&&(t=t?Te.ALL:Te.NONE),e.colorAttachments.length===0&&(t&=~Te.COLOR,!t))return;let s=this._renderer.gl,c=!!(t&Te.DEPTH)&&!this._renderer.state.depthMaskEnabled;if(t&Te.COLOR){n??(n=o.defaultClearColor);let e=this._clearColorCache,t=n;(e[0]!==t[0]||e[1]!==t[1]||e[2]!==t[2]||e[3]!==t[3])&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],s.clearColor(t[0],t[1],t[2],t[3]))}c&&s.depthMask(!0),s.clear(t),c&&s.depthMask(!1)}resizeGpuRenderTarget(e){if(e.isRoot)return;let t=this._renderTargetSystem.getGpuRenderTarget(e);t.width=e.pixelWidth,t.height=e.pixelHeight,e.colorAttachments.length>0&&this._resizeColor(e,t),t.depthStencilRenderBuffer&&this._resizeStencil(t),this._boundFramebuffer=void 0}_initColor(e,t){let n=this._renderer,r=n.gl,i=r.createFramebuffer();if(t.resolveTargetFramebuffer=i,r.bindFramebuffer(r.FRAMEBUFFER,i),e.colorAttachments.forEach((e,i)=>{let a=e.texture;a.antialias&&(n.context.supports.msaa?t.msaa=!0:k(`[RenderTexture] Antialiasing on textures is not supported in WebGL1`)),n.texture.bindSource(a,0);let o=n.texture.getGlSource(a),s=o.texture;if(o.target===r.TEXTURE_2D)r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,r.TEXTURE_2D,s,0);else if(o.target===r.TEXTURE_2D_ARRAY){if(n.context.webGLVersion<2)throw Error(`[RenderTargetSystem] TEXTURE_2D_ARRAY requires WebGL2.`);r.framebufferTextureLayer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,s,0,0)}else if(o.target===r.TEXTURE_CUBE_MAP)r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,r.TEXTURE_CUBE_MAP_POSITIVE_X,s,0);else throw Error(`[RenderTargetSystem] Unsupported texture target for framebuffer attachment.`)}),t.msaa){let n=r.createFramebuffer();t.framebuffer=n,r.bindFramebuffer(r.FRAMEBUFFER,n),e.colorAttachments.forEach((e,n)=>{let i=r.createRenderbuffer();t.msaaRenderBuffer[n]=i})}else t.framebuffer=i;this._resizeColor(e,t)}_initDepth(e,t){let n=this._renderer;if(n.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Depth-only render targets require WebGL2.`);let r=n.gl,i=r.createFramebuffer();t.resolveTargetFramebuffer=i,t.framebuffer=i,r.bindFramebuffer(r.FRAMEBUFFER,i),r.drawBuffers([r.NONE]),r.readBuffer(r.NONE)}_resizeColor(e,t){let n=e.colorAttachments[0].texture;if(t._attachedMipLevel=0,t._attachedLayer=0,e.colorAttachments.forEach((e,t)=>{t!==0&&e.texture.resize(n.width,n.height,n._resolution)}),t.msaa){let n=this._renderer,r=n.gl,i=t.framebuffer;r.bindFramebuffer(r.FRAMEBUFFER,i),e.colorAttachments.forEach((e,i)=>{let a=e.texture;n.texture.bindSource(a,0);let o=n.texture.getGlSource(a).internalFormat,s=t.msaaRenderBuffer[i];r.bindRenderbuffer(r.RENDERBUFFER,s),r.renderbufferStorageMultisample(r.RENDERBUFFER,4,o,a.pixelWidth,a.pixelHeight),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,r.RENDERBUFFER,s)})}}_attachDepthStencilTexture(e,t,n){let r=this._renderer,i=r.gl,a=e.depthStencilAttachment.texture,o=r.texture.getGlSource(a),s=o.texture,c=a.format,l;l=c===`depth24plus-stencil8`||c===`depth32float-stencil8`?i.DEPTH_STENCIL_ATTACHMENT:c===`stencil8`?i.STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,o.target===i.TEXTURE_2D?i.framebufferTexture2D(i.FRAMEBUFFER,l,i.TEXTURE_2D,s,t):o.target===i.TEXTURE_2D_ARRAY?i.framebufferTextureLayer(i.FRAMEBUFFER,l,s,t,n):o.target===i.TEXTURE_CUBE_MAP&&i.framebufferTexture2D(i.FRAMEBUFFER,l,i.TEXTURE_CUBE_MAP_POSITIVE_X+n,s,t)}_initStencil(e){if(e.framebuffer===null)return;let t=this._renderer.gl,n=t.createRenderbuffer();e.depthStencilRenderBuffer=n,t.bindRenderbuffer(t.RENDERBUFFER,n),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.RENDERBUFFER,n),this._resizeStencil(e)}_resizeStencil(e){let t=this._renderer.gl;t.bindRenderbuffer(t.RENDERBUFFER,e.depthStencilRenderBuffer),e.msaa?t.renderbufferStorageMultisample(t.RENDERBUFFER,4,t.DEPTH24_STENCIL8,e.width,e.height):t.renderbufferStorage(t.RENDERBUFFER,this._renderer.context.webGLVersion===2?t.DEPTH24_STENCIL8:t.DEPTH_STENCIL,e.width,e.height)}prerender(e){if(e.colorAttachments.length===0)return;let t=e.colorAttachments[0].texture.resource;this._renderer.context.multiView&&pe.test(t)&&this._renderer.context.ensureCanvasSize(t)}postrender(e){if(!this._renderer.context.multiView||e.colorAttachments.length===0)return;let t=e.colorAttachments[0].texture;if(pe.test(t.resource)){let e=this._renderer.context.canvas,n=t;n.context2D.drawImage(e,0,n.pixelHeight-e.height)}}_setDrawBuffers(e,t){let n=e.colorAttachments.length,r=this._drawBuffersCache[n];if(this._renderer.context.webGLVersion===1){let e=this._renderer.context.extensions.drawBuffers;e?e.drawBuffersWEBGL(r):k(`[RenderTexture] This WebGL1 context does not support rendering to multiple targets`)}else t.drawBuffers(r)}resetState(){this._boundFramebuffer=void 0,this._viewPortCache=new s,this._clearColorCache=[0,0,0,0]}bindFramebuffer(e){this._boundFramebuffer!==e&&(this._boundFramebuffer=e,this._renderer.gl.bindFramebuffer(this._renderer.gl.FRAMEBUFFER,e))}},fo=class extends Ae{constructor(e){super(e),this.adaptor=new uo,this.adaptor.init(e,this)}resetState(){this.adaptor.resetState()}};fo.extension={type:[m.WebGLSystem],name:`renderTarget`};var po=class extends p{constructor(e,t){super(),this._resourceType=`textureView`,this._resourceId=i(`resource`),this.source=e,this.viewDescriptor=t,this._onChange=this._onChange.bind(this),this._onDestroy=this._onDestroy.bind(this),this.source.on(`change`,this._onChange),this.source.on(`destroy`,this._onDestroy)}_onChange(){this.emit(`change`,this)}_onDestroy(){this.destroy()}get destroyed(){return this.source.destroyed}destroy(){this.source&&(this.source.off(`change`,this._onChange),this.source.off(`destroy`,this._onDestroy)),this.emit(`destroy`,this),this.removeAllListeners()}};function mo(e,n){let r=[],i=[`
        var g = s.groups;
        var sS = r.shader;
        var p = s.glProgram;
        var ugS = r.uniformGroup;
        var resources;
    `],a=!1,o=0,s=n._getProgramData(e.glProgram);for(let c in e.groups){let l=e.groups[c];r.push(`
            resources = g[${c}].resources;
        `);for(let u in l.resources){let d=l.resources[u];if(d instanceof C){if(d.ubo){let t=e._uniformBindMap[c][Number(u)];r.push(`
                        sS.bindUniformBlock(
                            resources[${u}],
                            '${t}',
                            ${e.glProgram._uniformBlockData[t].index}
                        );
                    `)}else r.push(`
                        ugS.updateUniformGroup(resources[${u}], p, sD);
                    `)}else if(d instanceof pt){let t=e._uniformBindMap[c][Number(u)];r.push(`
                    sS.bindUniformBlock(
                        resources[${u}],
                        '${t}',
                        ${e.glProgram._uniformBlockData[t].index}
                    );
                `)}else if(d instanceof t||d instanceof po){let t=e._uniformBindMap[c][u],l=s.uniformData[t];l&&(a||(a=!0,i.push(`
                        var tS = r.texture;
                        `)),n._gl.uniform1i(l.location,o),r.push(`
                        tS.bind(resources[${u}], ${o});
                    `),o++)}}}let c=[...i,...r].join(`
`);return Function(`r`,`s`,`sD`,c)}var ho=class{constructor(e,t){this.program=e,this.uniformData=t,this.uniformGroups={},this.uniformDirtyGroups={},this.uniformBlockBindings={}}destroy(){this.uniformData=null,this.uniformGroups=null,this.uniformDirtyGroups=null,this.uniformBlockBindings=null,this.program=null}};function go(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}function _o(e){let t=Array(e);for(let e=0;e<t.length;e++)t[e]=!1;return t}function vo(e,t){switch(e){case`float`:return 0;case`vec2`:return new Float32Array(2*t);case`vec3`:return new Float32Array(3*t);case`vec4`:return new Float32Array(4*t);case`int`:case`uint`:case`sampler2D`:case`sampler2DArray`:return 0;case`ivec2`:return new Int32Array(2*t);case`ivec3`:return new Int32Array(3*t);case`ivec4`:return new Int32Array(4*t);case`uvec2`:return new Uint32Array(2*t);case`uvec3`:return new Uint32Array(3*t);case`uvec4`:return new Uint32Array(4*t);case`bool`:return!1;case`bvec2`:return _o(2*t);case`bvec3`:return _o(3*t);case`bvec4`:return _o(4*t);case`mat2`:return new Float32Array([1,0,0,1]);case`mat3`:return new Float32Array([1,0,0,0,1,0,0,0,1]);case`mat4`:return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}var yo=null,bo={FLOAT:`float`,FLOAT_VEC2:`vec2`,FLOAT_VEC3:`vec3`,FLOAT_VEC4:`vec4`,INT:`int`,INT_VEC2:`ivec2`,INT_VEC3:`ivec3`,INT_VEC4:`ivec4`,UNSIGNED_INT:`uint`,UNSIGNED_INT_VEC2:`uvec2`,UNSIGNED_INT_VEC3:`uvec3`,UNSIGNED_INT_VEC4:`uvec4`,BOOL:`bool`,BOOL_VEC2:`bvec2`,BOOL_VEC3:`bvec3`,BOOL_VEC4:`bvec4`,FLOAT_MAT2:`mat2`,FLOAT_MAT3:`mat3`,FLOAT_MAT4:`mat4`,SAMPLER_2D:`sampler2D`,INT_SAMPLER_2D:`sampler2D`,UNSIGNED_INT_SAMPLER_2D:`sampler2D`,SAMPLER_2D_SHADOW:`sampler2DShadow`,SAMPLER_CUBE:`samplerCube`,INT_SAMPLER_CUBE:`samplerCube`,UNSIGNED_INT_SAMPLER_CUBE:`samplerCube`,SAMPLER_CUBE_SHADOW:`samplerCubeShadow`,SAMPLER_2D_ARRAY:`sampler2DArray`,INT_SAMPLER_2D_ARRAY:`sampler2DArray`,UNSIGNED_INT_SAMPLER_2D_ARRAY:`sampler2DArray`,SAMPLER_2D_ARRAY_SHADOW:`sampler2DArrayShadow`},xo={float:`float32`,vec2:`float32x2`,vec3:`float32x3`,vec4:`float32x4`,int:`sint32`,ivec2:`sint32x2`,ivec3:`sint32x3`,ivec4:`sint32x4`,uint:`uint32`,uvec2:`uint32x2`,uvec3:`uint32x3`,uvec4:`uint32x4`,bool:`uint32`,bvec2:`uint32x2`,bvec3:`uint32x3`,bvec4:`uint32x4`};function So(e,t){if(!yo){let t=Object.keys(bo);yo={};for(let n=0;n<t.length;++n){let r=t[n];yo[e[r]]=bo[r]}}return yo[t]}function Co(e,t){return xo[So(e,t)]||`float32`}function wo(e,t,n=!1){let r={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let i=t.getActiveAttrib(e,n);if(i.name.startsWith(`gl_`))continue;let a=Co(t,i.type);r[i.name]={location:0,format:a,stride:v(a).stride,offset:0,instance:!1,start:0}}let a=Object.keys(r);if(n){a.sort((e,t)=>e>t?1:-1);for(let n=0;n<a.length;n++)r[a[n]].location=n,t.bindAttribLocation(e,n,a[n]);t.linkProgram(e)}else for(let n=0;n<a.length;n++)r[a[n]].location=t.getAttribLocation(e,a[n]);return r}function To(e,t){if(!t.ACTIVE_UNIFORM_BLOCKS)return{};let n={},r=t.getProgramParameter(e,t.ACTIVE_UNIFORM_BLOCKS);for(let i=0;i<r;i++){let r=t.getActiveUniformBlockName(e,i);n[r]={name:r,index:t.getUniformBlockIndex(e,r),size:t.getActiveUniformBlockParameter(e,i,t.UNIFORM_BLOCK_DATA_SIZE)}}return n}function Eo(e,t){let n={},r=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<r;i++){let r=t.getActiveUniform(e,i),a=r.name.replace(/\[.*?\]$/,``),o=!!r.name.match(/\[.*?\]$/),s=So(t,r.type);n[a]={name:a,index:i,type:s,size:r.size,isArray:o,value:vo(s,r.size)}}return n}function Do(e,t){let n=e.getShaderSource(t);if(n===null){console.error(`PixiJS Error: Could not retrieve shader source (WebGL context may be lost).`);return}let r=n.split(`
`).map((e,t)=>`${t}: ${e}`),i=e.getShaderInfoLog(t)??``,a=i.split(`
`),o={},s=a.map(e=>parseFloat(e.replace(/^ERROR\: 0\:([\d]+)\:.*$/,`$1`))).filter(e=>e&&!o[e]?(o[e]=!0,!0):!1),c=[``];s.forEach(e=>{r[e-1]=`%c${r[e-1]}%c`,c.push(`background: #FF0000; color:#FFFFFF; font-size: 10px`,`font-size: 10px`)}),c[0]=r.join(`
`),console.error(i),console.groupCollapsed(`click to view full shader code`),console.warn(...c),console.groupEnd()}function Oo(e,t,n,r){e.getProgramParameter(t,e.LINK_STATUS)||(e.getShaderParameter(n,e.COMPILE_STATUS)||Do(e,n),e.getShaderParameter(r,e.COMPILE_STATUS)||Do(e,r),console.error(`PixiJS Error: Could not initialize shader.`),e.getProgramInfoLog(t)!==``&&console.warn(`PixiJS Warning: gl.getProgramInfoLog()`,e.getProgramInfoLog(t)))}function ko(e,t){let n=go(e,e.VERTEX_SHADER,t.vertex),r=go(e,e.FRAGMENT_SHADER,t.fragment),i=e.createProgram();e.attachShader(i,n),e.attachShader(i,r);let a=t.transformFeedbackVaryings;a&&(typeof e.transformFeedbackVaryings==`function`?e.transformFeedbackVaryings(i,a.names,a.bufferMode===`separate`?e.SEPARATE_ATTRIBS:e.INTERLEAVED_ATTRIBS):k(`TransformFeedback is not supported but TransformFeedbackVaryings are given.`)),e.linkProgram(i),e.getProgramParameter(i,e.LINK_STATUS)||Oo(e,i,n,r),t._attributeData=wo(i,e,!/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(t.vertex)),t._uniformData=Eo(i,e),t._uniformBlockData=To(i,e),e.deleteShader(n),e.deleteShader(r);let o={};for(let n in t._uniformData){let r=t._uniformData[n];o[n]={location:e.getUniformLocation(i,n),value:vo(r.type,r.size)}}return new ho(i,o)}var Ao={textureCount:0,blockIndex:0},jo=class{constructor(e){this._activeProgram=null,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._renderer=e}contextChange(e){this._gl=e,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._activeProgram=null}bind(e,t){if(this._setProgram(e.glProgram),t)return;Ao.textureCount=0,Ao.blockIndex=0;let n=this._shaderSyncFunctions[e.glProgram._key];n||(n=this._shaderSyncFunctions[e.glProgram._key]=this._generateShaderSync(e,this)),this._renderer.buffer.nextBindBase(!!e.glProgram.transformFeedbackVaryings),n(this._renderer,e,Ao)}updateUniformGroup(e){this._renderer.uniformGroup.updateUniformGroup(e,this._activeProgram,Ao)}bindUniformBlock(e,t,n=0){let r=this._renderer.buffer,i=this._getProgramData(this._activeProgram),a=e._bufferResource;a||this._renderer.ubo.updateUniformGroup(e);let o=e.buffer,s=r.updateBuffer(o),c=r.freeLocationForBufferBase(s);if(a){let{offset:t,size:n}=e;t===0&&n===o.data.byteLength?r.bindBufferBase(s,c):r.bindBufferRange(s,c,t)}else r.getLastBindBaseLocation(s)!==c&&r.bindBufferBase(s,c);let l=this._activeProgram._uniformBlockData[t].index;i.uniformBlockBindings[n]!==c&&(i.uniformBlockBindings[n]=c,this._renderer.gl.uniformBlockBinding(i.program,l,c))}_setProgram(e){if(this._activeProgram===e)return;this._activeProgram=e;let t=this._getProgramData(e);this._gl.useProgram(t.program)}_getProgramData(e){return this._programDataHash[e._key]||this._createProgramData(e)}_createProgramData(e){let t=e._key;return this._programDataHash[t]=ko(this._gl,e),this._programDataHash[t]}destroy(){for(let e of Object.keys(this._programDataHash))this._programDataHash[e].destroy();this._programDataHash=null,this._shaderSyncFunctions=null,this._activeProgram=null,this._renderer=null,this._gl=null}_generateShaderSync(e,t){return mo(e,t)}resetState(){this._activeProgram=null}};jo.extension={type:[m.WebGLSystem],name:`shader`};var Mo={f32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1f(location, v);
        }`,"vec2<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }`,"vec3<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3f(location, v[0], v[1], v[2]);
        }`,"vec4<f32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }`,i32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,"vec2<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,"vec3<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,"vec4<i32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,u32:`if (cv !== v) {
            cu.value = v;
            gl.uniform1ui(location, v);
        }`,"vec2<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2ui(location, v[0], v[1]);
        }`,"vec3<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3ui(location, v[0], v[1], v[2]);
        }`,"vec4<u32>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
        }`,bool:`if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,"vec2<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,"vec3<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,"vec4<bool>":`if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,"mat2x2<f32>":`gl.uniformMatrix2fv(location, false, v);`,"mat3x3<f32>":`gl.uniformMatrix3fv(location, false, v);`,"mat4x4<f32>":`gl.uniformMatrix4fv(location, false, v);`},No={f32:`gl.uniform1fv(location, v);`,"vec2<f32>":`gl.uniform2fv(location, v);`,"vec3<f32>":`gl.uniform3fv(location, v);`,"vec4<f32>":`gl.uniform4fv(location, v);`,"mat2x2<f32>":`gl.uniformMatrix2fv(location, false, v);`,"mat3x3<f32>":`gl.uniformMatrix3fv(location, false, v);`,"mat4x4<f32>":`gl.uniformMatrix4fv(location, false, v);`,i32:`gl.uniform1iv(location, v);`,"vec2<i32>":`gl.uniform2iv(location, v);`,"vec3<i32>":`gl.uniform3iv(location, v);`,"vec4<i32>":`gl.uniform4iv(location, v);`,u32:`gl.uniform1iv(location, v);`,"vec2<u32>":`gl.uniform2iv(location, v);`,"vec3<u32>":`gl.uniform3iv(location, v);`,"vec4<u32>":`gl.uniform4iv(location, v);`,bool:`gl.uniform1iv(location, v);`,"vec2<bool>":`gl.uniform2iv(location, v);`,"vec3<bool>":`gl.uniform3iv(location, v);`,"vec4<bool>":`gl.uniform4iv(location, v);`};function Po(e,t){let n=[`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
        var name = null;
    `];for(let r in e.uniforms){if(!t[r]){e.uniforms[r]instanceof C?e.uniforms[r].ubo?n.push(`
                        renderer.shader.bindUniformBlock(uv.${r}, "${r}");
                    `):n.push(`
                        renderer.shader.updateUniformGroup(uv.${r});
                    `):e.uniforms[r]instanceof pt&&n.push(`
                        renderer.shader.bindBufferResource(uv.${r}, "${r}");
                    `);continue}let i=e.uniformStructures[r],a=!1;for(let e=0;e<nt.length;e++){let t=nt[e];if(i.type===t.type&&t.test(i)){n.push(`name = "${r}";`,nt[e].uniform),a=!0;break}}if(!a){let e=(i.size===1?Mo:No)[i.type].replace(`location`,`ud["${r}"].location`);n.push(`
            cu = ud["${r}"];
            cv = cu.value;
            v = uv["${r}"];
            ${e};`)}}return Function(`ud`,`uv`,`renderer`,`syncData`,n.join(`
`))}var Fo=class{constructor(e){this._cache={},this._uniformGroupSyncHash={},this._renderer=e,this.gl=null,this._cache={}}contextChange(e){this.gl=e}updateUniformGroup(e,t,n){let r=this._renderer.shader._getProgramData(t);(!e.isStatic||e._dirtyId!==r.uniformDirtyGroups[e.uid])&&(r.uniformDirtyGroups[e.uid]=e._dirtyId,this._getUniformSyncFunction(e,t)(r.uniformData,e.uniforms,this._renderer,n))}_getUniformSyncFunction(e,t){return this._uniformGroupSyncHash[e._signature]?.[t._key]||this._createUniformSyncFunction(e,t)}_createUniformSyncFunction(e,t){let n=this._uniformGroupSyncHash[e._signature]||(this._uniformGroupSyncHash[e._signature]={}),r=this._getSignature(e,t._uniformData,`u`);return this._cache[r]||(this._cache[r]=this._generateUniformsSync(e,t._uniformData)),n[t._key]=this._cache[r],n[t._key]}_generateUniformsSync(e,t){return Po(e,t)}_getSignature(e,t,n){let r=e.uniforms,i=[`${n}-`];for(let e in r)i.push(e),t[e]&&i.push(t[e].type);return i.join(`-`)}destroy(){this._renderer=null,this._cache=null}};Fo.extension={type:[m.WebGLSystem],name:`uniformGroup`};function Io(e){let t={};if(t.normal=[e.ONE,e.ONE_MINUS_SRC_ALPHA],t.add=[e.ONE,e.ONE],t.multiply=[e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA],t.screen=[e.ONE,e.ONE_MINUS_SRC_COLOR,e.ONE,e.ONE_MINUS_SRC_ALPHA],t.none=[0,0],t[`normal-npm`]=[e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA],t[`add-npm`]=[e.SRC_ALPHA,e.ONE,e.ONE,e.ONE],t[`screen-npm`]=[e.SRC_ALPHA,e.ONE_MINUS_SRC_COLOR,e.ONE,e.ONE_MINUS_SRC_ALPHA],t.erase=[e.ZERO,e.ONE_MINUS_SRC_ALPHA],!(e instanceof b.get().getWebGLRenderingContext()))t.min=[e.ONE,e.ONE,e.ONE,e.ONE,e.MIN,e.MIN],t.max=[e.ONE,e.ONE,e.ONE,e.ONE,e.MAX,e.MAX];else{let n=e.getExtension(`EXT_blend_minmax`);n&&(t.min=[e.ONE,e.ONE,e.ONE,e.ONE,n.MIN_EXT,n.MIN_EXT],t.max=[e.ONE,e.ONE,e.ONE,e.ONE,n.MAX_EXT,n.MAX_EXT])}return t}var{BLEND:Lo,OFFSET:Ro,CULLING:zo,DEPTH_TEST:Bo,WINDING:Vo,DEPTH_MASK:Ho}=fe,Uo=class e{constructor(e){this._invertFrontFace=!1,this._renderer=e,this.gl=null,this.stateId=0,this.polygonOffset=0,this.blendMode=`none`,this._blendEq=!1,this.map=[],this.map[Lo]=this.setBlend,this.map[Ro]=this.setOffset,this.map[zo]=this.setCullFace,this.map[Bo]=this.setDepthTest,this.map[Vo]=this.setFrontFace,this.map[Ho]=this.setDepthMask,this.checks=[],this.defaultState=he.for2d(),e.renderTarget.onRenderTargetChange.add(this)}onRenderTargetChange(e){this._invertFrontFace=this._renderer.renderTarget.isFrontFaceInverted(e,e.flipY),this._cullFace?this.setFrontFace(this._frontFace):this._frontFaceDirty=!0}contextChange(e){this.gl=e,this.blendModesMap=Io(e),this.resetState()}set(e){if(e||(e=this.defaultState),this.stateId!==e.data){let t=this.stateId^e.data,n=0;for(;t;)t&1&&this.map[n].call(this,!!(e.data&1<<n)),t>>=1,n++;this.stateId=e.data}for(let t=0;t<this.checks.length;t++)this.checks[t](this,e)}forceState(e){e||(e=this.defaultState);for(let t=0;t<this.map.length;t++)this.map[t].call(this,!!(e.data&1<<t));for(let t=0;t<this.checks.length;t++)this.checks[t](this,e);this.stateId=e.data}setBlend(t){this._updateCheck(e._checkBlendMode,t),this.gl[t?`enable`:`disable`](this.gl.BLEND)}setOffset(t){this._updateCheck(e._checkPolygonOffset,t),this.gl[t?`enable`:`disable`](this.gl.POLYGON_OFFSET_FILL)}setDepthTest(e){this.gl[e?`enable`:`disable`](this.gl.DEPTH_TEST)}setDepthMask(e){this.gl.depthMask(e)}get depthMaskEnabled(){return!!(this.stateId&1<<Ho)}setCullFace(e){this._cullFace=e,this.gl[e?`enable`:`disable`](this.gl.CULL_FACE),this._cullFace&&this._frontFaceDirty&&this.setFrontFace(this._frontFace)}setFrontFace(e){this._frontFace=e,this._frontFaceDirty=!1;let t=this._invertFrontFace?!e:e;this._glFrontFace!==t&&(this._glFrontFace=t,this.gl.frontFace(this.gl[t?`CW`:`CCW`]))}setBlendMode(e){if(this.blendModesMap[e]||(e=`normal`),e===this.blendMode)return;this.blendMode=e;let t=this.blendModesMap[e],n=this.gl;t.length===2?n.blendFunc(t[0],t[1]):n.blendFuncSeparate(t[0],t[1],t[2],t[3]),t.length===6?(this._blendEq=!0,n.blendEquationSeparate(t[4],t[5])):this._blendEq&&(this._blendEq=!1,n.blendEquationSeparate(n.FUNC_ADD,n.FUNC_ADD))}setPolygonOffset(e,t){this.gl.polygonOffset(e,t)}resetState(){this._glFrontFace=!1,this._frontFace=!1,this._cullFace=!1,this._frontFaceDirty=!1,this._invertFrontFace=!1,this.gl.frontFace(this.gl.CCW),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!1),this.forceState(this.defaultState),this._blendEq=!0,this.blendMode=``,this.setBlendMode(`normal`)}_updateCheck(e,t){let n=this.checks.indexOf(e);t&&n===-1?this.checks.push(e):!t&&n!==-1&&this.checks.splice(n,1)}static _checkBlendMode(e,t){e.setBlendMode(t.blendMode)}static _checkPolygonOffset(e,t){e.setPolygonOffset(1,t.polygonOffset)}destroy(){this.gl=null,this.checks.length=0,this._renderer=null}};Uo.extension={type:[m.WebGLSystem],name:`state`};var Wo=Uo,Go=class{constructor(e){this.target=Ga.TEXTURE_2D,this._layerInitMask=0,this.texture=e,this.width=-1,this.height=-1,this.type=U.UNSIGNED_BYTE,this.internalFormat=Wa.RGBA,this.format=Wa.RGBA,this.samplerType=0}destroy(){}},Ko={id:`buffer`,upload(e,t,n,r,i,a=!1){let o=i||t.target;!a&&t.width===e.width&&t.height===e.height?n.texSubImage2D(o,0,0,0,e.width,e.height,t.format,t.type,e.resource):n.texImage2D(o,0,t.internalFormat,e.width,e.height,0,t.format,t.type,e.resource),t.width=e.width,t.height=e.height}},qo={"bc1-rgba-unorm":!0,"bc1-rgba-unorm-srgb":!0,"bc2-rgba-unorm":!0,"bc2-rgba-unorm-srgb":!0,"bc3-rgba-unorm":!0,"bc3-rgba-unorm-srgb":!0,"bc4-r-unorm":!0,"bc4-r-snorm":!0,"bc5-rg-unorm":!0,"bc5-rg-snorm":!0,"bc6h-rgb-ufloat":!0,"bc6h-rgb-float":!0,"bc7-rgba-unorm":!0,"bc7-rgba-unorm-srgb":!0,"etc2-rgb8unorm":!0,"etc2-rgb8unorm-srgb":!0,"etc2-rgb8a1unorm":!0,"etc2-rgb8a1unorm-srgb":!0,"etc2-rgba8unorm":!0,"etc2-rgba8unorm-srgb":!0,"eac-r11unorm":!0,"eac-r11snorm":!0,"eac-rg11unorm":!0,"eac-rg11snorm":!0,"astc-4x4-unorm":!0,"astc-4x4-unorm-srgb":!0,"astc-5x4-unorm":!0,"astc-5x4-unorm-srgb":!0,"astc-5x5-unorm":!0,"astc-5x5-unorm-srgb":!0,"astc-6x5-unorm":!0,"astc-6x5-unorm-srgb":!0,"astc-6x6-unorm":!0,"astc-6x6-unorm-srgb":!0,"astc-8x5-unorm":!0,"astc-8x5-unorm-srgb":!0,"astc-8x6-unorm":!0,"astc-8x6-unorm-srgb":!0,"astc-8x8-unorm":!0,"astc-8x8-unorm-srgb":!0,"astc-10x5-unorm":!0,"astc-10x5-unorm-srgb":!0,"astc-10x6-unorm":!0,"astc-10x6-unorm-srgb":!0,"astc-10x8-unorm":!0,"astc-10x8-unorm-srgb":!0,"astc-10x10-unorm":!0,"astc-10x10-unorm-srgb":!0,"astc-12x10-unorm":!0,"astc-12x10-unorm-srgb":!0,"astc-12x12-unorm":!0,"astc-12x12-unorm-srgb":!0},Jo={id:`compressed`,upload(e,t,n,r,i,a){let o=i??t.target;n.pixelStorei(n.UNPACK_ALIGNMENT,4);let s=e.pixelWidth,c=e.pixelHeight,l=!!qo[e.format];for(let r=0;r<e.resource.length;r++){let i=e.resource[r];l?n.compressedTexImage2D(o,r,t.internalFormat,s,c,0,i):n.texImage2D(o,r,t.internalFormat,s,c,0,t.format,t.type,i),s=Math.max(s>>1,1),c=Math.max(c>>1,1)}}},Yo=[`right`,`left`,`top`,`bottom`,`front`,`back`];function Xo(e){return{id:`cube`,upload(t,n,r,i){let a=t.faces;for(let t=0;t<Yo.length;t++){let o=a[Yo[t]];o.resource&&((e[o.uploadMethodId]||e.image).upload(o,n,r,i,Ga.TEXTURE_CUBE_MAP_POSITIVE_X+t,!(n._layerInitMask&1<<t)),n._layerInitMask|=1<<t)}n.width=t.pixelWidth,n.height=t.pixelHeight}}}var Zo={id:`image`,upload(e,t,n,r,i,a=!1){let o=i||t.target,s=e.pixelWidth,c=e.pixelHeight,l=e.resourceWidth,u=e.resourceHeight,d=r===2,f=a||t.width!==s||t.height!==c,p=l>=s&&u>=c,m=e.resource;(d?Qo:$o)(n,o,t,s,c,l,u,m,f,p),t.width=s,t.height=c}};function Qo(e,t,n,r,i,a,o,s,c,l){if(!l){c&&e.texImage2D(t,0,n.internalFormat,r,i,0,n.format,n.type,null),e.texSubImage2D(t,0,0,0,a,o,n.format,n.type,s);return}if(!c){e.texSubImage2D(t,0,0,0,n.format,n.type,s);return}e.texImage2D(t,0,n.internalFormat,r,i,0,n.format,n.type,s)}function $o(e,t,n,r,i,a,o,s,c,l){if(!l){c&&e.texImage2D(t,0,n.internalFormat,r,i,0,n.format,n.type,null),e.texSubImage2D(t,0,0,0,n.format,n.type,s);return}if(!c){e.texSubImage2D(t,0,0,0,n.format,n.type,s);return}e.texImage2D(t,0,n.internalFormat,n.format,n.type,s)}var es=Qi(),ts={id:`video`,upload(e,t,n,r,i,a=es){if(!e.isValid){let e=i??t.target;n.texImage2D(e,0,t.internalFormat,1,1,0,t.format,t.type,null);return}Zo.upload(e,t,n,r,i,a)}},ns={linear:9729,nearest:9728},rs={linear:{linear:9987,nearest:9985},nearest:{linear:9986,nearest:9984}},is={"clamp-to-edge":33071,repeat:10497,"mirror-repeat":33648},as={never:512,less:513,equal:514,"less-equal":515,greater:516,"not-equal":517,"greater-equal":518,always:519};function os(e,t,n,r,i,a,o,s){let c=a;if(!s||e.addressModeU!==`repeat`||e.addressModeV!==`repeat`||e.addressModeW!==`repeat`){let n=is[o?`clamp-to-edge`:e.addressModeU],r=is[o?`clamp-to-edge`:e.addressModeV],a=is[o?`clamp-to-edge`:e.addressModeW];t[i](c,t.TEXTURE_WRAP_S,n),t[i](c,t.TEXTURE_WRAP_T,r),t.TEXTURE_WRAP_R&&t[i](c,t.TEXTURE_WRAP_R,a)}if((!s||e.magFilter!==`linear`)&&t[i](c,t.TEXTURE_MAG_FILTER,ns[e.magFilter]),n){if(!s||e.mipmapFilter!==`linear`){let n=rs[e.minFilter][e.mipmapFilter];t[i](c,t.TEXTURE_MIN_FILTER,n)}}else t[i](c,t.TEXTURE_MIN_FILTER,ns[e.minFilter]);if(r&&e.maxAnisotropy>1){let n=Math.min(e.maxAnisotropy,t.getParameter(r.MAX_TEXTURE_MAX_ANISOTROPY_EXT));t[i](c,r.TEXTURE_MAX_ANISOTROPY_EXT,n)}e.compare?(t[i](c,t.TEXTURE_COMPARE_FUNC,as[e.compare]),t[i](c,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE)):s||t[i](c,t.TEXTURE_COMPARE_MODE,t.NONE)}function ss(e){return{r8unorm:e.RED,r8snorm:e.RED,r8uint:e.RED,r8sint:e.RED,r16uint:e.RED,r16sint:e.RED,r16float:e.RED,rg8unorm:e.RG,rg8snorm:e.RG,rg8uint:e.RG,rg8sint:e.RG,r32uint:e.RED,r32sint:e.RED,r32float:e.RED,rg16uint:e.RG,rg16sint:e.RG,rg16float:e.RG,rgba8unorm:e.RGBA,"rgba8unorm-srgb":e.RGBA,rgba8snorm:e.RGBA,rgba8uint:e.RGBA,rgba8sint:e.RGBA,bgra8unorm:e.RGBA,"bgra8unorm-srgb":e.RGBA,rgb9e5ufloat:e.RGB,rgb10a2unorm:e.RGBA,rg11b10ufloat:e.RGB,rg32uint:e.RG,rg32sint:e.RG,rg32float:e.RG,rgba16uint:e.RGBA,rgba16sint:e.RGBA,rgba16float:e.RGBA,rgba32uint:e.RGBA,rgba32sint:e.RGBA,rgba32float:e.RGBA,stencil8:e.STENCIL_INDEX8,depth16unorm:e.DEPTH_COMPONENT,depth24plus:e.DEPTH_COMPONENT,"depth24plus-stencil8":e.DEPTH_STENCIL,depth32float:e.DEPTH_COMPONENT,"depth32float-stencil8":e.DEPTH_STENCIL}}function cs(e,t){let n={},r=e.RGBA;return e instanceof b.get().getWebGLRenderingContext()?t.srgb&&(n={"rgba8unorm-srgb":t.srgb.SRGB8_ALPHA8_EXT,"bgra8unorm-srgb":t.srgb.SRGB8_ALPHA8_EXT}):(n={"rgba8unorm-srgb":e.SRGB8_ALPHA8,"bgra8unorm-srgb":e.SRGB8_ALPHA8},r=e.RGBA8),{r8unorm:e.R8,r8snorm:e.R8_SNORM,r8uint:e.R8UI,r8sint:e.R8I,r16uint:e.R16UI,r16sint:e.R16I,r16float:e.R16F,rg8unorm:e.RG8,rg8snorm:e.RG8_SNORM,rg8uint:e.RG8UI,rg8sint:e.RG8I,r32uint:e.R32UI,r32sint:e.R32I,r32float:e.R32F,rg16uint:e.RG16UI,rg16sint:e.RG16I,rg16float:e.RG16F,rgba8unorm:e.RGBA,...n,rgba8snorm:e.RGBA8_SNORM,rgba8uint:e.RGBA8UI,rgba8sint:e.RGBA8I,bgra8unorm:r,rgb9e5ufloat:e.RGB9_E5,rgb10a2unorm:e.RGB10_A2,rg11b10ufloat:e.R11F_G11F_B10F,rg32uint:e.RG32UI,rg32sint:e.RG32I,rg32float:e.RG32F,rgba16uint:e.RGBA16UI,rgba16sint:e.RGBA16I,rgba16float:e.RGBA16F,rgba32uint:e.RGBA32UI,rgba32sint:e.RGBA32I,rgba32float:e.RGBA32F,stencil8:e.STENCIL_INDEX8,depth16unorm:e.DEPTH_COMPONENT16,depth24plus:e.DEPTH_COMPONENT24,"depth24plus-stencil8":e.DEPTH24_STENCIL8,depth32float:e.DEPTH_COMPONENT32F,"depth32float-stencil8":e.DEPTH32F_STENCIL8,...t.s3tc?{"bc1-rgba-unorm":t.s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT,"bc2-rgba-unorm":t.s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT,"bc3-rgba-unorm":t.s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT}:{},...t.s3tc_sRGB?{"bc1-rgba-unorm-srgb":t.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,"bc2-rgba-unorm-srgb":t.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,"bc3-rgba-unorm-srgb":t.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}:{},...t.rgtc?{"bc4-r-unorm":t.rgtc.COMPRESSED_RED_RGTC1_EXT,"bc4-r-snorm":t.rgtc.COMPRESSED_SIGNED_RED_RGTC1_EXT,"bc5-rg-unorm":t.rgtc.COMPRESSED_RED_GREEN_RGTC2_EXT,"bc5-rg-snorm":t.rgtc.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}:{},...t.bptc?{"bc6h-rgb-float":t.bptc.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,"bc6h-rgb-ufloat":t.bptc.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT,"bc7-rgba-unorm":t.bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,"bc7-rgba-unorm-srgb":t.bptc.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT}:{},...t.etc?{"etc2-rgb8unorm":t.etc.COMPRESSED_RGB8_ETC2,"etc2-rgb8unorm-srgb":t.etc.COMPRESSED_SRGB8_ETC2,"etc2-rgb8a1unorm":t.etc.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgb8a1unorm-srgb":t.etc.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgba8unorm":t.etc.COMPRESSED_RGBA8_ETC2_EAC,"etc2-rgba8unorm-srgb":t.etc.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,"eac-r11unorm":t.etc.COMPRESSED_R11_EAC,"eac-rg11unorm":t.etc.COMPRESSED_SIGNED_RG11_EAC}:{},...t.astc?{"astc-4x4-unorm":t.astc.COMPRESSED_RGBA_ASTC_4x4_KHR,"astc-4x4-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,"astc-5x4-unorm":t.astc.COMPRESSED_RGBA_ASTC_5x4_KHR,"astc-5x4-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR,"astc-5x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_5x5_KHR,"astc-5x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,"astc-6x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_6x5_KHR,"astc-6x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,"astc-6x6-unorm":t.astc.COMPRESSED_RGBA_ASTC_6x6_KHR,"astc-6x6-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,"astc-8x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_8x5_KHR,"astc-8x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,"astc-8x6-unorm":t.astc.COMPRESSED_RGBA_ASTC_8x6_KHR,"astc-8x6-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,"astc-8x8-unorm":t.astc.COMPRESSED_RGBA_ASTC_8x8_KHR,"astc-8x8-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,"astc-10x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x5_KHR,"astc-10x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,"astc-10x6-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x6_KHR,"astc-10x6-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,"astc-10x8-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x8_KHR,"astc-10x8-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,"astc-10x10-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x10_KHR,"astc-10x10-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR,"astc-12x10-unorm":t.astc.COMPRESSED_RGBA_ASTC_12x10_KHR,"astc-12x10-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR,"astc-12x12-unorm":t.astc.COMPRESSED_RGBA_ASTC_12x12_KHR,"astc-12x12-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR}:{}}}function ls(e){return{r8unorm:e.UNSIGNED_BYTE,r8snorm:e.BYTE,r8uint:e.UNSIGNED_BYTE,r8sint:e.BYTE,r16uint:e.UNSIGNED_SHORT,r16sint:e.SHORT,r16float:e.HALF_FLOAT,rg8unorm:e.UNSIGNED_BYTE,rg8snorm:e.BYTE,rg8uint:e.UNSIGNED_BYTE,rg8sint:e.BYTE,r32uint:e.UNSIGNED_INT,r32sint:e.INT,r32float:e.FLOAT,rg16uint:e.UNSIGNED_SHORT,rg16sint:e.SHORT,rg16float:e.HALF_FLOAT,rgba8unorm:e.UNSIGNED_BYTE,"rgba8unorm-srgb":e.UNSIGNED_BYTE,rgba8snorm:e.BYTE,rgba8uint:e.UNSIGNED_BYTE,rgba8sint:e.BYTE,bgra8unorm:e.UNSIGNED_BYTE,"bgra8unorm-srgb":e.UNSIGNED_BYTE,rgb9e5ufloat:e.UNSIGNED_INT_5_9_9_9_REV,rgb10a2unorm:e.UNSIGNED_INT_2_10_10_10_REV,rg11b10ufloat:e.UNSIGNED_INT_10F_11F_11F_REV,rg32uint:e.UNSIGNED_INT,rg32sint:e.INT,rg32float:e.FLOAT,rgba16uint:e.UNSIGNED_SHORT,rgba16sint:e.SHORT,rgba16float:e.HALF_FLOAT,rgba32uint:e.UNSIGNED_INT,rgba32sint:e.INT,rgba32float:e.FLOAT,stencil8:e.UNSIGNED_BYTE,depth16unorm:e.UNSIGNED_SHORT,depth24plus:e.UNSIGNED_INT,"depth24plus-stencil8":e.UNSIGNED_INT_24_8,depth32float:e.FLOAT,"depth32float-stencil8":e.FLOAT_32_UNSIGNED_INT_24_8_REV}}function us(e){return{"2d":e.TEXTURE_2D,cube:e.TEXTURE_CUBE_MAP,"1d":null,"3d":e?.TEXTURE_3D||null,"2d-array":e?.TEXTURE_2D_ARRAY||null,"cube-array":e?.TEXTURE_CUBE_MAP_ARRAY||null}}var ds=4,fs=class e{constructor(t){this._glSamplers=Object.create(null),this._boundTextures=[],this._activeTextureLocation=-1,this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1,this._useSeparateSamplers=!1,this._renderer=t,this._managedTextures=new et({renderer:t,type:`resource`,onUnload:this.onSourceUnload.bind(this),name:`glTexture`});let n={image:Zo,buffer:Ko,video:ts,compressed:Jo,...e.uploadExtensions};this._uploads={...n,cube:Xo(n)}}get managedTextures(){return Object.values(this._managedTextures.items)}contextChange(e){this._gl=e,this._mapFormatToInternalFormat||(this._mapFormatToInternalFormat=cs(e,this._renderer.context.extensions),this._mapFormatToType=ls(e),this._mapFormatToFormat=ss(e),this._mapViewDimensionToGlTarget=us(e)),this._managedTextures.removeAll(!0),this._glSamplers=Object.create(null),this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1;for(let e=0;e<16;e++)this.bind(O.EMPTY,e)}initSource(e){this.bind(e)}bind(e,t=0){let n=e.source;e?(this.bindSource(n,t),this._useSeparateSamplers&&this._bindSampler(n.style,t)):(this.bindSource(null,t),this._useSeparateSamplers&&this._bindSampler(null,t))}bindSource(e,t=0){let n=this._gl;if(e._gcLastUsed=this._renderer.gc.now,this._boundTextures[t]!==e){this._boundTextures[t]=e,this._activateLocation(t),e||(e=O.EMPTY.source);let r=this.getGlSource(e);n.bindTexture(r.target,r.texture)}}_bindSampler(e,t=0){let n=this._gl;if(!e){this._boundSamplers[t]=null,n.bindSampler(t,null);return}let r=this._getGlSampler(e);this._boundSamplers[t]!==r&&(this._boundSamplers[t]=r,n.bindSampler(t,r))}unbind(e){let t=e.source,n=this._boundTextures,r=this._gl;for(let e=0;e<n.length;e++)if(n[e]===t){this._activateLocation(e);let i=this.getGlSource(t);r.bindTexture(i.target,null),n[e]=null}}_activateLocation(e){this._activeTextureLocation!==e&&(this._activeTextureLocation=e,this._gl.activeTexture(this._gl.TEXTURE0+e))}_initSource(e){let t=this._gl,n=new Go(t.createTexture());if(n.type=this._mapFormatToType[e.format],n.internalFormat=this._mapFormatToInternalFormat[e.format],n.format=this._mapFormatToFormat[e.format],n.target=this._mapViewDimensionToGlTarget[e.viewDimension],n.target===null)throw Error(`Unsupported view dimension: ${e.viewDimension} with this webgl version: ${this._renderer.context.webGLVersion}`);if(e.autoGenerateMipmaps&&(this._renderer.context.supports.nonPowOf2mipmaps||e.isPowerOfTwo)){let t=Math.max(e.width,e.height);e.mipLevelCount=Math.floor(Math.log2(t))+1}return e._gpuData[this._renderer.uid]=n,this._managedTextures.add(e)&&(e.on(`update`,this.onSourceUpdate,this),e.on(`resize`,this.onSourceUpdate,this),e.on(`styleChange`,this.onStyleChange,this),e.on(`updateMipmaps`,this.onUpdateMipmaps,this)),this.onSourceUpdate(e),this.updateStyle(e,!1),n}onStyleChange(e){this.updateStyle(e,!1)}updateStyle(e,t){let n=this._gl,r=this.getGlSource(e);n.bindTexture(r.target,r.texture),this._boundTextures[this._activeTextureLocation]=e,os(e.style,n,e.mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,`texParameteri`,r.target,!this._renderer.context.supports.nonPowOf2wrapping&&!e.isPowerOfTwo,t)}onSourceUnload(e,t=!1){let n=e._gpuData[this._renderer.uid];n&&(t||(this.unbind(e),this._gl.deleteTexture(n.texture)),e.off(`update`,this.onSourceUpdate,this),e.off(`resize`,this.onSourceUpdate,this),e.off(`styleChange`,this.onStyleChange,this),e.off(`updateMipmaps`,this.onUpdateMipmaps,this))}onSourceUpdate(e){let t=this._gl,n=this.getGlSource(e);t.bindTexture(n.target,n.texture),this._boundTextures[this._activeTextureLocation]=e;let r=e.alphaMode===`premultiply-alpha-on-upload`;if(this._premultiplyAlpha!==r&&(this._premultiplyAlpha=r,t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r)),this._uploads[e.uploadMethodId])this._uploads[e.uploadMethodId].upload(e,n,t,this._renderer.context.webGLVersion);else if(n.target===t.TEXTURE_2D)this._initEmptyTexture2D(n,e);else if(n.target===t.TEXTURE_2D_ARRAY)this._initEmptyTexture2DArray(n,e);else if(n.target===t.TEXTURE_CUBE_MAP)this._initEmptyTextureCube(n,e);else throw Error(`[GlTextureSystem] Unsupported texture target for empty allocation.`);this._applyMipRange(n,e),e.autoGenerateMipmaps&&e.mipLevelCount>1&&this.onUpdateMipmaps(e,!1)}onUpdateMipmaps(e,t=!0){t&&this.bindSource(e,0);let n=this.getGlSource(e);this._gl.generateMipmap(n.target)}_initEmptyTexture2D(e,t){let n=this._gl;n.texImage2D(n.TEXTURE_2D,0,e.internalFormat,t.pixelWidth,t.pixelHeight,0,e.format,e.type,null);let r=Math.max(t.pixelWidth>>1,1),i=Math.max(t.pixelHeight>>1,1);for(let a=1;a<t.mipLevelCount;a++)n.texImage2D(n.TEXTURE_2D,a,e.internalFormat,r,i,0,e.format,e.type,null),r=Math.max(r>>1,1),i=Math.max(i>>1,1)}_initEmptyTexture2DArray(e,t){if(this._renderer.context.webGLVersion!==2)throw Error(`[GlTextureSystem] TEXTURE_2D_ARRAY requires WebGL2.`);let n=this._gl,r=Math.max(t.arrayLayerCount|0,1);n.texImage3D(n.TEXTURE_2D_ARRAY,0,e.internalFormat,t.pixelWidth,t.pixelHeight,r,0,e.format,e.type,null);let i=Math.max(t.pixelWidth>>1,1),a=Math.max(t.pixelHeight>>1,1);for(let o=1;o<t.mipLevelCount;o++)n.texImage3D(n.TEXTURE_2D_ARRAY,o,e.internalFormat,i,a,r,0,e.format,e.type,null),i=Math.max(i>>1,1),a=Math.max(a>>1,1)}_initEmptyTextureCube(e,t){let n=this._gl;for(let r=0;r<6;r++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,e.internalFormat,t.pixelWidth,t.pixelHeight,0,e.format,e.type,null);let r=Math.max(t.pixelWidth>>1,1),i=Math.max(t.pixelHeight>>1,1);for(let a=1;a<t.mipLevelCount;a++){for(let t=0;t<6;t++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+t,a,e.internalFormat,r,i,0,e.format,e.type,null);r=Math.max(r>>1,1),i=Math.max(i>>1,1)}}_applyMipRange(e,t){if(this._renderer.context.webGLVersion!==2||t.mipLevelCount<=1)return;let n=this._gl,r=Math.max((t.mipLevelCount|0)-1,0);n.texParameteri(e.target,n.TEXTURE_BASE_LEVEL,0),n.texParameteri(e.target,n.TEXTURE_MAX_LEVEL,r)}_initSampler(e){let t=this._gl,n=this._gl.createSampler();return this._glSamplers[e._resourceId]=n,os(e,t,this._boundTextures[this._activeTextureLocation].mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,`samplerParameteri`,n,!1,!0),this._glSamplers[e._resourceId]}_getGlSampler(e){return this._glSamplers[e._resourceId]||this._initSampler(e)}getGlSource(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]||this._initSource(e)}generateCanvas(e){let{pixels:t,width:n,height:r}=this.getPixels(e),i=b.get().createCanvas();i.width=n,i.height=r;let a=i.getContext(`2d`);if(a){let e=a.createImageData(n,r);e.data.set(t),a.putImageData(e,0,0)}return i}getPixels(e){let t=e.source.resolution,n=e.frame,r=Math.max(Math.round(n.width*t),1),i=Math.max(Math.round(n.height*t),1),a=new Uint8Array(ds*r*i),o=this._renderer,s=o.renderTarget.getRenderTarget(e),c=o.renderTarget.getGpuRenderTarget(s),l=o.gl;return o.renderTarget.adaptor.bindFramebuffer(c.resolveTargetFramebuffer),l.readPixels(Math.round(n.x*t),Math.round(n.y*t),r,i,l.RGBA,l.UNSIGNED_BYTE,a),{pixels:new Uint8ClampedArray(a.buffer),width:r,height:i}}destroy(){this._managedTextures.destroy(),this._glSamplers=null,this._boundTextures=null,this._boundSamplers=null,this._mapFormatToInternalFormat=null,this._mapFormatToType=null,this._mapFormatToFormat=null,this._uploads=null,this._renderer=null}resetState(){this._activeTextureLocation=-1,this._boundTextures.fill(O.EMPTY.source),this._boundSamplers=Object.create(null);let e=this._gl;this._premultiplyAlpha=!1,e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this._premultiplyAlpha)}};fs.extension={type:[m.WebGLSystem],name:`texture`},fs.uploadExtensions=Object.create(null);var ps=fs;r.handleByMap(m.TextureUploaderWebGL,ps.uploadExtensions);var ms=class{contextChange(e){let t=new C({uColor:{value:new Float32Array([1,1,1,1]),type:`vec4<f32>`},uTransformMatrix:{value:new A,type:`mat3x3<f32>`},uRound:{value:0,type:`f32`}}),n=e.limits.maxBatchableTextures,r=tt({name:`graphics`,bits:[Je,$e(n),at,Ue]});this.shader=new g({glProgram:r,resources:{localUniforms:t,batchSamplers:Qe(n)}})}execute(e,t){let n=t.context,r=n.customShader||this.shader,i=e.renderer,{batcher:a,instructions:o}=i.graphicsContext.getContextRenderData(n);r.groups[0]=i.globalUniforms.bindGroup,i.state.set(e.state),i.shader.bind(r),i.geometry.bind(a.geometry,r.glProgram);let s=o.instructions;for(let e=0;e<o.instructionSize;e++){let t=s[e];if(t.size){for(let e=0;e<t.textures.count;e++)i.texture.bind(t.textures.textures[e],e);i.geometry.draw(t.topology,t.size,t.start)}}}destroy(){this.shader.destroy(!0),this.shader=null}};ms.extension={type:[m.WebGLPipesAdaptor],name:`graphics`};var hs=class{init(){let e=tt({name:`mesh`,bits:[at,mt,Ue]});this._shader=new g({glProgram:e,resources:{uTexture:O.EMPTY.source,textureUniforms:{uTextureMatrix:{type:`mat3x3<f32>`,value:new A}}}})}execute(e,t){let n=e.renderer,r=t._shader;if(!r){r=this._shader;let e=t.texture,n=e.source;r.resources.uTexture=n,r.resources.uSampler=n.style,r.resources.textureUniforms.uniforms.uTextureMatrix=e.textureMatrix.mapCoord}else if(!r.glProgram){k(`Mesh shader has no glProgram`,t.shader);return}r.groups[100]=n.globalUniforms.bindGroup,r.groups[101]=e.localUniformsBindGroup,n.encoder.draw({geometry:t._geometry,shader:r,state:t.state})}destroy(){this._shader.destroy(!0),this._shader=null}};hs.extension={type:[m.WebGLPipesAdaptor],name:`mesh`};var gs=D({WebGLRenderer:()=>ws}),_s=[...Oe,lo,$a,Ua,no,Va,ps,fo,Xa,Fo,jo,to,Wo,io,eo],vs=[...Ee],ys=[ta,hs,ms],bs=[],xs=[],Ss=[],Cs=[];r.handleByNamedList(m.WebGLSystem,bs),r.handleByNamedList(m.WebGLPipes,xs),r.handleByNamedList(m.WebGLPipesAdaptor,Ss),r.handleByNamedList(m.WebGLLoader,Cs),r.add(..._s,...vs,...ys);var ws=class extends B{constructor(){let e={name:`webgl`,type:te.WEBGL,systems:bs,renderPipes:xs,renderPipeAdaptors:Ss,loaders:Cs};super(e)}},Ts=class{constructor(e,t){this.autoGarbageCollect=!0,this._gpuData=null,this.gpuBindGroup=e,this._gcLastUsed=t}unload(){this.gpuBindGroup=null}},Es=class{constructor(e){this._hash=Object.create(null),this._renderer=e,e.gc.addResourceHash(this,`_hash`,`resource`),e.gc.addCollection(this,`_hash`,`hash`)}contextChange(e){this._gpu=e,this._hash=Object.create(null)}getBindGroup(e,t,n){let r=`${e._key}:${t._layoutKey<<4|n}`,i=this._hash[r];return i?(i._gcLastUsed=this._renderer.gc.now,i.gpuBindGroup):this._createBindGroup(r,e,t,n)}_createBindGroup(e,t,n,r){let i=this._gpu.device,a=n.layout[r],o=[],s=this._renderer;for(let e in a){let n=t.resources[e]??t.resources[a[e]];if(!n||n.destroyed)throw Error(`[BindGroup] the resource bound as '${e}' was destroyed while a shader still uses it. Remove it from the shader before destroying it.`);let r;if(n._resourceType===`uniformGroup`){let e=n;s.ubo.updateUniformGroup(e);let t=e.buffer;r={buffer:s.buffer.getGPUBuffer(t),offset:0,size:t.descriptor.size}}else if(n._resourceType===`buffer`){let e=n;r={buffer:s.buffer.getGPUBuffer(e),offset:0,size:e.descriptor.size}}else if(n._resourceType===`bufferResource`){let e=n;r={buffer:s.buffer.getGPUBuffer(e.buffer),offset:e.offset,size:e.size??e.buffer.descriptor.size}}else if(n._resourceType===`textureSampler`){let e=n;r=s.texture.getGpuSampler(e)}else if(n._resourceType===`textureSource`){let e=n;r=s.texture.getTextureView(e)}else if(n._resourceType===`textureView`){let e=n;r=s.texture.getTextureView(e.source,e.viewDescriptor)}o.push({binding:a[e],resource:r})}let c=s.shader.getProgramData(n).bindGroups[r],l=i.createBindGroup({layout:c,entries:o});return this._hash[e]=new Ts(l,s.gc.now),l}destroy(){this._hash=null,this._renderer=null}};Es.extension={type:[m.WebGPUSystem],name:`bindGroup`};var Ds=class{constructor(e){this.gpuBuffer=e}destroy(){this.gpuBuffer.destroy(),this.gpuBuffer=null}},Os=class{constructor(e){this._renderer=e,this._managedBuffers=new et({renderer:e,type:`resource`,onUnload:this.onBufferUnload.bind(this),name:`gpuBuffer`})}contextChange(e){this._gpu=e,this.destroyAll()}getGPUBuffer(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]?.gpuBuffer||this.createGPUBuffer(e)}updateBuffer(e){let t=this.getGPUBuffer(e),n=e.data;return e._updateID&&n&&(e._updateID=0,this._gpu.device.queue.writeBuffer(t,e._updateOffset,n.buffer,n.byteOffset+e._updateOffset,(e._updateSize||n.byteLength)+3&-4)),t}destroyAll(){this._managedBuffers.removeAll()}onBufferUnload(e){e.off(`update`,this.updateBuffer,this),e.off(`change`,this.onBufferChange,this)}createGPUBuffer(e){let t=this._gpu.device.createBuffer(e.descriptor);return e._updateID=0,e.data&&(Ye(e.data.buffer,t.getMappedRange(),e.data.byteOffset,e.data.byteLength),t.unmap()),e._gpuData[this._renderer.uid]=new Ds(t),this._managedBuffers.add(e)&&(e.on(`update`,this.updateBuffer,this),e.on(`change`,this.onBufferChange,this)),t}onBufferChange(e){this._managedBuffers.remove(e),e._updateID=0,this.createGPUBuffer(e)}destroy(){this._managedBuffers.destroy(),this._renderer=null,this._gpu=null}};Os.extension={type:[m.WebGPUSystem],name:`buffer`};var ks=class{constructor({minUniformOffsetAlignment:e}){this._minUniformOffsetAlignment=256,this.byteIndex=0,this._minUniformOffsetAlignment=e,this.data=new Float32Array(65535)}clear(){this.byteIndex=0}addEmptyGroup(e){if(e>this._minUniformOffsetAlignment/4)throw Error(`UniformBufferBatch: array is too large: ${e*4}`);let t=this.byteIndex,n=t+e*4;if(n=Math.ceil(n/this._minUniformOffsetAlignment)*this._minUniformOffsetAlignment,n>this.data.length*4)throw Error(`UniformBufferBatch: ubo batch got too big`);return this.byteIndex=n,t}addGroup(e){let t=this.addEmptyGroup(e.length);for(let n=0;n<e.length;n++)this.data[t/4+n]=e[n];return t}destroy(){this.data=null}},As=class{constructor(e){this._colorMaskCache=15,this._renderer=e}setMask(e){this._colorMaskCache!==e&&(this._colorMaskCache=e,this._renderer.pipeline.setColorMask(e))}destroy(){this._renderer=null,this._colorMaskCache=null}};As.extension={type:[m.WebGPUSystem],name:`colorMask`};var js=class{constructor(e){this._renderer=e}async init(e){return this._initPromise?this._initPromise:(this._options=e,this._initPromise=(e.gpu?Promise.resolve(e.gpu):this._createDeviceAndAdaptor(e)).then(e=>this._setGpu(e)),this._initPromise)}_setGpu(e){this.gpu=e,this.extensions={transientAttachment:typeof GPUTextureUsage.TRANSIENT_ATTACHMENT==`number`},this._options.gpu||e.device.lost.then(()=>this._restoreDevice()).catch(e=>k(`WebGPU device was lost and could not be restored`,e)),this._renderer.runners.contextChange.emit(this.gpu)}async _restoreDevice(){if(!this._renderer)return;let e=await this._createDeviceAndAdaptor(this._options);if(!this._renderer){e.device.destroy();return}this._setGpu(e)}contextChange(e){this._renderer.gpu=e}async _createDeviceAndAdaptor(e){let t=await b.get().getNavigator().gpu.requestAdapter({powerPreference:e.powerPreference,forceFallbackAdapter:e.forceFallbackAdapter});if(!t)throw Error(`WebGPU not supported. No GPU adapter was returned by navigator.gpu.requestAdapter().`);let n=[`texture-compression-bc`,`texture-compression-astc`,`texture-compression-etc2`,`indirect-first-instance`].filter(e=>t.features.has(e));return{adapter:t,device:await t.requestDevice({requiredFeatures:n,requiredLimits:{maxSampledTexturesPerShaderStage:t.limits.maxSampledTexturesPerShaderStage,maxSamplersPerShaderStage:t.limits.maxSamplersPerShaderStage}})}}destroy(){this._options?.gpu||this.gpu?.device.destroy(),this.gpu=null,this.extensions=null,this._renderer=null}};js.extension={type:[m.WebGPUSystem],name:`device`},js.defaultOptions={powerPreference:void 0,forceFallbackAdapter:!1};var Ms=class{constructor(e,t,n,r){this.gpuBundle=e,this.stateKey=t,this.device=n,this.label=r}},Ns=class{constructor(e){this._boundBindGroup=Object.create(null),this._boundVertexBuffer=Object.create(null),this._renderer=e;for(let e=0;e<16;e++)this._boundBindGroup[e]={bindGroup:null,program:null,key:null}}renderStart(){this.commandFinished=new Promise(e=>{this._resolveCommandFinished=e}),this.commandEncoder=this._renderer.gpu.device.createCommandEncoder()}beginRenderPass(e){this.endRenderPass(),this._clearCache(),this._passEncoder=this.commandEncoder.beginRenderPass(e.descriptor),this.renderPassEncoder=this._passEncoder}endRenderPass(){this._passEncoder&&this._passEncoder.end(),this.renderPassEncoder=null,this._passEncoder=null}beginBundle(e){if(this._passEncoder!==this.renderPassEncoder)throw Error(`Cannot begin a new render bundle while one is already being recorded.`);this._clearCache();let t=this._renderer.pipeline,n=t.getBundleDescriptor();n.label=e,this._bundleStateKey=t.bundleStateKey,this._bundleLabel=e,this.renderPassEncoder=this._gpu.device.createRenderBundleEncoder(n)}endBundle(){let e=this.renderPassEncoder;if(!e||!(`finish`in e))throw Error(`endBundle called without an active render bundle.`);let t=e.finish({label:this._bundleLabel});return this.renderPassEncoder=this._passEncoder,this._clearCache(),new Ms(t,this._bundleStateKey,this._gpu.device,this._bundleLabel)}isBundleValid(e){return e?.stateKey===this._renderer.pipeline.bundleStateKey&&e.device===this._gpu.device}executeBundle(e){let t=[];if(Array.isArray(e))for(let n=0;n<e.length;n++)t[n]=this._getGpuBundle(e[n]);else t[0]=this._getGpuBundle(e);this._clearCache(),this._passEncoder.executeBundles(t)}_getGpuBundle(e){return this.isBundleValid(e)||k(`Render bundle ${e?.label??`(unlabeled)`} was recorded against a different render target state or on a lost device. Re-record it \u2014 replaying it will either be rejected by WebGPU or draw with the wrong winding. Check encoder.isBundleValid(bundle) before executing.`),e.gpuBundle}setViewport(e){this._passEncoder.setViewport(e.x,e.y,e.width,e.height,0,1)}setStencilReference(e){this._passEncoder.setStencilReference(e)}setPipelineFromGeometryProgramAndState(e,t,n,r,i){let a=this._renderer.pipeline.getPipeline(e,t,n,r,i);this.setPipeline(a)}setPipeline(e){this._boundPipeline!==e&&(this._boundPipeline=e,this.renderPassEncoder.setPipeline(e))}_setVertexBuffer(e,t){this._boundVertexBuffer[e]!==t&&(this._boundVertexBuffer[e]=t,this.renderPassEncoder.setVertexBuffer(e,this._renderer.buffer.updateBuffer(t)))}_setIndexBuffer(e){if(this._boundIndexBuffer===e)return;this._boundIndexBuffer=e;let t=e.data.BYTES_PER_ELEMENT===2?`uint16`:`uint32`;this.renderPassEncoder.setIndexBuffer(this._renderer.buffer.updateBuffer(e),t)}resetBindGroup(e){let t=this._boundBindGroup[e];t.bindGroup=null,t.program=null,t.key=null}setBindGroup(e,t,n){let r=this._boundBindGroup[e];if(r.bindGroup===t&&r.program===n&&r.key===t._key)return;r.bindGroup=t,r.program=n,r.key=t._key,t._touch(this._renderer.gc.now);let i=this._renderer.bindGroup.getBindGroup(t,n,e);this.renderPassEncoder.setBindGroup(e,i)}setGeometry(e,t){let n=this._renderer.pipeline.getBufferNamesToBind(e,t);for(let t in n)this._setVertexBuffer(parseInt(t,10),e.attributes[n[t]].buffer);e.indexBuffer&&this._setIndexBuffer(e.indexBuffer)}_setShaderBindGroups(e,t){let n=e.gpuProgram;for(let r in e.groups){if(!n.layout[r])continue;let i=e.groups[r];t||this._syncBindGroup(i),this.setBindGroup(r,i,n)}}_syncBindGroup(e){for(let t in e.resources){let n=e.resources[t];n&&n.isUniformGroup&&this._renderer.ubo.updateUniformGroup(n)}}draw(e){let{geometry:t,shader:n,state:r,topology:i,size:a,start:o,baseVertex:s,instanceCount:c,skipSync:l,firstInstance:u}=e;this.setPipelineFromGeometryProgramAndState(t,n.gpuProgram,r,i,n._overrides),this.setGeometry(t,n.gpuProgram),this._setShaderBindGroups(n,l),t.indexBuffer?this.renderPassEncoder.drawIndexed(a||t.indexCount||t.indexBuffer.data.length,c??t.instanceCount,o||0,s||0,u||0):this.renderPassEncoder.draw(a||t.vertexCount,c??t.instanceCount,o||0,u||0)}drawIndirect(e){let{geometry:t,shader:n,state:r,topology:i,skipSync:a,indirectBuffer:o,indirectOffset:s}=e;this.setPipelineFromGeometryProgramAndState(t,n.gpuProgram,r,i,n._overrides),this.setGeometry(t,n.gpuProgram),this._setShaderBindGroups(n,a),t.indexBuffer?this.renderPassEncoder.drawIndexedIndirect(o,s):this.renderPassEncoder.drawIndirect(o,s)}finishRenderPass(){this._passEncoder&&(this._passEncoder.end(),this.renderPassEncoder=null,this._passEncoder=null)}postrender(){this.finishRenderPass(),this._gpu.device.queue.submit([this.commandEncoder.finish()]),this._resolveCommandFinished(),this.commandEncoder=null}_clearCache(){for(let e=0;e<16;e++){let t=this._boundBindGroup[e];t.bindGroup=null,t.program=null,t.key=null,this._boundVertexBuffer[e]=null}this._boundIndexBuffer=null,this._boundPipeline=null}destroy(){this._renderer=null,this._gpu=null,this._boundBindGroup=null,this._boundVertexBuffer=null,this._boundIndexBuffer=null,this._boundPipeline=null,this.renderPassEncoder=null,this._passEncoder=null}contextChange(e){this._gpu=e}};Ns.extension={type:[m.WebGPUSystem],name:`encoder`,priority:1};var Ps=class{constructor(e){this.supportsOverrideConstants=!1,this._renderer=e}contextChange(){let e=this._renderer.device.gpu.device;this.maxTextures=Math.min(e.limits.maxSampledTexturesPerShaderStage,e.limits.maxSamplersPerShaderStage),this.maxBatchableTextures=this.maxTextures,this._detectOverrideConstantsSupport(e)}_detectOverrideConstantsSupport(e){e.pushErrorScope(`validation`);let t=e.createShaderModule({code:`override TEST_VALUE: f32 = 0.0;
@compute @workgroup_size(1) fn main() {}`});e.createComputePipeline({layout:`auto`,compute:{module:t,entryPoint:`main`,constants:{TEST_VALUE:1}}}),e.popErrorScope().then(e=>{this.supportsOverrideConstants=!e})}destroy(){}};Ps.extension={type:[m.WebGPUSystem],name:`limits`};var Fs=class{constructor(e){this._renderer=e,e.renderTarget.onRenderTargetChange.add(this)}contextChange(){this._activeGpuRenderTarget=null}onRenderTargetChange(e){let t=this._renderer.renderTarget.getGpuRenderTarget(e);this._activeRenderTarget=e,this._activeGpuRenderTarget=t,this.setStencilMode(t.stencilMode,t.stencilReference)}setStencilMode(e,t){let n=this._activeGpuRenderTarget??(this._activeGpuRenderTarget=this._renderer.renderTarget.getGpuRenderTarget(this._activeRenderTarget));n.stencilMode=e,n.stencilReference=t;let r=this._renderer;r.pipeline.setStencilMode(e),r.encoder.setStencilReference(t)}destroy(){this._renderer.renderTarget.onRenderTargetChange.remove(this),this._renderer=null,this._activeRenderTarget=null,this._activeGpuRenderTarget=null}};Fs.extension={type:[m.WebGPUSystem],name:`stencil`};var Is={i32:{align:4,size:4},u32:{align:4,size:4},f32:{align:4,size:4},f16:{align:2,size:2},"vec2<i32>":{align:8,size:8},"vec2<u32>":{align:8,size:8},"vec2<f32>":{align:8,size:8},"vec2<f16>":{align:4,size:4},"vec3<i32>":{align:16,size:12},"vec3<u32>":{align:16,size:12},"vec3<f32>":{align:16,size:12},"vec3<f16>":{align:8,size:6},"vec4<i32>":{align:16,size:16},"vec4<u32>":{align:16,size:16},"vec4<f32>":{align:16,size:16},"vec4<f16>":{align:8,size:8},"mat2x2<f32>":{align:8,size:16},"mat2x2<f16>":{align:4,size:8},"mat3x2<f32>":{align:8,size:24},"mat3x2<f16>":{align:4,size:12},"mat4x2<f32>":{align:8,size:32},"mat4x2<f16>":{align:4,size:16},"mat2x3<f32>":{align:16,size:32},"mat2x3<f16>":{align:8,size:16},"mat3x3<f32>":{align:16,size:48},"mat3x3<f16>":{align:8,size:24},"mat4x3<f32>":{align:16,size:64},"mat4x3<f16>":{align:8,size:32},"mat2x4<f32>":{align:16,size:32},"mat2x4<f16>":{align:8,size:16},"mat3x4<f32>":{align:16,size:48},"mat3x4<f16>":{align:8,size:24},"mat4x4<f32>":{align:16,size:64},"mat4x4<f16>":{align:8,size:32}};function Ls(e){let t=e.map(e=>({data:e,offset:0,size:0})),n=0;for(let e=0;e<t.length;e++){let r=t[e],i=Is[r.data.type].size,a=Is[r.data.type].align;if(!Is[r.data.type])throw Error(`[Pixi.js] WebGPU UniformBuffer: Unknown type ${r.data.type}`);r.data.size>1&&(i=Math.max(i,a)*r.data.size),n=Math.ceil(n/a)*a,r.size=i,r.offset=n,n+=i}return n=Math.ceil(n/16)*16,{uboElements:t,size:n}}function Rs(e,t){let{size:n,align:r}=Is[e.data.type],i=(r-n)/4,a=e.data.type.indexOf(`i32`)>=0?`dataInt32`:`data`;return`
         v = uv.${e.data.name};
         ${t===0?``:`offset += ${t};`}

         arrayOffset = offset;

         t = 0;

         for(var i=0; i < ${e.data.size*(n/4)}; i++)
         {
             for(var j = 0; j < ${n/4}; j++)
             {
                 ${a}[arrayOffset++] = v[t++];
             }
             ${i===0?``:`arrayOffset += ${i};`}
         }
     `}function zs(e){return ot(e,dt,Rs)}var Bs=class extends lt{constructor(){super({createUboElements:Ls,generateUboSync:zs})}};Bs.extension={type:[m.WebGPUSystem],name:`ubo`};var Vs=128,Hs=class{constructor(e){this._bindGroupHash=Object.create(null),this._buffers=[],this._bindGroups=[],this._bufferResources=[],this._renderer=e,this._batchBuffer=new ks({minUniformOffsetAlignment:Vs});let t=256/Vs;for(let e=0;e<t;e++){let t=x.UNIFORM|x.COPY_DST;e===0&&(t|=x.COPY_SRC),this._buffers.push(new ee({data:this._batchBuffer.data,usage:t}))}}renderEnd(){this._uploadBindGroups(),this._resetBindGroups()}_resetBindGroups(){this._bindGroupHash=Object.create(null),this._batchBuffer.clear()}getUniformBindGroup(e,t){if(!t&&this._bindGroupHash[e.uid])return this._bindGroupHash[e.uid];this._renderer.ubo.ensureUniformGroup(e);let n=e.buffer.data,r=this._batchBuffer.addEmptyGroup(n.length);return this._renderer.ubo.syncUniformGroup(e,this._batchBuffer.data,r/4),this._bindGroupHash[e.uid]=this._getBindGroup(r/Vs),this._bindGroupHash[e.uid]}getUboResource(e){this._renderer.ubo.updateUniformGroup(e);let t=e.buffer.data,n=this._batchBuffer.addGroup(t);return this._getBufferResource(n/Vs)}getArrayBindGroup(e){let t=this._batchBuffer.addGroup(e);return this._getBindGroup(t/Vs)}getArrayBufferResource(e){let t=this._batchBuffer.addGroup(e)/Vs;return this._getBufferResource(t)}_getBufferResource(e){if(!this._bufferResources[e]){let t=this._buffers[e%2];this._bufferResources[e]=new pt({buffer:t,offset:(e/2|0)*256,size:Vs})}return this._bufferResources[e]}_getBindGroup(e){if(!this._bindGroups[e]){let t=new _({0:this._getBufferResource(e)});this._bindGroups[e]=t}return this._bindGroups[e]}_uploadBindGroups(){let e=this._renderer.buffer,t=this._buffers[0];t.update(this._batchBuffer.byteIndex),e.updateBuffer(t);let n=this._renderer.gpu.device.createCommandEncoder();for(let r=1;r<this._buffers.length;r++){let i=this._buffers[r];n.copyBufferToBuffer(e.getGPUBuffer(t),Vs,e.getGPUBuffer(i),0,this._batchBuffer.byteIndex)}this._renderer.gpu.device.queue.submit([n.finish()])}destroy(){for(let e=0;e<this._bindGroups.length;e++)this._bindGroups[e]?.destroy();this._bindGroups=null,this._bindGroupHash=null;for(let e=0;e<this._buffers.length;e++)this._buffers[e].destroy();this._buffers=null;for(let e=0;e<this._bufferResources.length;e++)this._bufferResources[e].destroy();this._bufferResources=null,this._batchBuffer.destroy(),this._renderer=null}};Hs.extension={type:[m.WebGPUPipes],name:`uniformBatch`};var Us={"point-list":0,"line-list":1,"line-strip":2,"triangle-list":3,"triangle-strip":4},Ws=new E({}),Gs={"depth24plus-stencil8":{depth:!0,stencil:!0,index:1},depth24plus:{depth:!0,stencil:!1,index:2},depth32float:{depth:!0,stencil:!1,index:3},"depth32float-stencil8":{depth:!0,stencil:!0,index:4},depth16unorm:{depth:!0,stencil:!1,index:5},stencil8:{depth:!1,stencil:!0,index:6}},Ks={depth:!1,stencil:!1,index:0};function qs(e,t){for(let[n,r]of Object.entries(t)){let t=RegExp(`override\\s+${n}\\s*:\\s*(\\w+)\\s*(?:=[^;]*)?;`);e=e.replace(t,(e,t)=>{let i;return i=t===`u32`?`${Math.trunc(r)}u`:t===`i32`?`${Math.trunc(r)}`:Number.isInteger(r)?`${r}.0`:`${r}`,`const ${n}: ${t} = ${i};`})}return e}function Js(e,t,n,r,i,a){return e*35184372088832+t*536870912+a*16384+(n<<8)+(r<<3)+i}var Ys=Object.create(null),Xs=0;function Zs(e){let t=Ys[e];return t===void 0&&(t=Ys[e]=Xs++),t}function Qs(e,t,n,r,i,a,o,s){return s<<20|a<<16|i<<13|n<<9|e<<6|o<<5|r<<1|t}function $s(e,t,n,r,i,a,o){return o<<11|a<<10|i<<9|r<<8|n<<5|t<<1|e}var ec=class{constructor(e){this._moduleCache=Object.create(null),this._bufferLayoutsCache=Object.create(null),this._bindingNamesCache=Object.create(null),this._pipeCache=new Map,this._pipeStateCaches=Object.create(null),this._colorMask=15,this._multisampleCount=1,this._colorTargetCount=1,this._colorFormat=`bgra8unorm`,this._colorFormatId=Zs(`bgra8unorm`),this._depthStencilFormat=`depth24plus-stencil8`,this._depthStencilFormatData=Ks,this._depthReadOnly=!1,this._stencilReadOnly=!1,this._invertFrontFace=!1,this._renderer=e}contextChange(e){this._gpu=e,this._moduleCache=Object.create(null),this._pipeStateCaches=Object.create(null),this.setStencilMode(Ze.DISABLED),this._updatePipeHash()}setMultisampleCount(e){this._multisampleCount!==e&&(this._multisampleCount=e,this._updatePipeHash())}setRenderTarget(e){let t=e.colorAttachments[0]?.texture;this._multisampleCount=t?.source.antialias?4:1,this._colorTargetCount=e.colorAttachments.length,this._colorFormat=t?.format??`bgra8unorm`,this._colorFormatId=Zs(this._colorFormat),this._depthStencilFormat=e.depthStencilAttachment?.texture.format,this._depthStencilFormatData=Gs[this._depthStencilFormat]||Ks,this._depthReadOnly=e.depthStencilAttachment?.depthReadOnly??!1,this._stencilReadOnly=e.depthStencilAttachment?.stencilReadOnly??this._depthReadOnly,this._invertFrontFace=this._renderer.renderTarget.isFrontFaceInverted(e,e.flipY),this._updatePipeHash()}setColorMask(e){this._colorMask!==e&&(this._colorMask=e,this._updatePipeHash())}setStencilMode(e){this._stencilMode!==e&&(this._stencilMode=e,this._stencilState=ft[e],this._updatePipeHash())}get bundleStateKey(){let e=this._depthStencilFormatData;return $s(this._multisampleCount===1?0:1,this._colorTargetCount,e.index,e.depth&&this._depthReadOnly?1:0,e.stencil&&this._stencilReadOnly?1:0,+!!this._invertFrontFace,this._colorFormatId)}getBundleDescriptor(){let e=[];for(let t=0;t<this._colorTargetCount;t++)e.push(this._colorFormat);let t={colorFormats:e,sampleCount:this._multisampleCount},n=this._depthStencilFormatData;return(n.depth||n.stencil)&&(t.depthStencilFormat=this._depthStencilFormat,n.depth&&this._depthReadOnly&&(t.depthReadOnly=!0),n.stencil&&this._stencilReadOnly&&(t.stencilReadOnly=!0)),t}setPipeline(e,t,n,r){let i=this.getPipeline(e,t,n);r.setPipeline(i)}getPipelineKey(e,t,n,r,i){return e._layoutKey||(rt(e,t.attributeData),this._generateBufferKey(e)),Js(e._layoutKey,t._layoutKey,n.data,n._blendModeId,Us[r],i.id)}getPipeline(e,t,n,r,i){e._layoutKey||(rt(e,t.attributeData),this._generateBufferKey(e)),r||(r=e.topology),i||(i=Ws);let a=Js(e._layoutKey,t._layoutKey,n.data,n._blendModeId,Us[r],i.id),o=this._pipeCache.get(a);return o||(o=this._createPipeline(e,t,n,r,i),this._pipeCache.set(a,o)),o}_createPipeline(e,t,n,r,i){let a=this._gpu.device,o=this._createVertexBufferLayouts(e,t),s=this._renderer.state.getColorTargets(n,this._colorTargetCount,this._colorFormat),c=this._stencilMode===Ze.RENDERING_MASK_ADD?0:this._colorMask;for(let e=0;e<s.length;e++)s[e].writeMask=c;let l=this._renderer.shader.getProgramData(t).pipeline,u=Object.keys(i.data).length>0,d=t.vertex.source,f=t.fragment.source,p;u&&(this._renderer.limits.supportsOverrideConstants?p=i.data:(d=qs(d,i.data),f=qs(f,i.data)));let m={vertex:{module:this._getModule(d),entryPoint:t.vertex.entryPoint,constants:p,buffers:o},fragment:{module:this._getModule(f),entryPoint:t.fragment.entryPoint,targets:s,constants:p},primitive:{topology:r,cullMode:n.culling?`back`:`none`,frontFace:n.clockwiseFrontFace===this._invertFrontFace?`ccw`:`cw`},layout:l,multisample:{count:this._multisampleCount},label:t.name?`PIXI Pipeline (${t.name})`:`PIXI Pipeline`};if(this._depthStencilFormatData.depth||this._depthStencilFormatData.stencil){let e=this._depthStencilFormatData;m.depthStencil={...this._stencilState,format:this._depthStencilFormat,depthWriteEnabled:e.depth?n.depthMask&&!this._depthReadOnly:!1,depthCompare:e.depth&&n.depthTest?`less`:`always`}}return a.createRenderPipeline(m)}_getModule(e){return this._moduleCache[e]||this._createModule(e)}_createModule(e){let t=this._gpu.device;return this._moduleCache[e]=t.createShaderModule({code:e}),this._moduleCache[e]}_generateBufferKey(e){let t=[],n=0,r=Object.keys(e.attributes).sort();for(let i=0;i<r.length;i++){let a=e.attributes[r[i]];t[n++]=a.offset,t[n++]=a.format,t[n++]=a.stride,t[n++]=a.instance}let i=t.join(`|`);return e._layoutKey=w(i,`geometry`),e._layoutKey}_generateAttributeLocationsKey(e){let t=[],n=0,r=Object.keys(e.attributeData).sort();for(let i=0;i<r.length;i++){let a=e.attributeData[r[i]];t[n++]=a.location}let i=t.join(`|`);return e._attributeLocationsKey=w(i,`programAttributes`),e._attributeLocationsKey}getBufferNamesToBind(e,t){let n=e._layoutKey<<16|t._attributeLocationsKey;if(this._bindingNamesCache[n])return this._bindingNamesCache[n];let r=this._createVertexBufferLayouts(e,t),i=Object.create(null),a=t.attributeData;for(let e=0;e<r.length;e++){let t=Object.values(r[e].attributes)[0].shaderLocation;for(let n in a)if(a[n].location===t){i[e]=n;break}}return this._bindingNamesCache[n]=i,i}_createVertexBufferLayouts(e,t){t._attributeLocationsKey||this._generateAttributeLocationsKey(t);let n=e._layoutKey<<16|t._attributeLocationsKey;if(this._bufferLayoutsCache[n])return this._bufferLayoutsCache[n];let r=[];return e.buffers.forEach(n=>{let i={arrayStride:0,stepMode:`vertex`,attributes:[]},a=i.attributes;for(let r in t.attributeData){let o=e.attributes[r];(o.divisor??1)!==1&&k(`Attribute ${r} has an invalid divisor value of '${o.divisor}'. WebGPU only supports a divisor value of 1`),o.buffer===n&&(i.arrayStride=o.stride,i.stepMode=o.instance?`instance`:`vertex`,a.push({shaderLocation:t.attributeData[r].location,offset:o.offset,format:o.format}))}a.length&&r.push(i)}),this._bufferLayoutsCache[n]=r,r}_updatePipeHash(){var e;let t=Qs(this._stencilMode,this._multisampleCount===1?0:1,this._colorMask,this._colorTargetCount,this._depthStencilFormatData.index,this._colorFormatId,+!!this._depthReadOnly,+!!this._invertFrontFace);this._pipeCache=(e=this._pipeStateCaches)[t]??(e[t]=new Map)}destroy(){this._bufferLayoutsCache=null,this._pipeCache=null,this._gpu=null,this._renderer=null,this._bindingNamesCache=null,this._pipeStateCaches=null,this._moduleCache=null}};ec.extension={type:[m.WebGPUSystem],name:`pipeline`};var tc=class{constructor(){this.contexts=[],this.msaaTextures=[],this.msaaSamples=1,this.stencilMode=Ze.DISABLED,this.stencilReference=0,this.maskStackIndex=0}},nc={bgra8unorm:!0,rgba8unorm:!0,rgba16float:!0};function rc(e){if(nc[e])return e;let t=navigator.gpu.getPreferredCanvasFormat();return k(`[WebGPU] CanvasSource format '${e}' is not a valid GPUCanvasContext format. Falling back to '${t}'. Allowed formats are: bgra8unorm, rgba8unorm, rgba16float.`),t}var ic=class{constructor(){this._activePass=null}init(e,t){this._renderer=e,this._renderTargetSystem=t}copyToTexture(e,t,n,r,i){let a=this._renderer;this.finishRenderPass();let o=this._getGpuColorTexture(e),s=a.texture.getGpuSource(t.source);return a.encoder.commandEncoder.copyTextureToTexture({texture:o,origin:n},{texture:s,origin:i},r),t}copyDepthTexture(e,t,n,r,i){let a=this._renderer;this.finishRenderPass();let o=e.depthStencilAttachment.texture,s=a.texture.getGpuSource(o),c=a.texture.getGpuSource(t.source),l=a.encoder.commandEncoder===null,u=l?a.gpu.device.createCommandEncoder():a.encoder.commandEncoder;u.copyTextureToTexture({texture:s,origin:n},{texture:c,origin:i},{width:r.width,height:r.height}),l&&a.gpu.device.queue.submit([u.finish()])}startRenderPass(e,t=!0,n,r,i=0,a=0){let o=this._renderTargetSystem.getGpuRenderTarget(e);if(a!==0&&o.msaaTextures?.length)throw Error(`[RenderTargetSystem] Rendering to array layers is not supported with MSAA render targets.`);if(i>0&&o.msaaTextures?.length)throw Error(`[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.`);let s=t;typeof s==`boolean`&&(s=s?Te.ALL:Te.NONE),(e.stencil||e.depth)&&!e.depthStencilAttachment&&e.ensureDepthStencilTexture();let c=!!e.depthStencilAttachment,l=this._activePass,u=l!==null&&l.renderTarget===e&&l.mipLevel===i&&l.layer===a&&l.depthStencil===c&&this._renderer.encoder.renderPassEncoder!==null&&s===Te.NONE;if(this._renderer.pipeline.setRenderTarget(e),u){this._renderer.encoder.setViewport(r);return}o.descriptor=this.getDescriptor(e,t,n,i,a),this._renderer.encoder.beginRenderPass(o),this._renderer.encoder.setViewport(r),this._activePass={renderTarget:e,mipLevel:i,layer:a,depthStencil:c}}finishRenderPass(){this._renderer.encoder.endRenderPass(),this._activePass=null}_getGpuColorTexture(e){if(e.colorAttachments.length===0)throw Error(`[GpuRenderTargetAdaptor] cannot get gpu color texture from a depth-only render target`);let t=e.colorAttachments[0].texture;return t instanceof pe&&t._gpuContext?t._gpuContext.getCurrentTexture():this._renderer.texture.getGpuSource(t)}getDescriptor(e,t,n,r=0,i=0){typeof t==`boolean`&&(t=t?Te.ALL:Te.NONE);let a=this._renderTargetSystem,o=a.getGpuRenderTarget(e),s=e.colorAttachments.map((e,s)=>{let c=e.texture,l=c instanceof pe?c._gpuContext:null,u,d;if(l){if(i!==0)throw Error(`[RenderTargetSystem] Rendering to array layers is not supported for canvas targets.`);u=l.getCurrentTexture().createView(e.viewDescriptor)}else u=this._renderer.texture.getTextureRenderTargetView(e.texture,r,i,e.viewDescriptor);let f=!1;o.msaaTextures[s]&&(d=u,u=this._renderer.texture.getTextureView(o.msaaTextures[s]),f=o.msaaTextures[s].transient);let p=e.loadOp;t!==void 0&&(p=t&Te.COLOR?`clear`:`load`),n??(n=a.defaultClearColor);let m=e.storeOp??`store`,h={view:u,resolveTarget:d,storeOp:f?`discard`:m,loadOp:p};p===`clear`&&(n??(n=e.clearValue??a.defaultClearColor),h.clearValue=n);for(let t in e)t!==`texture`&&t!==`viewDescriptor`&&t!==`clearValue`&&t!==`loadOp`&&t!==`storeOp`&&(h[t]=e[t]);return h}),c;if(e.depthStencilAttachment){o.msaa&&(e.depthStencilAttachment.texture.sampleCount=4),e.depthStencilAttachment.texture.transient=!!o.msaaTextures[0]?.transient;let n=e.depthStencilAttachment,a=n.texture.format.includes(`stencil`),s=n.texture.format.includes(`depth`),l=n.texture.transient?`discard`:`store`;c={view:this._renderer.texture.getTextureRenderTargetView(n.texture,r,i,n.viewDescriptor)};let u=n.depthReadOnly??!1,d=n.stencilReadOnly??u;a&&!d?(c.stencilLoadOp=t&Te.STENCIL?`clear`:n.stencilLoadOp??`load`,c.stencilStoreOp=n.stencilStoreOp??l,c.stencilLoadOp===`clear`&&(c.stencilClearValue=n.stencilClearValue??0)):a&&d&&(c.stencilReadOnly=!0),s&&!u?(c.depthLoadOp=t&Te.DEPTH?`clear`:n.depthLoadOp??`load`,c.depthStoreOp=n.depthStoreOp??l,c.depthLoadOp===`clear`&&(c.depthClearValue=n.depthClearValue??1)):s&&u&&(c.depthReadOnly=!0);for(let e in n)e!==`texture`&&e!==`viewDescriptor`&&e!==`stencilLoadOp`&&e!==`stencilStoreOp`&&e!==`stencilClearValue`&&e!==`stencilReadOnly`&&e!==`depthLoadOp`&&e!==`depthStoreOp`&&e!==`depthClearValue`&&e!==`depthReadOnly`&&(c[e]=n[e])}return{colorAttachments:s,depthStencilAttachment:c,label:e.label}}clear(e,t=!0,n,r,i=0,a=0){if(!t)return;let{gpu:o,encoder:s}=this._renderer,c=o.device;if(s.commandEncoder===null){let o=c.createCommandEncoder(),s=this.getDescriptor(e,t,n,i,a),l=o.beginRenderPass(s);l.setViewport(r.x,r.y,r.width,r.height,0,1),l.end();let u=o.finish();c.queue.submit([u])}else this.startRenderPass(e,t,n,r,i,a)}initGpuRenderTarget(e){e.isRoot=!0;let n=new tc;return e.colorAttachments.forEach((e,r)=>{let i=e.texture;if(i instanceof pe){let e=i._gpuContext??(i._gpuContext=i.resource.getContext(`webgpu`)),t=i.transparent?`premultiplied`:`opaque`,a=rc(i.format);try{e.configure({device:this._renderer.gpu.device,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC,format:a,alphaMode:t,...a===`rgba16float`?{toneMapping:{mode:`extended`}}:{}})}catch(e){console.error(e)}n.contexts[r]=e}if(n.msaa=i.source.antialias,i.antialias){let e=new t({width:0,height:0,sampleCount:4,autoGenerateMipmaps:!1,transient:i.transient,arrayLayerCount:i.arrayLayerCount,format:i.format});n.msaaTextures[r]=e}}),n.msaa&&(n.msaaSamples=4,e.depthStencilAttachment&&(e.depthStencilAttachment.texture.sampleCount=4,e.depthStencilAttachment.texture.transient=!!n.msaaTextures[0]?.transient)),n}destroyGpuRenderTarget(e){e.contexts.forEach(e=>{e.unconfigure()}),e.msaaTextures.forEach(e=>{e.destroy()}),e.msaaTextures.length=0,e.contexts.length=0}ensureDepthStencilTexture(e){let t=this._renderTargetSystem.getGpuRenderTarget(e);e.depthStencilAttachment&&t.msaa&&(e.depthStencilAttachment.texture.sampleCount=4)}resizeGpuRenderTarget(e){let t=this._renderTargetSystem.getGpuRenderTarget(e);t.width=e.width,t.height=e.height,t.msaa&&e.colorAttachments.forEach((e,n)=>{let r=e.texture;t.msaaTextures[n]?.resize(r.width,r.height,r._resolution)})}},ac=class extends Ae{constructor(e){super(e),this.adaptor=new ic,this.adaptor.init(e,this)}};ac.extension={type:[m.WebGPUSystem],name:`renderTarget`};var oc=class{constructor(){this._gpuProgramData=Object.create(null)}contextChange(e){this._gpu=e,this._gpuProgramData=Object.create(null)}getProgramData(e){return this._gpuProgramData[e._layoutKey]||this._createGPUProgramData(e)}_createGPUProgramData(e){let t=this._gpu.device,n=e.gpuLayout.map(e=>t.createBindGroupLayout({entries:e})),r={bindGroupLayouts:n};return this._gpuProgramData[e._layoutKey]={bindGroups:n,pipeline:t.createPipelineLayout(r)},this._gpuProgramData[e._layoutKey]}destroy(){this._gpu=null,this._gpuProgramData=null}};oc.extension={type:[m.WebGPUSystem],name:`shader`};var sc={};sc.normal={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}},sc.add={alpha:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one`,operation:`add`}},sc.multiply={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`dst`,dstFactor:`one-minus-src-alpha`,operation:`add`}},sc.screen={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one-minus-src`,operation:`add`}},sc.overlay={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one-minus-src`,operation:`add`}},sc.none={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`zero`,dstFactor:`zero`,operation:`add`}},sc[`normal-npm`]={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`}},sc[`add-npm`]={alpha:{srcFactor:`one`,dstFactor:`one`,operation:`add`},color:{srcFactor:`src-alpha`,dstFactor:`one`,operation:`add`}},sc[`screen-npm`]={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src`,operation:`add`}},sc.erase={alpha:{srcFactor:`zero`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`zero`,dstFactor:`one-minus-src`,operation:`add`}},sc.min={alpha:{srcFactor:`one`,dstFactor:`one`,operation:`min`},color:{srcFactor:`one`,dstFactor:`one`,operation:`min`}},sc.max={alpha:{srcFactor:`one`,dstFactor:`one`,operation:`max`},color:{srcFactor:`one`,dstFactor:`one`,operation:`max`}};var cc=class{constructor(){this.defaultState=new he,this.defaultState.blend=!0}contextChange(e){this.gpu=e}getColorTargets(e,t,n){let r=e.blend?sc[e.blendMode]||sc.normal:void 0,i=[];for(let e=0;e<t;e++)i[e]={format:n,writeMask:0,blend:r};return i}destroy(){this.gpu=null}};cc.extension={type:[m.WebGPUSystem],name:`state`};var lc={type:`image`,upload(e,t,n,r=0){let i=e.resource,a=(e.pixelWidth|0)*(e.pixelHeight|0),o=i.byteLength/a;n.device.queue.writeTexture({texture:t,origin:{x:0,y:0,z:r}},i,{offset:0,rowsPerImage:e.pixelHeight,bytesPerRow:e.pixelWidth*o},{width:e.pixelWidth,height:e.pixelHeight,depthOrArrayLayers:1})}},uc={"bc1-rgba-unorm":{blockBytes:8,blockWidth:4,blockHeight:4},"bc2-rgba-unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"bc3-rgba-unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"bc7-rgba-unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"etc1-rgb-unorm":{blockBytes:8,blockWidth:4,blockHeight:4},"etc2-rgba8unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"astc-4x4-unorm":{blockBytes:16,blockWidth:4,blockHeight:4}},dc={blockBytes:4,blockWidth:1,blockHeight:1},fc={type:`compressed`,upload(e,t,n,r=0){let i=e.pixelWidth,a=e.pixelHeight,o=uc[e.format]||dc;for(let s=0;s<e.resource.length;s++){let c=e.resource[s],l=Math.ceil(i/o.blockWidth)*o.blockBytes;n.device.queue.writeTexture({texture:t,mipLevel:s,origin:{x:0,y:0,z:r}},c,{offset:0,bytesPerRow:l},{width:Math.ceil(i/o.blockWidth)*o.blockWidth,height:Math.ceil(a/o.blockHeight)*o.blockHeight,depthOrArrayLayers:1}),i=Math.max(i>>1,1),a=Math.max(a>>1,1)}}},pc=[`right`,`left`,`top`,`bottom`,`front`,`back`];function mc(e){return{type:`cube`,upload(t,n,r){let i=t.faces;for(let t=0;t<pc.length;t++){let a=i[pc[t]];(e[a.uploadMethodId]||e.image).upload(a,n,r,t)}}}}var hc={type:`image`,upload(e,t,n,r=0){let i=e.resource;if(!i)return;if(globalThis.HTMLImageElement&&i instanceof HTMLImageElement){let t=b.get().createCanvas(i.width,i.height);t.getContext(`2d`).drawImage(i,0,0,i.width,i.height),e.resource=t,k(`ImageSource: Image element passed, converting to canvas and replacing resource.`)}let a=Math.min(t.width,e.resourceWidth||e.pixelWidth),o=Math.min(t.height,e.resourceHeight||e.pixelHeight),s=e.alphaMode===`premultiply-alpha-on-upload`;n.device.queue.copyExternalImageToTexture({source:i},{texture:t,origin:{x:0,y:0,z:r},premultipliedAlpha:s},{width:a,height:o})}},gc={type:`video`,upload(e,t,n,r){hc.upload(e,t,n,r)}},_c=class{constructor(e){this.device=e,this.sampler=e.createSampler({minFilter:`linear`}),this.pipelines={}}_getMipmapPipeline(e){let t=this.pipelines[e];return t||(this.mipmapShaderModule||(this.mipmapShaderModule=this.device.createShaderModule({code:`
                        var<private> pos : array<vec2<f32>, 3> = array<vec2<f32>, 3>(
                        vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 3.0), vec2<f32>(3.0, -1.0));

                        struct VertexOutput {
                        @builtin(position) position : vec4<f32>,
                        @location(0) texCoord : vec2<f32>,
                        };

                        @vertex
                        fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
                        var output : VertexOutput;
                        output.texCoord = pos[vertexIndex] * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5);
                        output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
                        return output;
                        }

                        @group(0) @binding(0) var imgSampler : sampler;
                        @group(0) @binding(1) var img : texture_2d<f32>;

                        @fragment
                        fn fragmentMain(@location(0) texCoord : vec2<f32>) -> @location(0) vec4<f32> {
                        return textureSample(img, imgSampler, texCoord);
                        }
                    `})),t=this.device.createRenderPipeline({layout:`auto`,vertex:{module:this.mipmapShaderModule,entryPoint:`vertexMain`},fragment:{module:this.mipmapShaderModule,entryPoint:`fragmentMain`,targets:[{format:e}]}}),this.pipelines[e]=t),t}generateMipmap(e){let t=this._getMipmapPipeline(e.format);if(e.dimension===`3d`||e.dimension===`1d`)throw Error(`Generating mipmaps for non-2d textures is currently unsupported!`);let n=e,r=e.depthOrArrayLayers||1,i=e.usage&GPUTextureUsage.RENDER_ATTACHMENT;if(!i){let t={size:{width:Math.ceil(e.width/2),height:Math.ceil(e.height/2),depthOrArrayLayers:r},format:e.format,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC|GPUTextureUsage.RENDER_ATTACHMENT,mipLevelCount:e.mipLevelCount-1};n=this.device.createTexture(t)}let a=this.device.createCommandEncoder({}),o=t.getBindGroupLayout(0);for(let s=0;s<r;++s){let r=e.createView({baseMipLevel:0,mipLevelCount:1,dimension:`2d`,baseArrayLayer:s,arrayLayerCount:1}),c=+!!i;for(let i=1;i<e.mipLevelCount;++i){let e=n.createView({baseMipLevel:c++,mipLevelCount:1,dimension:`2d`,baseArrayLayer:s,arrayLayerCount:1}),i=a.beginRenderPass({colorAttachments:[{view:e,storeOp:`store`,loadOp:`clear`,clearValue:{r:0,g:0,b:0,a:0}}]}),l=this.device.createBindGroup({layout:o,entries:[{binding:0,resource:this.sampler},{binding:1,resource:r}]});i.setPipeline(t),i.setBindGroup(0,l),i.draw(3,1,0,0),i.end(),r=e}}if(!i){let t={width:Math.ceil(e.width/2),height:Math.ceil(e.height/2),depthOrArrayLayers:r};for(let r=1;r<e.mipLevelCount;++r)a.copyTextureToTexture({texture:n,mipLevel:r-1},{texture:e,mipLevel:r},t),t.width=Math.ceil(t.width/2),t.height=Math.ceil(t.height/2)}return this.device.queue.submit([a.finish()]),i||n.destroy(),e}},vc=class{constructor(e){this.textureView=null,this.textureViews=Object.create(null),this.gpuTexture=e}destroy(){this.gpuTexture.destroy(),this.textureView=null,this.textureViews=null,this.gpuTexture=null}};function yc(e){return`${e.format||``}.${e.dimension||``}.${e.aspect||``}.${e.baseMipLevel||0}.${e.mipLevelCount||``}.${e.baseArrayLayer||0}.${e.arrayLayerCount||``}`}var bc=class e{constructor(t){this._gpuSamplers=Object.create(null),this._bindGroupHash=Object.create(null),this._renderer=t,t.gc.addCollection(this,`_bindGroupHash`,`hash`),this._managedTextures=new et({renderer:t,type:`resource`,onUnload:this.onSourceUnload.bind(this),name:`gpuTextureSource`});let n={image:hc,buffer:lc,video:gc,compressed:fc,...e.uploadExtensions};this._uploads={...n,cube:mc(n)}}get managedTextures(){return Object.values(this._managedTextures.items)}contextChange(e){this._gpu=e,this._managedTextures.removeAll(),this._gpuSamplers=Object.create(null),this._mipmapGenerator=null}initSource(e){return e._gpuData[this._renderer.uid]?.gpuTexture||this._initSource(e)}_initSource(e){if(e.autoGenerateMipmaps){let t=Math.max(e.pixelWidth,e.pixelHeight);e.mipLevelCount=Math.floor(Math.log2(t))+1}let t;e.sampleCount>1?(t=GPUTextureUsage.RENDER_ATTACHMENT,e.transient&&this._renderer.device.extensions.transientAttachment&&(t|=GPUTextureUsage.TRANSIENT_ATTACHMENT)):(t=GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,e.uploadMethodId!==`compressed`&&(t|=GPUTextureUsage.RENDER_ATTACHMENT,t|=GPUTextureUsage.COPY_SRC));let n=uc[e.format]||{blockBytes:4,blockWidth:1,blockHeight:1},r=Math.ceil(e.pixelWidth/n.blockWidth)*n.blockWidth,i=Math.ceil(e.pixelHeight/n.blockHeight)*n.blockHeight,a={label:e.label,size:{width:r,height:i,depthOrArrayLayers:e.arrayLayerCount},format:e.format,sampleCount:e.sampleCount,mipLevelCount:e.mipLevelCount,dimension:e.dimension,usage:t},o=this._gpu.device.createTexture(a);return e._gpuData[this._renderer.uid]=new vc(o),this._managedTextures.add(e)&&(e.on(`update`,this.onSourceUpdate,this),e.on(`resize`,this.onSourceResize,this),e.on(`updateMipmaps`,this.onUpdateMipmaps,this)),this.onSourceUpdate(e),o}onSourceUpdate(e){let t=this.getGpuSource(e);t&&(this._uploads[e.uploadMethodId]&&this._uploads[e.uploadMethodId].upload(e,t,this._gpu),e.autoGenerateMipmaps&&e.mipLevelCount>1&&this.onUpdateMipmaps(e))}onUpdateMipmaps(e){this._mipmapGenerator||(this._mipmapGenerator=new _c(this._gpu.device));let t=this.getGpuSource(e);this._mipmapGenerator.generateMipmap(t)}onSourceUnload(e){e.off(`update`,this.onSourceUpdate,this),e.off(`resize`,this.onSourceResize,this),e.off(`updateMipmaps`,this.onUpdateMipmaps,this)}onSourceResize(e){e._gcLastUsed=this._renderer.gc.now;let t=e._gpuData[this._renderer.uid],n=t?.gpuTexture;n?(n.width!==e.pixelWidth||n.height!==e.pixelHeight)&&(t.destroy(),this._bindGroupHash[e.uid]=null,e._gpuData[this._renderer.uid]=null,this.initSource(e)):this.initSource(e)}_initSampler(e){return this._gpuSamplers[e._resourceId]=this._gpu.device.createSampler(e),this._gpuSamplers[e._resourceId]}getGpuSampler(e){return this._gpuSamplers[e._resourceId]||this._initSampler(e)}getGpuSource(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]?.gpuTexture||this.initSource(e)}getTextureBindGroup(e){return this._bindGroupHash[e.uid]||this._createTextureBindGroup(e)}_createTextureBindGroup(e){let t=e.source;return this._bindGroupHash[e.uid]=new _({0:t,1:t.style,2:new C({uTextureMatrix:{type:`mat3x3<f32>`,value:e.textureMatrix.mapCoord}})}),this._bindGroupHash[e.uid]}getTextureView(e,t){var n;let r=e.source;r._gcLastUsed=this._renderer.gc.now;let i=r._gpuData[this._renderer.uid];i||(this.initSource(r),i=r._gpuData[this._renderer.uid]);let a=t?yc(t):0;return(n=i.textureViews)[a]||(n[a]=i.gpuTexture.createView({dimension:r.viewDimension,...t})),i.textureViews[a]}getTextureRenderTargetView(e,t=0,n=0,r){var i;let a=e.source;a._gcLastUsed=this._renderer.gc.now;let o=a._gpuData[this._renderer.uid];o||(this.initSource(a),o=a._gpuData[this._renderer.uid]);let s=n*(a.mipLevelCount||1)+t+1;return r&&(s=`${s}.${yc(r)}`),(i=o.textureViews)[s]||(i[s]=o.gpuTexture.createView({dimension:`2d`,baseMipLevel:t,mipLevelCount:1,baseArrayLayer:n,arrayLayerCount:1,...r})),o.textureViews[s]}generateCanvas(e){let t=this._renderer,n=t.gpu.device.createCommandEncoder(),r=b.get().createCanvas();r.width=e.source.pixelWidth,r.height=e.source.pixelHeight;let i=r.getContext(`webgpu`);return i.configure({device:t.gpu.device,usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC,format:b.get().getNavigator().gpu.getPreferredCanvasFormat(),alphaMode:`premultiplied`}),n.copyTextureToTexture({texture:t.texture.getGpuSource(e.source),origin:{x:0,y:0}},{texture:i.getCurrentTexture()},{width:r.width,height:r.height}),t.gpu.device.queue.submit([n.finish()]),r}getPixels(e){let t=this.generateCanvas(e),n=ne.getOptimalCanvasAndContext(t.width,t.height),r=n.context;r.drawImage(t,0,0);let{width:i,height:a}=t,o=r.getImageData(0,0,i,a),s=new Uint8ClampedArray(o.data.buffer);return ne.returnCanvasAndContext(n),{pixels:s,width:i,height:a}}destroy(){this._managedTextures.destroy();for(let e of Object.keys(this._bindGroupHash)){let t=Number(e);this._bindGroupHash[t]?.destroy()}this._renderer=null,this._gpu=null,this._mipmapGenerator=null,this._gpuSamplers=null,this._bindGroupHash=null}};bc.extension={type:[m.WebGPUSystem],name:`texture`},bc.uploadExtensions=Object.create(null);var xc=bc;r.handleByMap(m.TextureUploaderWebGPU,xc.uploadExtensions);var Sc=class{constructor(){this._maxTextures=0}contextChange(e){let t=new C({uTransformMatrix:{value:new A,type:`mat3x3<f32>`},uColor:{value:new Float32Array([1,1,1,1]),type:`vec4<f32>`},uRound:{value:0,type:`f32`}});this._maxTextures=e.limits.maxBatchableTextures;let n=Ge({name:`graphics`,bits:[We,Xe(this._maxTextures),ut,qe]});this.shader=new g({gpuProgram:n,resources:{localUniforms:t}})}execute(e,t){let n=t.context,r=n.customShader||this.shader,i=e.renderer,{batcher:a,instructions:o}=i.graphicsContext.getContextRenderData(n),s=i.encoder;s.setGeometry(a.geometry,r.gpuProgram);let c=i.globalUniforms.bindGroup;s.setBindGroup(0,c,r.gpuProgram);let l=i.renderPipes.uniformBatch.getUniformBindGroup(r.resources.localUniforms,!0);s.setBindGroup(2,l,r.gpuProgram);let u=o.instructions,d=null;for(let t=0;t<o.instructionSize;t++){let n=u[t];if(n.topology!==d&&(d=n.topology,s.setPipelineFromGeometryProgramAndState(a.geometry,r.gpuProgram,e.state,n.topology,r._overrides)),r.groups[1]=n.bindGroup,!n.gpuBindGroup){let e=n.textures;n.bindGroup=He(e.textures,e.count,this._maxTextures),n.gpuBindGroup=i.bindGroup.getBindGroup(n.bindGroup,r.gpuProgram,1)}s.setBindGroup(1,n.bindGroup,r.gpuProgram),s.renderPassEncoder.drawIndexed(n.size,1,n.start)}}destroy(){this.shader.destroy(),this.shader=null}};Sc.extension={type:[m.WebGPUPipesAdaptor],name:`graphics`};var Cc=class{init(){let e=Ge({name:`mesh`,bits:[it,st,qe]});this._shader=new g({gpuProgram:e,resources:{uTexture:O.EMPTY._source,uSampler:O.EMPTY._source.style,textureUniforms:{uTextureMatrix:{type:`mat3x3<f32>`,value:new A}}}})}execute(e,t){let n=e.renderer,r=t._shader;if(!r)r=this._shader,r.groups[2]=n.texture.getTextureBindGroup(t.texture);else if(!r.gpuProgram){k(`Mesh shader has no gpuProgram`,t.shader);return}let i=r.gpuProgram;if(i.autoAssignGlobalUniforms&&(r.groups[0]=n.globalUniforms.bindGroup),i.autoAssignLocalUniforms){let t=e.localUniforms;r.groups[1]=n.renderPipes.uniformBatch.getUniformBindGroup(t,!0)}n.encoder.draw({geometry:t._geometry,shader:r,state:t.state})}destroy(){this._shader.destroy(),this._shader=null}};Cc.extension={type:[m.WebGPUPipesAdaptor],name:`mesh`};var wc=D({WebGPURenderer:()=>Mc}),Tc=[...Oe,Bs,Ns,js,Ps,Os,xc,ac,oc,cc,ec,As,Fs,Es],Ec=[...Ee,Hs],Dc=[ra,Cc,Sc],Oc=[],kc=[],Ac=[],jc=[];r.handleByNamedList(m.WebGPUSystem,Oc),r.handleByNamedList(m.WebGPUPipes,kc),r.handleByNamedList(m.WebGPUPipesAdaptor,Ac),r.handleByNamedList(m.WebGPULoader,jc),r.add(...Tc,...Ec,...Dc);var Mc=class extends B{constructor(){let e={name:`webgpu`,type:te.WEBGPU,systems:Oc,renderPipes:kc,renderPipeAdaptors:Ac,loaders:jc};super(e)}},Nc=D({BitmapFont:()=>Pc}),Pc=class extends Hi{constructor(e,t){super();let{textures:n,data:r}=e;Object.keys(r.pages).forEach(e=>{let t=r.pages[parseInt(e,10)],i=n[t.id];this.pages.push({texture:i})}),Object.keys(r.chars).forEach(e=>{let t=r.chars[e],{frame:i,source:a,rotate:o}=n[t.page],c=d.transformRectCoords(t,i,o,new s),l=new O({frame:c,orig:new s(0,0,t.width,t.height),source:a,rotate:o});this.chars[e]={id:e.codePointAt(0),xOffset:t.xOffset,yOffset:t.yOffset,xAdvance:t.xAdvance,kerning:t.kerning??{},texture:l}}),this.baseRenderedFontSize=r.fontSize,this.baseMeasurementFontSize=r.fontSize,this.fontMetrics={ascent:0,descent:0,fontSize:r.fontSize},this.baseLineOffset=r.baseLineOffset,this.lineHeight=r.lineHeight,this.fontFamily=r.fontFamily,this.distanceField=r.distanceField??{type:`none`,range:0},this.url=t}destroy(){super.destroy();for(let e=0;e<this.pages.length;e++){let{texture:t}=this.pages[e];t.destroy(!0)}this.pages=null}static install(e){Zi.install(e)}static uninstall(e){Zi.uninstall(e)}};r.add(yt,bt);var Fc=[`ui`,`combat`,`player`,`env`],Ic=`ui.click,ui.back,ui.toggle,ui.slider,menu.start,ui.pause,ui.resume,levelup.open,levelup.ramp,levelup.pick,level.start,level.surface,boss.warn,boss.enter,summary.show,gun.fire,gun.hit,enemy.hit.small,enemy.hit.predator,enemy.hit.jelly,enemy.hit.shell,enemy.hit.ranged,enemy.hit.boss,enemy.leave.small,enemy.leave.predator,enemy.leave.jelly,enemy.leave.shell,enemy.leave.ranged,enemy.leave.boss,hit.crit,enemy.fire,enemy.charge,enemy.discharge,chain.zap,bomb.blast,puffer.counter,boss.attack,bullet.hurt,graze,player.hurt,player.pop,player.eat,player.absorb,stage.grow,mutation.gain,suction.on,rage.slam,rage.burst,rage.overload,rage.punish,health.low,player.slow,crab.launch,defeat.sting,vent.erupt,obstacle.break.crate,crate.warn,crate.drop,obstacle.break.coral,obstacle.break.net,obstacle.hit.wall,rain.press,foam.pop,mineral.hit`.split(`,`),Lc={fish:`small`,tuna:`small`,shrimp:`small`,shark:`predator`,dolphin:`predator`,whale:`predator`,octopus:`predator`,eel:`predator`,torpedo:`predator`,jelly:`jelly`,zapper:`jelly`,crab:`shell`,urchin:`shell`,starfish:`shell`,puffer:`shell`,bombfish:`shell`,fallcrate:`shell`,archer:`ranged`,pistol:`ranged`,angler:`ranged`};function Rc(e){return e===`boss`||e.startsWith(`boss-`)?`boss`:Lc[e]??`small`}var zc={crate:`obstacle.break.crate`,coral:`obstacle.break.coral`,net:`obstacle.break.net`,wall:`obstacle.break.coral`,tube:`obstacle.break.coral`},Bc=`obstacle.hit.wall`;function Vc(e){return`enemy.hit.${Rc(e)}`}function Hc(e){return`enemy.leave.${Rc(e)}`}var Uc=a(o(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):n.JSON5=r()})(e,(function(){function e(e,t){return t={exports:{}},e(t,t.exports),t.exports}var t=e(function(e){var t=e.exports=typeof window<`u`&&window.Math==Math?window:typeof self<`u`&&self.Math==Math?self:Function(`return this`)();typeof __g==`number`&&(__g=t)}),n=e(function(e){var t=e.exports={version:`2.6.5`};typeof __e==`number`&&(__e=t)});n.version;var r=function(e){return typeof e==`object`?e!==null:typeof e==`function`},i=function(e){if(!r(e))throw TypeError(e+` is not an object!`);return e},a=function(e){try{return!!e()}catch{return!0}},o=!a(function(){return Object.defineProperty({},"a",{get:function(){return 7}}).a!=7}),s=t.document,c=r(s)&&r(s.createElement),l=function(e){return c?s.createElement(e):{}},u=!o&&!a(function(){return Object.defineProperty(l(`div`),"a",{get:function(){return 7}}).a!=7}),d=function(e,t){if(!r(e))return e;var n,i;if(t&&typeof(n=e.toString)==`function`&&!r(i=n.call(e))||typeof(n=e.valueOf)==`function`&&!r(i=n.call(e))||!t&&typeof(n=e.toString)==`function`&&!r(i=n.call(e)))return i;throw TypeError(`Can't convert object to primitive value`)},f=Object.defineProperty,p={f:o?Object.defineProperty:function(e,t,n){if(i(e),t=d(t,!0),i(n),u)try{return f(e,t,n)}catch{}if(`get`in n||`set`in n)throw TypeError(`Accessors not supported!`);return`value`in n&&(e[t]=n.value),e}},m=function(e,t){return{enumerable:!(e&1),configurable:!(e&2),writable:!(e&4),value:t}},h=o?function(e,t,n){return p.f(e,t,m(1,n))}:function(e,t,n){return e[t]=n,e},g={}.hasOwnProperty,_=function(e,t){return g.call(e,t)},v=0,y=Math.random(),b=function(e){return`Symbol(${e===void 0?``:e})_${(++v+y).toString(36)}`},x=e(function(e){var r=`__core-js_shared__`,i=t[r]||(t[r]={});(e.exports=function(e,t){return i[e]||(i[e]=t===void 0?{}:t)})(`versions`,[]).push({version:n.version,mode:`global`,copyright:`© 2019 Denis Pushkarev (zloirock.ru)`})})(`native-function-to-string`,Function.toString),S=e(function(e){var r=b(`src`),i=`toString`,a=(``+x).split(i);n.inspectSource=function(e){return x.call(e)},(e.exports=function(e,n,i,o){var s=typeof i==`function`;s&&(_(i,`name`)||h(i,`name`,n)),e[n]!==i&&(s&&(_(i,r)||h(i,r,e[n]?``+e[n]:a.join(String(n)))),e===t?e[n]=i:o?e[n]?e[n]=i:h(e,n,i):(delete e[n],h(e,n,i)))})(Function.prototype,i,function(){return typeof this==`function`&&this[r]||x.call(this)})}),C=function(e){if(typeof e!=`function`)throw TypeError(e+` is not a function!`);return e},w=function(e,t,n){if(C(e),t===void 0)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,i){return e.call(t,n,r,i)}}return function(){return e.apply(t,arguments)}},T=`prototype`,E=function(e,r,i){var a=e&E.F,o=e&E.G,s=e&E.S,c=e&E.P,l=e&E.B,u=o?t:s?t[r]||(t[r]={}):(t[r]||{})[T],d=o?n:n[r]||(n[r]={}),f=d[T]||(d[T]={}),p,m,g,_;for(p in o&&(i=r),i)m=!a&&u&&u[p]!==void 0,g=(m?u:i)[p],_=l&&m?w(g,t):c&&typeof g==`function`?w(Function.call,g):g,u&&S(u,p,g,e&E.U),d[p]!=g&&h(d,p,_),c&&f[p]!=g&&(f[p]=g)};t.core=n,E.F=1,E.G=2,E.S=4,E.P=8,E.B=16,E.W=32,E.U=64,E.R=128;var D=E,ee=Math.ceil,te=Math.floor,ne=function(e){return isNaN(e=+e)?0:(e>0?te:ee)(e)},re=function(e){if(e==null)throw TypeError(`Can't call method on  `+e);return e},ie=function(e){return function(t,n){var r=String(re(t)),i=ne(n),a=r.length,o,s;return i<0||i>=a?e?``:void 0:(o=r.charCodeAt(i),o<55296||o>56319||i+1===a||(s=r.charCodeAt(i+1))<56320||s>57343?e?r.charAt(i):o:e?r.slice(i,i+2):(o-55296<<10)+(s-56320)+65536)}}(!1);D(D.P,`String`,{codePointAt:function(e){return ie(this,e)}}),n.String.codePointAt;var O=Math.max,k=Math.min,ae=function(e,t){return e=ne(e),e<0?O(e+t,0):k(e,t)},A=String.fromCharCode,oe=String.fromCodePoint;D(D.S+D.F*(!!oe&&oe.length!=1),`String`,{fromCodePoint:function(e){for(var t=arguments,n=[],r=arguments.length,i=0,a;r>i;){if(a=+t[i++],ae(a,1114111)!==a)throw RangeError(a+` is not a valid code point`);n.push(a<65536?A(a):A(((a-=65536)>>10)+55296,a%1024+56320))}return n.join(``)}}),n.String.fromCodePoint;var se={Space_Separator:/[\u1680\u2000-\u200A\u202F\u205F\u3000]/,ID_Start:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/,ID_Continue:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/},j={isSpaceSeparator:function(e){return typeof e==`string`&&se.Space_Separator.test(e)},isIdStartChar:function(e){return typeof e==`string`&&(e>=`a`&&e<=`z`||e>=`A`&&e<=`Z`||e===`$`||e===`_`||se.ID_Start.test(e))},isIdContinueChar:function(e){return typeof e==`string`&&(e>=`a`&&e<=`z`||e>=`A`&&e<=`Z`||e>=`0`&&e<=`9`||e===`$`||e===`_`||e===`‌`||e===`‍`||se.ID_Continue.test(e))},isDigit:function(e){return typeof e==`string`&&/[0-9]/.test(e)},isHexDigit:function(e){return typeof e==`string`&&/[0-9A-Fa-f]/.test(e)}},ce,le,M,ue,de,N,P,fe,pe,me=function(e,t){ce=String(e),le=`start`,M=[],ue=0,de=1,N=0,P=void 0,fe=void 0,pe=void 0;do P=ve(),Te[le]();while(P.type!==`eof`);return typeof t==`function`?he({"":pe},``,t):pe};function he(e,t,n){var r=e[t];if(typeof r==`object`&&r){if(Array.isArray(r))for(var i=0;i<r.length;i++){var a=String(i),o=he(r,a,n);o===void 0?delete r[a]:Object.defineProperty(r,a,{value:o,writable:!0,enumerable:!0,configurable:!0})}else for(var s in r){var c=he(r,s,n);c===void 0?delete r[s]:Object.defineProperty(r,s,{value:c,writable:!0,enumerable:!0,configurable:!0})}}return n.call(e,t,r)}var F,I,ge,_e,L;function ve(){for(F=`default`,I=``,ge=!1,_e=1;;){L=ye();var e=be[F]();if(e)return e}}function ye(){if(ce[ue])return String.fromCodePoint(ce.codePointAt(ue))}function R(){var e=ye();return e===`
`?(de++,N=0):e?N+=e.length:N++,e&&(ue+=e.length),e}var be={default:function(){switch(L){case`	`:case`\v`:case`\f`:case` `:case`\xA0`:case`﻿`:case`
`:case`\r`:case`\u2028`:case`\u2029`:R();return;case`/`:R(),F=`comment`;return;case void 0:return R(),z(`eof`)}if(j.isSpaceSeparator(L)){R();return}return be[le]()},comment:function(){switch(L){case`*`:R(),F=`multiLineComment`;return;case`/`:R(),F=`singleLineComment`;return}throw B(R())},multiLineComment:function(){switch(L){case`*`:R(),F=`multiLineCommentAsterisk`;return;case void 0:throw B(R())}R()},multiLineCommentAsterisk:function(){switch(L){case`*`:R();return;case`/`:R(),F=`default`;return;case void 0:throw B(R())}R(),F=`multiLineComment`},singleLineComment:function(){switch(L){case`
`:case`\r`:case`\u2028`:case`\u2029`:R(),F=`default`;return;case void 0:return R(),z(`eof`)}R()},value:function(){switch(L){case`{`:case`[`:return z(`punctuator`,R());case`n`:return R(),xe(`ull`),z(`null`,null);case`t`:return R(),xe(`rue`),z(`boolean`,!0);case`f`:return R(),xe(`alse`),z(`boolean`,!1);case`-`:case`+`:R()===`-`&&(_e=-1),F=`sign`;return;case`.`:I=R(),F=`decimalPointLeading`;return;case`0`:I=R(),F=`zero`;return;case`1`:case`2`:case`3`:case`4`:case`5`:case`6`:case`7`:case`8`:case`9`:I=R(),F=`decimalInteger`;return;case`I`:return R(),xe(`nfinity`),z(`numeric`,1/0);case`N`:return R(),xe(`aN`),z(`numeric`,NaN);case`"`:case`'`:ge=R()===`"`,I=``,F=`string`;return}throw B(R())},identifierNameStartEscape:function(){if(L!==`u`)throw B(R());R();var e=we();switch(e){case`$`:case`_`:break;default:if(!j.isIdStartChar(e))throw ke()}I+=e,F=`identifierName`},identifierName:function(){switch(L){case`$`:case`_`:case`‌`:case`‍`:I+=R();return;case`\\`:R(),F=`identifierNameEscape`;return}if(j.isIdContinueChar(L)){I+=R();return}return z(`identifier`,I)},identifierNameEscape:function(){if(L!==`u`)throw B(R());R();var e=we();switch(e){case`$`:case`_`:case`‌`:case`‍`:break;default:if(!j.isIdContinueChar(e))throw ke()}I+=e,F=`identifierName`},sign:function(){switch(L){case`.`:I=R(),F=`decimalPointLeading`;return;case`0`:I=R(),F=`zero`;return;case`1`:case`2`:case`3`:case`4`:case`5`:case`6`:case`7`:case`8`:case`9`:I=R(),F=`decimalInteger`;return;case`I`:return R(),xe(`nfinity`),z(`numeric`,_e*(1/0));case`N`:return R(),xe(`aN`),z(`numeric`,NaN)}throw B(R())},zero:function(){switch(L){case`.`:I+=R(),F=`decimalPoint`;return;case`e`:case`E`:I+=R(),F=`decimalExponent`;return;case`x`:case`X`:I+=R(),F=`hexadecimal`;return}return z(`numeric`,_e*0)},decimalInteger:function(){switch(L){case`.`:I+=R(),F=`decimalPoint`;return;case`e`:case`E`:I+=R(),F=`decimalExponent`;return}if(j.isDigit(L)){I+=R();return}return z(`numeric`,_e*Number(I))},decimalPointLeading:function(){if(j.isDigit(L)){I+=R(),F=`decimalFraction`;return}throw B(R())},decimalPoint:function(){switch(L){case`e`:case`E`:I+=R(),F=`decimalExponent`;return}if(j.isDigit(L)){I+=R(),F=`decimalFraction`;return}return z(`numeric`,_e*Number(I))},decimalFraction:function(){switch(L){case`e`:case`E`:I+=R(),F=`decimalExponent`;return}if(j.isDigit(L)){I+=R();return}return z(`numeric`,_e*Number(I))},decimalExponent:function(){switch(L){case`+`:case`-`:I+=R(),F=`decimalExponentSign`;return}if(j.isDigit(L)){I+=R(),F=`decimalExponentInteger`;return}throw B(R())},decimalExponentSign:function(){if(j.isDigit(L)){I+=R(),F=`decimalExponentInteger`;return}throw B(R())},decimalExponentInteger:function(){if(j.isDigit(L)){I+=R();return}return z(`numeric`,_e*Number(I))},hexadecimal:function(){if(j.isHexDigit(L)){I+=R(),F=`hexadecimalInteger`;return}throw B(R())},hexadecimalInteger:function(){if(j.isHexDigit(L)){I+=R();return}return z(`numeric`,_e*Number(I))},string:function(){switch(L){case`\\`:R(),I+=Se();return;case`"`:if(ge)return R(),z(`string`,I);I+=R();return;case`'`:if(!ge)return R(),z(`string`,I);I+=R();return;case`
`:case`\r`:throw B(R());case`\u2028`:case`\u2029`:Ae(L);break;case void 0:throw B(R())}I+=R()},start:function(){switch(L){case`{`:case`[`:return z(`punctuator`,R())}F=`value`},beforePropertyName:function(){switch(L){case`$`:case`_`:I=R(),F=`identifierName`;return;case`\\`:R(),F=`identifierNameStartEscape`;return;case`}`:return z(`punctuator`,R());case`"`:case`'`:ge=R()===`"`,F=`string`;return}if(j.isIdStartChar(L)){I+=R(),F=`identifierName`;return}throw B(R())},afterPropertyName:function(){if(L===`:`)return z(`punctuator`,R());throw B(R())},beforePropertyValue:function(){F=`value`},afterPropertyValue:function(){switch(L){case`,`:case`}`:return z(`punctuator`,R())}throw B(R())},beforeArrayValue:function(){if(L===`]`)return z(`punctuator`,R());F=`value`},afterArrayValue:function(){switch(L){case`,`:case`]`:return z(`punctuator`,R())}throw B(R())},end:function(){throw B(R())}};function z(e,t){return{type:e,value:t,line:de,column:N}}function xe(e){for(var t=0,n=e;t<n.length;t+=1){var r=n[t];if(ye()!==r)throw B(R());R()}}function Se(){switch(ye()){case`b`:return R(),`\b`;case`f`:return R(),`\f`;case`n`:return R(),`
`;case`r`:return R(),`\r`;case`t`:return R(),`	`;case`v`:return R(),`\v`;case`0`:if(R(),j.isDigit(ye()))throw B(R());return`\0`;case`x`:return R(),Ce();case`u`:return R(),we();case`
`:case`\u2028`:case`\u2029`:return R(),``;case`\r`:return R(),ye()===`
`&&R(),``;case`1`:case`2`:case`3`:case`4`:case`5`:case`6`:case`7`:case`8`:case`9`:throw B(R());case void 0:throw B(R())}return R()}function Ce(){var e=``,t=ye();if(!j.isHexDigit(t)||(e+=R(),t=ye(),!j.isHexDigit(t)))throw B(R());return e+=R(),String.fromCodePoint(parseInt(e,16))}function we(){for(var e=``,t=4;t-->0;){var n=ye();if(!j.isHexDigit(n))throw B(R());e+=R()}return String.fromCodePoint(parseInt(e,16))}var Te={start:function(){if(P.type===`eof`)throw Oe();Ee()},beforePropertyName:function(){switch(P.type){case`identifier`:case`string`:fe=P.value,le=`afterPropertyName`;return;case`punctuator`:De();return;case`eof`:throw Oe()}},afterPropertyName:function(){if(P.type===`eof`)throw Oe();le=`beforePropertyValue`},beforePropertyValue:function(){if(P.type===`eof`)throw Oe();Ee()},beforeArrayValue:function(){if(P.type===`eof`)throw Oe();if(P.type===`punctuator`&&P.value===`]`){De();return}Ee()},afterPropertyValue:function(){if(P.type===`eof`)throw Oe();switch(P.value){case`,`:le=`beforePropertyName`;return;case`}`:De()}},afterArrayValue:function(){if(P.type===`eof`)throw Oe();switch(P.value){case`,`:le=`beforeArrayValue`;return;case`]`:De()}},end:function(){}};function Ee(){var e;switch(P.type){case`punctuator`:switch(P.value){case`{`:e={};break;case`[`:e=[]}break;case`null`:case`boolean`:case`numeric`:case`string`:e=P.value}if(pe===void 0)pe=e;else{var t=M[M.length-1];Array.isArray(t)?t.push(e):Object.defineProperty(t,fe,{value:e,writable:!0,enumerable:!0,configurable:!0})}if(typeof e==`object`&&e)M.push(e),le=Array.isArray(e)?`beforeArrayValue`:`beforePropertyName`;else{var n=M[M.length-1];le=n==null?`end`:Array.isArray(n)?`afterArrayValue`:`afterPropertyValue`}}function De(){M.pop();var e=M[M.length-1];le=e==null?`end`:Array.isArray(e)?`afterArrayValue`:`afterPropertyValue`}function B(e){return Me(e===void 0?`JSON5: invalid end of input at `+de+`:`+N:`JSON5: invalid character '`+je(e)+`' at `+de+`:`+N)}function Oe(){return Me(`JSON5: invalid end of input at `+de+`:`+N)}function ke(){return N-=5,Me(`JSON5: invalid identifier character at `+de+`:`+N)}function Ae(e){console.warn(`JSON5: '`+je(e)+`' in strings is not valid ECMAScript; consider escaping`)}function je(e){var t={"'":`\\'`,'"':`\\"`,"\\":`\\\\`,"\b":`\\b`,"\f":`\\f`,"\n":`\\n`,"\r":`\\r`,"	":`\\t`,"\v":`\\v`,"\0":`\\0`,"\u2028":`\\u2028`,"\u2029":`\\u2029`};if(t[e])return t[e];if(e<` `){var n=e.charCodeAt(0).toString(16);return`\\x`+(`00`+n).substring(n.length)}return e}function Me(e){var t=SyntaxError(e);return t.lineNumber=de,t.columnNumber=N,t}return{parse:me,stringify:function(e,t,n){var r=[],i=``,a,o,s=``,c;if(typeof t==`object`&&t&&!Array.isArray(t)&&(n=t.space,c=t.quote,t=t.replacer),typeof t==`function`)o=t;else if(Array.isArray(t)){a=[];for(var l=0,u=t;l<u.length;l+=1){var d=u[l],f=void 0;typeof d==`string`?f=d:(typeof d==`number`||d instanceof String||d instanceof Number)&&(f=String(d)),f!==void 0&&a.indexOf(f)<0&&a.push(f)}}return n instanceof Number?n=Number(n):n instanceof String&&(n=String(n)),typeof n==`number`?n>0&&(n=Math.min(10,Math.floor(n)),s=`          `.substr(0,n)):typeof n==`string`&&(s=n.substr(0,10)),p(``,{"":e});function p(e,t){var n=t[e];switch(n!=null&&(typeof n.toJSON5==`function`?n=n.toJSON5(e):typeof n.toJSON==`function`&&(n=n.toJSON(e))),o&&(n=o.call(t,e,n)),n instanceof Number?n=Number(n):n instanceof String?n=String(n):n instanceof Boolean&&(n=n.valueOf()),n){case null:return`null`;case!0:return`true`;case!1:return`false`}if(typeof n==`string`)return m(n,!1);if(typeof n==`number`)return String(n);if(typeof n==`object`)return Array.isArray(n)?_(n):h(n)}function m(e){for(var t={"'":.1,'"':.2},n={"'":`\\'`,'"':`\\"`,"\\":`\\\\`,"\b":`\\b`,"\f":`\\f`,"\n":`\\n`,"\r":`\\r`,"	":`\\t`,"\v":`\\v`,"\0":`\\0`,"\u2028":`\\u2028`,"\u2029":`\\u2029`},r=``,i=0;i<e.length;i++){var a=e[i];switch(a){case`'`:case`"`:t[a]++,r+=a;continue;case`\0`:if(j.isDigit(e[i+1])){r+=`\\x00`;continue}}if(n[a]){r+=n[a];continue}if(a<` `){var o=a.charCodeAt(0).toString(16);r+=`\\x`+(`00`+o).substring(o.length);continue}r+=a}var s=c||Object.keys(t).reduce(function(e,n){return t[e]<t[n]?e:n});return r=r.replace(new RegExp(s,`g`),n[s]),s+r+s}function h(e){if(r.indexOf(e)>=0)throw TypeError(`Converting circular structure to JSON5`);r.push(e);var t=i;i+=s;for(var n=a||Object.keys(e),o=[],c=0,l=n;c<l.length;c+=1){var u=l[c],d=p(u,e);if(d!==void 0){var f=g(u)+`:`;s!==``&&(f+=` `),f+=d,o.push(f)}}var m;if(o.length===0)m=`{}`;else{var h;if(s===``)h=o.join(`,`),m=`{`+h+`}`;else{var _=`,
`+i;h=o.join(_),m=`{
`+i+h+`,
`+t+`}`}}return r.pop(),i=t,m}function g(e){if(e.length===0)return m(e,!0);var t=String.fromCodePoint(e.codePointAt(0));if(!j.isIdStartChar(t))return m(e,!0);for(var n=t.length;n<e.length;n++)if(!j.isIdContinueChar(String.fromCodePoint(e.codePointAt(n))))return m(e,!0);return e}function _(e){if(r.indexOf(e)>=0)throw TypeError(`Converting circular structure to JSON5`);r.push(e);var t=i;i+=s;for(var n=[],a=0;a<e.length;a++){var o=p(String(a),e);n.push(o===void 0?`null`:o)}var c;if(n.length===0)c=`[]`;else if(s===``)c=`[`+n.join(`,`)+`]`;else{var l=`,
`+i,u=n.join(l);c=`[
`+i+u+`,
`+t+`]`}return r.pop(),i=t,c}}}}))}))(),1),Wc=`{
  // =============================================================================================
  // 《冒泡大作战》机制数值配置
  // =============================================================================================
  //
  // 这个文件是给手工调参用的。改完存盘，页面会自动重新加载（Vite HMR），不需要重新构建。
  //
  // 格式是 **JSON5**（JSON 的超集），所以你可以：
  //   - 写 \`//\` 行注释和 \`/* */\` 块注释
  //   - 最后一项后面留逗号
  //   - 键名不加引号
  //   - 颜色直接写十六进制 \`0x9fe4ff\`（写 "#9fe4ff" 字符串也认，两种都行）
  //
  // 数值写错了会在浏览器控制台报错并指出是哪一项，不会静默失效。
  //
  // 每个数值都由 src/mechanisms.ts 读取。想让某个新机制可调，就在下面加一项，然后在代码里
  // 通过 \`mech.组名.项名\` 读取——不要直接写字面量，否则调参时改了这里也不生效。
  //
  // =============================================================================================

  // ---------------------------------------------------------------------------------------------
  // 积分
  // ---------------------------------------------------------------------------------------------
  //
  // 分数**常驻显示在屏幕左上角**（位置和样式在下面的 hud.score 里），每局从 0 开始，破裂/冲破海面时
  // 在结算卡上给最终分数（以及本次会话的最好成绩）。
  //
  // 键名就是分数事件名（见 src/score.ts 的 ScoreEvent）。**任何一项设成 0 就等于把这件事从积分里拿掉**，
  // 那条规则会连"记账"一起停掉，不会留下一串零——想让某件事不计分，改一个数字就行，不用改代码。
  "score": {
    // 把一条生物打跑（小泡泡子弹把它的血打空）得多少分。
    // 这是枪的回报：不设分的话，开枪只是把水变空，而这把枪本身没有任何代价可以与之相抵。
    "drivenOff": 25,

    // **吸收一个收集物**（普通泡泡）得多少分。
    //
    // 只有**不能靠吸收长大的类型**会拿到它。对吞噬/暴躁气泡来说，成长本身就是那份回报
    // （食物 = 体积 = 血量 + 判定框），再给一次分等于把同一件事付两遍；
    // 对普通气泡来说它不长（血量恒为 1，长大只换来更大的判定框和更慢的速度），所以吸收改成**给分**——
    // 否则"吃泡泡"这件事对它毫无意义，而那是它唯二的得分来源之一。
    "absorb": 5,

    // 吞掉一只生物（食物链反转）得多少分。
    // 反转是这个游戏的招牌动作、也是最危险的动作——气泡会因此变大变慢——所以它给分。
    "eaten": 40,

    // **击败 BOSS** 得多少分：整局最大的一笔，其它都是零钱。这也是唯一一个"赢"的事件——
    // 关卡不再因为距离走完而结束（见 config/levels.json5 的 boss），所以这笔钱就是通关的报酬。
    "boss": 1000,

    // 得分飘字：**在得分发生的位置**浮出一个 \`+25\`，向上飘、渐隐、到时间消失。
    //
    // 为什么位置是重点：左上角那个读数说的是"这局值多少"，说不出"刚刚这一下值多少"。
    // 把数字放在事情发生的地方就不用一句话解释——一条鱼向上逃走、原地留下一个 \`+25\`，这句话是完整的；
    // 同样一个 \`+25\` 出现在角落里，就只是记账。
    "popups": {
      // 一个飘字活多久，秒。
      "lifeSeconds": 0.5,

      // 这段时间里向上飘多少（设计像素，会按 designScale 缩放）。
      "risePx": 45,

      // 上升的**曲线**（时间进度取多少次方）：
      //   1   = 匀速（默认，和第一版一样）
      //   0.6 = 一开始窜得快、后面越来越慢 —— 街机飘字的经典手感
      //   1.6 = 先慢后快（像被吸上去）
      "riseEase": 0.6,

      // 字号（设计像素）。跟着 HUD 的缩放走，不跟世界缩放——一个要用来看的数字不能因为窗口宽了
      // 就变大（那是按钮踩过的坑）。
      "size": 16,

      // 颜色，以及整体基础不透明度（淡出是在这个值的基础上再乘，所以 0.8 就是"整体淡一点"）。
      "colour": 0xffd479,
      "alpha": 1,

      // 字重：'bold' 或 'normal'。字体族是全局的 \`text.fontFamily\`。
      "weight": "bold",

      // 数字前面加什么。默认的 "+" 让它读起来是"这一下赚了 50"，而不是"当前是 50"。
      // 想只显示数字就设成 ""。
      "prefix": "+",

      // 前百分之多少的时间保持全亮，剩下的时间渐隐（0.45 = 前 45% 全亮，后 55% 淡出）。
      // 立刻开始淡的话，眼睛还没看过去就已经半透明了。
      "fadeFrom": 0.45,

      // 渐隐的**曲线**（淡出进度的多少次方）：1 = 线性，2 = 先亮着、最后一下子没了，0.5 = 一开始就明显变淡。
      "fadeEase": 1,

      // 事件位置落在飘字的哪个点上（0 = 左/上边缘，0.5 = 正中，1 = 右/下边缘）。
      // 0.5/0.5 是以事件为中心，所以 "+500" 不会整体偏到右边去。想让数字从事件上方冒出来，
      // 把 anchorY 设成 1（字在事件之上）。
      "anchorX": 0.5,
      "anchorY": 0.5,

      // 同时在飞的飘字上限。这是**护栏**不是预算：真到上限了就退休最老的那个（玩家早读过它了），
      // 把新的放进来。
      "max": 24
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 触屏按钮：右侧竖排
  // ---------------------------------------------------------------------------------------------
  //
  // 所有动作按钮**竖向排在泳道最右边**，从下往上按"越常用越靠下"排：技能/吸附（最下面，拇指最容易够到），
  // 往上依次是其余动作（蓄力/爆破）。
  //
  // 为什么挤到一边：另一只手就空出来了。移动是"任意位置拖动"（见 movement.drag），所以屏幕左边和中间
  // 整片都是干净的操控区，手指不用绕开按钮也不会挡住气泡；按钮集中在一列，位置固定，闭着眼也能按。
  //
  // 每一项都是**设计像素**（会按 designScale 缩放），除了那个相对泳道宽度的上限。
  "touch": {
    // 按钮半径（设计像素）。
    "buttonRadius": 38,

    // 半径上限：相对泳道宽度的比例。窄泳道上按钮不能按设计像素长，否则会占掉太多水。
    "buttonMaxRadiusRatio": 0.13,

    // 离泳道右边缘的距离（设计像素）。留这一点，拇指压边时不会误触屏幕边缘手势。
    "rightInset": 12,

    // 最下面那个按钮离画布底边的距离（设计像素）。
    "bottomInset": 22,

    // 两个按钮之间的空隙（设计像素）。按**边到边**算，所以调大只会让整列变高，不会改变按钮大小。
    "buttonGap": 10
  },

  // ---------------------------------------------------------------------------------------------
  // 视差滚动：四层背景微粒，由远到近越来越快
  // ---------------------------------------------------------------------------------------------
  //
  // 海里的"海雪"原来只有一层，单一速度看起来就是**一堵会飘的点墙**，摄像机从旁边滑过去。四层四种速度才是
  // 空间：眼睛读的是**层与层之间的速度差**——那才是距离——场景里其它东西都不用动，"这片水有多深"就已经说出来了。
  //
  // 速度是关卡自身卷动的倍数（\`speedFactor\`），所以卷动更快的关卡四层一起更快，而**相对运动**（眼睛真正读的东西）
  // 不变。最近的一层是 1.0：它跟着世界走，其它三层靠它定位。
  //
  // 每一层自成一个 \`tileScreens\` 屏高的纵向带：微粒按世界米摆一次，层的位置 = \`scrolled × speedFactor\`，
  // 超出可见带的按带高**绕回**，所以有限的粒子能覆盖无限的上浮。
  "background": {
    // 一个 tile 有多少屏高。大于 1 表示比屏幕高，绕回时不会在边缘留下空档。
    "tileScreens": 1.6,
    // 所有层微粒数量的整体倍率（手机上粒子多了会糊，这一项是总闸）。
    "countScale": 1,
    "layers": [
      // 最远：几乎不动，最小最暗最稀。它是"远处的悬浮物"。
      { "speedFactor": 0.08, "count": 90, "sizeRatio": 0.0022, "colour": 0x9fc7e0, "alpha": 0.1 },
      // 远
      { "speedFactor": 0.22, "count": 70, "sizeRatio": 0.003, "colour": 0xc6e2f2, "alpha": 0.14 },
      // 中
      { "speedFactor": 0.5, "count": 46, "sizeRatio": 0.004, "colour": 0xdff6ff, "alpha": 0.2 },
      // 近：跟着世界走（1.0），最大最亮，也是最容易被误认成敌人/收集物的那一层，所以它最稀。
      { "speedFactor": 1, "count": 26, "sizeRatio": 0.0055, "colour": 0xffffff, "alpha": 0.26 }
    ]
  },

  // ---------------------------------------------------------------------------------------------
  // HUD 的位置
  // ---------------------------------------------------------------------------------------------
  //
  // 顶部这一条现在的构成：左边是分数，中间是 BOSS 血条（只在 BOSS 战期间出现），右上是齿轮。
  //
  // 关卡的地标标签（鱼群 / 气泡潮 / 爆发）已经删掉了：屏幕边上一列常驻的段落名读起来像菜单，
  // 不像水里的景象。
  //
  // **水位管和"距海面还有多少米"都删掉了**：关卡不再因为距离走完而结束，所以"离海面多远"不再是
  // 进度，只是一串一直变大的数字。现在唯一有意义的进度是 **BOSS 还剩多少血**。
  "hud": {

    // BOSS 血条：屏幕顶部居中，只在 BOSS 战期间出现。
    //
    // 它同时承担两件事：告诉玩家"还剩多少"，以及**告诉玩家这只东西有名字**——BOSS 和杂鱼的区别
    // 一半在血量，一半在"它有名字"。
    "bossBar": {
      // 血条离画布顶边的距离（设计像素）。
      //
      // 放在 88：给左上角的分数和上方的操作留出空带。突变块固定挂在血条下方（\`mutation.gauge.bossGap\`），
      // 所以这条带子的位置同时决定了突变块的位置。
      "y": 88,
      // 血条占**泳道**宽度的比例，以及高度（设计像素）。
      //
      // 按泳道而不是按画布算：桌面窗口里泳道会被限制在 900px 左右并居中，画布却可以宽得多——按画布算的
      // 血条会比泳道宽、还会两边各偏出去一截，直接压到泳道外面的水面上。同屏的资源条和突变条一直是按
      // 泳道对齐的，血条现在和它们一致。
      "widthRatio": 0.62,
      "height": 12,
      // 名字字号（设计像素）与它离血条中心的距离。
      "nameSize": 13,
      "nameOffset": 15,
      // 名字颜色、血条颜色、底槽颜色与底槽不透明度。
      "nameColour": 0xf0d7ff,
      "fillColour": 0xd05bff,
      "backColour": 0x0a0f1c,
      "backAlpha": 0.72,
      // 血条边框（让它在明亮的浅水里也看得见）。
      "borderColour": 0xffffff,
      "borderAlpha": 0.35
    },

    // 分数读数：常驻在屏幕左上角（进度条上方，调试读数上方）。
    //
    // 放左上是因为顶部那一条只剩这个角：中间是"距海面"，右上是齿轮，左边那条边从 y=110 开始是进度条。
    // 数值全部是**设计像素**（会按 designScale 缩放），颜色是 0xrrggbb。
    "score": {
      // 离泳道左边缘的距离。
      "x": 18,
      // 离画布顶边的距离。
      "y": 16,
      // 字号。
      "size": 15,
      // 颜色，以及整体不透明度。
      "colour": 0xffd479,
      "alpha": 0.95
    },

    // 玩家自己的血条：屏幕左下角，一条固定长度的进度条加一行「3/5」。
    //
    // 放在左下角是因为那里**一直是空的**：触屏按钮全在右下角一列（技能在最下，往上叠蓄力和爆破），
    // 拖动是"屏幕上任意位置起手"，所以血条放在左下角既不挡拇指的拖动区，也不和顶部那一堆读数抢位置。
    //
    // 长度是**固定**的，不随上限变化：两条路线的血量尺度差十倍（不长的路线恒定 5 点，吞噬路线能从 5 点
    // 长到 50 点），条只有比例在动、数字才是绝对值，这样"我掉了多少"和"我还有多少"各由一个通道回答。
    "healthBar": {
      // 离泳道左边缘、离画布底边的距离（设计像素）。
      "x": 18,
      "y": 26,

      // 条的长度，占泳道宽度的比例；以及高度（设计像素）。
      "widthRatio": 0.45,
      "height": 8,

      // 底槽的颜色与不透明度。
      "trackColour": 0x0a0f1c,
      "trackAlpha": 0.72,

      // 填充色与不透明度：正常时是青色系（和顶部读数一家），低于阈值时换成告警色。
      "fillColour": 0x6fe3ff,
      "fillAlpha": 1,
      "lowColour": 0xff6b6b,
      // 低于这个比例就用告警色。
      //
      // 它和 \`brokenScreen.threshold\`（50%，裂纹出现）**刻意不是同一个数**，但它也不是随便定的：它等于
      // \`brokenScreen.maxThreshold\`——**血条变红的那一刻，裂纹正好拉满**。所以红色读起来不是"又一个警告"，
      // 而是"已经到底了，再低画面不会更糟"。
      "lowThreshold": 0.3,

      // 边框：让它在明亮的浅水里也看得见，和 BOSS 血条同一套做法。
      "borderColour": 0xffffff,
      "borderAlpha": 0.35,

      // 「3/5」那行字的字号、颜色，以及它离条右端的距离（设计像素）。
      "labelSize": 12,
      "labelColour": 0x7fc4e8,
      "labelGap": 8
    },

    // 血量告急：**泳道两壁**向内长出裂纹，表示气泡即将破碎。
    //
    // **程序画的，不是素材。** 项目里所有非生物的东西（水体、视差、星点、HUD、爆炸环）都是 Graphics 画的，
    // 而裂纹天然是"沿边框"的形状：素材是固定像素密度的图，而屏幕从 390×844 到 1920×1080 都在跑，贴图要
    // 铺满就得拉伸，一拉伸就破坏"一个密度"那条规则。矢量没有这个问题。
    //
    // 颜色**不在这里**：它跟着当前路线/阶段的 \`hudColor\` 走（不长路线青→金→粉，沸腾路线随怒气），
    // 和气泡自己是同一个颜色。
    //
    // 强度是**静态**的，只随血量变，不脉动——画面里已经有水流、粒子、擦边慢动作和闪白，再加一个一直在动
    // 的东西就是噪音。
    "brokenScreen": {
      // **开始警告**的血量比例：低于它就出现裂纹。刻意比血条变红的阈值（\`healthBar.lowThreshold\`，30%）早，
      // 因为这两件事说的是**不同的**东西：裂纹是"快没血了，注意"，血条变红是"已经到最危险了"。
      //
      // 以前两者同值，规则是"条变红和屏幕开始裂说的是同一件事"。分开之后那条规则换成了另一条同样能读出来的：
      // **血条变红的那一刻，裂纹正好到最多**（见 \`maxThreshold\`）——所以红色不是另一个警告，是"已经到底了"。
      "threshold": 0.5,

      // **裂纹拉满**的血量比例：降到它就到达 \`crackCountDeep\` / \`alphaDeep\`，再低不再增加。
      //
      // 插值区间是 [maxThreshold, threshold]，也就是 30%～50% 这一段。低于 30% 之后画面**不再变化**——
      // 那是故意的：剩下的 30% 血里玩家要能看清自己在哪，而不是让一个越来越花的屏幕把最后一口气也拿走。
      "maxThreshold": 0.3,

      // 裂纹最多向内伸进多少，相对**泳道宽度**的比例。
      //
      // 相对泳道而不是画布：桌面窗口里泳道只有中间那一条（上限 900px），按画布算的裂纹会长到泳道外面的
      // 水面上——那是气泡碰不到的地方。手机上前两者等宽，所以按画布算看起来一直是对的。
      "reachRatio": 0.12,

      // 刚到 \`threshold\`（50%）时 / 降到 \`maxThreshold\`（30%）时的裂纹条数。介于两者之间按强度插值。
      "crackCountNear": 18,
      "crackCountDeep": 36,

      // 每条主裂纹分叉的概率。
      "branchChance": 1,

      // **分叉从哪里分出去**：主裂纹走完多少比例的位置。0 = 贴着墙那端，1 = 尖端。
      //
      // 从**尖端**分（原来的做法）整条读起来像"一条线末端裂开了"，而不像"一根裂纹分了一道岔"——
      // 分叉的根部和主裂纹的尖端共用同一个点，两根线在辉光里糊成一块。从六成处分才像真的裂纹。
      "branchAtRatio": 0.6,

      // 分叉相对主裂纹的长度比例。
      //
      // 原来是 0.45，而 \`reach\` 本身还要乘 \`(0.35 + 0.65 × 强度)\`，所以满强度下分叉只有约 19px、
      // 还切成 5 段（每段 4px），外面裹一层 3 倍宽的辉光——那个尺寸读起来是"这根裂纹变粗了"。
      "branchLengthRatio": 0.75,

      // 分叉张开的**最大**角度（弧度）。0.96 ≈ 55°。
      //
      // 角度大小**不是均匀随机**的：先随机一个左右，大小取最大值的 75%～100%。
      // 均匀随机的话每五个分叉就有一个贴着主裂纹走（小于 11°），读起来仍然像"这根变粗了"——
      // 而这次修的正是这件事，所以宁可牺牲一点自然感，也不让分叉白画。
      "branchAngleRadians": 0.96,

      // 一条裂纹由几段折线组成、每段长度的随机浮动（比例），以及每段最多转多少弧度。
      //
      // 段数和转角一起决定"像不像裂纹"：段少而转角大的时候，画出来是**折线**（像电路板走线），
      // 而不是一条裂开的口子。段多、每段只转一点，才读得出"裂痕"。
      "segmentsPerCrack": 6,
      "segmentJitter": 0.35,
      "segmentTurn": 0.7,

      // 线宽（设计像素），以及外发光的线宽倍数与不透明度比例。
      "width": 2.2,
      "glowWidthRatio": 3,
      "glowAlphaRatio": 0.35,

      // 不透明度：刚到 \`threshold\`（50%）时几乎看不见，降到 \`maxThreshold\`（30%）时最重。
      "alphaNear": 0.18,
      "alphaDeep": 0.85,

      // 随机种子。0 = 每次进入危险状态重掷（裂纹形状每局不同）；非 0 时形状固定，便于截图对比。
      // 随机种子。0 = 每次进入危险状态重掷（裂纹形状每局不同）；非 0 时形状固定，便于截图对比。
      "seed": 0,

      // ---------------------------------------------------------------------------------------------
      // 四边的渐变（和上面的裂纹是两件事）
      // ---------------------------------------------------------------------------------------------
      //
      // 裂纹说的是"**哪里**裂了"（泳道两壁），这一层说的是"**整个画面在逼近**"：四条边各有一道向中心
      // 淡出的半透明蓝，并且按固定频率闪动。
      //
      // **它也在泳道里**：上下两条横跨泳道的宽度，左右两条就长在泳道两壁上。泳道外面的水是气泡碰不到的
      // 地方，在那儿画警告是在警告一件不存在的事——这个坑 BOSS 血条、进度图、裂纹各踩过一次了。
      //
      // **颜色固定蓝，不跟路线走**——裂纹跟路线（和气泡同色），这一层是屏幕级的压迫感。两张不同的嘴说
      // 同一句话会互相抵消。
      "vignette": {
        // 颜色，以及最深处的不透明度。
        //
        // 0.55 而不是 0.3：这个数乘了两次（强度、闪动）才到画面上，而且线性渐变里**大部分区域比最深处淡
        // 得多**——0.3 的峰值实测在满强度时也只是一层若有若无的雾。
        "colour": 0x4aa8ff,
        "alpha": 0.55,

        // 每条边向中心延伸多少：横向的两条按**泳道宽度**算，纵向的两条按屏幕高度算。各按自己的轴而不是
        // 统一按某个基准，四条边的观感才一样。
        "reachRatio": 0.08,

        // 闪动频率（每秒几次）与闪动深度。
        //
        // 深度 0 = 不闪（恒亮），1 = 从全灭到最亮。默认留 0.45 的底，让它在闪的同时不至于完全消失：
        // "看不见"的那几帧会被读成"危机解除了"，而那是这个效果最不能撒的谎。
        "pulseHz": 1.4,
        "pulseDepth": 0.45
      }
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 字体
  // ---------------------------------------------------------------------------------------------
  //
  // 为什么字体要放在配置文件里，而不是写死在代码里：
  //
  // Pixi 画文字时，是用**首选字体**去量行高和基线的（它拿 "|ÉqÅM" 这几个拉丁字母去量），
  // 但画面上的汉字其实是由**回退字体**画的。如果首选字体是不含汉字的等宽字体（Consolas 之类），
  // 量出来的 ascent 就比汉字实际占的高度小，汉字顶部会超出 Pixi 给这段文字开的那块画布而被裁掉——
  // 看起来就是"开阔水域"只显示了下面一半，笔画多的字只剩底部几笔。
  //
  // 所以**含汉字的字体必须排在最前面**：量高度的是它，画汉字的也是它，两边就对得上。
  // 后面几个是给没有微软雅黑的机器（macOS / 安卓 / Linux）兜底的，可以按口味换。
  "text": {
    "fontFamily": "Microsoft YaHei, PingFang SC, Hiragino Sans GB, Noto Sans SC, sans-serif",
  },

  // ---------------------------------------------------------------------------------------------
  // 气泡成长阶段
  // ---------------------------------------------------------------------------------------------
  //
  // 气泡的大小现在是三个"阶段"。开局是阶段 1，吸收够一定数量的泡泡后长成阶段 2、阶段 3。
  //
  // 阶段影响移动速度：阶段越大越慢。这是设计的核心张力——**吃得越多，越难躲**。
  // 所以"要不要继续吃"是一个真实的取舍，而不是无脑越大越好。
  //
  // 注意：阶段不改变气泡的视觉大小（那由体积 volume 决定，仍然是逐颗累加的）。
  // 阶段只负责"速度档位"和"外观等级"这两件事。
  "stages": {
    // 每个阶段的移动速度倍率。数组长度 = 阶段数量，第 0 项是阶段 1。
    //
    // 现在是 1.00 → 0.80 → 0.64，也就是每一级乘 0.8（阶段2 = 阶段1 的 80%，阶段3 = 阶段2 的 80%）。
    // 想改成别的曲线就直接改这三个数，不必再是 0.8 的等比。
    "speedMultiplier": [1.0, 0.8, 0.64],

    // 速度倍率的下限。留一道保险：以后阶段变多、或者你把上面的值调得更狠时，
    // 气泡不会慢到无法躲避。调成 1.0 就等于关掉这个保险。
    "minSpeedMultiplier": 0.45,

    // 从阶段 1 长到阶段 2 需要吸收的泡泡数量。
    "absorbToStage2": 12,

    // 从阶段 2 长到阶段 3 需要吸收的泡泡数量（是"再吸收这么多"，不是累计）。
    "absorbToStage3": 20,

    // 长到新阶段时的短暂无敌时间（秒）。给玩家一点缓冲，否则刚变大就被撞死，
    // 手感上会觉得是游戏在惩罚他。
    "growInvulnerableSeconds": 0.6,

    // ---------------------------------------------------------------------------------------------
    // 每个阶段的外观
    // ---------------------------------------------------------------------------------------------
    //
    // 变强必须**看得见**，否则玩家不知道自己现在什么速度档，也就没法做"还要不要继续吃"的决策。
    // 这里有两套独立的视觉信号，故意各管一件事：
    //
    //   "radius" —— 大小。阶段越高越大，一眼看出"我现在很大"
    //   "外观色" —— 色相。阶段越高色相越暖，一眼看出"我是哪个阶段"
    //
    // 为什么不用同一套：体积（volume）已经在**连续地**改变大小了（每吃一颗都大一点），所以光看大小
    // 分不出"刚升到阶段2"和"在阶段2又吃了五颗"。颜色是离散的，它才能回答"我在第几阶段"。
    //
    // 每个阶段是一个对象，所有外观数值都在里面，改一个阶段不用在五个平行数组之间数下标。
    // 加阶段就往数组末尾再塞一个对象；少于阶段数时，最后一个会被复用。
    //
    // 想彻底换个观感，先改 "rim"（色相的主要载体，最显眼），再改 "glow"（控制内部亮度），
    // "inner" 只负责"亮"，基本不用动。
    "appearance": [
      {
        // 视觉半径倍率，乘在体积算出来的半径之上。**同时影响判定**——画多大就吃多大。
        // 想让大小只跟体积走就全部设成 1.0。
        "radius": 1.0,

        // 内部填充色。**接近白色即可**，只带一点色相。
        // 原因：只有 innerAlpha 这么低的不透明度（这样水才能透过去，气泡才像气泡），而内部还叠着
        // glow 和内高光两层半透明。中等亮度的色叠完之后中心反而更暗，看起来比低阶段还暗。
        // 色相交给 rim 和 glow，这里只负责"亮"。
        "inner": 0xf2fdff,
        "innerAlpha": 0.12,

        // 轮廓描线色。**这是色相的主要载体**：高饱和度、接近不透明，在深色水里勾出轮廓，
        // 也是玩家余光里分辨阶段的主要依据。想换颜色先改这一项。
        "rim": 0xd8fbff,
        "rimAlpha": 0.95,
        "rimWidthRatio": 0.16,

        // 光晕色。**要亮，不要饱和**——它以大圆压在气泡内部之上（这是"发光"的做法），
        // 亮度直接决定气泡内部多亮。
        //
        // 只画一圈（1.18R），不再有 1.55R 的外圈。理由不是好看：外圈比真正的碰撞半径大 55%，
        // 玩家会把它的边缘当成自己的边界，想擦边的时候按它估距离就会估错。内圈这 18% 的溢出在深色水里
        // 读作高光而不是轮廓，留着。
        "glow": 0x9beeff,
        "glowInnerAlpha": 0.22,
        "glowInnerRadiusRatio": 1.18,

        // 从阶段 2 起，轮廓内侧多一圈细环。
        // 这是**形状线索**，不是色相线索：手机上白天看，暖金和暖粉够接近到会混，但一圈和两圈不会混，
        // 而且这个线索在余光里就有效——玩家是在看鱼，不是在看气泡。
        "innerRing": false,
        "innerRingAlpha": 0.5,
        "innerRingWidthRatio": 0.055,

        // 内高光（偏左上，模拟光线）和镜面高光点的颜色与不透明度。
        "sheen": 0xeafcff,
        "sheenAlpha": 0.13,
        "specular": 0xffffff,
        "specularAlpha": 0.8,

        // HUD 上阶段标签用的色。和 rim 同色系但不是同一个值：
        // 这个要**在深色 HUD 上**看得清，rim 要**在深色水里**看得清。两者背景不同，不能混用。
        "hudColor": 0x9fe4ff,

        // 阶段的中文名，显示在 HUD 上。
        "name": "幼泡"
      },
      {
        "radius": 1.32,
        "inner": 0xfffaf0,
        "innerAlpha": 0.12,
        "rim": 0xffcf6b,
        "rimAlpha": 0.95,
        "rimWidthRatio": 0.16,
        "glow": 0xffd9a0,
        "glowInnerAlpha": 0.22,
        "glowInnerRadiusRatio": 1.18,
        "innerRing": true,
        "innerRingAlpha": 0.5,
        "innerRingWidthRatio": 0.055,
        "sheen": 0xeafcff,
        "sheenAlpha": 0.13,
        "specular": 0xffffff,
        "specularAlpha": 0.8,
        "hudColor": 0xffd479,
        "name": "成泡"
      },
      {
        "radius": 1.72,
        "inner": 0xfff2f8,
        "innerAlpha": 0.12,
        "rim": 0xff8fbe,
        "rimAlpha": 0.95,
        "rimWidthRatio": 0.16,
        "glow": 0xffb4d4,
        "glowInnerAlpha": 0.22,
        "glowInnerRadiusRatio": 1.18,
        "innerRing": true,
        "innerRingAlpha": 0.5,
        "innerRingWidthRatio": 0.055,
        "sheen": 0xeafcff,
        "sheenAlpha": 0.13,
        "specular": 0xffffff,
        "specularAlpha": 0.8,
        "hudColor": 0xff9ec4,
        "name": "巨泡"
      }
    ]
  },

  // ---------------------------------------------------------------------------------------------
  // 体积与血量
  // ---------------------------------------------------------------------------------------------
  //
  // 体积 volume 是逐颗累加的，它决定两件事：能不能吃下某个泡泡（大的吃小的），以及能挨几下打。
  // 血量是固定次数，不是按体积算——这样"变大"不会让每次受击变得更容易，只会让你更能挨。
  "volume": {
    // 体积上限。到了就不再长大。
    //
    // 原来是 3.2，那个值是在**还没有食物链**的时候定的：当时体积只影响外观、血量和吃泡泡的口径，
    // 封在 3.2 只是防止气泡变成一堵墙。加了吞噬阶梯之后它变成了一个**设计冲突**——
    // 阶梯要 2.2 / 4.0 / 6.0 / 8.5 才能吃到鱼 / 水母 / 螃蟹 / 巨型，
    // 3.2 的上限**让大半个食物链永远够不到**，规格里的"巨物碾压"和"最终以巨大体积冲出海面"都是空话。
    //
    // 10 而不是 8.5：留一点余量，让最后一档能真正吃满而不是卡在阈值上。
    // 调小它就等于砍掉食物链的后半段。
    "max": 10.0,

    // ---------------------------------------------------------------------------------------------
    // 血量比例 → 体积的四档（**只对吞噬路线**）
    // ---------------------------------------------------------------------------------------------
    //
    // 体积不再是吃出来的，而是**血量的表现**：满血最大，快死了最小。
    //
    // 四档而不是连续映射，是为了让它**稳定**——判定框在战斗中途突然变小，会让"贴多近能吃"这个刚学会的
    // 判断当场失效，而那是这个游戏里最贵的一种困惑。所以它只在两个时刻重算：**关卡开始时**，以及
    // **选下吞噬路线的那一刻**。
    //
    // \`minRatio\` 是这一档的下界（含），按从低到高排。最小的一档要**明显**小（2 而不是 5）："我快碎了"
    // 这件事应该同时被三样东西说出来——血条、屏幕裂纹、以及一颗小到能钻过去的气泡。
    //
    // 血是**跨关继承**的，所以这几档真的会动：带着 40% 血进下一关，气泡就真的是一颗小气泡。
    "healthBands": [
      { "minRatio": 0.0, "volume": 2 },
      { "minRatio": 0.3, "volume": 5 },
      { "minRatio": 0.5, "volume": 8 },
      { "minRatio": 0.8, "volume": 10 }
    ],

    // 吃掉一个泡泡回多少血：**每一点体积**换多少点血。
    //
    // 10 不是随便定的——血量上限 100 除以体积上限 10。它就是旧经济里"体积"与"挨几下"之间那个换算的
    // 等价物，只是现在它换的是血：一个中等泡泡（体积 1）回 10 点，一个大的（体积 4）回 40。
    "healthPerVolume": 10,

    // 气泡的视觉半径，相对泳道宽度的比例（在体积 = 1.0 时）。
    "laneRatio": 0.0425
  },

  // ---------------------------------------------------------------------------------------------
  // 不长的那些路线的血量
  // ---------------------------------------------------------------------------------------------
  //
  // 上面那套"体积 = 血量"只归**吞噬路线**了。没选吞噬的形态（沸腾，以及还没选路线的开局）
  // 气泡从头到尾一样大，血量改由这里的一套独立数值承担。
  //
  // 为什么不共用一套：体积那套的问题不是它错了，而是它**看不见**——开局 1.0 到满 10.0，血量涨了 10 倍，
  // 视觉半径才涨 2.6 倍，玩家从气泡大小里读不出"我还能挨几下"。拆开之后血量有了自己的条。
  "health": {
    // 开局的血量上限。
    //
    // **100 而不是 5，这个数是养成的地基。** 血量 5 的时候，敌人伤害只能是 1/2/5 这种整数，防御也无处
    // 可堆（−8% 作用在 1 点上等于 0.92）——小数血量和整数伤害挤在一起，RPG 那套成长没有任何空间。
    // 100 让"敌人伤害 20、防御 +2"这种数字说得通。
    "start": 100,

    // 被动回复：每秒回多少点血。**三条路线共用这一个值**，只在 \`playing\` 里生效
    // （暂停、选卡、出生演出、破裂动画、爬升、结算都不回）。
    //
    // 攒够一秒才跳 1 点，不是每帧渗入：伤害、修复、防御全是整数，血条上的 \`87/100\` 也要能心算。
    // 没有每关上限，也不会超过 \`healthMax\`。关卡中途的回血**不会**让吞噬路线的气泡变大——
    // 体积仍然只在关卡开始和选路线时按血量重算（见 \`volume.healthBands\`）。
    "regenPerSecond": 1,

    // 「修复血条」这张卡每级的回复量。
    "healPerPick": 20,

    // 「血上限」这张卡每级的增量。
    //
    // 没有封顶：和其它数值卡一样可以一路叠。
    "maxPerPick": 20,

    // 一次伤害的保底比例：无论防御多高，至少扣 \`伤害 × 这个比例\`。
    //
    // 为什么不是"至少扣 1 点"：在 100 制下那几乎等于没有保底——20 伤害的鱼打一个 30 防御的玩家，
    // 每下掉 1 点，等于无敌。0.1 的意思是"**防御最多吃掉九成**"。
    "minDamageRatio": 0.1
  },

  // ---------------------------------------------------------------------------------------------
  // 移动手感
  // ---------------------------------------------------------------------------------------------
  "movement": {
    // 键盘横穿整个泳道需要几秒。这个数**越小越快**。
    //
    // 这一项现在只管键盘。触屏是拖动（见下面 drag 段），拖动距离和手指 1:1，不吃这个速度。
    "keyboardCrossingSeconds": 2.0,

    // 纵向速度相对横向的倍率。1.0 = 两个方向一样快。
    // 大于 1 让爬升更快，因为关卡是纵向的，纵向不该是较慢的那一轴。
    "verticalSpeedScale": 1.35,

    // ---------------------------------------------------------------------------------------------
    // 触屏拖动（手机端唯一的移动方式）
    // ---------------------------------------------------------------------------------------------
    //
    // 屏幕**任意位置**按下并拖动，气泡就按手指移动的方向和距离移动同样的距离；松手即停，
    // 没有惯性、没有加速，也不会把气泡吸附到手指下面。
    //
    // 关键是"相对位移"：手指在屏幕上移动 30px，气泡就在**自己当前位置**上移动 30px，
    // 而不是被挪到手指所在的位置。所以手指可以按在离气泡很远的空白水面上，
    // 一边看着气泡一边操作，手指不会挡住它。
    //
    // "松手即停"同样来自这个模型：位移只发生在手指移动的那几帧里，手指不动就没有位移，
    // 松手更没有，气泡于是留在原地。键盘那一套的"松手滑行"在这里不存在。
    "drag": {
      // 位移倍率。1 = 手指移动多少，气泡就移动多少（1:1，设计要的就是这个）。
      // 想让气泡比手指慢一点、更好微调，调到 0.6~0.8；想让它更跟手（更快），调大于 1。
      "sensitivity": 1,

      // 成长阶段 / 吸附 / 减速 这些"速度惩罚"要不要也算进拖动距离里。
      //
      // false（默认）= 严格 1:1：气泡多大、是不是开着吸力场，手指移动多少它就移动多少。
      // true = 把那几个倍率乘到位移上（大泡泡、开吸力时同样一段手指位移走得少）。代价是不再严格
      // 1:1，好处是"越大越难躲"这条核心张力在手机上仍然感受得到。
      "penaltiesApply": false
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 收集物（可吸收的泡泡）
  // ---------------------------------------------------------------------------------------------
  //
  // 参考物是**关卡的卷轴速度**，不是玩家速度：世界自己在动，所以"这个东西看起来多快"是关卡的属性。
  "collectables": {
    // 泡泡自己上浮的速度，相对卷轴速度的倍率区间。
    //
    // 真实世界里泡泡越大上浮越快（浮力随体积增长，阻力只随截面积增长），所以这里也是越大越快。
    // 玩家看到的是两者的差：\`卷轴速度 - 它自己的上浮速度\`。
    // 于是小泡泡（0.15）以 0.85 倍卷轴速度往下掉，特别大的（1.6）反而会超过卷轴往上爬。
    // 这不需要任何 UI：往下漂的是能吃的，往上跑的是吃不了的。
    "riseMin": 0.15,
    "riseMax": 1.6,

    // 上浮速度随体积增长的曲线指数。1.0 = 线性。
    "riseSpeedExponent": 1.0,

    // 摆动幅度区间（小泡泡抖，大泡泡稳）。纯装饰。
    "wobbleMin": 0.05,
    "wobbleMax": 0.3
  },

  // ---------------------------------------------------------------------------------------------
  // 危险物
  // ---------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------
  // 冲锋（弹幕的第一种来源：撞过来）
  // ---------------------------------------------------------------------------------------------
  //
  // 表里的生物一旦进入自己的 \`triggerMeters\`，就会**蓄势**（把将要走的曲线画给你看），然后沿着这条
  // **固定曲线**一头撞过来。曲线在蓄势开始的那一刻就定死了（瞄准的是"那一刻的你"），所以躲法只有一个：
  // 蓄势期间**挪开**。这是弹幕游戏的通行做法，也是它公平的原因——玩家永远有机会，只是必须动。
  //
  // 为什么是曲线而不是直线：直线冲锋的躲法是"往旁边站"，看一眼就够了；弯过来的东西必须看它**弯向哪边**，
  // 于是"往哪躲"从条件反射变成一次判断。\`bowRatio\` 就是这个弯曲程度。
  //
  // **每种生物一行**（和 \`enemyBullets.shooters\` 一样的约定）：不在表里的生物就是不冲锋，
  // 而且每种可以有自己的手感——这正是水母存在的理由：它是**从侧面**来的冲锋，和鱼的俯冲是两个方向。
  "charges": {
    /**
     * 每种会冲锋的生物一行。
     */
    "chargers": {
      // 小鱼：俯冲。追猎者的直线答案，弯一点点让你必须读方向。
      "fish": {
      // 进入这个距离（米）就开始蓄势。太大 = 老远就冲过来；太小 = 贴脸才冲、没有反应时间。
      // 参考：鱼的感知半径是 150m 起（随玩家体积增长）。
      "triggerMeters": 300,

      // 蓄势多久（秒）。**这是玩家的反应窗口**，也是这个机制公平性的全部：太短 = 躲不掉，
      // 太长 = 每次都被躲掉、冲锋变成装饰。
      "telegraphSeconds": 0.75,

      // 从起点冲到目标点用多久（秒）。
      "travelSeconds": 0.55,

      // 曲线弯曲程度，相对冲锋距离的比例。0 = 直线；0.3 大约是"绕一个身位"。
      // 符号按生物在玩家的哪一侧决定，所以两边的鱼会弯向不同方向。
      "bowRatio": 0.3,

      // 冲完一次要等多久才能再冲（秒）。这是"不断躲避"的节奏旋钮。
      "cooldownSeconds": 2.2
    },

    // 水母：**从侧面横着冲进来**。
    //
    // 它的移动逻辑是"漂"，本来没有追猎能力；给它 'side' 冲锋之后它变成一个会绕到你侧面再横扫过来的东西，
    // 和鱼的俯冲需要不同的躲法（鱼是往下躲，水母是往另一边横移）。所以它比鱼软（见 hazards.health.jelly = 2）：
    // 更难躲的那个，代价是更好打跑。
    "jelly": {
      "triggerMeters": 320,
      // 蓄势比鱼长一点：它的弯很大，得多给一点时间让人读出"它要绕哪边"。
      "telegraphSeconds": 0.95,
      "travelSeconds": 0.6,
      // 弯得厉害：从它**当前所在的位置**甩出一条大弧，再横扫进来。
      "bowRatio": 0.85,
      "cooldownSeconds": 2.8
    },
    // **盲虾**：它本来只会横着走直线，加上这一行之后，它平时照旧直走，**靠近玩家时会蓄力再冲一下** ——
    // 那张卷曲的姿势就是为这个前摇准备的。
    // 触发距离给得比鱼近（它是第一关的东西，不该在远处就开始威胁玩家），蓄势也短一点，因为它体型小、动作快。
    "shrimp": {
      "triggerMeters": 200,
      "telegraphSeconds": 0.7,
      "travelSeconds": 0.45,
      "bowRatio": 0.35,
      "cooldownSeconds": 2.6
    },

    // **金枪鱼**：整套冲锋参数**照抄鱼那一行**，因为它就是"更大的一条鱼"（行为共用 \`stepFish\`）。
    // 想让它更快更凶（金枪鱼嘛）：把 \`telegraphSeconds\` 调小（反应窗口变短）、\`travelSeconds\` 调小（扑得更快）、
    // \`cooldownSeconds\` 调小（更频繁）。三个数一起动就是另一个敌人了。
    "tuna": {
      "triggerMeters": 300,
      "telegraphSeconds": 0.75,
      "travelSeconds": 0.55,
      "bowRatio": 0.3,
      "cooldownSeconds": 2.2
    },
    // ---------------------------------------------------------------------------------------------
    // 第 4 关的四个猎食者：**它们和鱼、金枪鱼共用同一套行为**（见 src/hazards.ts 的 CREATURES），
    // 所以"这四个各自是什么性格"全部写在这里，一行都不在代码里。
    //
    //   telegraphSeconds  冲之前先摆多久的架势。**这是公平性的那个数**：玩家要靠这段时间躲开。
    //   travelSeconds     冲过去用多久。越小越难躲，也越像"它已经决定了"。
    //   triggerMeters     离玩家多少米开始考虑冲锋。
    //   bowRatio          冲锋时身体弓起来的程度（观感）。
    //   cooldownSeconds   冲完多久才能再冲。
    //
    // 四个人的性格就是这张表读出来的：**海豚快而短**（前摇最短、冷却最短，烦人但不致命）；
    // **大白鲨最长的那一口气**（前摇短、冲刺最快，是这一关的招牌）；**座头鲸慢到你来得及看**（前摇 1.1 秒，
    // 但冲起来最快最重）；**章鱼最懒**（前摇最长、冷却最长，它是这一关里"可以忽略一会儿"的那个）。
    // 想整体更凶就把所有 telegraphSeconds 往下调，想更宽容就往上调——**四个一起调**，否则性格就串了。
    "dolphin": {
      "triggerMeters": 280,
      "telegraphSeconds": 0.55,
      "travelSeconds": 0.45,
      "bowRatio": 0.3,
      "cooldownSeconds": 1.8
    },
    "octopus": {
      "triggerMeters": 240,
      "telegraphSeconds": 0.9,
      "travelSeconds": 0.7,
      "bowRatio": 0.25,
      "cooldownSeconds": 2.6
    },
    "shark": {
      "triggerMeters": 340,
      "telegraphSeconds": 0.6,
      "travelSeconds": 0.4,
      "bowRatio": 0.35,
      "cooldownSeconds": 2.4
    },
    "whale": {
      "triggerMeters": 220,
      "telegraphSeconds": 1.1,
      "travelSeconds": 0.8,
      "bowRatio": 0.4,
      "cooldownSeconds": 3.2
    },

    // ---------------------------------------------------------------------------------------------
    // 矿物颗粒（\`mineral\`）：**它不是冲锋者**，这一行是"被 BOSS 甩出来的那种颗粒"的飞行参数
    // ---------------------------------------------------------------------------------------------
    //
    // 为什么需要这一行：BOSS 挥螯时甩出的颗粒，走的是**冲锋那套二次贝塞尔曲线**（\`h.charge\`），
    // 而曲线的时间参数是按种类从这个表里读的（\`travelSeconds\` 决定飞多久，\`telegraphSeconds\` 决定前摇多久）。
    //
    // \`telegraphSeconds: 0\` 是这一行的关键，而且是**故意的**：
    //   * 颗粒自己不再画一条预警弧 —— 读秒由 BOSS 的**挥螯动画**负责，两层预警只会互相打架；
    //   * 于是"看得见的前摇"只有一处（第 1-5 帧举钳），代码里那句 \`windingUp\` 对颗粒永远为 false。
    // \`triggerMeters\` 和 \`cooldownSeconds\` 写了 0：\`stepMineral\` **从不主动发起冲锋**，喷口那些颗粒照旧只是往上漂，
    // 所以这两个数没有任何代码会读到（放在这里是因为这一张表的每一行都长这样，缺字段比写 0 更难读）。
    // **要改"颗粒飞得快不快"，改 \`travelSeconds\`**：它就是玩家躲开的时间。
    "mineral": {
      "triggerMeters": 0,
      "telegraphSeconds": 0,
      "travelSeconds": 0.62,
      "bowRatio": 0.09,
      "cooldownSeconds": 0
    }
  },

    // 预警线（蓄势曲线）和冲刺拖尾的颜色与不透明度，所有冲锋共用的外观。
    "telegraphColour": 0xff9a6b,
    "telegraphAlpha": 0.55,
    "trailColour": 0xffd479,
    "trailAlpha": 0.3
  },

  // ---------------------------------------------------------------------------------------------
  // 擦边（贴着死亡飞过去）
  // ---------------------------------------------------------------------------------------------
  //
  // 一条正在冲锋的生物（过了前摇、正在飞的那一段）从你身边擦过——近到贴脸、却没有碰到——
  // 就是一次擦边。擦边是这套游戏里**最危险的赚钱方式**，所以它也是突变值涨得最快的方式。
  //
  // 判定的形状：**过点判定**——只有当冲锋的怪**不再朝你过来**（运动方向与"怪→你"连线的点积 ≤ 0，
  // 即正在远离、或在最近点上垂直掠过）而它又还在"接触半径 × radiusMultiplier"的圈里，才算擦边。
  // 一条笔直冲着你来的冲锋，进圈到撞上全程不判：站在弹道上不叫擦边，钱是躲闪的报酬，
  // 在怪真正擦身而过的那一帧到账（追着一头正在离场的冲锋怪贴上去也算——它本来就在走，追它有代价）。
  //
  // 倍数乘在**接触半径**上（你的半径 + 它的半径），所以怪越大圈越大，语义直观；全局一个数。
  // 每一次冲锋最多擦一次（冲锋状态里带一个 grazed 标记）；**碰到过你的冲锋永不判擦边**
  // （hitPlayer 标记——挨过你一下的冲锋什么也不欠你，出圈也不补发）；挨打后的无敌闪烁期间同样不判
  // （闪烁期白嫖经验违背"擦边最危险"的定位）。
  //
  // BOSS 甩出来的矿物颗粒走的是同一套冲锋曲线，所以躲颗粒贴脸也算擦边——BOSS 战因此也有得赚。
  // ---------------------------------------------------------------------------------------------
  // 慢动作：一个全局时间轴，两处用它
  // ---------------------------------------------------------------------------------------------
  //
  // 游戏里**只有一个时间缩放**（\`src/main.ts\` 的 \`timeScale()\`）：它同时驱动固定步长和绘制，所以玩家、生物、
  // 子弹、水、飘字一起变慢，没有任何一处能和另一处不一致。
  //
  // 两件事会触发它——**擦边**（后怕节拍：怪已经擦过去了，慢半秒让你看清刚才发生了什么）和**突变三选一之前**
  // （预告节拍：条满了，慢下来告诉你马上要选了）。两件事的时间感不一样，所以各给一组数；但
  // "慢到多少 → 慢多久 → 花多久回来"是同一套算术。
  //
  // 同时发生**不叠加，取更慢的那一个**。两处的倒计时都按**真实时间**走，而且在暂停、三选一、菜单里冻结。
  "slowMotion": {
    // 擦边：短促。它在危险峰值**之后**触发，是"回头看"。
    "graze": {
      // 慢到原速的多少倍。0.25 = 四分之一速。
      "factor": 0.25,
      // 保持在最慢处的时长（秒）。
      "slowSeconds": 0.5,
      // 从最慢线性回到原速花多久（秒）。硬切回原速看起来是一次卡顿。
      "recoverSeconds": 0.3
    },
    // 突变三选一：够长到让人反应过来。它是"预告"，方向和后怕相反。
    "pick": {
      // 慢到原速的多少倍。比擦边浅一点：这段时间玩家**还能操作**，太慢会像卡死。
      "factor": 0.3,
      // 慢动作持续多久（秒）之后弹卡。**这段时间要走完，卡片才出现。**
      "slowSeconds": 0.6,
      // 玩家选完之后，从最慢回到原速花多久（秒）。音乐跟着一起回来。
      "recoverSeconds": 0.4
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 节奏：威胁权重
  // ---------------------------------------------------------------------------------------------
  //
  // 这套权重只服务一件事：**把刷怪表折成一条"每屏威胁"的曲线**，也就是节奏的纵轴。它不参与任何玩法——
  // 改一个数不会让任何一只怪变强，只会让"这一屏有多挤"这个读数变化。
  //
  // 分类的**唯一原则**是"**它拿走了你哪个选项**"，不是"它有多快"、也不是"它有多疼"：
  //
  //   0  收集物：吃它变强，不是威胁。
  //   1  绕开就行：地形、天气、环境物，以及那些不追你的生物。你只要往旁边一挪。
  //   2  它会来找你 / 它逼你做决定：追你的、潜伏扑击的、抓着你吸血的、以及"吃还是躲"那一家。
  //   3  它拿掉了你的一个选项：朝你开火的（你必须持续躲）、封住路线的（你必须改道，而且不给你打的选项）、
  //      以及致命地形（喷口：只能横移）。
  //
  // **为什么按"选项"分而不是按伤害分**：\`contactDamage\` 已经有一张表了（10 到 40），但"疼"和"挤"是两回事——
  // 一屏十只 35 点伤害但不追你的鲸鱼，压力**小于**一屏三只 30 点伤害一直朝你开火的电鳗。节奏曲线要量的是后者。
  //
  // **每个种类都必须有一行**（33 个生物 + 5 个障碍 + \`bubble\` = 39 行；启动时检查，缺一个就加载报错）。
  // 漏掉一个的话，那种怪在曲线里等于**不存在**，而"这关很空"和"我忘了给这种怪算分"在读数上长得一模一样。
  // BOSS 那七行不会出现在曲线里（关卡不放它们进刷怪表），留着是为了让检查不必再判断一次"哪些算 BOSS"。
  "pacing": {
    "threat": {
      // ---- 0：收集物
      // 捡它变强。它在刷怪表里占一块，但那块是"奖励"不是"压力"。
      "bubble": 0,

      // ---- 1：绕开就行
      // 矿物颗粒：环境自己的弹幕，慢而好读。
      "mineral": 1,
      // 泡沫：假装是泡泡、打不掉。它不伤你，但它让你分不清自己在哪（第六关的核心压力）。
      //
      // **它不在第 1 档，它不是"绕开就行"**：你没法从一个你分不清是不是自己的东西旁边挪开——那正是它拿走的东西。
      // 第一版把它和矿物颗粒放在一起，是因为两者都"不伤你"，但"不伤你"和"绕得开"是两件事。
      "foam": 2,
      // 雨：压你下沉、不追踪。
      //
      // **同样不在第 1 档。** 第 1 档的定义是"你只要往旁边一挪"，而雨是**满屏的**：挪不开，只能改变移动方式
      // （往下压住等它过去）。它和 \`jelly\` 是同一类——"它作用在你身上"，不是"它在那儿"。
      "rain": 2,
      // 木箱：脆，撞碎或者绕开都行。
      "crate": 1,
      // 渔网：软网，不伤人，推着就能撕开。
      "net": 1,
      // 鱼：**大多数没有在追你**——只在感知半径内才靠拢，半径外自己 S 形漂。
      "fish": 1,
      // 盲虾：慢，而且从不转向。
      "shrimp": 1,
      // 螃蟹：它把你**弹上天**。README 里写的是"螃蟹是机会不是敌人"。
      "crab": 1,

      // ---- 2：它会来找你 / 逼你做决定
      // 金枪鱼：比鱼主动，会真的追。
      "tuna": 2,
      // 海豚 / 鲨鱼 / 鲸鱼 / 章鱼：大型捕食者，主动逼近。
      "dolphin": 2,
      "shark": 2,
      "whale": 2,
      "octopus": 2,
      // 鮟鱇：潜伏 + 扑击，而诱饵**就是**陷阱——它是这游戏里唯一会主动骗你的一样东西。
      "angler": 2,
      // 失控鱼雷：第一段是直线（诚实），第二段转身追你（不诚实）。
      "torpedo": 2,
      // 水母：碰到减速（\`slowFactor\` 0.55 持续 1.5 秒）。它不追你，但它让你躲不开下一波。
      "jelly": 2,
      // 垃圾袋 / 腐烂物 / 油污：这一家是"**吃还是躲**"——它拿走的是一个决定，而不是一条命。
      "trash": 2,
      "rot": 2,
      "oil": 2,

      // ---- 3：它拿掉了你的一个选项
      // 四个射手：电鳗 / 海胆 / 弓箭手 / 手枪鱼。你必须持续躲；电鳗打不掉，另外三个可以边躲边清。
      "eel": 3,
      "urchin": 3,
      "archer": 3,
      "pistol": 3,
      // 海星：五向齐射，而且**它的腕就是下一轮的方向**——它把"往哪躲"这件事变成了一道要读的题。
      "starfish": 3,
      // 河豚：打它就向四周炸一圈。它拿掉的是"随便开枪"这个选项。
      "puffer": 3,
      // 电击水母：碰它或打它都放电，而且**导电链**会把危险传给旁边的同类——越打越危险。
      "zapper": 3,
      // 炸弹鱼：会炸。在爆炸半径外打死才算拆弹，近了就变成"选在哪挨"。
      "bombfish": 3,
      // 喷口：致命热柱，只能横移。第一关的招牌，也是"你必须改道"最纯粹的一例。
      "vent": 3,
      // 封路木箱：**任何体积都撞不开**——打掉它或者从缺口过去，没有第三条路。
      "wall": 3,
      // 珊瑚：硬。它的存在就是"变小有优势"这句话本身。
      "coral": 3,
      // 管虫：一排留一个缺口，第一关用它做了四道门。
      "tube": 3,
      // 下落木箱：预警 2 秒后砸下，拿走的是"这一列现在不能待"——它是一次强制改道，不是一条命。
      "fallcrate": 3,
      // 墨雾：它不伤人，但把"怎么走"这件事的成本抬高了——和水母/雨同档。
      "ink": 2,

      // ---- BOSS：关卡不在刷怪表里放它（它由关卡自己的 \`boss\` 字段登场），所以这几行**不会出现在曲线里**。
      // 写它们是为了让"每个种类都必须有一行"这条检查不需要第三个"哪些算 BOSS"的判断——
      // 那判断已经在 \`isBossKind\` 和 \`src/soundIds.ts\` 里各有一份了，再来一份就是三处要互相对齐。
      "boss": 3,
      "boss-crab": 3,
      "boss-octopus": 3,
      "boss-jelly": 3,
      "boss-shark": 3,
      "boss-netshark": 3,
      "boss-eye": 3
    }
  },

  "graze": {
    // 擦边圈是接触半径的多少倍。2.0 = "贴着但没碰到"的那个手感宽度。
    "radiusMultiplier": 2.0,

    // ---------------------------------------------------------------------------------------------
    // 慢动作：擦边的奖励节拍
    // ---------------------------------------------------------------------------------------------
    //
    // 全局统一：玩家、生物、子弹一起变慢（电影感），不拆"玩家时间轴 / 世界时间轴"。
    // 连续擦边**不叠加只刷新**——时间留在慢速上，不会越叠越慢。
    //
    // 过点判定下它在危险峰值**之后**触发——怪已经擦过去了，世界慢半秒让玩家看清刚才发生了什么、
    // 顺便喘口气（"后怕节拍"，和 DMC/Bayonetta 的 near-miss 反馈同一个位置）。
    //
    // 节奏是"慢 → 渐回"两段。**这三个数现在在顶层的 \`slowMotion.graze\`**——和突变三选一那组放在一起，
    // 因为两者共用同一套算术，只是各给一组数。

    // ---------------------------------------------------------------------------------------------
    // 气泡边缘闪一下：擦边的视觉确认
    // ---------------------------------------------------------------------------------------------
    //
    // 擦边已经有水里那行「擦边！！」和半秒慢动作，这是第三样，而且是唯一一样**长在气泡自己身上**的：
    // 前两样说的是"发生了什么"，这一样说的是"差一点碰到的是你"。
    //
    // 闪的是玩家气泡的边缘（描边），不是怪身上的圈。**不做常驻的擦边范围显示**——那等于把擦边从手感
    // 变成看圈办事；事后闪一下只解释"这 25 分哪来的"，不告诉你下次该贴多近。
    "playerFlash": {
      // 闪多久（秒）。
      "seconds": 0.25,
      // 描边颜色，以及峰值不透明度（时间上从峰值线性淡出）。
      "colour": 0xffffff,
      "alpha": 0.9,
      // 描边宽度，相对气泡半径的比例。
      "widthRatio": 0.22
    }
  },

  // "擦边！！"飘字。独立的一套样式（比分数飘字更大更响），因为它是奖励的宣告而不是记账。
  // prefix 不参与显示——飘字系统为它提供了一个直接写字的入口（say），整个文案就是 prefix + 空文案。
  "grazePopups": {
    "lifeSeconds": 0.9,
    // 擦边文字不往上飘太高：它发生在你和怪之间，眼睛已经在那了。
    "risePx": 26,
    "riseEase": 0.6,
    "size": 22,
    "colour": 0x9ff2ff,
    "alpha": 1,
    "weight": "bold",
    "prefix": "擦边！！",
    "fadeFrom": 0.5,
    "fadeEase": 1,
    "anchorX": 0.5,
    "anchorY": 0.5,
    "max": 6
  },

  // ---------------------------------------------------------------------------------------------
  // 突变（局内的成长路线）
  // ---------------------------------------------------------------------------------------------
  //
  // 突变值攒满 → 整个游戏冻结 → 弹出三个突变选项，必须选一个 → 选完恢复并给半秒无敌。
  // 来源按速率刻意拉开：随时间最慢，**吸收一颗收集物紧挨着它上面**，然后是打跑/吞噬，
  // 擦边最快（也最危险）、BOSS 一大笔。
  //
  // 升级池装的是"枪 + 身体 + 技能"（拾取系统已废除，枪管/射速/技能都从这里来）：
  // 必选、全池均匀随机、数值型可叠加、按气泡类型过滤废牌（普通气泡不会抽到吞噬专属）。
  // 跨关保留、死亡清零——和分数同等待遇。
  "mutation": {
    // 随时间自动积累：每秒多少点。最慢的来源——纯挂机 55 秒攒满第一级（首级 55 点）。
    //
    // **首级实际落在 30-55 秒**：这条时间线不再是唯一来源了，拾取一颗收集物给 2 点（见下面的 \`absorb\`），
    // 而六关的泡泡密到 0.40 颗/秒（全收下），所以"一路捡着走"的速率是 1.8/秒、首级约 30 秒。
    // 两头就是这两种打法：只靠时间线是 55 秒，边走边捡是 30 秒。
    "autoPerSecond": 1.0,

    // 每种事件给多少点。和 score 表一样：设成 0 就等于把这件事从突变值里拿掉。
    "gain": {
      // **吸收一颗收集物**（普通泡泡）。比时间线大、比打跑敌人小——它就是中间那一档的入口。
      //
      // 和积分那张表**故意不同**：\`score.absorb\` 只发给"不能靠吸收长大的类型"（成长本身就是吞噬路线的报酬），
      // 而这一笔给**两条路线都发**。理由是拾取这件事两边都发生了，吞食路线的成长速度本来就更快，
      // 不该在突变上反而落后。2 这个数是实测出来的：见 \`autoPerSecond\` 上面那段。
      //
      // 收集物的**分布**和这个数是一起定的：六关合计 182 颗、平均 0.40 颗/秒，而且是**铺在每一屏的缝隙里**
      // （爆发屏一颗不放），不是只在开头结尾各堆一撮——分布一变，这个数就要重算（见关卡文件里的刷怪表头）。
      "absorb": 2,
      // 打跑一条生物（和积分的 drivenOff 同一个事件）。
      "drivenOff": 3,
      // 吞掉一条生物（食物链反转）。
      "eaten": 3,
      // 一次擦边。最快的来源：危险打法大约每 8-10 秒一次。
      "graze": 25,
      // **子弹擦边**：一颗敌方子弹擦身而过（过点判定，小字「擦」）。
      // 刻意很小：子弹比冲锋频繁得多，这是擦边经济里"最碎"的那一档——
      // 若实测贴弹道流追上冲锋擦边流（2.5-3/秒），先压这里再加护栏。
      "bulletGraze": 4,
      // **贴脸击杀**：在接触判定（贴图包围盒）的 pointBlankRadius 倍以内用枪打跑一只怪（小字「贴脸」）。
      // BOSS 不会"逃跑"，所以它按**每次命中**结算，冷却见下面的 bossPointBlankCooldownSeconds。
      "pointBlank": 8,
      // **远距拆弹**：在爆炸半径外把炸弹鱼打死（小字「拆弹」）。一次性低频事件，给得比贴脸多。
      "defuse": 15,
      // 击败 BOSS：一大笔，跨关携带时滚进下一关的条里（"打完 boss 开局半管"）。
      "boss": 100
    },

    // 贴脸判定半径：接触距离的多少倍以内算贴脸。接触用与碰撞相同的贴图包围盒；没有贴图时退回圆形半径。
    "pointBlankRadius": 1.3,

    // BOSS 的贴脸限流：同一只 BOSS 的小字与经验最多每这么多秒一次。BOSS 会吃下每一发子弹，
    // 高射速/霰弹枪下逐发支付会刷屏并让经验膨胀；设 0 就恢复"每次命中都触发"。
    "bossPointBlankCooldownSeconds": 1.0,

    // 三条小技巧反馈（子弹擦边「擦」/ 贴脸「贴脸」/ 拆弹「拆弹」）共用的浮字样式。
    // 比冲锋擦边的大字「擦边！！」小一档——慢动作是冲锋擦边独享的身份标识，这三条只报数。
    // 文字由事件传入，prefix 不参与显示。
    "callouts": {
      "lifeSeconds": 0.7,
      "risePx": 22,
      "riseEase": 0.6,
      "size": 14,
      "colour": 0x9ff2ff,
      "alpha": 0.95,
      "weight": "bold",
      "prefix": "",
      "fadeFrom": 0.5,
      "fadeEase": 1,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "max": 12
    },

    // 等级曲线：第 N 级需要 first × growth^(N-1) 点。溢出保留（连续擦边冲过门槛不截断爽感）。
    //
    // 80 → 55：暴怒/吞噬形态的卡组是**围绕形态本身**的（第一条命就带的那三条线），所以第一次三选一
    // 要来得比"通用成长"更早——玩家得在形态还没被忘掉之前看到它的卡。55 让"边走边捡"落在 30 秒
    //（见上面 autoPerSecond 那段），纯时间线是 55 秒。
    "first": 55,
    "growth": 1.3,

    // 选完突变恢复游戏的瞬间给多少秒无敌（角色闪烁）。防止"选完当场被打死"的绝杀。
    "resumeInvulnerableSeconds": 0.5,

    // 每张数值卡一选的量级。卡的名字和文案在 src/mutations.ts（那是内容），这里只有数。
    "pool": {
      // 子弹伤害 +15%/张，可叠加。
      "damagePerPick": 0.15,
      // 受伤减免 +8%/张（现在改成加防御，见下）。
      //
      // 两条路线都吃这一项：吞噬路线减的是每次扣掉的**体积**，不长的路线减的是每次扣掉的**血量**。
      // 修复卡的回血量在 \`health.healPerPick\`，不在这里——它按"点"算，而这里的数是按体积算的。
      // 受伤减免：**改成加防御**。它以前是"每次少扣 8%"的百分比，而现在的公式是减法
      // （\`max(伤害 × 10%, 伤害 − 防御)\`），百分比没有位置了——防御是一个能堆的整数，正是要的养成要素。
      "defensePerPick": 2,
      // 「厚甲 +5 防御」那张大卡。和小卡分工：小卡是常态的小台阶，大卡是后期的一次质变。
      "defenseBigPerPick": 5,
      // 怒气积攒 +15%/张（仅沸腾路线）。
      "ragePerPick": 0.15,
      // 吸取范围 +15%/张（仅吞噬路线）。
      "suctionPerPick": 0.15,
      // 吞噬后的无敌 +0.3 秒/张（仅吞噬路线）。
      "eatInvulnSecondsPerPick": 0.3,
      // 可吞档位 +1 档/张（仅吞噬路线）：比体积说的话多吃一档，食欲也能爬食物链。
      "appetiteTiersPerPick": 1,
      // 爆破半径 +15%/张（仅沸腾路线）。
      "burstRadiusPerPick": 0.15,
      // 怒气衰减 -25%/张（仅沸腾路线）：余温，挨打攒的热散得慢。
      "rageDecayReductionPerPick": 0.25,
      // 子弹速度 +25%/张（**全池**：所有形态都抽得到。曾经是路线专属，但「越快伤害越高」按弹速加成
      // 算伤害，专属就等于别的形态抽到一张 +0% 的废牌）。
      "bulletSpeedPerPick": 0.25,
      // 子弹半径 +30%/张（全池）：判定和画面同一个数，看见多大就撞多大。
      "bulletRadiusPerPick": 0.3,
      // 子弹射程 +40%/张（全池）：寿命就是射程。
      "bulletRangePerPick": 0.4,

      // ---------------------------------------------------------------------------------------------
      // 两张「伤害跟着子弹状态走」的卡
      // ---------------------------------------------------------------------------------------------
      //
      // 为什么要单独设这两个数：默认伤害**故意**不跟体积挂钩，否则「慢速大气泡流」自动变成唯一正确答案
      // （见 src/bullets.ts 里同一条规则的英文版）。这两张卡是**付钱买那个耦合**——你花一张卡，让
      // 子弹的某个状态开始换伤害。
      //
      // 两个 bonus **乘算**，各自乘在自己的那项上。
      //
      // 「越大伤害越高」＝（当前半径 ÷ 发射半径 − 1）× 这个数。
      //
      // 注意「大弹丸」卡的倍率在这一项里**会约掉**：它同时抬高起始半径和成长率，比值不变。所以这张卡
      // 实际奖励的是**飞得久**（＝堆射程），而不是堆体积。这是故意的，也正是它和下面那张的分岔点。
      //
      // 代价要说清楚：线性意味着**这张卡的强度与 bullets.radiusGrowthPerSecond 绑死**。现在速率是
      // 0.007，2.2 秒寿命下比值 2.4 → 一张卡约 +28%（同「子弹伤害 +15%」一档）。你要是把速率调回
      // 0.187，比值会到 38，同一张卡变成 +740%。
      // ---------------------------------------------------------------------------------------------
    // 霰弹：枪的一条支线（一次打出一把，间隔拉长）
    // ---------------------------------------------------------------------------------------------
    //
    // **"近身高伤害"不用另写衰减**：弹丸是直线斜飞的，所以**越近全中越多、越远越散**——几何自己就是那句话。
    // 贴脸时 4 颗全中是 4 点（现在 1 点一枪），射速减半所以 DPS 是 2 倍；远了只中一两颗，比现在更差。
    // 那 30% 的追踪弹和它是反的：追踪会把飞散的一两颗拉回目标身上，所以"追踪 + 霰弹"是收敛而不是散开。
    //
    // 四张配套卡**只在这张转型卡拿过之后才会出现在池子里**：它们是这条支线的深度，单独拿没有意义
    //（"多一发"没有张角就只是白送 DPS）。
    "shotgun": {
      // 转型：射速乘这个。
      "rateScale": 0.5,
      // 转型：每排**多**几颗（1 + 3 = 一次 4 颗）。
      "pellets": 3,
      // 转型：**总张角**（度）。4 颗在这个范围内均分，所以 12° 就是 ±6°。
      //
      // 这个数是**量出来的**，不是拍的（\`node scripts/probe-shotgun.mjs\` 打的那条阶梯；一屏 361 米宽、
      // 一条鱼 0.035 泳道宽）：
      //     贴脸 ≤120m：4 颗全中 = 一枪 4 点，DPS 是现在的 2 倍
      //     200-450m（大部分交火距离）：中 2 颗 = **和现在刚好打平**（半速 × 两颗）
      //     700m 以上：一颗不中——霰弹对远处**什么都做不到**，你只能逼近
      // 20° 会把这个阶梯整体拉近（120 米只剩两颗、450 米全空），也就是把"中距离打平"那一段删掉，让这条支线
      // 退化成纯贴脸武器。
      "totalSpreadDegrees": 12,
      // 多一发：每拿一张，齐射 +1 颗。
      "pelletsPerPick": 1,
      // 抵近射击：目标在你的上方**多少米以内**算近。枪是往上游的，所以射程就是这个竖直距离
      //（六十米大致是中期玩家自己半径的两倍，也就是"贴到脸上"）。
      "closeRangeMeters": 60,
      // 抵近射击：每张 +35% 伤害。
      "closeDamagePerPick": 0.35,
      // 收束：每张把张角乘 (1 − 这个)。
      "narrowPerPick": 0.25,
      // 收束的地板：张角不低于基准的 40%。再窄弹丸就叠在一起，"散"这件事在画面上消失了。
      "narrowFloor": 0.4,
      // 顶开：每张把命中击退乘 (1 + 这个)——基准是 hitKnockback.meters（8 米）。
      "knockbackPerPick": 0.5
    },

    // ---------------------------------------------------------------------------------------------
    // 暴怒（沸腾形态）的卡组：怒甲那三个旋钮，加上灼烧的那一个
    // ---------------------------------------------------------------------------------------------
    //
    // 和霰弹那套不同，这几张**不深化某一张转型卡**——暴怒开局就带着怒甲和灼烧，它们只是把本来就有、
    // 但很钝的三条线各自磨快一档。所以它们没有 \`available\` 门槛，沸腾形态从第一次三选一起就能拿到。
    //
    // 数值都是让**第一张立刻能感觉到**的量级（5 秒 → 4 秒、2 层 → 3 层、1.5 → 1.75 倍、灼烧翻一倍），
    // 因为暴怒的全部玩法就是这三条线：攒甲、撞、烧。
    "rage": {
      // 怒甲更快：每张把攒甲间隔乘 (1 − 这个)。5 秒 → 4 → 3.2 → 2.56。
      "plateSecondsPerPick": 0.2,

      // 那个乘法器的地板：它是**乘法**，所以五张之后是 0.33、十张之后 0.11——一秒一个甲不再是"节拍"，
      // 而是贴脸即无敌。0.25 = 最快 1.25 秒一个，大约是"一波怪"的五分之一，还读得出节奏。
      "plateSecondsFloor": 0.25,

      // 多存一层：每张把上限 +1（基准 2 → 3 → 4）。
      "plateMaxPerPick": 1,

      // 那个上限的顶：5 层。存到 5 就不再是"攒一手"，而是"只要不一直撞就一直有"——
      // 那时玩家读的不再是节拍而是余额，这张卡的存在意义（连着撞）也就没了。
      "plateMaxCap": 5,

      // 破甲更深：每张把破甲倍数 **+这个**（1.5 → 1.75 → 2.0）。加法而不是乘法，因为它乘的已经是倍数了，
      // 再乘一层（1.5^n）会让三张就从 1.5 跳到 3.4。
      //
      // 这张是"与霰弹结合基本秒杀一切"的那个开关：霰弹贴脸几颗一起命中，乘完破甲就是成倍的伤害——
      // 所以它是**乘区**，只加上限不加地板，也不用封顶（玩家的卡位是封顶）。
      "breakPerPick": 0.25,

      // 灼烧更烈：每张把每跳伤害**乘** (1 + 这个)。乘法而不是加法，和 \`damagePerPick\` 同一个道理：
      // 灼烧的基数要跟着枪的基数走，加法会让这张卡在基数抬高之后被悄悄稀释。
      //
      // 1.0 = 每张翻一倍，与它原来"平加 0.5、而基数本身就是 0.5"逐点等价：2.5 → 5.0 → 7.5。
      // 第三张之后 7.5 点 / 0.5 秒 = 15 点/秒，和枪同量级了——这是"常驻底噪"变成"第二条输出线"的那一步，
      // 代价是要贴到敌人身上。
      "burnRatePerPick": 1.0
    },

    "sizeDamagePerPick": 0.2,
      // 「越快伤害越高」＝（弹速加成 − 1）× 这个数，也就是按**弹速卡的堆叠**算，不按飞行过程算。
      //
      // 「弹速加成」读的是 run.bulletSpeedMultiplier（= 1 + 0.25 × 张数），不是张数本身——这样
      // bulletSpeedPerPick 调整时这张卡自动跟着走，不会两处记账。
      //
      // 四张「弹速」（倍率 2.0）→ +30%。单独一张「弹速」只有 +7.5%，所以它是配套卡而不是单卡强度。
      "speedDamagePerPick": 0.3
    },

    // ---------------------------------------------------------------------------------------------
    // 突变值条（顶部中央，资源槽里）
    // ---------------------------------------------------------------------------------------------
    //
    // 住在怒气条下面（暴躁气泡时两条叠放），另外两种气泡独占这个位置。
    // 和怒气条同一套画法，所以也是同一套旋钮。
    "gauge": {
      "widthRatio": 0.4,
      "height": 7,
      // 与上方内容（怒气条，或没有怒气条时的那行资源文字）的间距，设计像素。
      "gap": 6,

      // 突变块（标签 + 条）放在 **BOSS 血条槽位下方** 多少设计像素。
      //
      // BOSS 条平时是隐藏的，但突变块**始终**用这个位置：HUD 不能在 BOSS 登场时整体跳一下。
      // 它以前是按资源行往下排的，BOSS 条一出现就正好压在一起。
      "bossGap": 8,
      "radius": 3.5,
      "trackColour": 0x0a1c2e,
      "trackAlpha": 0.7,
      "trackStroke": 0x3d7fa8,
      "trackStrokeAlpha": 0.5,
      "fillColour": 0x9ff2ff,
      "fillAlpha": 0.95,
      // 满级待选时描一圈亮边，提示"冻结三选一"这件事在等你。
      "readyStroke": 0x9ff2ff,
      "readyStrokeAlpha": 0.9,
      // 慢动作预告期间条的样子：比"攒着一张卡"更亮，因为此刻正要发生的事比"欠你一张"更近。
      "rampStroke": 0xffffff,
      "rampStrokeAlpha": 1,
      // 预告期间描边有多粗（相对条高）。比 ready 那圈厚，隔着屏幕也看得见。
      "rampStrokeScale": 2.5,
      "labelSize": 11,
      "labelColour": 0x9ff2ff
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 敌方子弹（弹幕的第二种来源：对着你打）
  // ---------------------------------------------------------------------------------------------
  //
  // \`shooters\` 里列出的生物会按自己的节奏**瞄准你开火**。和冲锋一样，公平性靠三件事：
  //   1. **瞄的是"开火那一刻的你"**，之后不再修正 —— 所以看得懂、也躲得开，不是追踪弹；
  //   2. **速度比你的横向速度慢**（见每行的 speedPerSecond），所以"躲得开"在物理上永远成立；
  //   3. **只在 rangeMeters 内开火**，所以子弹永远不可能从你看不见的地方飞过来。
  //
  // 每种会开枪的生物一行，**不在表里的生物就是不开枪**（不是"用默认值"）：
  // 一个因为漏写配置而开始开枪的生物，是一次没人做过的难度改动。
  "enemyBullets": {
    "shooters": {
      // 电鳗：**唯一的不可伤害炮台**（0 血，见 hazards.health.eel），主题是电。
      // 蓝色弹是给它的：其它枪手的暖色弹在余光里都是"敌方火力"，而电鳗的弹要读作"电"。
      // 0.6 发/秒（约 1.7 秒一发）——比它以前的 1.1 稀疏，但仍快过手枪虾的 0.35。
      // **每发只掉 5 点血**：命中它的主要代价是麻痹（两轴操作反向 0.5 秒），不是伤害。
      // \`image\` 是「电鳗闪电」：一小簇分叉的蓝色电弧。贴图缺失时退回蓝色的程序化弹丸。
      // \`imageScale\` 是画面宽度相对判定直径的倍数（2.5 = 判定圈的 2.5 倍，让细支叉伸出去）。
      "eel": { "perSecond": 0.6, "speedPerSecond": 0.3, "spread": 1, "spreadRadians": 0, "damage": 5, "shape": "bolt", "coreColour": 0xbfe8ff, "rimColour": 0x3f8cff, "image": "电鳗闪电", "imageScale": 2.5, "imageAlpha": 1 },

      // 海胆：**尖刺**，比你见过的其它子弹都快。它本来只会"躺在那儿扎你"，现在既会扎人也会放刺。
      "urchin": { "perSecond": 0.8, "speedPerSecond": 0.5, "spread": 1, "spreadRadians": 0, "damage": 20, "shape": "spike" },

      // ---------------------------------------------------------------------------------------------
      // 四位枪手
      // ---------------------------------------------------------------------------------------------
      //
      // **射水鱼**：基本射手，日常款——最薄的一只，枪能处理掉。
      // 慢节奏（0.8/秒）、中速弹（0.35 泳道/秒），第一课"会开枪的东西也可以被赶走"。
      "archer": { "perSecond": 0.8, "speedPerSecond": 0.35, "spread": 1, "spreadRadians": 0, "damage": 20, "shape": "bolt" },

      // **手枪虾**：精英。单发**大号空化弹**（约 2.6 倍弹径，命中圈和擦弹圈同步变大）
      // × **每次命中 2 个命中点**——\`damage\` 这个字段自射手表诞生起就校验却从未被读，
      // 手枪虾是第一个让它说不一样的话的射手。射速极慢（0.35/秒）、弹速全表最快（0.8 泳道/秒）：
      // 稀疏、快、重，一发就是半管血的威胁。
      "pistol": { "perSecond": 0.35, "speedPerSecond": 0.8, "spread": 1, "spreadRadians": 0, "damage": 40, "shape": "bolt", "radiusRatio": 0.042 },

      // **刺魨**：防御反击型。\`perSecond: 0\` = **从不主动开火**——它的刺什么时候出取决于你什么时候打它
      // （见 hazards.puffer 的反击配置）。这一行只描述刺本身：快、直、尖刺外形。
      "puffer": { "perSecond": 0, "speedPerSecond": 0.45, "spread": 1, "spreadRadians": 0, "damage": 20, "shape": "spike" },

      // **海星**：弹幕型。这一行只定**节奏**（每 2.5 秒一轮）和弹速；一轮打几发、往哪转
      // 是 hazards.starfish 的事——齐射的方向是固定的星形，不瞄人。
      "starfish": { "perSecond": 0.4, "speedPerSecond": 0.3, "spread": 1, "spreadRadians": 0, "damage": 20, "shape": "bolt" },

      // **章鱼 BOSS 的环弹**：\`perSecond: 0\` = 不参与自动瞄准射击；这一行只给环弹提供速度、伤害与外形。
      // 一圈几发、每轮转多少，在 \`hazards.bossSkills['boss-octopus']\`。
      "boss-octopus": { "perSecond": 0, "speedPerSecond": 0.3, "spread": 1, "spreadRadians": 0, "damage": 20, "shape": "bolt", "coreColour": 0xe0c6ff, "rimColour": 0x8a4fff }
    },

    // 开火距离的上限（米）。超出就**按住**扳机而不是攒着。
    "rangeMeters": 420,

    // 子弹半径，相对泳道宽度的比例。
    "radiusRatio": 0.016,

    // 存活秒数（也就是射程的另一半）。
    "lifeSeconds": 7,

    // 外观：亮芯 + 暖色外圈，和玩家那串冷色小泡泡在余光里就不会混。
    "coreColour": 0xffe9a8,
    "rimColour": 0xff7a5c,
    "rimAlpha": 0.9,

    // 每行的字段含义：
    //   perSecond        每秒几发（调大就是持续压迫；**0 = 这一行的弹存在、但从不主动开火**——刺魨用）
    //   speedPerSecond   速度，单位是**泳道宽/秒**（0.22 ≈ 80 m/s，玩家横穿泳道只要 2 秒，所以躲得开）
    //   spread           一次几发（>1 会按 spreadRadians 扇形铺开）
    //   spreadRadians    扇形每发之间的夹角（弧度）
    //   damage           命中扣几个命中点（1 = 一次受击；手枪虾的空化弹是 2。同一帧里的**不同发**会被无敌帧合并，这是有意的保护；**同一发的多点**不会）
    //   shape            'bolt'（一条带尾巴的弹丸，默认）或 'spike'（一颗尖刺：更长更窄，指向飞行方向）
    //   radiusRatio      可选：这一种子弹的半径（相对泳道宽）。不写就用上面那个全局值。手枪虾的大弹用。
    //   coreColour / rimColour  可选：这一种子弹自己的亮芯与外圈颜色。不写就用上面的全局暖色。
    //                    电鳗写蓝色——它是唯一需要和其它枪手分开的弹。
    //   image / imageScale / imageAlpha  可选：这一种子弹的贴图、画面宽度（相对判定直径）和不透明度。
    //                    只给电鳗用；贴图未加载或缺失时仍然画程序化弹丸。
  },

  // ---------------------------------------------------------------------------------------------
  // 命中闪白
  // ---------------------------------------------------------------------------------------------
  //
  // 子弹打中任何**能被打的东西**，它都会闪一下白：敌人、以及可破坏的障碍物。以前只有 BOSS 会闪，普通小鱼和木箱
  // 打上去只有血量的变化——而血量在画面上看不见，于是"我到底打到了吗"这个问题**没有答案**。
  //
  // 放在顶层而不是 hazards 里：这是"命中反馈"，不是某一种东西的属性。障碍物不是 hazard，却需要同一个效果；
  // 一个效果两处配置，就是把"调一致"变成一件要记得做的事。
  // ---------------------------------------------------------------------------------------------
  // 加载页（点开始后、进关前）
  // ---------------------------------------------------------------------------------------------
  //
  // 图片以前是"用到才下载"，于是关卡开头那几秒——玩家看得最仔细的时候——敌人会从**代码画的形状**变成贴图。
  // 现在开始前先全部下完，进度条走完才真正进关。
  // ---------------------------------------------------------------------------------------------
  // 击中粒子
  // ---------------------------------------------------------------------------------------------
  //
  // 打中溅火花（向外乱飞），**打跑炸一圈碎片**（沿radius向外等速——"它是散开的"，而不是"它又被撞了一下"）。
  // ---------------------------------------------------------------------------------------------
  // 冲锋拖尾气泡
  // ---------------------------------------------------------------------------------------------
  //
  // 所有冲锋在**冲刺阶段**带一条气泡拖尾：一张 6 帧图，贴在敌人身后循环播放（蓄势阶段没有——拖尾是"它已经冲出去了"）。
  "chargeTrail": {
    // 图片文件名（src/assets 下，不写扩展名）。空字符串 = 整个拖尾关掉。
    "image": "冲锋拖尾",
    // **图的排版**：几列几行。这是"文件的事实"，代码猜不出来——猜错就是每一帧都被裁歪。
    // 帧序是**先左到右、再上到下**：i = 行 × columns + 列。图排成别的样子就把它描述出来，代码跟着改。
    "columns": 6,
    "rows": 1,
    // **拖尾是一个跟着敌人走的动画，不是留在身后的粒子**：一个 sprite 贴在敌人身后，把 6 帧循环播放。
    // 所以这里只有"每帧播多久"——不是发射频率，也不是寿命。6 帧 × 0.07 ≈ 0.42 秒一轮。
    "frameSeconds": 0.07,
    // 气泡大小（占泳道宽度的比例，指的是**宽度**）与整体不透明度。
    // 面积翻倍 = 宽度乘 √2：0.05 → 0.0707（直接写 0.1 就是面积 4 倍了）。
    // **明显调大了**：一顆小气泡读不出"有东西在水里游"，所以基础尺寸给足（面积约是 0.0707 时的 5 倍）。
    "sizeRatio": 0.16,
    // **跟在身后**：沿冲锋方向往后退，退的距离是气泡自身大小的多少倍（0 = 正好压在敌人身上，1 ≈ 边缘相切）。
    "behindFactor": 1.2,
    // 一簇几条。**默认为 1：就是"一条跟在身后的拖尾动画"**。调大就变成一组被搅动的气泡。
    "count": 1,
    // 只有 count > 1 才有意义：每条比上一条再远多少（相对它自己的大小），以及角度的随机抖动（弧度）。
    "spread": 0,
    "jitter": 0,
    // 大小的随机浮动（±比例）与"越靠后越小"的衰减（同样只在 count > 1 时有意义）。
    "scaleVariance": 0,
    "sizeFalloff": 0,
    "alpha": 0.85
  },

  "particles": {
    // 同时存在的粒子上限，超了就顶掉最老的。
    "maxParticles": 260,
    // 命中火花：数量、速度（米/秒）、寿命（秒）、大小（米）。
    "hitCount": 6,
    "hitSpeed": 26,
    "hitLife": 0.28,
    "hitSize": 1.6,
    // 打跑碎片：数量、速度、寿命、大小、颜色，以及角度的随机抖动（0 = 完美的圆）。
    "defeatCount": 14,
    "defeatSpeed": 34,
    "defeatLife": 0.5,
    "defeatSize": 2.4,
    "defeatColour": 0xdff6ff,
    "defeatJitter": 0.5,
    // 每秒衰减比例（越小越快停下）与额外的下沉速度（跟着水流走）。
    "drag": 0.92,
    "descentSpeed": 6
  },

  // 炸弹鱼炸开时画的那圈环。**不是粒子**：粒子是"被打中的反馈"，这是"刚才那一下有多大"的读数，
  // 所以它是一圈会扩大、会淡出的环，而不是一蓬碎屑。
  //
  // 环有两个同心圆：外圈描边、内圈填充。每个都有"从多少倍半径长到多少倍"和起始不透明度，
  // 两个都按寿命线性插值——所以调这里就是调它看起来有多"炸"。
  "explosions": {
    // 一圈活多久（秒）。\`step\` 用它老化、绘制用它算进度，所以只有一个数字。
    "seconds": 0.45,
    // 外圈：颜色、起始不透明度、半径从 0.25 倍长到 1 倍（相对爆炸半径）、线宽（同样相对半径）。
    "strokeColour": 0xffb44a,
    "strokeAlpha": 0.85,
    "strokeStartRatio": 0.25,
    "strokeEndRatio": 1,
    "strokeWidthRatio": 0.16,
    // 内圈：更亮更淡的一层填充，让环读起来像"里面在烧"，而不是一根线。
    "coreColour": 0xffe9a8,
    "coreAlpha": 0.28,
    "coreStartRatio": 0.15,
    "coreEndRatio": 0.65
  },

  // ---------------------------------------------------------------------------------------------
  // 载入页（点开始游戏之后、进关之前的那个整屏页面）
  // ---------------------------------------------------------------------------------------------
  //
  // 这一页要说明"正在下载什么、还要多久"，所以它显示三件事：**已下载 / 总大小 / 当前网速**，单位 MB。
  // 数字来自服务器自己报的 Content-Length（见 src/assets.ts），不是写死的清单。
  "loading": {
    // 整页背景颜色与不透明度。1 = 完全不透明，水面和 HUD 全部被盖住（"完整的页面"要的就是这个）。
    "scrimColour": 0x030a17,
    "scrimAlpha": 1,
    // 进度条：轨道色、填充色、高度、最大宽度（设计像素）。
    "trackColour": 0x123049,
    "barColour": 0x6dc7e8,
    "barHeight": 10,
    "maxWidth": 420,
    // 标题（页面顶部那行字）的内容、字号、颜色。
    "label": "正在下载游戏资源",
    "titleSize": 26,
    "titleColour": 0xeaf9ff,
    // 百分比和下面两行数字的字号、颜色、行高（设计像素）。
    "textColour": 0xcfeaff,
    "textSize": 16,
    "lineHeight": 24,
    // 三处竖向间距（设计像素）：标题→进度条、进度条→百分比、百分比→数字。
    // 整个版块按这三段加起来的实际高度**整体居中**，所以改这里等于改整块的疏密。
    "gapTitle": 40,
    "gapBar": 14,
    "gapStats": 20,
    // 网速的测量窗口（秒）：显示的是最近这段时间的平均速度。调小 = 更灵敏但更跳，调大 = 更稳但更迟钝。
    "speedWindowSeconds": 3,

    // ---------------------------------------------------------------------------------------------
    // 第二阶段：等菜单音乐
    // ---------------------------------------------------------------------------------------------
    //
    // 图片下载完以后，进度条停在 100%，下面的统计数字换成这一行字，等菜单背景音乐缓冲到"可以开始播"。
    // 之所以单独一行而不是继续显示网速：这时候已经不是在下载图片了，一个满条旁边挂着 0.00 MB/s 看起来像卡死。
    "musicLabel": "正在缓冲音乐…",

    // 下载页至少停留多少秒（即使资源瞬间就到）。0 = 不设下限。
    // 0.4 秒是"能看清这一页存在过、又不至于让人等"的长度；它同时保证菜单的渐入不是从第一帧才开始被看见。
    "minSeconds": 0.4,

    // 等音乐可播放的时限（秒）。超时就直接进菜单——一首曲子不该把整个游戏拦在下载页上。
    // 调小 = 更快进入（网络慢时会带着还没缓冲好的音乐进菜单），调大 = 更愿意等。
    "bootTimeoutSeconds": 15
  },

  // ---------------------------------------------------------------------------------------------
  // 命中反馈：全身闪白（每一个被打中的敌人）
  // ---------------------------------------------------------------------------------------------
  //
  // 闪白是"打中了"的第一层反馈。它是**一条曲线**，不是"亮起来再淡出"：从 0 升到峰值，然后平滑衰减。
  // 之所以这么设计：从满亮开始倒数的那种闪白，在**命中的那一帧**就是最亮的，看起来像"跳了一下"而不是"闪了一下"，
  // 而那一帧恰好是眼睛唯一一定看得到的帧。
  //
  // 时间线（按 seconds 的百分比）：0 → 峰值在 riseFraction 处 → 之后平方缓出衰减到 0。
  // 原来的例子（0ms 强度 0 / 15ms 0.25 / 60ms 0）是 seconds 0.06、riseFraction 0.25、peakIntensity 0.25，
  // 实测在屏幕上几乎看不见：30fps 下命中后只有 1 帧、约 9% 白；60fps 下也就 1–2 帧、最多 23%，而银色的鱼本来就亮，
  // 朝白走 25% 几乎没有对比。现在是 seconds 0.10、riseFraction 0.15、peakIntensity 0.6。
  //
  // **peakIntensity 是"最亮时有多白"**：0.6 = 每个像素朝白色走 60%，保留 40% 本来的颜色。
  // 1.0 = 整个剪影变成纯白（旧的行为，会盖掉贴图本身的细节）。
  // **0 = 整个全身闪白关掉**；设置面板里的"降低闪烁"开关关的也是这一层（只关全身闪白，火花 / 伤害数字 / 暴击轮廓都保留）。
  "hitFlash": {
    // 闪多久（秒）。0.10 = 100ms：60fps 下约 6 帧，亮的部分约 4 帧；再短就会被帧间隔吃掉。
    "seconds": 0.10,
    // 峰值强度（0..1）。**这个数是"全身闪白"的总开关之一：设 0 就彻底不闪。**
    "peakIntensity": 0.6,
    // 升到峰值用掉生命周期的多少比例。0.15 = 前 15ms 冲上去，剩下 85ms 衰减。
    "riseFraction": 0.15,
    // **冷却（秒）**：上一次闪白开始后这么久之内，新的命中不会重新点亮它，只是让正在播的那一次继续播完。
    // 没有冷却的话，一秒十几发的枪会让它一直停在最亮处——那就不是"闪"而是"整只变成白色"了。
    // 0.14 在 0.10 的闪白长度下，两次闪之间留 40ms 的暗，看起来是"一下一下"的；冷却小于闪白长度就会连成一片。
    "cooldownSeconds": 0.14,
    // 闪的颜色与"程序画的身体"（没有贴图的敌人）的不透明度。贴图用的是上面的 peakIntensity，这里是那条路径的参数。
    "colour": 0xffffff,
    "alpha": 0.85,
    // 白色覆盖层相对物体半径的倍率（同样是"程序画的身体"那条路径用的）。
    "radiusScale": 1.1
  },

  // ---------------------------------------------------------------------------------------------
  // 命中反馈：暴击（只有大伤害才有的强调）
  // ---------------------------------------------------------------------------------------------
  //
  // 普通命中 = 火花 + 轻闪白。**暴击**再往上加两层：套在身体外的一圈轮廓高亮，和一次很轻的屏幕震动。
  // "多大算暴击"由伤害数字决定，不是由武器种类决定——所以以后加一把高伤害的枪，它自动就能暴击，不用改代码。
  //
  // 阈值刻意够不着单发：\`bullets.damage\` 是 5，满级双管同一帧是 10，都到不了 20。**霰弹的多颗也不会叠加**——
  // 每一颗是各自结算的一次命中（\`BulletField\` 对每颗单独调 \`hit\`），所以四颗贴着打是四次 5 点，不是一次 20 点。
  // 真够得到 20 的只有**把这一局的伤害堆上去**：\`damagePerPick\` 要 20 张，或者霰弹的「抵近射击」叠几张、
  // 再乘上「越大伤害越高」之类的乘区。所以暴击是"这局堆出来了"的结果，不是某一枪的偶然。
  //
  // 这里原来有**两层**（重击 10 / 暴击 20）。删掉重击那一层，是因为两层画的是同一张画、只是响度不同，
  // 而响度用一个可缩放的强度表达就够了。留下的这层完整保留了那套表现（轮廓 + 震动），只是门槛抬到了 20。
  "hitFeedback": {
    /**
     * 伤害达到这个数算暴击：轮廓高亮 + 屏幕震动。
     *
     * 强度按 \`min(1, 伤害 / critDamage)\` 算，而**门槛就是这个分母**——所以任何一次暴击的强度都恰好是 1，
     * 震动只有"满格"或"不响"两种。原来重击和暴击是两个数（门槛 10、分母 20），强度才会在 0.5~1 之间变化；
     * 合并成一道门之后那个区间就不存在了。想让更大的伤害震得更狠，需要给强度**单开一个分母**。
     */
    "critDamage": 20,
    // 轮廓高亮的颜色、峰值不透明度、相对身体半径的位置、线宽（比例）。
    "critOutlineColour": 0xfff2c8,
    "critOutlineAlpha": 0.85,
    "critOutlineRadiusScale": 1.28,
    "critOutlineWidthRatio": 0.14,
    // 轮廓亮多久（秒）。比闪白长：闪白说"打中了"，轮廓说"这一下很重"，后者值得多停一会儿。
    "critOutlineSeconds": 0.18,
    // 屏幕震动：设计像素幅度（乘 1 强度的值）与时长（秒）。**0 = 关掉暴击的震动。**
    // 8px / 0.12s 是"感觉到一下"而不是"镜头在晃"。
    "critShakePixels": 8,
    "critShakeSeconds": 0.12
  },

  // ---------------------------------------------------------------------------------------------
  // 命中击退：敌人被小泡泡子弹打中时，会**轻轻后退一下**
  // ---------------------------------------------------------------------------------------------
  //
  // 闪白是"打中了"的第一层反馈，后退是第二层：闪白只说明**这一帧**有命中，位置上的位移才让玩家看见
  // "这一发把它顶回去了"。两者是一套东西的两半，所以数值也和 hitFlash.seconds 差不多长。
  //
  // 后退的**方向**不用调：永远是"背离命中点"，也就是子弹来的方向（子弹往上飞，所以敌人往上退）。
  // 命中点偏在左边还是右边，决定它往哪边偏一点；没有命中点（连锁放电）时一律往正上方退。
  "hitKnockback": {
    // 一次命中总共后退多少**米**（不是速度：调的时候直接说"退多远"，不用反推）。
    //
    // 8 米是什么概念：鱼的半径是泳道宽度的 0.035（泳道 361 米），也就是 12.6 米——所以这是大约三分之一个
    // 身位，看得见，但明显不是"被打飞"（作对比：怒气爆破把东西弹开是 angry.burst.knockbackMeters = 26 米）。
    // 0 = 关掉击退，打中就只有闪白。
    "meters": 8,
    // 这 8 米在多少秒内退完。用**线性衰减**（一开始最快、末了停住），所以在多少秒内退完，退的就是上面那个米数，
    // 与帧率无关。0.14 ≈ 闪白（0.07）的两倍：闪白还没结束，后退已经到位。
    "seconds": 0.14
  },

  // ---------------------------------------------------------------------------------------------
  // 伤害飘字：子弹**打到敌人**时，在它身上浮出一个伤害数字
  // ---------------------------------------------------------------------------------------------
  //
  // 这是"命中反馈"的第三半，而且是唯一说**多少**的那一半：闪白说"这一帧打中了"，后退说"把它顶回去了"，
  // 只有数字能回答"它还剩多少血、我还要打几发"——敌人的血量本来就是看不见的。
  //
  // 字段和得分飘字（score.popups）**完全一样**，两套共用同一段机制（见 src/numberPopups.ts），
  // 所以这里只写"这一套长什么样"。区别就是这套要**更小声**：得分是事件（打死一条鱼就那么一下），
  // 而伤害是频率（枪一秒能打好几发），所以字号更小、活得也更短。
  //
  // 觉得吵就调这两个：\`lifeSeconds\`（活得短=更清爽）和 \`max\`（同时在飞的上限）。
  // **\`max: 0\` 就是彻底关掉伤害飘字**（这一套就不再产生任何数字），别的都不用动。
  "damagePopups": {
    // 活多久，秒。比得分飘字（0.5）短：同一只敌人在一秒内可能挨好几发，前一个得赶紧让位。
    "lifeSeconds": 0.35,

    // 这段时间里向上飘多少（设计像素）。比得分的小，因为文字本身也小。
    "risePx": 26,

    // 上升曲线：0.6 = 一开始窜得快、后面慢下来（和得分飘字同一种手感）。
    "riseEase": 0.6,

    // 字号（设计像素）。12 比得分的 16 小一档："+50"是主角，"−1"是标点。
    "size": 12,

    // 颜色：珊瑚红，和得分飘字的金色明确不同——玩家一眼就能分出"这个是钱"和"这个是伤害"。
    // 水体是深蓝，所以暖色最跳。
    "colour": 0xff8a7a,
    "alpha": 0.95,

    "weight": "bold",

    // 数字前面加什么。"−"让它读起来是"这一下削掉 1 点"，而不是"它现在是 1 点"。
    // 只想要数字就设成 ""。
    "prefix": "-",

    // 前 35% 的时间全亮，之后淡出。比得分的 0.45 略短：它本来活得就短。
    "fadeFrom": 0.35,
    "fadeEase": 1,

    // 事件位置落在飘字的正中（和得分飘字一致）。
    "anchorX": 0.5,
    "anchorY": 0.5,

    // 同时在飞的上限。枪是每帧都可能命中的，所以这个上限是护栏：到顶了就退休最老的那个（玩家早读过它了）。
    // **0 = 这一套飘字整个关掉**（伤害数字不再出现），这是这一套的开关。
    "max": 20
  },

  // ---------------------------------------------------------------------------------------------
  // 敌人贴图（按种类）
  // ---------------------------------------------------------------------------------------------
  //
  // 每种敌人可以给一到两张图：**平时**一张、**冲锋时**一张（没写就用平时那张）。文件名写在 src/assets/ 下、
  // 不写扩展名。没有贴图的种类照旧用代码画 —— 一次换一种，不用一次全换。
  //
  // 灯笼鱼多一项：它的**触角会发光**，而图里没有画。发光是**代码加上去的**（一根线 + 一颗会呼吸的光点，
  // 位置按图片高度的比例给），所以换图不用重画光，调参数也不用重新导图。
  // 敌人朝哪边算"正面"。左边是默认值——灯笼鱼的图本来就是头在左、尾在右。
  // 某一种敌人如果画反了，就在它自己的条目里写一行 front: "right"，不用动别的。
  "hazardFront": "left",
  // **转向冷却（秒）**：一次转向之后，这么久之内不再改主意。
  // 没有它的话，玩家正好在敌人上下方时，敌人会随着玩家在它中线左右细微移动而**每帧翻转**——那是频闪，不是转身。
  // 2 秒是个"看得见方向、又跟得上玩家横移"的值：调小更灵敏，调大更迟钝。
  "hazardFacing": {
    "cooldownSeconds": 2,
    // **转身动画的时长（秒）**：朝向一变就演一次"正面 → 侧成一条竖线 → 反面"。0 = 不演，直接翻过去。
    //
    // 缓动不是一种风格。\`(1-cos(πt))/2\` 作用在横向缩放上的结果恰好是 \`cos(πt)\`，那正是一块平板以**恒定角
    // 速度**转过去时看起来的宽度——侧成一条线的那一刻最快，两端最慢。所以这只是"真的转过去"的样子。
    //
    // 它由每帧循环推进，**不是** requestAnimationFrame，所以跟着世界的冻结一起冻：暂停面板、变异选择开着
    // 的时候，不会有哪条鱼自己偷偷转完。
    //
    // 和 \`cooldownSeconds\` 的关系：这里要是设得比冷却还长，生物就会翻到一半又转向。动画会从当前的镜像值
    // 接着往回走、不会跳，但看起来会忙。
    //
    // 还有一件事要知道：这 0.4 秒里它**画出来只有一条线宽**，但碰撞盒仍然是整个精灵盒——"画什么打什么"
    // 在这 0.4 秒里是故意不成立的。开 Debug 进关卡能看到一条线外面套着一个完整的框。
    "turnSeconds": 0.4
  },

  // ---------------------------------------------------------------------------------------------
  // 动画（逐帧播放的图）
  // ---------------------------------------------------------------------------------------------
  //
  // 一种敌人如果某个状态有**好几张图**（比如 BOSS 的待机 4 帧、死亡 4 帧），就在这里起个名字，然后在 hazardArt 里
  // 把 move / charge / dead 写成**这个名字**。只有一张图的状态不用进来，直接写文件名就行。
  //
  // **图从哪来**：还是 src/assets/ 下的普通图片，一帧一个文件，走同一套路径解析和预加载（Pixi 的 asset 管理会
  // 按 URL 缓存，同一张图只会下载、上传一次）。所以换图仍然是"按文件名替换文件"，不用改代码。
  //
  // **frames 有两种写法**：
  //   1. 编号模板 + count：\`"frames": "螃蟹-BOSS-待机-{n}", "count": 4\` —— 展开成 -1、-2、-3、-4。
  //      编号从 1 开始，这是文件名的写法决定的。
  //   2. 直接列名字：\`"frames": ["图A", "图B"]\`。图没编号时用这个，顺序就是列表顺序。
  //
  // **速度**：framesPerSecond 是"每秒几帧"，maxSeconds 是"这个动画最长能演多久"，**两个里更短的那个说了算**。
  // 前者决定观感（0.07 秒一帧就是老式逐帧动画的味道），后者是护栏：一个 4 帧的图如果配了 0.5 帧/秒就是 8 秒，
  // 看起来像卡住了而不是在动。
  //
  // **once**：true = 只播一遍、停在最后一帧（死亡动画就是这样）；不写 = 循环（待机、游动）。
  "animations": {
    // 螃蟹 BOSS 的待机：4 帧循环。
    // 0.25 秒一帧 = 每秒 4 帧，一轮 1 秒。想更"呼吸感"就调小 framesPerSecond（更慢），想更急促就调大。
    "boss-idle": {
      "frames": "螃蟹-BOSS-待机-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 螃蟹 BOSS 的死亡：4 帧、每秒 3.5 帧播一遍，停在最后一帧，整段约 1.14 秒。
    // **播完之后尸体才被移除**，所以这两个数一起决定"爆炸在场上停多久"：改小 framesPerSecond 或改大 maxSeconds 都是让它停更久。
    // maxSeconds 在这里是护栏而不是实际长度（4 帧 ÷ 3.5 = 1.14 < 2）。
    "boss-dead": {
      "frames": "螃蟹-BOSS-死亡-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 水母的待机：4 帧循环，一轮约 0.73 秒（4 ÷ 5.5），和资产管线算出来的 180 毫秒一帧一致。
    // 四张图来自 \`generated-images/jellyfish-alpha/\`（像素化 + 对齐之后，该目录已随中间产物删除），导进 src/assets 的是
    // **同一扇裁剪窗口裁出来的等尺寸帧**（都是 118×174），这一点不是洁癖：
    // 绘制时按**图片宽度**统一缩放（hazards.ts 的 \`unit = size / texture.width\`），
    // 四帧宽度不一样的话每帧的缩放倍率就跟着不一样 —— 而伞盖的收缩/张开**正是宽度差**，
    // 于是动画会剩下触手在动、身体不动。等尺寸帧让一个 \`scale\` 管住全部四帧。
    "jelly-idle": {
      "frames": "水母-待机-{n}",
      "count": 4,
      "framesPerSecond": 5.5,
      "maxSeconds": 4
    },
    // 螃蟹 BOSS 的**挥螯**：8 帧、每秒 11 帧，一轮 0.73 秒，只播一遍（once）然后停在第 8 帧。
    // 帧序：1-2 抬钳 → 3-4 高举（前摇，玩家读得到的预警）→ 5 下砸 → **6 钳子合上（矿物颗粒在这一帧离开钳子，
    // 见 hazards.boss.attackSprayFrame）** → 7 收势 → 8 回到待机姿势（所以它既能接回待机，也能当循环看）。
    // **11 帧/秒是"重"的读数**：再快就轻飘，再慢前摇会变成罚站。想改手感就动这一个数。
    "boss-attack": {
      "frames": "螃蟹-BOSS-攻击-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 金枪鱼的**游动**：4 帧循环，每秒 8 帧（125 毫秒一帧），一轮 0.5 秒。
    // 帧序是"摆尾向上 → 摆平 → 摆尾向下 → 摆平"，所以第 4 帧接得回第 1 帧。
    // **8 帧/秒**：鱼鳍的摆动在这个速度上读起来是"游"而不是"抖"；想更急促就往上调，12 左右开始像抽搐。
    "tuna-swim": {
      "frames": "金枪鱼-游动-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    // 小鱼的游动：四帧，和鲸/豚/鲨/金枪鱼同一套（转尾巴合成，身体逐像素不变），帧率也取 8——
    // 它是全场数量最多的动画，跟金枪鱼用同一个数才不会出现"一鱼一速"。
    //
    // **四个品种共用这一组参数**（帧率、帧数、上限全都一样）。它们只是四条不同的鱼，摆动不该有差别；
    // 哪天想让沙丁摆得比鲈快，就是在这里给某一条单独改一个数——但没有理由之前不要。
    "fish-swim": {
      "frames": "小鱼-游动-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    "fish-swim-2": {
      "frames": "小鱼2-游动-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    "fish-swim-3": {
      "frames": "小鱼3-游动-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    "fish-swim-4": {
      "frames": "小鱼4-游动-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    // ---------------------------------------------------------------------------------------------
    // 第 4 关的四个猎食者：四帧游动循环，和大鱼（金枪鱼）同一套做法的产物。
    //
    // **帧率是按体型给的，不是统一值**：小的摆动快、大的摆动慢。这和现实一致，也让"大"这件事在**时间**上
    // 也读得出来——座头鲸 5 帧/秒、一轮 0.8 秒，是全场最慢的动作；海豚 9 帧/秒是四个里最急的。
    // 想整体更慢就一起调小，但**别只调一只**：四个帧率一样的话，鲸鱼看起来就只是一条放大的海豚。
    "dolphin-swim": {
      "frames": "海豚-游动-{n}",
      "count": 4,
      "framesPerSecond": 9,
      "maxSeconds": 2
    },
    "octopus-swim": {
      "frames": "章鱼-游动-{n}",
      "count": 4,
      "framesPerSecond": 6,
      "maxSeconds": 2
    },
    "shark-swim": {
      "frames": "大白鲨-游动-{n}",
      "count": 4,
      "framesPerSecond": 7,
      "maxSeconds": 2
    },
    "whale-swim": {
      "frames": "座头鲸-游动-{n}",
      "count": 4,
      "framesPerSecond": 5,
      "maxSeconds": 2
    },
    // 螃蟹-move：一个资产一套动画，import 生成的。
    "螃蟹-move": {
      "frames": "螃蟹-move-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    // 炸弹鱼-move：一个资产一套动画，import 生成的。
    "炸弹鱼-move": {
      "frames": "炸弹鱼-move-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    // 电击水母-move：一个资产一套动画，import 生成的。
    "电击水母-move": {
      "frames": "电击水母-move-{n}",
      "count": 4,
      "framesPerSecond": 8,
      "maxSeconds": 2
    },
    // 烟囱蟹王-move：move（循环），import 生成的。
    "烟囱蟹王-move": {
      "frames": "烟囱蟹王-move-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 烟囱蟹王-attack：attack（播一遍停住），import 生成的。
    "烟囱蟹王-attack": {
      "frames": "烟囱蟹王-attack-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 烟囱蟹王-dead：dead（播一遍停住），import 生成的。
    "烟囱蟹王-dead": {
      "frames": "烟囱蟹王-dead-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 冠冕水母-move：move（循环），import 生成的。
    "冠冕水母-move": {
      "frames": "冠冕水母-move-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 冠冕水母-attack：attack（播一遍停住），import 生成的。
    "冠冕水母-attack": {
      "frames": "冠冕水母-attack-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 冠冕水母-dead：dead（播一遍停住），import 生成的。
    "冠冕水母-dead": {
      "frames": "冠冕水母-dead-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 寄居沉船章鱼-move：move（循环），import 生成的。
    "寄居沉船章鱼-move": {
      "frames": "寄居沉船章鱼-move-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 寄居沉船章鱼-attack：attack（播一遍停住），import 生成的。
    "寄居沉船章鱼-attack": {
      "frames": "寄居沉船章鱼-attack-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 寄居沉船章鱼-dead：dead（播一遍停住），import 生成的。
    "寄居沉船章鱼-dead": {
      "frames": "寄居沉船章鱼-dead-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 长尾鲨-move：move（循环），import 生成的。
    "长尾鲨-move": {
      "frames": "长尾鲨-move-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 长尾鲨-attack：attack（播一遍停住），import 生成的。
    "长尾鲨-attack": {
      "frames": "长尾鲨-attack-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 长尾鲨-dead：dead（播一遍停住），import 生成的。
    "长尾鲨-dead": {
      "frames": "长尾鲨-dead-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 废网巨鲨-move：move（循环），import 生成的。
    "废网巨鲨-move": {
      "frames": "废网巨鲨-move-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 废网巨鲨-attack：attack（播一遍停住），import 生成的。
    "废网巨鲨-attack": {
      "frames": "废网巨鲨-attack-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 废网巨鲨-dead：dead（播一遍停住），import 生成的。
    "废网巨鲨-dead": {
      "frames": "废网巨鲨-dead-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 风暴之眼-move：move（循环），import 生成的。
    "风暴之眼-move": {
      "frames": "风暴之眼-move-{n}",
      "count": 4,
      "framesPerSecond": 4,
      "maxSeconds": 4
    },
    // 风暴之眼-attack：attack（播一遍停住），import 生成的。
    "风暴之眼-attack": {
      "frames": "风暴之眼-attack-{n}",
      "count": 8,
      "framesPerSecond": 11,
      "maxSeconds": 2,
      "once": true
    },
    // 风暴之眼-dead：dead（播一遍停住），import 生成的。
    "风暴之眼-dead": {
      "frames": "风暴之眼-dead-{n}",
      "count": 4,
      "framesPerSecond": 3.5,
      "maxSeconds": 2,
      "once": true
    },
    // 火山火焰：第一关喷口的喷流。4 帧循环，12 帧/秒（一轮约 0.33 秒）。
    // 它不是“生物动画”，因此没有 idle/attack/dead 之分；循环速度只决定火焰抖得多快。
    "vent-flame": {
      "frames": "火山火焰-{n}",
      "count": 4,
      "framesPerSecond": 12,
      "maxSeconds": 2
    }
  },

  "hazardArt": {
    // ---------------------------------------------------------------------------------------------
    // 小鱼：游戏里最常见的生物（六关一共刷 129 处），原来是 \`drawFish\` 用代码画的椭圆加三角尾。
    // 现在换成原图 + **转尾巴的游动循环**。
    //
    // \`scale: 1.94\` 是按 \`radius 0.035\` 算的：画出来宽度 = 2 × 0.035 × 412 × 1.94 ≈ 56px（网格 40），
    // 和代码画那版差不多（旧版身体 3r 宽 + 尾巴伸到 2.2r，全长约 53px）——**鱼是全场的基准尺寸**，
    // 它变大或变小，别的生物的"大小"就读不出来了。
    //
    // **有一处只有贴图会丢的东西，已经单独补上了**：被诱饵控住的鱼会画一个呆滞的白眼
    // （见 hazards.ts 精灵分支里的注释）——那不只是装饰，因为被引诱的鱼**既不追你也不会伤你**，
    // "哪些鱼现在被控住了"就是威胁状态本身。代码画的那版是**把眼睛换成白点**，而图片自带眼睛，
    // 所以那个点是在精灵之后重画上去的。
    // ---------------------------------------------------------------------------------------------
    // 小鱼：**四个品种，行为完全一样**，只有长相不同。
    //
    // 它们都是 \`stepFish\`、都是 radius 0.035、都掉一样的东西——"品种"只影响画出来是什么，
    // 所以加品种不需要动任何一行玩法代码。
    //
    // **一个品种 = 一群鱼**：品种不是每条鱼随机挑的，而是**跟着刷怪块走**（\`expandBlock\` 把块的序号发给
    // 块里的每一条），因为一块就是一群——二十条鱼是一个鱼群，而这群鱼一半沙丁一半鲈，那是两个群在假装一个。
    // 关卡里按块轮转（\`序号 % 4\`），所以相邻两群一定不同；随机刷怪（一次只来一条）才是每条随机。
    //
    // 四条都朝左、**同一个 \`--drawn 56\`**，所以一群换品种时体型不变；高度不同（14 / 21 / 21 / 22 像素）
    // 是它们本来的体型差——沙丁就是比鲈细长。
    "fish": {
      "front": "left",
      // **鱼不看玩家，看向自己游的方向。**
      //
      // 默认是"面朝玩家的气泡"（猎人该面向猎物），但这条对鱼是错的：屏幕上的鱼**绝大多数没有在追人**——
      // \`stepFish\` 只在感知半径内才靠拢，半径外只是自己 S 形漂。所以原来那些漂着的鱼会**集体转过头来盯着一个
      // 根本没注意到你的气泡**，而**被诱饵控住的鱼**更明显：它正在往远离你的方向游，却回头看着你。
      //
      // 关掉之后它面向自己的 \`heading\`（游向），还没游过任何地方时保持原图朝左的姿势。
      "facesPlayer": false,
      // 四张脸：细长的沙丁式（最扁，41×14）、原来的银色那条（41×21）、圆钝的鲈式（41×22）、带竖条纹的鲈科（41×22）。
      "variants": [
        { "move": "fish-swim", "scale": 1.94 },
        { "move": "fish-swim-2", "scale": 1.94 },
        { "move": "fish-swim-3", "scale": 1.94 },
        { "move": "fish-swim-4", "scale": 1.94 }
      ],
      "alpha": 1
    },
    // ---------------------------------------------------------------------------------------------
    // 金枪鱼：新敌人，一张游动动画，没有第二张姿势
    // ---------------------------------------------------------------------------------------------
    //
    // 它**和鱼是同一套行为**（见 src/hazards.ts 的 CREATURES / CONTACT：\`tuna: stepFish\` / \`tuna: contactFish\`），
    // 所以这里只有一张图：游动循环。冲锋时不需要换姿势（鱼也没有图），蓄势的弧线是代码画的。
    // **\`scale: 2.5\`** 是按 \`radius 0.045\` 算的：画出来宽度 = 2 × 0.045 × 泳道像素 × 2.5 ≈ **93px**（手机上），
    // 而**那 93px 就是它的碰撞盒宽度**——判定框是精灵占的那块矩形，高 = 宽 × (38 ÷ 70) ≈ 50px。
    // 这是全场最长的鱼之一，所以它的判定框又宽又扁；**它也因此是这次改动里威胁涨得最多的一个**
    // （见 README 的"碰撞盒"一节）。
    "tuna": {
      // 图里金枪鱼头朝左，和全局默认一致。
      "front": "left",
      "move": "tuna-swim",
      "scale": 2.5,
      "alpha": 1
    },
    // ---------------------------------------------------------------------------------------------
    // 第 4 关的四个猎食者。**四张图里头的方向都是朝左**，和全局默认一致，所以 front 可以不写——
    // 写出来是为了下次换图时一眼能看到"这里依赖朝向"。
    //
    // **\`scale\` 现在直接决定碰撞盒**（这是它上一条定义的反转，见下）：画出来的精灵宽度 = 2 × radius × scale，
    // 而**精灵占的那块矩形就是判定**（\`hazardBoxFractions\`，在 src/hazards.ts）。
    //
    //     判定框宽 = 2 × radius × scale        判定框高 = 宽 × (图高 ÷ 图宽)
    //
    // 所以"改 scale 只影响观感"这句话**不再成立**：调大 scale，图和判定一起变大。这正是这次改动的目的——
    // 以前是一只 2.5 倍于自己判定圈的金枪鱼。
    //
    // 这四个值是和上面 hazards.radius 里的 0.055 / 0.07 / 0.07 / 0.085 **成对**定下来的，
    // 分别得到 90.6 / 109.6 / 138.4 / 154.1 屏幕像素，也就是导入时传给 import-sheet.py 的 \`--drawn\`。
    // **改其中任何一个，都要按新宽度重跑一遍导入**（网格 = 画出来宽度 ÷ 1.4），否则这只怪物的像素
    // 密度就和别人不一样——这在这套美术里一眼看得出来。
    "dolphin": {
      "front": "left",
      "move": "dolphin-swim",
      "scale": 2.0,
      "alpha": 1
    },
    "octopus": {
      "front": "left",
      "move": "octopus-swim",
      "scale": 1.9,
      "alpha": 1
    },
    "shark": {
      "front": "left",
      "move": "shark-swim",
      "scale": 2.4,
      "alpha": 1
    },
    "whale": {
      "front": "left",
      "move": "whale-swim",
      "scale": 2.2,
      "alpha": 1
    },
    // ---------------------------------------------------------------------------------------------
    // 电鳗：**两张图，接在它现有的射击上**。
    //
    // 它本来就会放"电箭"（\`enemyBullets.shooters.eel\`，0.6 发/秒、射程 420m、\`shape: "bolt"\`），
    // 所以"放电攻击"不需要第二个机制：**开火的那一瞬间切到带电弧的姿势**，过一会儿回待机。
    // 玩家看到的"它电你了"就是它开火的样子，而开火是它早就在做的事。
    //
    // \`attackSeconds\` 是放电姿势亮多久。射一发的间隔是 1/0.6 ≈ 1.67 秒，0.45 就是"不到三分之一程带电"：
    // 电弧闪一下再熄。**调到接近 1.67 会让这张攻击图变成它的常态**，那待机那张就白做了。
    "eel": {
      "front": "left",
      "move": "电鳗",
      "attack": "电鳗-放电",
      "attackSeconds": 0.45,
      // 画出来宽 2 × 0.058 × 412 × 2.18 ≈ 104px（网格 74）。两张图是同一天同一宽度导入的，
      // 所以切换姿势时它**不会忽大忽小**。
      "scale": 2.18,
      "alpha": 1
    },
    // ---------------------------------------------------------------------------------------------
    // 海胆：一张图 + **自转**。它本来就是一个放射状的刺球，转起来就是它全部的动画。
    //
    // \`spin\` 是**每秒转多少弧度**，沿用的是原来代码画那版的转速（\`drawUrchin\` 里的 \`h.phase * 0.35\`），
    // 所以换成图片之后手感不变。0 = 完全不转；想更明显就调大（1.0 左右是"滚起来了"）。
    "urchin": {
      "move": "海胆",
      "spin": 0.35,
      // 画出来宽 2 × 0.052 × 412 × 1.54 ≈ 66px（网格 47）。和代码画那版一样：
      // 刺尖伸到 1.55r，所以图片比碰撞圈大一圈，而碰撞仍然是那个圈。
      "scale": 1.54,
      "alpha": 1
    },
    // 盲虾：第一关的常客，靠水流漂，不会追人。
    "shrimp": {
      // 如果这张图的正面在右边，把这里改成 "right" 就对了。
      "front": "left",
      "move": "盲虾",
      // **蓄力姿势**：和灯笼鱼一样，进入冲锋前摇（charge 非空）时换成这张。
      // 注意：盲虾**目前不是冲锋者**（charges.chargers 里没有它），所以这张图暂时没有出场机会；
      // 想让它真蓄力冲锋，在 charges.chargers 里照着别的冲锋者加一行 shrimp 即可。
      "charge": "盲虾-蓄力",
      "scale": 1.4,
      "alpha": 1
    },
    "angler": {
      // 这张图的正面在左边（头朝左）。玩家的气泡在它右边时，它会被镜像过来面对玩家。
      "front": "left",
      "move": "灯笼鱼-移动",
      "charge": "灯笼鱼-冲锋",
      // 贴图相对敌人半径的缩放（图里鱼占画面的比例不同就调这里）。
      "scale": 1.5,
      "alpha": 1,
      // **触角发光**：沿鱼身上方画一根细线，末端一颗光点，亮度随时间呼吸。
      // **发光（lure）已按你的要求去掉**：新的那张图里已经带了光，程序再画一层只是两套光在打架。
      //
      // 想重新打开：把下面这段作为 \`"lure": { … }\` 加回这个条目里就行（键与含义见 README 里那张表）——
      // 代码一直在，只是没有配置它就不会画。

    },
    // ---------------------------------------------------------------------------------------------
    // 水母（\`jelly\`）：第一关就有、第三关成林的那只软体
    // ---------------------------------------------------------------------------------------------
    //
    // 它只有一套图（待机 4 帧），所以 \`charge\` 不写 —— 水母是会从侧面冲锋的（见 charges.chargers.jelly），
    // 蓄势那一帧就继续用 \`move\` 的动画，而蓄势的弧线和落点环是代码画的、不在这张图里（照旧会画）。
    "jelly": {
      // 图是正对镜头的（伞盖朝上、触手垂下），所以朝向只影响镜像。写 left 是默认值。
      "front": "left",
      "move": "jelly-idle",
      // **\`scale\` 是"图片宽度 = 碰撞直径 × scale"**。
      // 图片框宽 118 px，其中**伞盖**最宽 81 px（触手比伞盖还散，框宽是触手撑出来的）。
      // \`hazards.radius.jelly = 0.062\` 画出来的伞盖本来就是 2r 宽，所以 118 / 81 ≈ 1.46 就是
      // "伞盖和碰撞圈一样宽"的那一档 —— 1.45 取的它：**看得见的身体 = 会撞到你的那个圆**。
      // 觉得小就往上调（触手会比伞盖先出画），觉得大就往下调（伞盖会小于碰撞圈，看着像被空气撞）。
      "scale": 1.45,
      "alpha": 1
    },
    // ---------------------------------------------------------------------------------------------
    // 第一关的 BOSS：螃蟹
    // ---------------------------------------------------------------------------------------------
    //
    // 它的三个状态各有一张/一套图：
    //   move  = 待机（平时）—— 4 帧循环，见上面 animations 里的 boss-idle
    //   dead  = 死亡 —— 4 帧播一遍，最后一帧停住，然后它才从场上被移除（animations.boss-dead）
    //   charge= 没有（它不冲锋）
    //
    // **\`dead\` 只在"这个敌人是死掉而不是离开"时才有意义**，目前只有 BOSS 是这样：别的敌人被打光血是"被赶走"，
    // 会往某个方向游走。BOSS 是关卡的胜利条件，它没有地方可去，所以它**死在原地**、把死亡动画播完。
    "boss": {
      // 螃蟹的图是正对的（两只钳子都朝着镜头），所以朝向不重要；写 left 是默认值。
      "front": "left",
      "move": "boss-idle",
      // **挥螯**：它每 attackEverySeconds 秒挥一次，挥到第 attackSprayFrame 帧时甩出矿物颗粒。
      // 这三张图都是 512 宽（1024 的原始图在它被导入的那次提交里；降采样是为了显存，见 README 的图集一节）。
      "attack": "boss-attack",
      "dead": "boss-dead",
      // -----------------------------------------------------------------------------------------
      // BOSS 的命中反馈三件套（**所有 BOSS 都适用**，因为规则挂在 hazardArt 这一层，不是挂在某一关）
      // -----------------------------------------------------------------------------------------
      //
      // 1. \`spriteFlashScale\` —— **全身闪白的倍率**：乘在 hitFlash.peakIntensity 上。
      //    1 = 和普通敌人一样亮（全局配置已经是 20%–30% 的强度，所以这里保持 1 就是符合要求的那一档）；
      //    0 = 这个 BOSS 完全不闪白。想让它比普通敌人更含蓄就往下调。
      "spriteFlashScale": 1,
      // 图里螃蟹占画面的比例：1024 的方图里螃蟹横向占满、纵向约 55%，所以这个数要比 1 大不少才显得"占满"。
      // 2.8 是在屏幕上调过的值（初始按"身体占泳道 1/3"估的是 1.8）。觉得小就继续往上调，糊了就往下调。
      "scale": 2.8,
      "alpha": 1
    },
    // ---------------------------------------------------------------------------------------------
    // 六个 BOSS 的图：**现在都还指着旧 BOSS 的那三套动画**
    // ---------------------------------------------------------------------------------------------
    //
    // 这是拆分中间态，不是最终形态。六行现在只是把 \`hazardArt.boss\` 抄了一遍，所以：
    //   * 六个 kind 都能查到自己的图 → 画面上和拆分前**完全一样**，没有回归；
    //   * 每一行都独立了 → 某只 BOSS 的帧做好之后，改**这一行**的 \`move\`/\`attack\`/\`dead\` 就行，
    //     不需要动代码，也不需要动别的 BOSS。
    //
    // 六只都换完之后，旧的 \`boss\` kind、\`hazards.boss\` 和这一组 \`hazardArt.boss\` 一起删掉（那才是最后一步）。
    //
    // ---------------------------------------------------------------------------------------------
    // **BOSS 默认不调头**（\`fixedFacing\`）
    // ---------------------------------------------------------------------------------------------
    //
    // BOSS 的立绘**永不镜像**——不朝玩家翻、也不按自己漂的方向翻，永远按原图的样子画。
    //
    // 为什么：BOSS 是一场仗的布景，立绘是照着那样画的；而且它按 \`scale: 2.8\` 占掉三分之一泳道，0.4 秒的转身
    // （横向压扁）放在这么大的东西上，看起来像画面抽了一下，而不是像它转了个身。
    //
    // **要让某一只调头，把这一行的 \`fixedFacing\` 改成 \`false\`**——那时它会按玩家所在的左右侧镜像，转身动画
    // 和其它生物一样（\`hazardFacing.turnSeconds\`）。**六只里没有一只是照"面向玩家"画的**，所以真要打开之前，
    // 先打开它在游戏里看一眼：站到它右边，如果它看起来朝左，就说明它的立绘本来朝左。
    //
    // 注意两件事：
    //   * 这一行写 \`true\` 只是把默认值说出来。**代码里的默认值也是"BOSS 不调头"**（\`paintHazards\` 里
    //     \`fixedFacing ?? 是BOSS\`），所以将来加第七只、忘了写这一行，它也不会偷偷调头。
    //   * \`front: "left"\` 别删。不调头时它一次都用不上，但哪只以后打开了调头，它决定"哪边算面向玩家"——
    //     写反了那只就会背对着玩家。
    //
    // 另外：**攻击方向不受这个影响**。BOSS 的攻击是从玩家所在的那一侧发出来的（\`paintHazards\` 里另外一处），
    // 不看朝向——所以关掉调头不会让它打歪，只是立绘可能看着朝反方向挥手。
    // 第 1 关 —— 烟囱蟹王
    "boss-crab": { "front": "left", "fixedFacing": true, "move": "烟囱蟹王-move", "attack": "烟囱蟹王-attack", "dead": "烟囱蟹王-dead", "spriteFlashScale": 1, "scale": 2.8, "alpha": 1 },
    // 第 2 关 —— 寄居沉船章鱼
    "boss-octopus": { "front": "left", "fixedFacing": true, "move": "寄居沉船章鱼-move", "attack": "寄居沉船章鱼-attack", "dead": "寄居沉船章鱼-dead", "spriteFlashScale": 1, "scale": 2.8, "alpha": 1 },
    // 第 3 关 —— 冠冕水母
    "boss-jelly": { "front": "left", "fixedFacing": true, "move": "冠冕水母-move", "attack": "冠冕水母-attack", "dead": "冠冕水母-dead", "spriteFlashScale": 1, "scale": 2.8, "alpha": 1 },
    // 第 4 关 —— 长尾鲨
    "boss-shark": { "front": "left", "fixedFacing": true, "move": "长尾鲨-move", "attack": "长尾鲨-attack", "dead": "长尾鲨-dead", "spriteFlashScale": 1, "scale": 2.8, "alpha": 1 },
    // 第 5 关 —— 废网巨鲨
    "boss-netshark": { "front": "left", "fixedFacing": true, "move": "废网巨鲨-move", "attack": "废网巨鲨-attack", "dead": "废网巨鲨-dead", "spriteFlashScale": 1, "scale": 2.8, "alpha": 1 },
    // 第 6 关 —— 风暴之眼
    "boss-eye": { "front": "left", "fixedFacing": true, "move": "风暴之眼-move", "attack": "风暴之眼-attack", "dead": "风暴之眼-dead", "spriteFlashScale": 1, "scale": 2.8, "alpha": 1 },


    // ---------------------------------------------------------------------------------------------
    // 四位枪手
    // ---------------------------------------------------------------------------------------------
    //
    // 在此之前这四个种类是用 \`drawArcher\` / \`drawPistol\` / \`drawPuffer\` / \`drawStarfish\` 代码画的占位身体，
    // 现在换成原图。四张原图都是**真实照片**经 Seedream 重绘、再按 1.4 屏幕像素/texel 像素化得到的；
    // 照片的出处、许可和重绘参数记在 README 的资产一节。原图在 \`generated-images/gunners/\`（已入库）。
    //
    // 四张图都朝左，也就是 \`hazardFront\` 的默认值，所以这里不写 \`front\`。
    //
    // **\`scale\` 不是随手填的，它是从"画出来多大"反推的**：网格 = 2 × hazards.radius × 412 × scale ÷ 1.4。
    // 射水鱼 1.8 → 画出来 56px → 网格 32（和小鱼同档，它俩体型本来就一样）；刺魨 1.55 → 64px → 网格 38；
    // 海星 1.7 → 73px → 网格 44；手枪虾 1.5 → 72px → 网格 43（四者里最大的，精英要显眼）。
    // **改这里就要重新跑一遍导入**，否则像素密度和别的敌人对不上，画面里会有一种生物明显比邻居"细"。
    "archer": {
      // 日常款射手：一条朝左的银身鱼，竖带、大眼、上翘的尖吻——吻部就是它的枪口。
      "move": "射水鱼",
      "scale": 1.8,
      "alpha": 1
    },
    "pistol": {
      // 精英。图里那只巨螯是整张画最大的单个形状，因为"这一发会打疼我"必须在看见子弹之前就读出来。
      "move": "手枪虾",
      "scale": 1.5,
      "alpha": 1
    },
    "puffer": {
      // 硬，而且打它有代价。图是一个竖满刺的球。
      // **已知缺口**：代码画的那版在反击冷却时会瘪下去（\`counterRest > 0\`），那是"现在打它免费"的唯一提示；
      // 贴图版没有第二张图，所以现在冷热一个样。补法是再生成一张瘪下去的图、挂到 \`charge\` 上，
      // 再给 puffer 加一条 pose 规则（见 hazards.ts 的 POSE_RULES）。
      "move": "刺魨",
      "scale": 1.55,
      "alpha": 1,
      // charge：刺魨-瘪。这张是同一个生物的第二副样子，不是另一个种类。
      "charge": "刺魨-瘪"
    },
    "starfish": {
      // **海星不能用 \`spin\`。** \`spin\` 是"每秒转多少弧度"的速率，而海星的五条腕**就是**下一轮齐射的五个方向：
      // stepStarfish 沿 \`h.volleySpin + i × 72°\` 发射，那是个**状态**（每轮跳一格、初值是随机角），
      // 速率追不上状态，差一格就是"图在骗人"。\`volleyAligned\` 让角度直接取自 h.volleySpin，
      // 并且**不镜像**——镜像是同一个 bug 的另一半：镜像后的海星仍然是海星，但每条腕都跑到了错的一侧。
      "move": "海星",
      "scale": 1.7,
      "alpha": 1,
      "volleyAligned": true,
      // 图里第一条腕的朝向（游戏坐标，y 向上）。从原图的剪影量出来是 20°。海星是五等分的，所以哪条算"第一条"
      // 无所谓——换一条就正好差一整格，落在同一颗星的另一条腕上。这个数只负责把图自己的朝向对到齐射的 0 度。
      "volleyBaseRadians": 0.3491
    },
    // mineral：矿物颗粒。scale 是按"画出来多大"反推的，和旁边那些一样。
    // \`fixedFacing: true\`：它是**东西，不是生物**，图永远按原样画，不朝玩家转、也不随漂移方向镜像。
    // （只设 \`facesPlayer: false\` 不够：那样它还是会按自己横向漂的方向翻面。）
    "mineral": { "move": "矿物颗粒", "scale": 1.7, "alpha": 1, "fixedFacing": true },
    // torpedo：失控鱼雷。scale 是按"画出来多大"反推的，和旁边那些一样。
    "torpedo": { "move": "失控鱼雷", "scale": 2, "alpha": 1 },
    // crab：螃蟹。scale 是按"画出来多大"反推的，和旁边那些一样。
    "crab": { "move": "螃蟹-move", "scale": 1.5, "alpha": 1 },
    // bombfish：炸弹鱼。scale 是按"画出来多大"反推的，和旁边那些一样。
    "bombfish": { "move": "炸弹鱼-move", "scale": 1.5, "alpha": 1 },
    // zapper：电击水母。scale 是按"画出来多大"反推的，和旁边那些一样。
    "zapper": { "move": "电击水母-move", "scale": 1.5, "alpha": 1 },
    // fallcrate：下落木箱。复用场景木箱的同一张图与同一档大小；\`fixedFacing\` 因为箱子没有朝向，
    // 不该朝玩家转或随漂移方向镜像。
    "fallcrate": { "move": "木箱", "scale": 1.4, "alpha": 1, "fixedFacing": true },
    // ink：第二关 BOSS 的墨雾。图片是**落地后的云**；墨团飞行阶段仍用程序画的小团（见 hazards.ts）。
    // \`fixedFacing\` 因为墨云没有朝向，不该朝玩家转或随漂移方向镜像。
    "ink": { "move": "墨汁", "scale": 1, "alpha": 1, "fixedFacing": true }
  },

  "hazards": {
    // ---------------------------------------------------------------------------------------------
    // 体型：每种敌人的**基准尺寸**（占泳道宽度的比例）
    // ---------------------------------------------------------------------------------------------
    //
    // 它的含义在这次改动里变窄了，值得说清楚：它**不再等于碰撞半径**。
    //
    //   碰撞盒 = 精灵占的那块矩形 = 宽 \`2 × radius × scale\`、高 \`宽 × (图高 ÷ 图宽)\`
    //
    // 也就是说 \`radius\` 和 \`hazardArt.<kind>.scale\` 一起决定**画出来多大**，而画出来多大**就是**判定多大
    // （见 \`hazardBoxFractions\`，src/hazards.ts）。这样"看见多大就撞多大"是**推出来的**，不是靠人对数字。
    //
    // 它仍然单独决定那些"和美术无关"的间距：吸附范围、出生点离屏幕边缘多远、擦边圈的基准。
    //
    // 没有美术的五种（\`trash\` / \`rot\` / \`oil\` / \`foam\` / \`rain\`）退回**半径 radius 的圆**——
    // 那是绘制也退回的形状（一个半径为 radius 的点），所以两边仍然一致。
    // **喷口是例外**：它有两层贴图（\`hazards.vent.art\`），但判定仍然是“底座圆 + 沿朝向的等宽胶囊”，
    // 贴图按这两个尺寸画，所以“看见多大就撞多大”仍然成立。
    //
    // 比例而不是米：窄手机上泳道更窄，比例能让敌人保持"占屏幕多少"的观感一致。
    "radius": {
      "fish": 0.035,
      // **金枪鱼**：比鱼大一档（0.035 → 0.045，+29%）。它是新敌人，行为照旧是鱼那套（追猎 + 冲锋），
      // 区别只在体型。想再大一点就改这里——**同时要改网格**（\`sheet --grid 画出来宽度/1.4\`），
      // 因为像素密度是按"画到屏幕上多大"定的，见 README 的像素化一节。
      "tuna": 0.045,
      // ---------------------------------------------------------------------------------------------
      // 第 4 关的四个猎食者：同一种行为、四种体型。半径和 \`hazardArt.<kind>.scale\` 一起决定**画出来多大**，
      // 而画出来多大就是碰撞盒（见本段开头的说明）——所以这四个现在是本次改动里判定涨得最多的一批。
      // 所以这四个数就是这个关卡的难度本身——0.035 的鱼是麻烦，0.085 的鲸鱼是一个决定。
      //
      // **改这里必须同时改网格**：像素密度是按"画到屏幕上多大"定的，画出来宽度 = 2 × radius × 412 × scale
      // （见 hazardArt 的 scale），网格 = 那个宽度 ÷ 1.4。改完要重新跑一遍导入，否则图会糊或者过细。
      // 当前值对应的画出来宽度：海豚 90.6 / 章鱼 109.6 / 大白鲨 138.4 / 座头鲸 154.1 屏幕像素。
      "dolphin": 0.055,
      "octopus": 0.07,
      "shark": 0.07,
      "whale": 0.085,
      "jelly": 0.062,
      "trash": 0.05,
      "crab": 0.045,
      "urchin": 0.052,
      "bombfish": 0.048,
      "mineral": 0.018,
      // **盲虾放大到 2 倍**：0.033 → 0.066（第一关里它多，放大后更容易看见、也更好吃）。
      "shrimp": 0.066,
      // 灯笼鱼：0.045 → 0.09（2 倍，上一轮的要求；重建这张表时不能把它带回默认值）。
      "angler": 0.09,
      "torpedo": 0.036,
      "zapper": 0.058,
      "rain": 0.014,
      // 墨雾：Boss 技能生成的区域，半径要足够大才像一片雾。
      "ink": 0.3,
      // 下落木箱：与场景木箱同尺寸（场景那边是 \`obstacles.radius.crate\`），所以看起来就是同一种箱子。
      "fallcrate": 0.075,
      "eel": 0.058,
      "rot": 0.056,
      "oil": 0.066,
      // 四位枪手：射水鱼是鱼的大小（0.038），手枪虾是最大的枪手（0.058，精英要显眼），
      // 刺魨介于螃蟹与海胆之间（0.05），海星是宽而扁的东西（0.052）。
      // 这四个值与代码里的 KIND_TUNING 默认一致——写在这里是让"调体型"和其它生物一样有唯一的去处。
      "archer": 0.038,
      "pistol": 0.058,
      "puffer": 0.05,
      "starfish": 0.052,

    },

    // ---------------------------------------------------------------------------------------------
    // 判定倍数：在"精灵盒"之上单独放大 / 缩小某只生物的碰撞盒
    // ---------------------------------------------------------------------------------------------
    //
    // 精灵盒是**画什么打什么**的默认答案，但"图占多大"和"应该撞多难"不总是同一件事：一条画得很宽的鱼，
    // 尾巴尖不该真的能碰到你；反过来，一个画得很小、行为却很凶的东西，判定给它放大一点才公平。
    //
    // 这个倍数**只作用于判定**，不动美术——美术的大小是 \`radius\` × \`hazardArt.<kind>.scale\`，那两项一起
    // 决定画出来多大（见 README 的像素化一节）。所以这里的 1.0 就是"正好是精灵盒"：
    //
    //     <1  判定比图小（尾巴、触须、裙边可以不参与）
    //     >1  判定比图大（图小但威胁大的东西）
    //
    // **按种类写，不按变体**：变体已经各自有不同的宽高比了，再让倍数随变体变，同一只鱼的难度就会跟着
    // 一个随机的 \`variety\` 滚来滚去——那是玩家看不见的骰子。
    //
    // 只有想调的才写；没写的就是 1。没有美术的五种（\`trash\` / \`rot\` / \`oil\` / \`foam\` / \`rain\`）
    // 也可以调，它们没有精灵盒，倍数是加在"半径 \`radius\` 的圆"上。喷口的判定是底座圆 + 胶囊，
    // 这里的倍数只乘在底座圆的半径上；胶囊的半宽和长度仍由 \`hazards.vent\` 的两个比例决定。
    //
    // 改完按「调试模式」看线：线画在哪就打到哪。
    "hitboxScale": {
      "angler": 0.6,
      "shrimp": 0.6,
    },
    // 受击后的减速倍率和持续秒数（水母）。
    "slowFactor": 0.55,
    "slowSeconds": 1.5,

    // ---------------------------------------------------------------------------------------------
    // 水母
    // ---------------------------------------------------------------------------------------------
    //
    // 它碰到你时扣多少，在 \`contactDamage\` 那张表里。
    //
    // 减速本身是水母存在的理由（它是"你在错的时间站在错的地方"这件事的账单），但只有减速的话，
    // **碰到水母比碰到鱼更划算**——而一只又慢又躲不开的漂浮物绝不能是这样。所以它要见血，
    // 而减速让这笔血更疼：你既受了伤，接下来一秒还很笨拙。
    //
    // 这一段的数值只剩伤害一项，所以没有键了——名字留在段头是为了让这条理由有地方待。

    // ---------------------------------------------------------------------------------------------
    // 血量：被小泡泡子弹打几下才会跑
    // ---------------------------------------------------------------------------------------------
    //
    // 掉光血**不等于死**：它会掉头加速游出屏幕（见下面的 fleeSpeedFactor）。设计上这是有意的——
    // 生物在这个游戏里不是拿来杀的，"把它赶走"才是玩家能做的事（和"吃掉它"并列的第二条出路）。
    //
    // 0 = 子弹对它无效，直接穿过去（地形与环境干扰那一类）。正数 = 打得跑；想让哪一种也能被打跑，
    // 把它的数字改成正数即可。每种危险物都必须在这里有一行，漏了会加载报错（见 src/mechanisms.ts 的检查）。
    //
    // ---------------------------------------------------------------------------------------------
    // 这些数是**血量**，不是"几发"
    // ---------------------------------------------------------------------------------------------
    //
    // 这里曾经每只都标着"几发打跑"，而那是 \`bullets.damage = 1\` 时的巧合：伤害一旦能被卡堆高，
    // 同一条鱼就不再是一个固定发数，发数成了**结果**而不是规定。所以下面只写相对厚度——
    // 谁比谁硬、谁值得花弹药、谁的弱点不在这里——具体几发由你当时的构筑决定。
    //
    // 量级：鱼是标准，厚一档 15，精英 20~30，海胆是最厚的靶子 75。Boss 在关卡文件里给。
    "health": {
      // 鱼：标准。它会冲锋，所以"打得跑"是它唯一的弱点。
      "fish": 10,
      // 金枪鱼：比鱼厚一档（它也比鱼大一档）。给成和鱼一样也可以——那它就是一个更大的靶子。
      "tuna": 15,
      // 第 4 关的四个猎食者：厚度跟着体型走，而**海豚是例外**，和鱼一样脆。
      // 它是四个里唯一"可以早早吃掉"的一个，这是刻意的：一关全是不好惹的东西，玩家就只剩躲了。
      // 座头鲸：全场最厚，但也是最慢的，慢到你来得及决定是打它还是绕开。
      "dolphin": 15,
      "octopus": 25,
      "shark": 30,
      "whale": 40,
      // 水母：比鱼软一点，但它会从侧面冲过来，所以"打得跑"是它唯一的弱点。
      "jelly": 10,
      "trash": 0,
      "crab": 0,
      // 海胆：最厚的靶子，也是"打得跑但要花弹药"的那一个。它会开枪，但掉头就跑。
      "urchin": 75,
      // 炸弹鱼：你可以在它靠近之前打爆它——但那是**原地**爆炸，离太近照样挨。
      "bombfish": 50,
      // 下落木箱：50 点，和炸弹鱼同档；它是一块木头，而且下落途中一直可以打。
      "fallcrate": 50,
      // 墨雾：不能被打，0 = 子弹直接穿过。
      "ink": 0,
      // BOSS 的血量在**关卡**里给（见 config/levels.json5 的 boss.health）：同一只 BOSS 在第二关可以更厚，
      // 那是关卡强度，不是机制。这里留一行是为了让"每种危险物一行"这条约定继续成立。
      "boss": 0,
      "boss-crab": 0,
      "boss-octopus": 0,
      "boss-jelly": 0,
      "boss-shark": 0,
      "boss-netshark": 0,
      "boss-eye": 0,
      // 喷口（黑烟囱）：**碰到就是死**（5 点伤害，而体积 1 的气泡只有 1 点血）。
      // 它不"打跑"，它是地形：这一关要学的是**横向离开**，不是硬扛。
      "vent": 0,
      "mineral": 0,
      "shrimp": 10,
      "angler": 50,
      "torpedo": 10,
    // 电击水母：碰到或被攻击都会放一圈电。给得薄：它是"别乱碰"的，不是"打不动的"。
      "zapper": 10,
      // 第六关：碎浪泡沫是**环境干扰**，打不掉（0 血 = 子弹穿过去），它挡住的是你的视线和判定。
      "foam": 0,
      "rain": 0,
      // 电鳗：**不可伤害的炮台**（0 = 子弹直接穿过去，和泡沫、雨一样）。它是第一个"打不掉、但仍会开火"的常驻
      // 威胁：玩家只能躲，不能清。这一行仍然要有——血量表按种类校验。
      "eel": 0,
      "rot": 0,
      "oil": 0,
      // 五位射手：四位枪手全部可被打跑，厚度就是它们的难度阶梯：
      // 射水鱼（日常款，最薄）、海星（软）、刺魨（硬，而且打它有代价）、手枪虾（精英）。
      // **电鳗是例外**：上面的 0 让它打不掉，下面的 5 让它吃不到——它是唯一只能躲的射手。
      "archer": 15,
      "pistol": 50,
      "puffer": 30,
      "starfish": 20
    },

    // ---------------------------------------------------------------------------------------------
    // 每种危险物**对玩家造成的伤害**
    // ---------------------------------------------------------------------------------------------
    //
    // 和上面的 \`health\`（它自己挨几下才被打跑）是两件事，所以是两张表。**每只单独标，不分档**：档位省事，
    // 但会让"章鱼和大白鲨体型一样、可它们是不同的威胁"这种差别消失，而"多疼"正是表达这件事的地方。
    //
    // 量级（开局气泡 100 点血）：
    //   10 = 环境干扰，碰一下掉一层皮
    //   20 = 一般的鱼，**这是标准伤害**，一局里绝大多数碰撞是这一档
    //   30 = 精英：会冲锋的、会开枪的
    //   35 = 比精英更重：体型最大的那几个，以及喷口
    //   40 = BOSS
    //
    // 玩家的防御从这个数里**直接减**（\`max(伤害 × minDamageRatio, 伤害 − 防御)\`），所以这些数同时也是
    // 防御的标尺：+2 防御对 20 伤害是 10% 减免，对 10 伤害是 20%。
    "contactDamage": {
      // 环境干扰。
      "mineral": 10,
      "rain": 10,
      "foam": 10,
      "trash": 10,

      // 一般的鱼。
      "fish": 20,
      "tuna": 20,
      "shrimp": 20,
      "crab": 20,
      "urchin": 20,
      "archer": 20,
      "starfish": 20,
      "puffer": 20,
      // 下落木箱：和普通鱼/障碍同档。
      "fallcrate": 20,
      // 墨雾：不造成接触伤害，只减速。
      "ink": 0,

      // 电鳗：**撞上本体也会麻痹**（两轴操作反向），所以伤害只给环境档的 10——它的代价在操作，不在掉血。
      "eel": 10,

      // 精英。
      "dolphin": 30,
      "jelly": 30,
      "angler": 30,
      "torpedo": 30,
      "zapper": 30,
      "pistol": 30,
      "rot": 30,
      "oil": 30,

      // 比精英更重。
      //
      // **喷口在这一档，而不是"一击必杀"**：它的设计意图是"进去就没有好下场"，但"必杀"是一个会过期的
      // 判断（血量上限会成长），而且它会把"伤害"这一个字段变成两种单位。35 = "这一下拿走你三分之一"，
      // 对一堵明摆着的墙来说已经足够吓人。
      "octopus": 35,
      "shark": 35,
      "bombfish": 35,
      "whale": 35,
      "vent": 35,

      // BOSS：六只一样。它们的区别在怎么打，不在多疼。
      "boss": 40,
      "boss-crab": 40,
      "boss-octopus": 40,
      "boss-jelly": 40,
      "boss-shark": 40,
      "boss-netshark": 40,
      "boss-eye": 40
    },

    // 逃跑速度：单位是**屏幕高/秒**（不是相对水流，也不是米/秒）。
    //
    // 为什么用这个单位：水面本身在以 25 m/s 往下走，而屏幕高有 800 m，用"相对水流几倍"表达这件事就会
    // 得到 2 倍 = 半分钟才出画面这种反直觉的结果。这里直接说"每秒跑几个屏幕高"：
    // 0.9 ≈ 一秒多窜出画面，玩家看得见"它跑了"，又不至于在画面里慢慢飘。
    "fleeScreensPerSecond": 0.9,

    // 退场的**方向**：上方 / 左边 / 右边，三选一**随机**（代码里掷骰子，这里没有数值可调）。
    //
    // 为什么不是永远往上跑：只往上退场的话，玩家学到的规则是"被赶走的鱼都往上飘"，看起来像一条固定的
    // 动画；三个方向都有，同一件事每次都不一样，读起来才像"这条鱼自己决定跑了"。
    // 侧向退场会从左右边缘游出画面，所以横向也要有清理（见 src/hazards.ts 的去重条件）。

    // 退场中的**暗淡程度**：整只生物按这个不透明度画（1 = 和平时一样亮，0 = 完全看不见）。
    //
    // 0.42 的做法是"用同一套画法、整体压暗"，而不是换一套退场专用颜色：形状、颜色、朝向全都还是它，
    // 只是明显比水里的其它鱼淡——玩家一眼就能分出"这条已经在走了，不用再打"。
    "fleeAlpha": 0.42,

    // ---------------------------------------------------------------------------------------------
    // 超大鱼群（Boids）
    // ---------------------------------------------------------------------------------------------
    //
    // 关卡里一个刷怪块写 \`boids: true\`（必须同时是 \`kind: 'fish'\` 并且给 \`path\`），这一块的 \`count\` 条鱼就是
    // **一个鱼群**：每条都是一条真正的鱼（会碰伤你、能被打、掉的东西和普通小鱼一样），但**不追你也不躲你**，
    // 它们只做三件事——
    //
    //   分离  离得太近的邻居互相推开，不叠成一坨（**按三维距离算**，见 \`depthRange\`）
    //   对齐  朝邻居的平均方向游，所以整群一起转弯
    //   聚合  往邻居的重心靠，所以不散
    //
    // 再加第四件：**样条走的不是鱼，是一个看不见的领队**。\`path\` 驱动领队；**领队只影响离它近的那几条鱼**
    // （\`leaderReach\`），把它们的速度拉向领队的速度。离得远的鱼完全不看领队，只看邻居——所以领队一拐弯，
    // 先是头部的鱼转，转向再一条一条传到尾部，而不是一百二十条鱼在同一帧一起转。
    //
    // （上一版是每条鱼被一根弹簧拉向领队此刻的位置和速度：领队一转，全群在同一帧收到同样的指令，量出来头和尾只差
    // 0.03 秒，看起来像整群被拴在一个点上。）
    //
    // **不是刚体的原因**：每条鱼有自己的速度系数（\`speedJitter\`），领队自己还会沿着样条的法线慢慢扭（\`wobble*\`）。
    //
    // **前景和背景**：默认的群是前景——每条都是真的鱼。也可以把一个群放到背景（见下面的 \`back\`），
    // 它们没有碰撞盒，纯粹是画面。
    //
    // **长度单位全是泳道比例（lane）**，泳道固定 361 米宽，所以同样的数字在手机和桌面上是同样的鱼群。
    //
    // 想先看效果：设置面板 → 作弊区 → 进入调试关（需要在主菜单里开着调试模式）。
    "boids": {
      // 一个群**出生时**散在领队起点周围多大的圆里。样条的第一个点应当在画外（见各关的 \`paths\` 说明），
      // 所以这个半径要小于"起点离泳道边缘的距离"，否则会有几条出生在画面里、凭空冒出来。
      "spawnSpread": 0.3,

      // **对齐**和**聚合**只看离自己最近的 \`neighbours\` 条鱼（真实鸟群、鱼群看的是固定的约 7 条，不是"一定距离内
      // 所有的"）。这是转向能一条传一条的关键：按距离算的话，鱼群越密每条鱼听到的就越多，平均出来几乎是全群的平均，
      // 转向在全群几乎同一刻到达（实测：密的时候头尾只差 0.03 秒，稀的时候 1.9 秒）。按条数算，传递的速度跟密度无关。
      // \`neighbourRadius\` 还在，作为"最远多远的邻居才算"（泳道比例）。条数太少群会裂成小团，太多又趋近同步。
      "neighbours": 7,
      "neighbourRadius": 0.3,

      // 比这个近的邻居开始互相推开，推力在距离 0 时最大、到这个半径时为 0。
      // 真鱼画出来约 0.082 个泳道宽（0.136 × \`scale\`），所以这个值和它差不多：鱼互相有重叠但看得出每一条
      // （实测 120 条：最近邻居平均间距约 0.04 个泳道宽）。**敏感**：大了群变稀、变长，小了缩成一团。
      // 动它之前先用 \`scripts/probe-boids.mjs\` 看形状检查。
      "separationRadius": 0.08,

      // **三条规则的强度**（领队的影响在下面）。
      //   \`separationAccel\`  分离的最大加速度，lane/秒²
      //   \`alignmentRate\`    每秒把速度向邻居平均速度拉近多少（1/秒）。2 = 约半秒就跟上邻居
      //   \`cohesionAccel\`    聚合的最大加速度，lane/秒²，邻居重心在 \`neighbourRadius\` 之外时满强度
      "separationAccel": 1.5,
      "alignmentRate": 2.0,
      "cohesionAccel": 1.4,
      // **聚合横向比纵向强多少**：聚合是朝邻居的重心拉，这里把"垂直于邻居前进方向"的那一半放大这么多倍。
      // 1 = 各个方向一样，鱼群是个圆；越大鱼群越被压成顺着前进方向的长带。全靠邻居（邻居的前进方向是它们的平均速度），
      // 没有领队、没有固定的点——上一版用弹簧拉向领队来做长条，而朝一个点的弹簧就是整群同一帧一起转的原因。
      "cohesionAcrossRatio": 4,

      // **领队的影响**：
      //   \`leaderReach\`   领队影响多远内的鱼（泳道比例）。半径内的鱼把速度往"领队的速度 × 自己的速度系数"拉，
      //                   拉力从领队身边的满强度线性降到半径边缘的 0，所以没有一条线、鱼在线上被突然抓住。
      //                   **半径外的鱼完全不看领队。** 大了，更多的鱼同时转（传递的段数变少）；小了，领队够不着
      //                   足够多的鱼，群会在领队前后散开。
      //   \`leaderSteer\`   半径内每秒把速度向领队拉近多少（1/秒）。大了贴着领队的鱼转得急。
      //   \`leaderTether\`  **防走丢的保险**：鱼离领队超过这个距离（泳道比例），才开始有一个朝领队位置的拉力。
      //                   在它里面的所有鱼，位置上都不受领队任何牵引。
      //   \`tetherAccel\`   保险拉力的上限，lane/秒²，鱼越过 \`leaderTether\` 一倍距离时达到上限。
      // 这里**没有弹簧**：没有任何一项是"拉回某个位置"，除了那个只在鱼已经掉队很远时才生效的保险。
      "leaderReach": 0.25,
      "leaderSteer": 4,
      "leaderTether": 0.9,
      "tetherAccel": 0.5,
      //   \`leaderWantFish\` / \`leaderAllowAhead\` / \`leaderWaitFloor\` / \`leaderCatchUp\`  **领队待在鱼群的最前端**。
      //                   领队沿路径**匀速**走（速度 = 路径长度 / \`path.seconds\`），走到终点不停，继续往外走。
      //                   它只管半径内的鱼，所以：
      //                   · 它自己一路走远，半径里很快一条鱼都没有，鱼群就靠惯性直线冲出去——在拐弯处就是直接冲出路径。
      //                     所以半径内的真鱼少于 \`leaderWantFish\` 条时它放慢，放慢到最多自己步速的 \`leaderWaitFloor\`；
      //                   · 比它快的鱼会超过它。**它前面的鱼**够不着领队、前面又没有邻居可以跟，鱼群最前面反而最后转弯。
      //                     所以它前面的真鱼多于 \`leaderAllowAhead\` 条时它加速去追，最多到自己步速的 \`leaderCatchUp\` 倍。
      //                   结果是领队始终在鱼群前端；走完整条路的时间会因鱼群而和 \`path.seconds\` 有出入。
      "leaderAllowAhead": 6,
      "leaderWantFish": 8,
      "leaderWaitFloor": 0.25,
      "leaderCatchUp": 1.6,

      // 游速的下限和上限，lane/秒。**有下限**：鱼不会悬停，群走出路径之后也要继续游着散去。
      "minSpeed": 0.04,
      "maxSpeed": 0.45,

      // 合力的上限，lane/秒²：几十条鱼挤在一起时分离的力会叠得很大，不夹住的话一次拥挤就把鱼弹飞。
      "maxAccel": 2.0,

      // **真鱼的大小**：相对普通小鱼的倍数，**画面和碰撞盒一起缩**（所以"看见多大就撞多大"仍然成立）。
      // 真实鱼群是几百条小鱼而不是几十条大鱼，缩小是"超大鱼群"这个感觉里最值钱的一项。
      // 改它要同时改上面的 \`separationRadius\`——鱼小了，互相推开的距离也该跟着小。
      "scale": 0.6,

      // **每条鱼自己的速度系数**：它在领队身边时试图跟上的是"领队速度 × (1 ± 这个数)"。快的一条会在鱼群里往前蹿、
      // 再被邻居的对齐和聚合带回来，所以鱼和鱼之间一直在互相穿插，而不是一块整齐地平移。0 = 全部一样（刚体）。
      "speedJitter": 0.15,

      // **领队的扭动**：沿样条法线的侧向偏移，两个不同周期的正弦叠成，所以不会明显地重复。
      // \`wobbleAmplitude\` 是最大偏移（泳道比例），\`wobbleSeconds\` 是主周期。路径的头 15% 和尾 15% 会淡入淡出，
      // 免得出生点和出口处有一个折角。0 = 不扭。
      "wobbleAmplitude": 0.06,
      "wobbleSeconds": 3.0,

      // **深度**：每条真鱼出生时有一个固定的深度（0 近、1 远，从远到近等距排开，**一辈子不变**）。
      // 只用在两处：①分离按三维距离算——\`depthRange\`（泳道比例）是深度 0 到 1 隔多厚，深度差很大的两条鱼
      // 不互相推，所以屏幕上可以叠在一起而整群不被撑稀；②远的鱼被乘上 \`depthTint\` 的颜色，程度由 \`depthDim\`
      // 决定（0 = 不变，1 = 最远的整个变成这个颜色）。**不改大小、不改透明度**——大小会牵动碰撞盒，
      // 太透的鱼又像个能穿过去的幽灵。
      "depthRange": 0.06,
      "depthDim": 0.35,
      "depthTint": 0x7f93a8,

      // **背景鱼群**（\`layer: 'back'\`）：关卡里一个刷怪块写 \`layer: 'back'\` 加一个 \`distance\`（0 近 ~ 1 远），
      // 它就是**同一套 Boids**——同样的领队、同样的四条规则、同样沿 \`path\` 游——只是它的鱼**不是敌人**：
      // 没有碰撞盒，子弹穿过去、碰不到、吃不到，也不参与任何判定；画在最后面（背景图之上、所有生物和障碍物之下）。
      // 所以可以先在背景放好几群鱼游过，让玩家有心理准备，再放前景那一群。
      //
      // \`distance\` **只决定大小和亮度**，下面每一对是 \`distance\` 0 和 1 时的值，中间按直线插值。
      // 它**不改游速**：一群鱼多快游过去由它的 \`path.seconds\` 决定，这是作者要说了算的事，
      // 不该藏在另一个数字后面悄悄变。
      //   \`scaleNear\` \`scaleFar\`  大小，相对普通小鱼的倍数。\`distance\` 0 时和前景真鱼一样大（\`scale\`）。
      //                           **只改画出来的大小，不改群的疏密**：群内的间距（\`separationRadius\`）和前景是同一个数，
      //                           所以远处的小鱼群看起来会比较稀。想要远处也密，就把那一块的 \`count\` 加大。
      //   \`dimNear\` \`dimFar\`      乘上 \`tint\` 的程度（0 = 不变，1 = 整个变成 \`tint\`）。越远越暗、越冷。
      //   \`tint\`                  那个冷色。和每群里"远的鱼更暗"（上面的 \`depthDim\`）是叠加的。
      "back": {
        "scaleNear": 0.6,
        "scaleFar": 0.22,
        "dimNear": 0.2,
        "dimFar": 0.75,
        "tint": 0x4a6a8a
      }
    },

    // 弹射速度的衰减时间常数（秒）。越小衰减越快，弧线越短。
    // **这个是通用的**（不止螃蟹：撞上木箱被顶回来也走它），所以它留在这一层，不在螃蟹那一块里。
    "launchDecaySeconds": 0.9,

    // ---------------------------------------------------------------------------------------------
    // 螃蟹（一种生物一块）
    // ---------------------------------------------------------------------------------------------
    //
    // **这是新生物的写法**：一只生物的全部数值都放在 \`hazards.<kind>\` 这一块里，想知道"螃蟹怎么动"就只看
    // 这里，不用在按数字类型分的几张表之间找 \`crabXxx\` 开头的键。代码通过 \`mech.hazards.crab.*\` 读它。
    //
    // 为什么值得这样分：加一只生物本来要同时改好几张表（血量、质量、可吞档位、爆破处理、体型、冲锋……），
    // 漏一行只会在启动时报错（那些检查还在，只是不再是唯一的安全网）；一块一个之后，"这只生物是什么"是一个
    // 可以被读、被比较、被整个记住的东西。新生物照这个写，老几种会一种一种搬过来。
    "crab": {
      // 警告距离（米）：进入这个距离才开始倒计时，保证玩家有时间看到它在蓄势。
      "armDistanceMeters": 55,
      // 从开始倒计时到起爆的秒数。和 armDistanceMeters 是一对：距离给反应时间，引信给"多久之后"。
      "fuseSeconds": 1.2,
      // 起爆把玩家弹开的初速度（米/秒，世界单位）。
      "launchMps": 30,
      // 抛物线升到顶点的时间（秒）：弧线形状由它和 launchMps 一起决定（原来写死在 src/hazards.ts 里）。
      "apexSeconds": 1.1,

      // **额外**的屏幕位移倍率，加在世界冲量之外。
      //
      // 为什么需要它：世界在卷动，30 m/s 的冲量换算到屏幕上是 0.066 屏高/秒，
      // 而卷轴同时以 25 m/s 把它往下推，两者几乎抵消，弹射在屏幕上看不出来。
      // 这个倍率把那部分补回来：气泡会明显地"窜"上去一截，但最终仍会被水流带回去。
      "launchScreenBonus": 2.4
    },

    // ---------------------------------------------------------------------------------------------
    // 垃圾袋
    // ---------------------------------------------------------------------------------------------
    //
    // 这两个值是**一对**：\`drainPerSecond\` × \`minGripSeconds\` 就是一次完整缠绕能造成的伤害
    // （14.3 × 1.4 ≈ 20 点），所以单独调其中一个会让它数学上无法造成伤害——那正是这两个数放在同一块里的理由。
    "trash": {
      // 缠住你时每秒吸走多少血。
      "drainPerSecond": 14.3,
      // 一次"吸够了"的门槛：累积到它就扣一次这个数（所以它同时是单次伤害，也是那个"一对"里的另一头）。
      //
      // 它**不吃防御**：被垃圾缠住是玩家自己的处境（贪心地贴着垃圾游），不是外面的东西打你。
      "drainPerHit": 20,
      // 最短缠绕时间（秒）：挣扎也要缠够这么久才松得开，否则一次缠绕只有一帧，玩家根本感觉不到。
      "minGripSeconds": 1.4
    },

    // ---------------------------------------------------------------------------------------------
    // 炸弹鱼：一只会追着你过来的定时炸弹
    // ---------------------------------------------------------------------------------------------
    //
    // 它是水里的倒计时：朝你的气泡靠近，近了（\`armMeters\`）就点燃引信，\`fuseSeconds\` 秒后爆开。
    // 在此之前把它打爆，它就**原地**炸（那一下离你多近，就是你要付的代价）。
    // 吞得动它的气泡也能贴脸把它吃下——即时到账，没有库存，也没有为你暂停的引信。
    "bombfish": {
      // 追踪速度，单位是泳道宽/秒。0.3 ≈ 108 m/s，比玩家的横向速度（2 秒横穿泳道 = 180 m/s）慢，
      // 所以躲得开；调大它就会变成"躲不掉的追命炸弹"。
      "seekSpeedFactor": 0.3,

      // 进入这个距离（米）点燃引信。太大会变成"一进屏幕就开始倒计时"，太小就变成"贴脸才响"。
      "armMeters": 110,

      // 引信长度（秒）。**这是玩家最后的机会窗口**：够时间跑出爆炸半径，或者把它打爆（打爆也会炸，
      // 但炸在原地——所以远距离打爆是唯一安全的拆弹方式）。
      "fuseSeconds": 3,

      // 爆炸的伤害半径（泳道比例）与扣几个命中点。
      "blastRadiusRatio": 0.33,
      "blastDamage": 1,

      // 爆炸时的**抖屏**：位移多少（设计像素）与持续多久（秒）。
      //
      // 抖的是**整个画面**（连 HUD 一起），因为这不是"水在晃"而是"这一下打在你身上"。
      // 幅度刻意小（6px 左右）：它要的是"那一下有分量"，而不是让玩家看不清自己站在哪——
      // 抖屏期间玩家还得躲下一颗子弹。设成 0 就关掉。
      "blastShakePixels": 7,
      "blastShakeSeconds": 0.3
    },

    // ---------------------------------------------------------------------------------------------
    // 第一关：热液喷口（黑烟囱）
    // ---------------------------------------------------------------------------------------------
    //
    // **这一关的招牌**：一块立在泳道**内侧边缘**的岩石，从岩上的喷口沿一个**固定朝向**喷出火柱
    // （伤害 35，开局气泡 100 点血——三下就没了）。
    //
    // 它教的是**两种**解法，而不是一种：
    //   - **斜向喷流**水平覆盖 \`长度 / √2\`，够不到另一面墙，所以**横向离开**躲得掉；
    //   - **横向喷流**横贯整条泳道，横向没地方去，只能**靠时机**（把气泡往下压，等它喷完再过去）。
    //
    // 所以第一关真正在教的是"看清楚这一根是哪一种，再决定挪还是等"——这比原来那句"唯一的解法是
    // 横向离开"更接近这一关想要的东西，也让"纵向也能动"这件事第一次有了用。
    //
    // ---------------------------------------------------------------------------------------------
    // 画什么就打什么
    // ---------------------------------------------------------------------------------------------
    //
    // 底座的判定是它自己的圆，喷流的判定是**等宽胶囊**，两者都由 \`src/hazards.ts\` 里同一组数字算出来，
    // 绘制读的也是同一组——所以"看见多宽就撞多宽"。改这一节之前，绘制是一根 1.5 泳道宽的高柱而判定
    // 只有半径 0.085 的圆（绘制是判定的 11 倍高），玩家能站在画出来的柱子里不掉血。
    //
    // 周期仍然是公平性的依据：喷发有 \`periodSeconds\`/\`activeSeconds\` 的节拍，\`warnSeconds\` 之前开始预警。
    "vent": {
      // 底座半径（泳道比例）：立在泳道内侧、贴着墙的那块岩。
      //
      // **它可撞、有伤害**，而且是**常驻**的（不像喷流只在喷发时伤人）——所以靠着墙等它喷完不是免费的。
      "baseRadiusRatio": 0.075,

      // 喷流半宽（泳道比例）：等宽胶囊的半宽，**比底座细**——喷流是火，不是把底座拉长。
      "jetHalfWidthRatio": 0.045,

      // 喷流从喷口沿朝向喷多远（泳道宽的倍数）。**每个朝向一个值**。
      //
      // 为什么必须分开：横向要横贯整条泳道（>= 1 才封得死），而斜向的水平覆盖是 \`长度 / √2\`，
      // 要留出能横向躲开的空隙就得 < 1。共用一个值的话两者不可兼得——要么横向封不死（"横贯"
      // 不成立），要么斜向也封死（"横向离开"这个解法整个消失）。
      //
      // 按默认值：斜向水平覆盖 0.64 泳道宽，留 0.36 可以躲；横向 1.15 略微超出泳道（超出部分是
      // 泳道外的空白，无害），封得死。
      "jetLengthRatio": { "up": 0.9, "flat": 1.15, "down": 0.9 },

      // "斜向上 / 斜向下"与水平面的夹角（弧度）。0.7854 ≈ 45°，所以水平分量 = 垂直分量。
      // 改这个值会直接改变上面那张"留多少可以躲"的账。
      "diagonalRadians": 0.7854,

      // 出现后先**安静**多少秒。延迟的最后 \`warnSeconds\` 秒开始预警——和之后每一次喷发**规则完全相同**。
      //
      // 默认 0（等于"一出场就进入周期"）。关卡可以按只覆盖：第一只给一两秒，玩家才有时间读它。
      // 注意它和 \`at\` 的分工：\`at\` 决定**在哪出现**，这个决定**出现之后多久才危险**。
      "startDelaySeconds": 0,

      // 喷发一个周期多少秒，以及一个周期里喷多久。剩下的时间是**安全窗口**——玩家就是靠它过去的。
      "periodSeconds": 4.2,
      "activeSeconds": 2.6,

      // 喷发前的预警时长（秒）：烟流变亮变粗，这时候还来得及挪出去（横移或者往下压）。
      "warnSeconds": 0.7,

      // 烟流外观（只在贴图缺失、退回代码绘制时使用）。
      "plumeColour": 0x2a1b22,
      "glowColour": 0xff5a3c,
      "edgeColour": 0xffb066,
      "edgeAlpha": 0.7,

      // ---------------------------------------------------------------------------------------------
      // 喷口的贴图：底座一张、火焰一套 4 帧
      // ---------------------------------------------------------------------------------------------
      //
      // **两张图分开出**：底座（\`base\`）常驻，火焰（\`flame\`）只在喷发/预警时出现。代码把火焰画在底座
      // **下面**，底座盖住火焰根部，接缝看不出来。整个组件按 \`aimX/aimY\` 旋转，所以素材本身按“朝上”画。
      //
      // 名字都不带扩展名，和项目里其它素材一样；\`flame\` 指向 \`animations\` 里的名字，不是单张图。
      //
      // 贴图缺失时（没打包、加载失败）整个喷口退回下面的代码绘制，游戏不会因此没有喷口。
      "art": {
        "base": "火山底座",
        "flame": "vent-flame"
      },

      // 火焰整体的不透明度（0..1）。贴图本身已经带透明度，这里再乘一层，用来让它融进水里。
      "flameAlpha": 0.9,

      // 火焰贴图的横向放大倍率：**让画出来的火焰宽度追上碰撞胶囊**。
      //
      // 贴图左右有透明边（27 像素里可见的只有 23），亮部更窄（约 70%）；碰撞宽度却是
      // \`jetHalfWidthRatio\` 的整条胶囊。按同一宽度画时，玩家会看到"火焰没那么宽却被打中"。
      // 1.25 把透明边和亮部的差一起补回来：亮部大约到胶囊边缘的九成，外缘略超出。
      // 只改画，不改判定；调大看着更宽，调小更窄。
      "flameWidthScale": 1.8,

      // 火焰贴图的纵向放大倍率：**让画出来的火焰长度追上碰撞胶囊的末端**。
      //
      // \`tipFadeFraction\` 把最后 15% 渐隐掉。按胶囊长度 1:1 画时，最后 15% 的判定区里没有火——
      // 玩家看到"火焰已经结束，却还在挨打"（截图里胶囊末端那个空圆）。
      // 1.18 ≈ 1 / (1 − 0.15)，把渐隐段推到胶囊之外；亮部正好铺到胶囊末端。
      // 不要用 \`jetLengthRatio\` 来补：那会同时改变喷流的实际射程。只改画，不改判定。
      "flameLengthScale": 1.1,

      // 火焰尖端的渐隐长度，占火焰高度的比例。原图把喷流画到了画面边缘，像素化后尖端是一条平口；
      // 0.15 = 最后 15% 从实到透明，平口消失。0 = 不渐隐，1 = 整条火焰从头淡到尾。
      // 曲线是 smoothstep（两端慢、中间快），不是线性——线性渐隐的末端仍可能看见一条淡淡的终止线。
      "tipFadeFraction": 0.15,

      // 喷发开始/结束时火焰淡入淡出的时长（秒）。0 = 直接出现/消失。
      "artFadeSeconds": 0.12,

      // 预警时火焰只显示多长（喷发长度的比例）。0.35 = 只露出前三分之一多一点，读作“要来了”。
      "warnLengthFraction": 0.05,

      // 预警时火焰的明暗闪烁：每秒闪几次，以及不透明度的下限/上限。
      // 频率调高会更急，调低会更像在喘息；上下限决定闪烁有多明显。
      "warnFlickerHz": 6,
      "warnAlphaMin": 0.55,
      "warnAlphaMax": 0.9
    },

    // 矿物颗粒：随热流上升，最基础的环境弹幕。打得掉（很脆），但更多时候是让路变窄。
    "mineral": {
      // 上升速度（泳道宽/秒）。比玩家的横向速度慢，所以永远躲得开。
      "riseSpeedFactor": 0.32,
      // 横向摆动幅度与周期，免得它们排成一条整齐的线。
      "wobbleAmplitude": 0.06,
      "wobblePeriodSeconds": 2.1,
      // 超过这个高度就消失（它们是"喷上来的"，不该飘满整屏）。
      "lifeMeters": 900
    },

    // 水母：沿自己的头/脚轴向上游，速度跟着伞盖的收缩脉冲。
    //
    // 它不再随水流下沉，也不再横向漂移——整条漂移只剩"向上"，速度由伞盖的脉冲决定。
    // 冲锋（\`charges.chargers.jelly\`）仍是单独的横向攻击，不受这里影响。
    "jelly": {
      // 向上爬升的速度，占水流下落速度（driftSpeed）的比例。
      // 0 = 刚好抵消水流、停在原地；0.35 = 逆着水流缓慢上浮；调大更主动，调小更像悬停。
      "climbRatio": 0.35,
      // 每一帧的推进倍率，顺序对应 \`jelly-idle\` 的 4 帧（5.5 帧/秒，一轮约 0.73 秒）。
      // 第 2 帧伞盖收得最紧 -> 最快；第 3 帧展开 -> 最慢。四个数是"这一帧游多快"，不是时长。
      "pulse": [0.7, 1.6, 0.8, 1.3]
    },

    // 盲眼虾：从侧面缓慢靠近，试图戳破气泡。
    "shrimp": {
      // 横向逼近速度（泳道宽/秒）。慢，而且**不追踪**——它朝一个方向走到底。
      "driftSpeedFactor": 0.11,
      // 它戳一下扣几点。
    },

    // 灯笼鱼：用发光诱饵吸引玩家，靠近后突然张口冲刺。
    "angler": {
      // 悬停时随水流下沉的比例（它基本上停在那儿）。
      "driftFactor": 0.12,
      // 诱饵够到多近就扑（米）。
      "lureMeters": 300,
      // 扑击：蓄势、持续、冷却（和敌人的冲锋共用一套曲线数学）。
      "telegraphSeconds": 0.55,
      "travelSeconds": 0.45,
      "cooldownSeconds": 3.2,
      // **直线冲锋**：0 = 不弯曲，从它当前位置**笔直**冲向触发瞬间玩家所在的位置。
      // 弯曲（原来的 0.2）读起来像"绕过来"，而灯笼鱼的设定是**咬**——一条直线更像一口咬下去，
      // 也让玩家更容易从"它正对着我"这一件事上读出威胁。
      "bowRatio": 0,
      // 诱饵外观（它会脉动，所以玩家会盯着它看——这正是陷阱）。
      "lureColour": 0xa8f0ff,
      "lureRadiusRatio": 0.02,
      "lurePulsePerSecond": 2.6,
      "lureOffsetRatio": 0.9
    },

      // ---------------------------------------------------------------------------------------------
    // 第六关：破晓海面（碎浪泡沫 / 雨滴冲击）
    // ---------------------------------------------------------------------------------------------
    //
    // 这一关的干扰不是"打你"，而是"让你看不清"：泡沫长得像玩家的气泡，雨滴把你压回水下。
    "foam": {
      // 它的半径（泳道比例）：和玩家开局的气泡差不多大，所以"哪个是我"需要真的看一眼。
      "radiusRatio": 0.055,
      // 靠近多久之后破掉（秒）。它不是永久的墙：挡一下视线就散。
      "lifeSeconds": 3.4,
      // 碰到它扣不扣血（0 = 纯干扰，只是挡视线和判定）。
      // 外观：白泡沫，和气泡的蓝白区分开一点，但轮廓故意做得像。
      "colour": 0xeaf6ff,
      "rimColour": 0xffffff,
      "alpha": 0.55,
      "rimAlpha": 0.5
    },
    "rain": {
      // 下落速度（泳道宽/秒）：比水流的卷动快，所以它是"砸下来"的，不是"漂下来"的。
      "fallSpeedFactor": 0.55,
      // 它把气泡往下推多远（米）。这是它在机制上的作用：接近海面时把你压回去。
      "pushMeters": 34,
      // 命中扣几点。
      "colour": 0xbfe8ff,
      "lengthRatio": 0.09
    },

    // ---------------------------------------------------------------------------------------------
    // 第二关：下落木箱
    // ---------------------------------------------------------------------------------------------
    //
    // 从屏幕顶部坠落，落下前 2 秒在目标整列画红色条幅和感叹号。它不受 push，也不看玩家：只垂直下落。
    // 伤害与血量在 \`contactDamage\` / \`health\` 两张表里，这里只放"预警 + 下落"本身的数值。
    "fallcrate": {
      // **预警多久（秒）**：条幅亮这么久后木箱才离开顶部。改这个数就是改玩家的反应时间。
      "warnSeconds": 2.0,
      // **下落速度（泳道宽/秒）**：0.42 ≈ 152 m/s。恒定速度，不加速。
      "fallSpeedFactor": 0.42,
      // 条幅：高度相对泳道宽度；宽度固定为整列（1/3 泳道）。颜色、闪烁频率、透明度范围都在这里。
      "warnStripHeightRatio": 0.06,
      "warnColour": 0xd83232,
      "warnExclamationColour": 0xff2b2b,
      "warnFlashHz": 3.0,
      "warnAlphaMin": 0.35,
      "warnAlphaMax": 0.95,
      // **图片的固定旋转角（度）**：45 = 尖角向下落下；0 = 正面平边向下。它只转图片，不转判定盒。
      "rotationDegrees": 45
    },

    // ---------------------------------------------------------------------------------------------
    // 第二关 BOSS：墨汁
    // ---------------------------------------------------------------------------------------------
    //
    // 墨团先飞 \`throwSeconds\`，落地后成雾。雾本身是一个 0 血、0 伤害的 hazard：它在 \`WORLD_BOUND_KINDS\`
    // 里，所以随相机卷动向下漂；玩家在雾的判定圈内时，每帧续一次减速，离开后 \`slowRefreshSeconds\` 秒恢复。
    "ink": {
      // 墨团飞行时间：这就是玩家看到它在飞、可以走开的反应时间。
      "throwSeconds": 0.5,
      // 雾持续多久（秒）。
      "lifeSeconds": 4.5,
      // 寿命结束后淡出的时间。
      "fadeSeconds": 0.35,
      // 雾内移动速度倍率：0.4 = 只剩四成速度。
      "slowFactor": 0.4,
      // 每帧续减速的时长，也是离开雾后恢复的时间。
      "slowRefreshSeconds": 0.2,
      // 墨团在飞行中的大小，相对雾的半径。
      "throwRadiusRatio": 0.18,
      // 近乎黑的墨色，加一圈很暗的紫边，免得在深色水里完全看不见。
      "colour": 0x07070b,
      "rimColour": 0x4a3560,
      "alpha": 0.92
    },

    // ---------------------------------------------------------------------------------------------
    // 第三关：电击水母（发光水母林）
    // ---------------------------------------------------------------------------------------------
    //
    // 它自己会放一圈电：被**碰到**或者**被打中**都会放电。这一条让它和别的敌人完全不同——
    // 它是唯一一个"你越用力打它，它越危险"的东西，也是**导电连锁**的点火源。
    "zapper": {
      // 放电环的半径（泳道比例）与它对玩家的伤害。
      "ringRadiusRatio": 0.42,
      "ringDamage": 1,
      // 放电环显示多久（秒），以及放电之间的冷却（防止贴脸时每帧都放）。
      "ringSeconds": 0.5,
      "ringCooldownSeconds": 1.1,
      // 被子弹打中时是否也放电（这是"别用枪解决它"的那一半）。
      "dischargesWhenHit": true,
      // 外观。
      "bellColour": 0xb98cff,
      "ringColour": 0xd8f4ff,
      "ringAlpha": 0.85
    },

    // ---------------------------------------------------------------------------------------------
    // 导电连锁（第三关的招牌机制）
    // ---------------------------------------------------------------------------------------------
    //
    // **气泡本身不会立刻被电破，它会积累电荷。** 带电的气泡靠近另一只水母，就会触发连锁放电——
    // 于是同一个机制同时是三件事：危险（带电时你会引爆整片水母）、武器（主动带电去炸敌群）、
    // 以及路线解谜（把电导向封路的触须，炸开一条捷径）。
    //
    // 电荷怎么来、怎么没：被放电环扫到会加一大截，靠近一只电击水母会慢慢加，不在任何电场里则缓慢泄露。
    "charge": {
      // 上限，以及触发连锁需要的阈值。
      "max": 100,
      "chainAt": 70,
      // 一次放电环扫到加多少；靠近一只水母每秒加多少；没有电场时每秒泄多少。
      "perRingHit": 55,
      "perSecondNearZapper": 16,
      "decayPerSecond": 9,
      // "靠近"的判定距离（米）。
      "nearMeters": 170,
      // 连锁放电：触发距离（米）、从一只水母跳到下一只的距离、每次伤害、最多跳几只。
      "chainRangeMeters": 150,
      "chainJumpMeters": 210,
      // 每次伤害（点）。打的是和枪、灼烧同一个血池，所以同一个量纲。
      "chainDamage": 20,
      "chainMaxTargets": 12,
      // 连锁时气泡自己会不会掉血（带电去引爆是有代价的）。
      "chainSelfDamage": 0,
      // 外观：气泡上那圈电的颜色与线宽（泳道比例），以及连锁光环。
      "bubbleRingColour": 0xd8f4ff,
      "bubbleRingWidthRatio": 0.02,
      "burstColour": 0xd8f4ff,
      "burstAlpha": 0.5,
      "burstSeconds": 0.4
    },

    // 失控鱼雷：从船舱里射出来，直飞一段之后转向追踪。
    "torpedo": {
      // 直线段的速度（泳道宽/秒）与长度（米）。这一段是"诚实"的：它不会转向。
      "runSpeedFactor": 0.34,
      "runMeters": 220,
      // 转向之后的速度（慢一点，否则躲不开）与追踪时间。
      "seekSpeedFactor": 0.24,
      "seekSeconds": 6,
      // 碰到扣几点。
    },

    // ---------------------------------------------------------------------------------------------
    // BOSS 的老档案 —— **这是一块墓碑，删掉它是迁移的最后一步**
    // ---------------------------------------------------------------------------------------------
    //
    // **它不属于水流**：BOSS 不随水漂走，而是**咬住画面**——横向追着你游弋，纵向在可见带的上半部分
    // 按自己的节奏巡逻，所以你不可能"跑过去"。血量、名字、出现位置是**关卡**给的（那只属于关卡强度）。
    //
    // 从前"它怎么动、怎么打、多大、什么颜色"也在这里，六只 BOSS 共用一份 —— 见上面 \`hazards.bosses\`。
    // 那一块落地的同时，这一块就只剩一个用处：**旧 \`boss\` kind 的取值**，以及下面这些注释所记的"为什么"。
    // 六个 kind 各有了自己的皮之后，这一块、\`hazardArt.boss\` 和 \`src/hazards.ts\` 里的 \`'boss'\` 一起删。
    "boss": {
      // 纵向巡逻的三个数：中心在可见高度的 70%，上下浮动 8%，周期独立于横向。
      //
      // 高度用**可见带的比例**而不是米：窗口越宽越扁，可见深度越小，写死米数会让它在某些窗口里跑到屏幕外。
      // 实际位置还会按 BOSS 自身的贴图半高夹紧，保证整只都在屏内，而不是只夹一个固定边距。
      "patrolCenterRatio": 0.7,
      "patrolVerticalAmplitudeRatio": 0.08,
      "verticalPatrolPeriodSeconds": 6.8,
      // 纵向收敛速度：数值越大越"跟手"，越小越像缓慢巡游。
      "verticalSeekPerSecond": 1.4,

      // 横向游弋的幅度（泳道比例）与周期（秒）。这是"弹幕从一个会动的炮台来"的全部来源。
      "patrolAmplitude": 0.36,
      "patrolPeriodSeconds": 4.6,

      // 它横向追你的速度（泳道/秒）。比玩家慢，所以它压过来的时候你有地方去。
      "seekSpeedFactor": 0.16,

      // 碰到它扣几点。

      // 体型（泳道比例）。做得大是刻意的：它是这一关的答案，不是又一条鱼。
      "radiusRatio": 0.11,

      // 默认颜色。**关卡不再覆盖它了**：颜色是 \`hazards.bosses.<kind>.colour\`，也就是"这只 BOSS 长什么样"，
      // 而不是"这一关的强度"——这本来就不该由关卡来说。
      "colour": 0x53306b,
      "eyeColour": 0xffd479,
      "armourColour": 0x7a4f9c,

      // 被打中时的闪白：颜色在这里，**时长和强度在顶层的 hitFlash**（那是所有敌人的命中反馈，不只是 BOSS 的）。
      // 这里曾经还有一个 hitFlashSeconds，没有任何代码读它——覆盖检查现在会把这种键揪出来。
      "weakPointWidthRatio": 0.03,
      "hitFlashColour": 0xffffff,
      // **程序画的 BOSS 身体**（没有贴图时那条路径）的闪白强度，0..1，乘在闪白曲线上。
      // 贴图版用 hazardArt.boss.spriteFlashScale，这条只影响代码画的椭圆身体。
      // 保持 1：程序画的身体没有细节可保，整块亮起来才是它需要的反馈。
      "hitFlashStrength": 1,

      // **被击中时的后退倍率**：乘在顶层 hitKnockback.meters 上（普通敌人是 1）。
      //
      // 为什么 BOSS 要单独减半：全场只有它不随水流走，而是**咬住画面**——别的敌人被顶一下是"在漂移里插了一段位移"，
      // 而它被顶一下是"一个悬停的庞然大物整体弹了一下"，同样的米数在它身上读起来是"它被推飞了"。
      // 0.5 让它明显有受击反馈，但仍然是"晃了一下"而不是"被顶开"。0 = 完全免疫击退（只有闪白）。
      "knockbackScale": 0.5,

      // ---------------------------------------------------------------------------------------------
      // 挥螯 + 喷矿物颗粒（第一关设计稿里写的那两件事，见 config/levels.json5 的 boss 注释）
      // ---------------------------------------------------------------------------------------------
      //
      // **这是这场 BOSS 战唯一的攻击**，也是整场战斗的节奏来源：它悬在你上方、横着游弋、每隔几秒挥一次螯，
      // 螯合上的那一瞬间从钳子里甩出一片矿物颗粒，朝**你当时所在的位置**飞过来。
      //
      // 公平性靠三件事，和敌人的枪是同一条规矩（见 enemyBullets 那一段）：
      //   1. **瞄的是挥螯那一刻的你**，之后不再修正 —— 看得懂、躲得开；
      //   2. **飞得比你的横移慢**（attackSpraySeconds 就是这段飞行时间）—— "躲得开"在物理上永远成立；
      //   3. **前摇是看得见的**：挥螯动画的前 5 帧就是预警，颗粒在第 6 帧（钳子合上）才离开钳子。
      //
      // **颗粒用的是现成的 \`mineral\`（矿物颗粒）+ 现成的冲锋曲线**：它借用 \`charges.chargers.mineral\` 那一行
      // 的飞行参数，走的是和鱼/水母/灯笼鱼同一条二次贝塞尔，所以"看得懂、躲得开"这件事不需要第二套代码。
      "attackEverySeconds": 4.6,
      // 第 6 帧 = 钳子合上那一下。**改动画帧数或帧率都不用改这里**：它指的是动画里的第几帧。
      "attackSprayFrame": 6,
      // 一次甩出几颗。奇数好：正中间那一颗是直冲你来的，两边的逼你挪窝。
      "attackSprayCount": 7,
      // 这 7 颗摊开多宽（泳道比例）。0.55 差不多是半个泳道 —— 站着不动必中，横移四分之一个泳道就出去了。
      "attackSpraySpread": 0.55,
      // 从钳子飞到落点用多久（秒）。**这就是躲的时间**：调到 0.25 以下就变成"看见已经晚了"。
      "attackSpraySeconds": 0.62,
      // 钳子在哪（相对它自己的半径）：+x 是正面，-y 是身体下方。图里钳子在身体前下方，所以是 (0.55, -1.25)。
      "attackSprayFromX": 0.55,
      "attackSprayFromY": -1.25,
      // 每颗的弧度（占飞行距离的比例）。一点点就够，让一片颗粒读起来是"甩出来的"而不是一排子弹。
      "attackSprayBowRatio": 0.09
    },
    // ---------------------------------------------------------------------------------------------
    // 六个 BOSS：一个 kind 一份完整档案
    // ---------------------------------------------------------------------------------------------
    //
    // **这里是 BOSS 的"手感"唯一该写的地方。** 从前 BOSS 只有一个共享档案（下面那个旧的 \`boss\`）加一个
    // "关卡自己给颜色"的 \`boss.colour\`，于是决定它怎么动、怎么贴、怎么开火的每一个数都是六只共用的 ——
    // 六场 BOSS 战里有五场其实是同一场画了六遍。拆开之后，一只 BOSS 的节奏终于有地方可写。
    //
    // 键就是 hazard kind（见 \`src/hazards.ts\` 的 \`BOSS_KINDS\`），写法和 \`hazards.radius\`、\`hazards.health\`、
    // \`hazardArt\` 一致。**除使用 \`bossSkills\` 的 BOSS 外，每行都是完整的 23 个字段，不留默认值**：留默认值就等于
    // "这个数在别处"，而调一只 BOSS 的时候不该需要同时记住另一只的数。\`boss-octopus\` 用技能组代替钳子扇形，
    // 所以它没有 \`attackSprayCount/Spread/Seconds/FromX/FromY/BowRatio\` 这六个数。
    //
    // 字段含义（这样六行可以并排看，不用每行都读一遍注释）：
    //   patrolCenterRatio / patrolVerticalAmplitudeRatio / verticalPatrolPeriodSeconds
    //                                             纵向巡逻：中心高度（可见带比例）、上下浮动幅度、独立周期。纵向不看玩家。
    //   verticalSeekPerSecond                      纵向靠近目标高度的速度（每秒收敛比例）。
    //   patrolAmplitude / patrolPeriodSeconds       横向游弋的幅度（泳道比例）与周期（秒）——"弹幕来自一个会动的炮台"
    //   seekSpeedFactor                             横向追你的速度（泳道/秒）。比玩家慢，所以它压过来时你有地方去
    //   radiusRatio                                 体型（泳道比例）
    //   colour / eyeColour / armourColour           身体、眼睛、甲壳的颜色（**代码画的那条路径**用；有贴图时以贴图为准）
    //   weakPointWidthRatio                         弱点标记的宽度（泳道比例）
    //   hitFlashColour / hitFlashStrength           命中闪白：颜色，以及程序画的身体的强度（贴图版用 hazardArt 的
    //                                               spriteFlashScale）。时长和曲线在顶层的 hitFlash
    //   knockbackScale                              被击中时的后退倍率，乘在顶层 hitKnockback.meters 上（普通敌人是 1）
    //   attackEverySeconds                          两次挥螯之间的间隔（秒）
    //   attackSprayFrame                            挥到动画的第几帧甩出颗粒（钳子合上那一下）
    //   attackSprayCount / attackSpraySpread        一次甩几颗，摊开多宽（泳道比例）。使用 \`bossSkills\` 的 BOSS 不写。
    //   attackSpraySeconds                          颗粒飞到落点用多久（秒）——**这就是躲的时间**。使用 \`bossSkills\` 的 BOSS 不写。
    //   attackSprayFromX / attackSprayFromY         钳子在哪（相对它自己的半径）。使用 \`bossSkills\` 的 BOSS 不写。
    //   attackSprayBowRatio                         每颗的弧度（占飞行距离的比例）。使用 \`bossSkills\` 的 BOSS 不写。
    //
    // **六行现在的值是一模一样的**，抄自旧的 \`hazards.boss\`，而且这一步是**先证明"行为没变"**：
    // 六只 BOSS 必须和拆分前那只逐像素一致，之后才谈各不相同。烟囱蟹王先走通，再复制到其余五个。
    "bosses": {
      // 第 1 关 —— 烟囱蟹王。
      "boss-crab": {
        "patrolCenterRatio": 0.7,
        "patrolVerticalAmplitudeRatio": 0.08,
        "verticalPatrolPeriodSeconds": 6.8,
        "verticalSeekPerSecond": 1.4,
        "patrolAmplitude": 0.36,
        "patrolPeriodSeconds": 4.6,
        "seekSpeedFactor": 0.16,
        "radiusRatio": 0.11,
        "colour": 0x53306b,
        "eyeColour": 0xffd479,
        "armourColour": 0x7a4f9c,
        "weakPointWidthRatio": 0.03,
        "hitFlashColour": 0xffffff,
        "hitFlashStrength": 1,
        "knockbackScale": 0.5,
        "attackEverySeconds": 4.6,
        "attackSprayFrame": 6,
        "attackSprayCount": 7,
        "attackSpraySpread": 0.55,
        "attackSpraySeconds": 0.62,
        "attackSprayFromX": 0.55,
        "attackSprayFromY": -1.25,
        "attackSprayBowRatio": 0.09
      },
      // 第 2 关 —— 寄居沉船章鱼。**技能组见下面的 \`bossSkills\`**：它不使用挥螯喷颗粒，
      // 所以这里没有 \`attackSpray*\` 那六个数（类型与校验都已改为可选）。
      "boss-octopus": {
        "patrolCenterRatio": 0.7,
        "patrolVerticalAmplitudeRatio": 0.08,
        "verticalPatrolPeriodSeconds": 6.8,
        "verticalSeekPerSecond": 1.4,
        "patrolAmplitude": 0.36,
        "patrolPeriodSeconds": 4.6,
        "seekSpeedFactor": 0.16,
        "radiusRatio": 0.11,
        "colour": 0x53306b,
        "eyeColour": 0xffd479,
        "armourColour": 0x7a4f9c,
        "weakPointWidthRatio": 0.03,
        "hitFlashColour": 0xffffff,
        "hitFlashStrength": 1,
        "knockbackScale": 0.5,
        // 技能组（见下面的 \`bossSkills\`）比挥螯更频繁：2.3 秒间隔 + 约 0.73 秒攻击动画 ≈ 每 3 秒一招。
        "attackEverySeconds": 2.3,
        "attackSprayFrame": 6
      },
      // 第 3 关 —— 冠冕水母。
      "boss-jelly": {
        "patrolCenterRatio": 0.7,
        "patrolVerticalAmplitudeRatio": 0.08,
        "verticalPatrolPeriodSeconds": 6.8,
        "verticalSeekPerSecond": 1.4,
        "patrolAmplitude": 0.36,
        "patrolPeriodSeconds": 4.6,
        "seekSpeedFactor": 0.16,
        "radiusRatio": 0.11,
        "colour": 0x53306b,
        "eyeColour": 0xffd479,
        "armourColour": 0x7a4f9c,
        "weakPointWidthRatio": 0.03,
        "hitFlashColour": 0xffffff,
        "hitFlashStrength": 1,
        "knockbackScale": 0.5,
        "attackEverySeconds": 4.6,
        "attackSprayFrame": 6,
        "attackSprayCount": 7,
        "attackSpraySpread": 0.55,
        "attackSpraySeconds": 0.62,
        "attackSprayFromX": 0.55,
        "attackSprayFromY": -1.25,
        "attackSprayBowRatio": 0.09
      },
      // 第 4 关 —— 长尾鲨。
      "boss-shark": {
        "patrolCenterRatio": 0.7,
        "patrolVerticalAmplitudeRatio": 0.08,
        "verticalPatrolPeriodSeconds": 6.8,
        "verticalSeekPerSecond": 1.4,
        "patrolAmplitude": 0.36,
        "patrolPeriodSeconds": 4.6,
        "seekSpeedFactor": 0.16,
        "radiusRatio": 0.11,
        "colour": 0x53306b,
        "eyeColour": 0xffd479,
        "armourColour": 0x7a4f9c,
        "weakPointWidthRatio": 0.03,
        "hitFlashColour": 0xffffff,
        "hitFlashStrength": 1,
        "knockbackScale": 0.5,
        "attackEverySeconds": 4.6,
        "attackSprayFrame": 6,
        "attackSprayCount": 7,
        "attackSpraySpread": 0.55,
        "attackSpraySeconds": 0.62,
        "attackSprayFromX": 0.55,
        "attackSprayFromY": -1.25,
        "attackSprayBowRatio": 0.09
      },
      // 第 5 关 —— 废网巨鲨。
      "boss-netshark": {
        "patrolCenterRatio": 0.7,
        "patrolVerticalAmplitudeRatio": 0.08,
        "verticalPatrolPeriodSeconds": 6.8,
        "verticalSeekPerSecond": 1.4,
        "patrolAmplitude": 0.36,
        "patrolPeriodSeconds": 4.6,
        "seekSpeedFactor": 0.16,
        "radiusRatio": 0.11,
        "colour": 0x53306b,
        "eyeColour": 0xffd479,
        "armourColour": 0x7a4f9c,
        "weakPointWidthRatio": 0.03,
        "hitFlashColour": 0xffffff,
        "hitFlashStrength": 1,
        "knockbackScale": 0.5,
        "attackEverySeconds": 4.6,
        "attackSprayFrame": 6,
        "attackSprayCount": 7,
        "attackSpraySpread": 0.55,
        "attackSpraySeconds": 0.62,
        "attackSprayFromX": 0.55,
        "attackSprayFromY": -1.25,
        "attackSprayBowRatio": 0.09
      },
      // 第 6 关 —— 风暴之眼。
      "boss-eye": {
        "patrolCenterRatio": 0.7,
        "patrolVerticalAmplitudeRatio": 0.08,
        "verticalPatrolPeriodSeconds": 6.8,
        "verticalSeekPerSecond": 1.4,
        "patrolAmplitude": 0.36,
        "patrolPeriodSeconds": 4.6,
        "seekSpeedFactor": 0.16,
        "radiusRatio": 0.11,
        "colour": 0x53306b,
        "eyeColour": 0xffd479,
        "armourColour": 0x7a4f9c,
        "weakPointWidthRatio": 0.03,
        "hitFlashColour": 0xffffff,
        "hitFlashStrength": 1,
        "knockbackScale": 0.5,
        "attackEverySeconds": 4.6,
        "attackSprayFrame": 6,
        "attackSprayCount": 7,
        "attackSpraySpread": 0.55,
        "attackSpraySeconds": 0.62,
        "attackSprayFromX": 0.55,
        "attackSprayFromY": -1.25,
        "attackSprayBowRatio": 0.09
      },
    },

    // ---------------------------------------------------------------------------------------------
    // 第二关 BOSS 的技能组
    // ---------------------------------------------------------------------------------------------
    //
    // **这里有一只 BOSS 的行，它每次攻击就从三招里随机抽一个**，而不是使用 \`attackSpray*\` 的钳子扇形：
    //   1. 墨汁：朝玩家当前位置抛出墨团，落地成雾，雾内全部移动变慢（参数在 \`hazards.ink\`）。
    //   2. 召唤木箱：随机留一列，另外两列从屏幕顶部同时落箱（木箱就是关卡里的 \`fallcrate\`，同样 2 秒预警）。
    //   3. 环形子弹：360° 均匀一圈，弹速/伤害/外形来自 \`enemyBullets.shooters['boss-octopus']\`。
    // 三招共用 BOSS 自己的 \`attack\` 动画与 \`attackSprayFrame\` 作为施法前摇。
    "bossSkills": {
      // 寄居沉船章鱼：一圈 12 发，每轮整体旋转 15°（0.2618 弧度）。
      "boss-octopus": { "ringCount": 12, "ringRotationRadians": 0.2618 }
    },


    // ---------------------------------------------------------------------------------------------
    // 电鳗
    // ---------------------------------------------------------------------------------------------
    //
    // **电鳗**：它的威胁是**命中后让你麻痹**——操作反向 0.5 秒。电箭打中你、或者你撞上它的本体，
    // 都会触发；伤害刻意很低（弹 5 点、本体 10 点），这一条机制才是它存在的理由。
    //
    // 被麻痹期间**水平和垂直操作都是反的**——这就是规格说的"短暂失控"：往左按，气泡往右走；往上按，
    // 气泡往下走。两个轴同时失效才是"手不听话"，而气泡上那圈锯齿电光就是让人立刻察觉这件事的提示。
    // 0.5 秒是刻意短：它的作用是让人**慌一下**并为此改航线，不是让人白白送命。
    "eel": {
      // **被麻痹多久（秒）**：电箭命中、或撞上本体，操作反向这么久。设成 0 就整条关掉。
      "paralysisSeconds": 0.5,
      // 垂直方向是否也反转。水平反转是这条机制的本体，始终生效；这一项只控制垂直轴：
      // 设成 false 就退回"只反左右"的旧行为，方便单独对比手感，而不必改代码。
      "invertVertical": true,
      // 被麻痹期间气泡上那圈锯齿电光的颜色与线宽（相对气泡半径）。
      //
      // 这个提示**必须存在**：控制反转是玩家唯一会怀疑"游戏坏了"的机制，所以失灵的瞬间必须在气泡上看得见，
      // 而且要看起来像"我被电了"而不是"我按错了"。刻意用近乎白的冷色而不是电鳗自己的黄绿——
      // 阶段色已经占了气泡本体，电鳗的色是给**它**用的，这个是给**我**用的。
      "paralysisColour": 0xeaffff,
      "paralysisWidthRatio": 0.14,

      // 电箭外圈的麻痹波纹：**和玩家气泡上那圈是同一张画**（\`src/paralysis.ts\`），
      // 这里只决定它的基准半径——子弹判定半径的多少倍。
      //
      // 闪电簇贴图的半宽约是判定半径的 2.5 倍，所以 2.5 让圈正好落在贴图外面；
      // 线宽和锯齿比例沿用玩家那圈的 \`paralysisWidthRatio\`，不另开一套。
      "bulletRingRadiusRatio": 2.5
    },
    // ---------------------------------------------------------------------------------------------
    // 四位枪手（移动与各自的核心机制；弹药的节奏/速度/伤害在 enemyBullets.shooters 那边）
    // ---------------------------------------------------------------------------------------------
    //
    // 四个都是**随水流漂的炮台**：枪手的威胁在弹不在脚，而漂着下坠本身就会扫过玩家的泳道——
    // 和电鳗/海胆同一套移动模型，玩家不需要学第二条移动规则。
    //
    // **射水鱼**：唯一只管漂的——它的全部个性都在射手行里（弹型、节奏、可打跑）。
    "archer": {
      // 随水流下坠的速度（相对卷动速度的倍率）。越小悬得越久、压迫时间越长。
      "driftFactor": 0.3
    },

    // **手枪虾**：精英。悬得最久（漂得最慢），让那一发又快又重的大弹有足够的存在感。
    "pistol": {
      "driftFactor": 0.22
    },

    // **刺魨**：防御反击型——**每受一次击就向四周炸一圈刺**（9 向，刺的速度/外形在它的射手行）。
    //
    // \`countersWhenHit\` 是总开关（设 false = 纯肉靶）；\`counterCooldownSeconds\` 是这条机制的全部灵魂：
    // 打一发、吃一圈、在冷却窗口里再打——射击它是一个**节奏**而不是一个反射。
    // 冷却期间占位身体会瘪下去，安全窗口看得见。
    "puffer": {
      "driftFactor": 0.3,
      // 受击要不要反击（总开关）。
      "countersWhenHit": true,
      // 两次反击之间的冷却（秒）。
      "counterCooldownSeconds": 1.2,
      // 一次反击向四周射几根刺。
      "spikeCount": 9
    },

    // **海星**：弹幕型——每轮 \`volleyCount\` 向**固定角度**齐射（不瞄人），每轮整体旋转
    // \`volleySpinRadians\`（默认 36°，两轮补满整星）。站着不动是死，一直动就永远有缝。
    // 齐射的节奏与弹速在射手行（perSecond 0.4 = 每 2.5 秒一轮）。
    "starfish": {
      "driftFactor": 0.25,
      // 一轮几个方向。
      "volleyCount": 5,
      // 每轮整体旋转多少弧度。0.6283 ≈ 36°。
      "volleySpinRadians": 0.6283
    },

    // 受击后的无敌时间（秒）。防止被一群鱼连续秒杀。
    "invulnerableSeconds": 0.8
  },

  // ---------------------------------------------------------------------------------------------
  // 吞噬（食物链反转）
  // ---------------------------------------------------------------------------------------------
  //
  // 核心承诺：**刚才还要躲开的东西，变大后可以回头一口吃掉。**
  //
  // 这是整个"吞噬气泡"玩法的地基。它建在已有的体积机制上，不引入第二套资源：
  // 体积依然是唯一的成长量，危险物现在是**另一类食物**，只是需要先长到吃得下它的体积。
  //
  // 判定是**双向**的，这一点是它好玩的原因：
  //   - 体积够 → 你撞上去，它被你吃掉，你变大
  //   - 体积不够 → 同上一次碰撞，但结果是它伤害你
  // 于是同一只水母，在关卡前半段是威胁、后半段是补给，而**分界线由玩家自己吃出来**。
  //
  // 能吃什么由 volumeTier 阶梯决定，不看体积的连续值。理由：连续阈值会让"我到底能不能吃它"
  // 在数值边缘变得不可判断，而分档能配合轮廓标记给出一个是/否的答案。
  "consumption": {
    // 体积档位阶梯：**这个数组的下标就是档位**，值是进入该档所需的体积。
    //
    // 为什么要有这条独立阶梯，而不是直接用成长阶段：成长阶段是按**吸收个数**晋升的
    // （absorbToStage2 = 12 颗），而体积是每颗按体积累加的——两者不是同一个量，体积反推不出阶段。
    // 第一版就是拿"12 颗"当体积阈值用，于是长到阶段2 的玩家体积只有 2.3，却要 13 才算"第2档"，
    // 结果**永远吃不到鱼**。吞噬阶梯必须是它自己的、以体积为单位的阶梯。
    //
    // 单位是体积。现在有 5 档，对应规格里的 微型/小型/中型/大型/巨型。
    // 让某个档位更容易达到就把那个数调小。
    "tierVolume": [0, 2.2, 4.0, 6.0, 8.5],

    // 每种危险物的**质量**（等价于体积）。决定吃下它能长大多少。
    // 排列体现了食物链：鱼最好吃、螃蟹最"重"。
    "mass": {
      "fish": 0.28,
      // 金枪鱼 0.4：比鱼重（它比鱼大一档），但比螃蟹轻得多——它是"可以吃的一顿好饭"，不是硬骨头。
      "tuna": 0.4,
      // 第 4 关：体型即分量，所以一只能吃下去的猎食者本身就是一笔大收获。
      // 海豚 0.35 比金枪鱼还轻（它是"快到可以拿的奖励"），座头鲸 0.6 是全场最重的一口。
      "dolphin": 0.35,
      "octopus": 0.45,
      "shark": 0.5,
      "whale": 0.6,
      "jelly": 0.42,
      "trash": 0.55,
      "crab": 0.8,
      "bombfish": 0.45,
      "urchin": 0.5,
      // 只有值，没有用武之地：edibleAtTier 把它锁在最高档（= 永远吃不到），所以 BOSS 永远吃不到。表要有这一行，
      // 只是为了让"两张表的键必须一致"那条加载期检查继续有效。
      "boss": 40,
    "boss-crab": 40,
    "boss-octopus": 40,
    "boss-jelly": 40,
    "boss-shark": 40,
    "boss-netshark": 40,
    "boss-eye": 40,
      "vent": 0,
      "mineral": 0.05,
      "shrimp": 0.22,
      "angler": 0.4,
      "torpedo": 0.35,
      "zapper": 0.46,
      "foam": 0.02,
      "rain": 0.05,
      "eel": 0.4,
      "rot": 0.38,
      "oil": 0.6,
      // 四位枪手：体型即分量——精英最重。
      "archer": 0.3,
      "pistol": 0.55,
      "puffer": 0.45,
      "starfish": 0.35,
      // 下落木箱：不可吃，质量只用于满足"两张表键必须一致"的加载期检查。
      "fallcrate": 5,
      // 墨雾：不可吃，质量同样只是为了表的完整性。
      "ink": 0.05
    },

    // 吃下每种危险物所需的**档位**，对应上面 tierVolume 的下标 + 1。
    //   1 = 体积 0.0 起（开局就能吃，现在没有这种）
    //   2 = 体积 2.2 起
    //   3 = 体积 4.0 起
    //   4 = 体积 6.0 起
    //   5 = 最高档：**永远吃不到**（\`canEatHazard\` 把最高档当作"不是食物"）
    //
    // 现在的阶梯：鱼 2、水母 3、垃圾 3、螃蟹 4、**炸弹鱼 2、海胆 3、电鳗 5（不可吃）**。
    // 所以关卡开头鱼是威胁（追着你跑），长到体积 2.2 之后它变成食物；水母的减速在那时还很烦人，
    // 到体积 4.0 之后也成了补给。这正是"反转"的节奏。调高某个数 = 那种危险物更晚才能吃。
    "edibleAtTier": {
      "fish": 2,
      // 金枪鱼 3：比鱼晚一档——它更大，所以要更大的气泡才吞得下。这是"体型决定食谱"那条规则的自然结果。
      "tuna": 3,
      // 第 4 关：海豚和章鱼第 3 档就能吞，大白鲨和座头鲸要第 4 档——**这条才是"体型决定食谱"最直接的表达**，
      // 一关里同时出现"现在吃得下"和"还吃不下的"，比把它们藏进血量里清楚得多。
      "dolphin": 3,
      "octopus": 3,
      "shark": 4,
      "whale": 4,
      "jelly": 3,
      "trash": 3,
      "crab": 4,
      "bombfish": 2,
      // 5 = 最高档（tierVolume 的最后一档）也吃不了它。BOSS 不是食物，这个值只是"永远够不到"。
      "boss": 5,
      "boss-crab": 5,
      "boss-octopus": 5,
      "boss-jelly": 5,
      "boss-shark": 5,
      "boss-netshark": 5,
      "boss-eye": 5,
      "vent": 5,
      "mineral": 5,
      "shrimp": 2,
      "angler": 3,
      "torpedo": 3,
      "zapper": 3,
      "foam": 5,
      "rain": 5,
      "urchin": 3,
      // 电鳗：**不可吃**。和 BOSS 一样写到最高档——\`canEatHazard\` 把最高档当作"永远"，
      // 所以体积和「大胃口」都够不到它。它已经是不可伤害的炮台，再能被吞掉就等于换了一条清怪途径。
      "eel": 5,
      "rot": 3,
      "oil": 2,
      // 四位枪手全是 3 档（体积 4.0 起）：开局它们是纯威胁，长到中期变成补给——
      // 和水母同档，"会开枪的东西也能吃"是反转节奏的一部分。
      "archer": 3,
      "pistol": 3,
      "puffer": 3,
      "starfish": 3,
      // 下落木箱：不可吃（最高档）。
      "fallcrate": 5,
      // 墨雾：不可吃（最高档）。
      "ink": 5
    },

    // 吃下危险物得到的质量，相对它自身 mass 的比例。
    // 小于 1 表示"吃有损耗"：吃一只鱼得到的比它自身轻，于是不能靠吃危险物无限膨胀。
    "massEfficiency": 0.85,

    // 吃下危险物时的短暂无敌（秒）。和阶段晋升同理由：刚完成一次吞食就被旁边的东西撞上，
    // 手感上会觉得游戏在惩罚你做对了事。
    "eatInvulnerableSeconds": 0.35,

    // 撞上一个**吃不下的**泡泡（比你的口径大）时扣多少血。
    //
    // 20 = 和一只普通的鱼一样。这是"撞到东西"这件事的标准价，和障碍物、和普通的鱼对齐：玩家学一条规则
    // 就够了，不用记"泡泡撞起来比较不疼"。
    "bumpDamage": 20,

    // ---------------------------------------------------------------------------------------------
    // 威胁标记
    // ---------------------------------------------------------------------------------------------
    //
    // 规格要求"可吞噬目标的轮廓从红色变为金色"。但**阶段色已经占了气泡本体**（青→金→粉，
    // 表示"我是第几阶段"），两者都用轮廓色就会出现"金色既表示我是阶段3、又表示这个能吃"。
    //
    // 所以标记**只画在危险物自己身上**，是一种叠在它原有画法之外的框：
    //   可吞      —— 柔和的金色内发光
    //   不可吞    —— 红色硬边
    // 玩家气泡的阶段色完全不受影响，两个信号各说各的。
    "marker": {
      // 可吞噬标记的金色。**这个颜色和阶段色里的金色是两个东西**：那个是"我"，这个是"它"，
      // 之所以都用金色系是因为"能吃"这个含义应该是统一的一套语言。
      "edibleColor": 0xffd479,

      // 标记的线宽，相对危险物半径的比例。
      "widthRatio": 0.12,

      // 标记的不透明度。
      "edibleAlpha": 0.75,
      "blockedAlpha": 0.55,

      // 不可吞噬标记的红色。第一版先只做"可吞"这一种，因为它是玩家**行动所需**的信息：
      // 不知道能吃什么就没法做决策，而不知道什么不能吃只是少一点谨慎。
      // 把这一项改成 false 就只保留可吞标记。
      "showBlocked": false
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 吸附（长按产生吸力）
  // ---------------------------------------------------------------------------------------------
  //
  // 长按技能钮产生吸力，把**前方**的轻型物体拉向自己。这让吞噬不再只是"接触"，而包含站位和时机的判断：
  // 你得先把自己挪到能捞到东西的位置，再按住，再在被打到之前松手。
  //
  // 和吞噬阶梯的关系：吸力**只负责拉近**，不负责吃。拉到位之后仍然走那套档位判定——所以吸一只吃不了的
  // 螃蟹过来，等于把危险物加速拉到自己脸上。这也是规格里说的"sucking pulls the dangerous things too"：
  // 吸力会连同你不想吃的东西一起拉过来，这让"什么时候按住"变成一个真实的取舍。
  "suction": {
    // 吸力半径的基础值，相对泳道宽度的比例。实际半径见 radiusPerVolume。
    "radiusRatio": 0.22,

    // 每 1.0 体积额外增加多少半径（相对泳道宽度的比例）。
    // 规格里的 R = R0(1 + 0.6*sqrt(M/100)) 是个连续曲线；这里用线性近似，因为吸附半径是玩家能**看到**的
    // 东西，分段线性的边界比开方更容易对着画面调。想让半径只跟基础值走就设成 0。
    "radiusPerVolume": 0.035,

    // 最大吸附半径（相对泳道宽度的比例）。防止后期大到把整个泳道都吸住。
    "maxRadiusRatio": 0.5,

    // 拉动速度，相对泳道宽度每秒的比例。
    // "轻型物品"的判定见下面的 massFactor：拉得动多少取决于目标相对玩家的等级。
    "pullPerSecond": 0.55,

    // 按等级决定拉动难度的因子：目标质量 / 玩家质量 越大越拉不动。
    // 这是规格里"小于当前吞噬等级的直接吸入、同级需要持续吸附、过大的只能轻微移动"的实现：
    //   ratio <= 1      -> 全速拉动（直接吸入）
    //   ratio 在 1..3   -> 按 massFactor 衰减
    //   ratio >= heavyRatio -> 只剩 heavyFloor 的速度，几乎拉不动
    "heavyRatio": 3.0,
    "heavyFloor": 0.12,

    // 吸附期间玩家移动速度的倍率。规格要求"吸附期间移动速度降低"——
    // 这是这个机制唯一的代价，也是它需要判断时机的原因：按住的时候你几乎躲不开。
    "moveSpeedFactor": 0.45,

    // 吸附期间气泡的视觉表现：一圈向内收的光环，以及它的不透明度和半径倍率。
    "fieldColor": 0x9beeff,
    "fieldAlpha": 0.22,
    "fieldWidthRatio": 0.06,

    // 被吸住的物体身上画一条朝向气泡的连线（"吸附轨迹"）。0 = 不画。
    "tetherAlpha": 0.35,
    "tetherWidthRatio": 0.05
  },
  // ---------------------------------------------------------------------------------------------
  // 小泡泡子弹（气泡自带的武器）
  // ---------------------------------------------------------------------------------------------
  //
  // 玩家的气泡**一直在吐小泡泡**，像街机空战里的子弹：不用按键，自己按节奏往上打。
  // 打在生物身上掉血；血掉光它**不会死**，而是加速游出屏幕跑掉（血量见 hazards.health，逃跑速度见
  // hazards.fleeSpeedFactor）。
  //
  // 它**不打障碍物**：子弹会被木箱挡住但不掉它的耐久——破障碍是冲撞和爆破的事，免费火力顺手拆墙
  // 会让那两个动词失去意义（见 src/bullets.ts 里同一条规则的英文版）。
  //
  // 关掉的办法有两种：把射速第一档设成 0（全员关），或者把某个气泡类型的 \`firesBullets\` 关掉
  // （见 src/bubbleTypes.ts，那里是"这个类型有什么本事"的唯一答案）。
  "bullets": {
    // **小泡泡子弹的贴图**：写 src/assets/ 下的文件名（不写扩展名）。空字符串 = 用代码画的小圆点。
    // 会**整个替换**程序化的外观；子弹很多，所以是按需创建的精灵池，不是每帧新建。
    "image": "玩家子弹",
    // 贴图的不透明度与染色（0xffffff = 原色）。子弹比气泡小，图上留白多/少就调 imageScale。
    "imageAlpha": 1,
    "imageTint": 0xffffff,
    "imageScale": 2,
    // ---------------------------------------------------------------------------------------------
    // 射速：**三档**，开局第一档，每捡一个"射速升级"升一档
    // ---------------------------------------------------------------------------------------------
    //
    // 三档就是**这个数组的长度**：加一档就多写一个数，删一档就删一个数。不用另设"上限"，
    // 因为"一共有几档"和"每档多少发"本来就是同一件事。
    //
    // 0 = 完全不射（放在第一档就是全员关枪）。
    "rateTiers": [4, 6, 9],

    // ---------------------------------------------------------------------------------------------
    // 速度曲线：初速 → 匀加速 → 最高速封顶
    // ---------------------------------------------------------------------------------------------
    //
    // 单位都是"泳道宽/秒"（加速度是每平方秒）。屏幕上看到的接近速度还要**加上关卡自己的卷动速度**
    // （水在往下走），所以不用调得很大也能追上迎面来的东西。
    //
    // 三个数一起决定**射程**（速度曲线下方的面积）。默认值让总射程与旧的"匀速 1.6 × 2.2 秒 ≈ 3.5 泳道宽"
    // 大致相等，所以这组数不加强也不削弱枪——它只是把匀速换成了加速的形状。
    //
    // 默认在 1.4 秒时达到最高速，而 \`lifeSeconds\` 是 2.2 秒，所以默认射程下三个阶段**都看得见**。
    "speedStartPerSecond": 0.6,
    "accelerationPerSecond": 1.0,
    "speedMaxPerSecond": 2.0,

    // ---------------------------------------------------------------------------------------------
    // 体积曲线：随时间**线性**长大，没有上限
    // ---------------------------------------------------------------------------------------------
    //
    // \`radiusRatio\` 是发射那一刻的半径，\`radiusGrowthPerSecond\` 是它每秒长多少（都是泳道宽的比例）。
    // 做得很小：它是泡泡，不是炮弹，不该挡住玩家看危险物的视线。
    //
    // **只跟时间有关**，不跟速度直接挂钩：所以飞得慢的子弹在屏幕里待得久、长得大，而飞得快的还没胀起来就
    // 出屏幕或者打中了。这正是"高速弹幕流"和"低速大气泡流"这两条路的分岔点。
    //
    // 没有上限：唯一的限制是它能活多久（\`lifeSeconds\`）。加一道人为的天花板会让"堆射程"在后期变成一张
    // 被截断的卡——真糊住视野就调小每秒增长，那是数值问题不是机制问题。
    "radiusRatio": 0.011,
    "radiusGrowthPerSecond": 0.007,

    // 每发伤害（点）。和 hazards.health 同一个量纲，两张表必须一起读。
    //
    // 5 而不是 1，是为了给**伤害成长**留分辨率：基数 1 时"+15% 伤害"这张卡只能落成 0 或 1，
    // 而"越大伤害越高""越快伤害越高"这类按倍率算的卡，在基数太小的时候根本读不出差别。
    // 伤害本身早就是浮点（见 \`damageOf\`），所以基数一抬，小数伤害立刻有了意义。
    //
    // 这不是平衡改动：生物血量同步乘了 5，逐只的所需发数一点没变。
    "damage": 5,

    // ---------------------------------------------------------------------------------------------
    // 火力升级（拾取"能力升级"之后）
    // ---------------------------------------------------------------------------------------------
    //
    // 每拾取一个，枪就**多一排**：一次齐射从每排各出一发（不是提高射速），所以 DPS 成倍增长。
    // 和"射速升级"是两个独立的乘数：排数 × 射速，各有各的上限，各自一个道具。
    // 排的横向间距按泳道宽度的比例给，两条弹道会分别在气泡左右，中间留出缝——既看得出是两排，
    // 也不会把整个泳道糊住（那会让"躲"这件事失去意义，因为敌人也在同一条泳道里）。
    "upgradeSpreadRatio": 0.075,

    // 排数上限。默认 3：一局开局只有一排，所以「枪管」现在是**两步升级**，捡两个才到顶。
    // （以前是 2，因为有一条路线一进场就白送一排；那条路线没有了，没有形态再被白送一排。）
    // 上限内重复拾取会被消耗掉但不再变化。
    "maxStreams": 3,

    // 存活秒数。超时就消失，免得屏幕被子弹堆满（也会限制射程）。
    "lifeSeconds": 2.2,

    // 外观：一颗亮芯 + 一圈淡边，和其它泡泡一样的画法，所以它是"气泡"而不是"激光"。
    "colour": 0xd8fbff,
    "alpha": 0.85,
    "rimColour": 0x7fc4e8,
    "rimAlpha": 0.7,

    // ---------------------------------------------------------------------------------------------
    // 追踪弹：枪的一张卡，30% 的子弹会自己找目标
    // ---------------------------------------------------------------------------------------------
    //
    // 判定发生在**出膛那一刻**：每发子弹各自掷一次骰，掷中就带上追踪属性。所以**同一次齐射里可以一颗追踪、
    // 一颗不追踪**——这不是边界情况，是设计。属性挂在子弹上而不是挂在枪上，正是为了这个。
    //
    // 选目标的规则（写死在代码里，见 src/bullets.ts）：
    //   · 目标必须**在气泡上方**（\`敌人 y > 玩家 y\`，严格半平面，左右不限）——你已经游过去的敌人不回头打；
    //   · 目标必须**在屏幕内**（就是上面速度曲线那一节说的可见范围）；
    //   · 目标必须是**活着的、能被子弹打的生物**（和枪自己的判定完全同一行代码）。
    //   三者取交集，**均匀随机**挑一个。锁定之后不再改主意，除非目标消失（被打死 / 被吃掉 / 离场）——那时用
    //   **当时**的气泡位置重选一次；再选不到，这颗弹就转入下面的"弧线"，直到消失为止。
    //
    // **只有横向在动**：纵向永远是上面那条速度曲线，所以追踪弹不会掉头、不会减速，只是在往上飞的同时朝目标
    // 滑过去。横向是这套东西唯一的自由度。
    "homing": {
      // 出膛时判定为追踪弹的概率。0 = 这张卡完全无效（也是临时关掉它的办法）。
      "chance": 0.3,
      // 横向速度上限（泳道宽/秒）。相对纵向速度（0.6 → 2.0）要小得多：子弹是**弯过去**的，不是横着飞的。
      "lateralMaxPerSecond": 0.55,
      // 转向速率上限（泳道宽/秒²）：横向速度每秒最多变这么多。**这就是"转速"**——调小是有重量感的追踪，
      // 调大就是必中；它和普通子弹的区别全在这个数上。
      "steerPerSecond": 2.6,
      // 横向速度的**目标值** = 与目标的横向距离 × 这个系数（1/秒），再被上面的上限截断。
      // 所以离得远时全速滑过去，快到了自动减速——没有这一项，子弹会在目标两边来回抽。
      "approachPerSecond": 3.0,
      // 没有目标时的固定横向加速度（泳道宽/秒²）。**这就是那条弧线**：出膛时没找到目标，就从横向速度 0 开始
      // 按这个加速度拐出去；中途丢了目标又重选不到，就从当时的横向速度接着拐。朝哪边随机。
      "arcPerSecond": 1.1,
      // 屏幕外余量（米）：把"屏幕内"的判定在现有的可见范围上再放宽这么多，让刚进场的也算合格目标。
      "rangeMarginMeters": 0,
      // 外观：换一套颜色，让玩家一眼看出哪颗在追踪。贴图开着的时候用 imageTint。
      "colour": 0x9ef0d6,
      "rimColour": 0x4fbf9c,
      "imageTint": 0x9ef0d6
    }
  },
  // ---------------------------------------------------------------------------------------------
  // 玩家气泡的贴图
  // ---------------------------------------------------------------------------------------------
  "playerBubble": {
    // 写 src/assets/ 下的文件名（**不写扩展名**）。空字符串 = 用代码画的泡泡。
    // 设了它就**整个替换**程序化的外观（填充 + 边 + 高光 + 光晕）——"你给的图就是气泡本身"，
    // 再把旧的边画上去就是两个气泡在互相不同意。只有"图只是填充、还想要边"时才把 keepDetails 设为 true。
    // 已打开：图片在 src/assets/玩家气泡.png。真正的原因见 syncBubbleSprite —— Texture.from() 在图片尺寸已知之前
    // 会给出 **0 宽** 的纹理，而 sprite.width = size 正好是除以它，于是缩放爆炸、贴图铺满半个屏幕。
    // 现在先 \x07wait image.decode() 再建纹理，并且**用 scale 而不是 width**。
    // 想换图就改这个文件名，空字符串 = 回到代码画的泡泡。
    // 原注释："玩家气泡" 就能打开，图片已经导入在 src/assets/ 下。
    "image": "玩家气泡",
    // 贴图的不透明度与染色（0xffffff = 原色；关卡阶段色仍会叠上去）。
    "imageAlpha": 1,
    "imageTint": 0xffffff,
    // 半径倍率：图里球体周围留白多就调大。
    "imageScale": 1.5,
    // **贴图自身的旋转**（度，顺时针为正）。0 = 正着；180 = 上下颠倒。
    //
    // 为什么会需要它：整个世界容器是**上下翻转**的（世界 +y 向上，屏幕 +y 向下），所以放在里面的贴图默认是
    // 镜像的 —— 代码画的泡泡是上下对称的，谁也看不出来；换成有高光的图就一眼看出来"转反了"。
    // 代码已经自动抵消了那个翻转（见 syncBubbleSprite），所以这里的 0 就是"图保持原样朝上"；
    // 要是你这张图的"上"本来就不在画面上方，用这个值转到对为止。
    "imageRotation": 0,
    "keepDetails": true
  },

  // ---------------------------------------------------------------------------------------------
  // 收集物的贴图
  // ---------------------------------------------------------------------------------------------
  //
  // 用**主菜单水里那十二张**（\`气泡-1\` 到 \`气泡-12\`，同一组文件）。为什么是十二张而不是一张缩放的，
  // 那个文件里写过：像素边框经不起缩放，一张图放大到顶会变成一根粗棒、缩到底会细成发丝。
  // 十二张的 texel 尺寸**和它们画出来的尺寸成比例**（5–12 texel，跨 2.4 倍），所以"用哪张"就已经决定了
  // 大小，不用再编一套尺寸表。
  //
  // 收集物这边比菜单多一层：**它的大小是玩法**（\`半径 = 玩家半径 × 关卡写的比例\`，六关里那个比例是 0.35–0.7），
  // 所以图必须缩放到碰撞半径，不能反过来让图决定大小。
  "collectableArt": {
    // 十二张图，按名字写。**顺序不重要**（代码按 texel 宽度自己排序），但十二张都要在。
    "pictures": [
      "气泡-1", "气泡-2", "气泡-3", "气泡-4", "气泡-5", "气泡-6",
      "气泡-7", "气泡-8", "气泡-9", "气泡-10", "气泡-11", "气泡-12"
    ],
    // **图按"相对玩家多大"分配**：比例等于 smallRatio 的用最小的那张，largeRatio 的用最大的那张，中间线性。
    //
    // 这两个数只管外观，不参与玩法——收集物真正的大小永远是 \`半径 = 玩家半径 × 比例\`，
    // 它们只回答"那 2.4 倍的美术跨度落在 0.35–0.7 这一段上时，每颗该穿哪张图"。
    // 于是**边框的粗细一直在说"它相对于你有多大"**，而那正好是它的玩法意义（能不能吃下它）。
    // 超出范围的（以后有关卡写 1.2）会被夹到两端，不会报错。
    "smallRatio": 0.35,
    "largeRatio": 0.7,
    // 画出来相对碰撞半径的缩放。1 = **长边正好等于直径**，所以非正方的图只会比判定略小、不会略大——
    // 大了就是"看起来能躲过、其实碰到了"。
    "imageScale": 1
  },

  // ---------------------------------------------------------------------------------------------
  // 形态选择屏（「开始游戏」之后、加载之前的那一屏）
  // ---------------------------------------------------------------------------------------------
  //
  // 一轮一次，在死亡重开时**不再问**：形态是这一局的，每次死都问一遍会把一个决定变成一道关卡。
  // 锁住的两个也照画——灰掉、底下写清原因——因为看不到自己在追什么的玩家，没有在追什么。
  //
  // 卡片**内部**那四行的位置是代码里的比例（见 \`src/routePick.ts\`）：那是重画卡片，不是调参。
  // 这里放的是尺寸、颜色和卡片自己的尺度。
  "routePick": {
    // 遮罩。和加载页一样是**一张自己的屏**：这一页压着画布，背后的东西不参与。
    "backdropColour": 0x030a17,
    "backdropAlpha": 0.93,
    // 标题两行。
    "headingColour": 0x9ff2ff,
    "headingSize": 26,
    "subheadingColour": 0x7fc4e8,
    "subheadingSize": 14,
    // 卡片里的四行：名字、身份、一句话、锁。
    "nameColour": 0xe8f6ff,
    "nameSize": 24,
    "titleColour": 0x9ff2ff,
    "titleSize": 15,
    "mutedColour": 0x9fb8cc,
    "blurbSize": 13,
    "lockColour": 0xffb862,
    "lockSize": 13,
    // 锁住的那两张整体压暗到多少。
    "lockedAlpha": 0.45,
    // 卡片的尺度（设计像素）。
    "cardHeight": 118,
    "cardGap": 18,
    "cardRadius": 14,
    // 卡片最宽 = min(画布 × 这个比例, 这个设计像素数)。
    "maxWidthRatio": 0.86,
    "maxWidth": 340,
    // 版式：离顶多少、标题和副标题之间、以及副标题到第一张卡片。
    "topMargin": 120,
    "headingGap": 60,
    "subheadingGap": 34,
    "cardFillColour": 0x0b1c2e,
    "cardAlpha": 0.92,
    "cardStrokeColour": 0x3d7fa8,
    "cardStrokeWidth": 1.5,
    "selectedStrokeColour": 0x9ff2ff,
    "selectedStrokeWidth": 3
  },

  // ---------------------------------------------------------------------------------------------
  // 主菜单的按钮
  // ---------------------------------------------------------------------------------------------
  //
  // 两个入口：开始游戏、设置。它们是**两张石头图**（\`src/assets/按钮-*.png\`），不再是画出来的圆角矩形加
  // 一行文字——每个按钮三张状态图（普通 / Hover / Pressed），共用**同一个裁切框**，所以换贴图时位置不会跳。
  //
  // **pressed 的下沉是画在贴图里的**（三张图里内容整体下移了几像素、同时变薄），所以代码**不再移第二次**：每个
  // 按钮有一个固定的"槽"，贴图在槽里下沉。代价是槽高含了下沉那段行程，所以按钮**看起来**的间距会比 \`buttonGap\`
  // 稍大一点。
  //
  // 触摸屏上没有 hover，手指按下去会直接进 pressed——这是对的，不是漏了一个状态。
  "menu": {
    // ---------------------------------------------------------------------------------------------
    // 三个石头按钮
    // ---------------------------------------------------------------------------------------------
    //
    // 这里只有一个尺寸旋钮，而且是**高度**：宽度 = 高度 × 这张图自己的宽高比。三张图是三次独立生成，原始比例
    // 是 3.95 : 3.71 : 3.26，所以"按宽度统一"看着和按高度统一等价，其实错得很隐蔽——同一宽度下三块石头的高度
    // 差 20%，而**文字是画在石头上的**，那 20% 里含着文字的大小。"设置的字比开始游戏大"就是这么来的。
    //
    // 现在三块的**帧**已经一样了（169×49，见下），所以按哪个维都行；旋钮留成高度，是因为"三块一样高"才是让
    // 文字一样大的那个条件。宽度这里**没有上限旋钮**：宽度和文字大小是同一件事，任何会"生效"的宽度上限都会让
    // 某一块的文字变小，也就是把刚修好的问题重新引入一遍。宽窗口下的上限由 \`designScale\` 自己的 1.5 封顶负责。
    //
    // **三块现在是等宽的**（每块 169×49 纹素），但那不是在游戏里算出来的，是**导入时**做到的：每张图按住
    // 文字那一段不动、只把两侧拉开或压窄，拉到同一个宽度。所以 \`buttonHeight\` 乘出来的宽度三块天然相同。
    //
    // 保留段是**量出来的，不是估的**，而且量错一次就出过一次事：第一版把设置的保留段从「设」字中间切了过去，
    // 那个字的左半边进了拉伸区，被拉宽 1.2 倍，看起来就是个坏字。量文字范围用亮度掩膜不可靠（石头的蓝灰和
    // 边框高光都会命中），**要把掩膜画出来用眼睛确认边界**再取数。
    //
    // 以后想改这个共同宽度，从源图重导一遍最省事（源图在 \`Downloads/TGBA/\`）：
    //     python scripts/import-picture.py <src>/开始游戏.png --name 按钮-开始游戏 \\
    //         --crop 78,206,1184,489  --grid-height 45 --keep 43,140 --stretch-to <新宽度>
    //     python scripts/import-picture.py <src>/设置.png     --name 按钮-设置 \\
    //         --crop 149,211,1131,513 --grid-height 45 --keep 51,104 --stretch-to <新宽度>
    // （每块两个状态都要跑一遍，hover 用同一个 --crop 和 --keep。\`--keep\` 是**像素化之后**的内容坐标，
    // 不含四周那 2 个透明纹素；\`--grid-height 45\` 保证两块同高——高度是这里必须一致的那一维。）
    //
    // 不想重导、只想从现有的图改宽度也行，但保留段在图里的位置**已经跟着左移了**，得用新坐标
    // （开始游戏 37,134 / 设置 61,114，\`scripts/restretch-picture.py\` 会把两种坐标都打出来）。
    "buttonHeight": 82,
    // 两个按钮之间的纵向间距。**槽**与槽之间的间距：两块石头的帧一样高，所以这个数就是看得见的间距。
    "buttonGap": 14,
    /**
     * 按下时整块石头往下位移多少，设计像素。
     *
     * 贴图里**没有** pressed 态了：那三张画的是"厚度缩短 + 光照变暗"，渲染出来看着像被压扁。
     * 改成一整块石头往下沉——真石头被按下去就是这样，而且不用再让生图模型对准像素。
     *
     * 位移的是**整张图**（连它自己画的下边缘阴影一起），所以读起来是"整块滑下去"而不是"压进地里"。
     * 想要后者就得同时缩一点点，那是另一个旋钮，先不引入。
     */
    "buttonPressDrop": 3,

    /**
     * 整组的**纵向中心**占屏高的比例。0.5 就是屏幕上居中。
     *
     * 锚点从"按钮的顶边"改成了"整组的中心"，理由就一条：按钮高度是上面那个数可以调的。按顶边锚的话，
     * 改一次高度，同一个数字就不再表示"居中"了——而这里想表达的恰恰是"这一组在屏幕上居中"。
     */
    "groupCentreRatio": 0.5,

    // ---------------------------------------------------------------------------------------------
    // 标题（\`src/assets/标题.png\`）
    // ---------------------------------------------------------------------------------------------
    //
    // 一张拱形石匾，托底、珊瑚和苔藓**都画在贴图里**，所以代码不再给它垫任何暗底——上一版那层
    // \`titleGlow*\` 是给一张对比度不够的扁平标题用的，这一张自带。
    //
    // \`titleWidthRatio\` 是它画多宽，占**泳道**宽的比例。0.78 不是随手挑的：这张图的细节（石头颗粒、苔藓、
    // 细珊瑚）在项目的密度下（1.4 屏幕像素/纹素）比旧标题容易糊，量过 0.62 时笔画内部的纹理和珊瑚会糊成
    // 噪点，0.78 给到 233 个纹素才立得住。而且菜单现在只剩标题和三个按钮，上半屏本来就空着。
    //
    // \`titleAspect\` 是**这张图自己的**宽高比，量的对象是**裁好、加完边距之后的帧**（233 ÷ 90 = 2.589），
    // 不是源图的 2.676——\`import-picture.py\` 会给四周各留 2 个纹素。排布局时要用它算高度，那时候图片可能
    // 还没加载完、精灵还没有尺寸。这是"图片本身的事实"，和 \`chargeTrail.columns/rows\` 同类。
    "titleWidthRatio": 0.78,
    "titleAspect": 2.589,
    // 标题**底边**到最上面那块石头的**顶边**的距离。标题是按底边锚的，不是按中心——一块拱形石匾的中心
    // 会随它的高度上上下下，而它坐在按钮上这件事不该跟着变。
    "titleButtonGap": 36,

    // ---------------------------------------------------------------------------------------------
    // 主菜单的渐入：标题先浮出来，按钮一块接一块
    // ---------------------------------------------------------------------------------------------
    //
    // 每次菜单成为当前屏幕时都会重演（启动加载完成之后、从一局回到菜单时），不是只演一次。
    // 所有透明度都由同一个时钟算出来，所以改这三个数不会让标题和按钮各演各的。
    //
    // 曲线是 smoothstep（两端慢、中间快）：线性渐变更像"把灯调亮"，而这个更像从水里浮出来。
    "intro": {
      // 标题从全透明到完全显示要多久（秒）。也是按钮开始出现之前的等待。
      "titleSeconds": 1,
      // 每一块石头自己渐入要多久（秒）。
      "buttonSeconds": 0.35,
      // 相邻两块石头开始渐入的间隔（秒）。0 = 所有按钮同时出现。
      "buttonStaggerSeconds": 0.12
    },

    // ---------------------------------------------------------------------------------------------
    // 主菜单的动态背景：鱼一直在游，底部两排珊瑚
    // ---------------------------------------------------------------------------------------------
    //
    // 它是**菜单自己的一个装饰世界**（不碰 run 的任何字段），但画的是真实的生物和珊瑚：关卡里同一批贴图、
    // 同一套动画、同一套绘制函数。菜单里没有玩家，所以这些鱼**不追、不冲锋、不开火**，只是游过去——
    // 而它们的造型是真的，所以你在这里看到的鲨鱼就是关卡里的那条。
    //
    // 单位是"屏幕宽度的比例"或"每秒多少屏"，所以换窗口大小观感不变。
    "backdrop": {
      // 同时在场几只。低于下限就补一只，超过上限就不刷。
      "minAlive": 12,
      "maxAlive": 24,
      // 两次生成之间至少隔多少秒，免得一群一起涌出来。
      "spawnGapSeconds": 0.55,

      // 横移速度（屏幕宽/秒）。**快慢混合**：快的像巡逻，慢的像漂浮。
      "speedMin": 0.045,
      "speedMax": 0.16,
      // 纵向漂移速度的上限，相对横向速度——鱼不是走直线的。0.5 是"一眼就看得出来在斜着游"的幅度：一条
      // 横穿屏幕的鱼最多斜着漂半个屏高。
      //
      // 代价是有些鱼会从上下边缘斜着游出去。**不处理**是对的：那和横着游出屏幕是同一件事，而且真处理
      // （比如到边压平）会在斜线上留一个像撞了隐形墙的拐点。
      "driftRatio": 0.5,

      // 掉头：**偶尔真的往回游**——方向和图一起翻，次数不限。海星海胆例外，它们根本不掉头（见下面的
      // \`crawler*\`）。
      //
      // \`turnEverySeconds\` 是**其它生物**的频率，\`fishTurnEverySeconds\` 是**普通小鱼**的——小鱼才是一大片里
      // 真正活蹦乱跳的那种，所以它掉头勤一倍。两个都可以调，只要小鱼那个更小就行。
      //
      // 两者都是"平均每多少秒有一次掉头的**机会**"，不是倒计时：每一帧按 dt/这个数 掷一次骰。所以快鱼
      // （横穿十秒）大概掉一次头，慢鱼（横穿三十多秒）会多掉几次。
      //
      // \`turnBand\` 是"只在屏幕中间这一段才准掉头"（0.6 = 中间 60%，两侧各留 20% 当通道）。**没有它，慢鱼
      // 会在屏幕里随机游走、赖着不走**，占满 \`maxAlive\` 之后新鱼就刷不出来，画面上永远是那几条。有了它，
      // 一条鱼一旦游进两侧通道就只能一路游出去，所以转向次数虽然不限，必定在两次横穿之内离场。
      // 量的是**群中心**（所有存活成员 x 的平均），不是某一条鱼的位置——否则一群里在带宽外的成员不跟着转，
      // 群就散了。
      "turnEverySeconds": 20,
      "fishTurnEverySeconds": 12,
      "turnBand": 0.6,

      // 加速：**突然窜一段**。而且**只有普通小鱼会窜**——单独一条也好，一整群也好（成群的时候整群一起窜）。
      // 别的生物都不加速：这是"小鱼"这个物种的特色，和"只有小鱼结大群"是同一类**事实**，所以写在
      // \`menuBackdrop.ts\` 的 \`darts()\` 里，不是这里的一个旋钮。
      //
      // 速度是"基础速度 × 这个倍率"，只持续 \`burstSeconds\`，到点自动回到原速——倍率乘在**位移**上而不是改
      // 基础速度，所以它和掉头互不干扰，冲刺中途掉头也没问题。
      //
      // 同一个倍率也喂给动画时钟，所以尾巴扇得和位移一样快；不然就是贴图被拖着飞。帧数是固定的，尾巴快
      // 一倍半时帧切换会略粗，但背景鱼很小，基本看不出来。
      //
      // \`burstEverySeconds\` 和掉头同量级但略稀，一次冲刺才是"突然发生的事"而不是常态。加速**不设**掉头那种
      // 带宽：它不会让谁赖场，反而让刚出生的鱼更快入场。
      "burstScale": 2.5,
      "burstSeconds": 1.2,
      // **减速的尾巴。** 冲刺**突然开始**（那是要的），但**不是突然结束**：全速跑完 \`burstSeconds\` 之后，速度用这
      // 一段时间滑回原速。总时长是 \`burstSeconds + burstFallSeconds\`。
      //
      // 用**缓出**（平方）：刚进滑行段时掉得最快，末尾趋平、平滑接上巡航——末尾的斜率是 0，所以接得上；而速度
      // 本身从头到尾是连续的，唯一的不连续只剩"减速度在滑行开始那一刻从 0 跳起来"，那个看不出来。
      "burstFallSeconds": 0.4,
      "burstEverySeconds": 12,

      // 出现的生物**看起来**多大、多亮。这两项**只作用于菜单**，不动游戏里任何一只。
      //
      // 为什么需要它们：背景用的就是游戏里真实的大小，而一条鲨鱼在关卡里是"占掉泳道三分之一"的压迫感，
      // 放在标题底下就成了抢戏。所以这里给它一个整体的缩放和一个整体压暗；\`radius\` 和 \`hazardArt.scale\`
      // 决定的是游戏里多大，不该为了菜单去改。
      "creatureScale": 0.62,
      "creatureAlpha": 1,

      // 其它生物：偶尔来**一小队**同种的一起游过，2～3 只。
      //
      // 注意这**只是"同一批入场"**，不是一个会一起做决定的群：小队里的两三条各游各的，各自掉头、各自加速。
      // 只有下面那组小鱼才真的作为一个整体行动——见 \`src/menuBackdrop.ts\` 里 \`School\` 的注释。
      "schoolChance": 0.18,
      "schoolMin": 2,
      "schoolMax": 3,

      // **只能独行的几种。** 名单里的一种，无论掷骰结果如何都只出 1 只 —— 两只鲨鱼并排游过去是假的，而这两只
      // 恰恰是背景里最"一只就是一件事"的东西。名单之外的照旧走上面的 \`schoolChance\`。
      //
      // 两个坑写在前面：**每一项都必须是会在菜单里出现的那 17 种之一**（\`src/menuBackdrop.ts\` 的 \`SWIMMERS\`），
      // 写错一个（拼错、或者写了 \`vent\` 这种地形）会在加载时直接报错，因为那否则就是一个完全无声的空旋钮；
      // 另外**别把 \`fish\` 写进来**，那会让下面 \`fishSchool*\` 那一组整套失效。
      "loners": ["shark", "whale", "angler", "octopus"],

      // **普通小鱼单列一组**，因为它成群是常态而不是点缀：真实水体里小鱼就是一群一群的，
      // 而一条鲨鱼旁边跟着九条鲨鱼是另一回事。所以小鱼的概率更高、队伍更大。
      //
      // 但光有这一组是**看不见的**：名单上十九种生物均匀随机，小鱼只占 1/19，所以它们本来就不常出现。
      // 下面这个权重补上另一半——没有它，上面三个数就是在描述一件几乎不会发生的事。
      "fishSchoolChance": 0.55,
      "fishSchoolMin": 8,
      "fishSchoolMax": 10,
      // 一次生成里，**先按这个概率决定是不是小鱼**，不是的话再从其余生物里均匀挑。
      // 关卡里小鱼也是压倒性地最常见的，菜单照抄这个分布比均匀随机更像那片水。
      "fishChance": 0.38,

      // **底栖的两种：海星和海胆。** 它们不游，是**爬**——只在屏幕下方这一段爬，速度慢得多，而且不掉头。
      //
      // \`crawlerBandTop\` 是这一带的上边界（占屏高），下边界就是屏幕最底边。所以贴着底边的那几只会被**前层
      // 珊瑚挡住一部分**，那是有意的：看起来是在珊瑚之间爬。
      //
      // \`crawlerSpeedScale\` 乘在 \`speedMin/Max\` 上。要知道的代价：爬得慢又不掉头，**它们会长时间占住名额**，
      // 最慢的一只要一分半才横穿完，水里的换新会慢一点。
      //
      // 这里只有数字。哪几种算是"爬"，写在 \`menuBackdrop.ts\` 的 \`CRAWLERS\` 里——那是关于**动物**的事实。
      "crawlerSpeedScale": 0.4,
      "crawlerBandTop": 0.33,

      // 珊瑚两层：**后层**小而远（在鱼的后面），**前层**大而近（在鱼的前面，会遮住一部分鱼）。
      // 这让整片底栖看起来有深度，而不是一条贴纸。
      //
      // \`count\` 是横向个数；\`halfWidth\` 是珊瑚的**半宽占屏幕宽的比例**（菜单里珊瑚没有碰撞，所以这就是
      // 直接定大小；每株珊瑚还会按自己的图在 ±20% 里浮动）；\`bottom\` 是珊瑚底边在屏幕下边界之下多少
      // （负 = 露出屏幕外一截，所以看起来是从画面外长上来的）。
      "backCoralCount": 14,
      "backCoralHalfWidth": 0.032,
      "backCoralBottom": 0.0,
      "frontCoralCount": 7,
      "frontCoralHalfWidth": 0.162,
      "frontCoralBottom": -0.05,

      // 点开始之后：**不再刷新**，现有的鱼转身朝最近的边游走，同时开始这个倒计时；到点之后剩下的直接不画。
      //
      // 退场用的是**被击败时的速度**（\`hazards.fleeScreensPerSecond\`，0.9 屏幕高/秒）。那个单位是"高"，
      // 而横向要走的最多是半个屏幕**宽**——手机上宽是高的一半，所以听起来慢、看起来是斜着一道窜出去，
      // 实际只要 0.3 秒左右。倒计时要贴着这个数：设大了屏幕上会先空一段时间再开局。
      "exitSeconds": 0.65,
      // 整层（鱼 + 珊瑚）淡出用多少秒。和倒计时同时开始，并且**比它短**，这样开局时已经淡干净了。
      "fadeSeconds": 0.5
    },

    // ---------------------------------------------------------------------------------------------
    // 深海光照：顶上泻下光来，底下一片黑
    // ---------------------------------------------------------------------------------------------
    //
    // 三样东西叠出深海：**顶部一团大光晕**（水面透下来的光）+ **几道光柱**（上窄下宽、缓慢摆动）+
    // **一张越往下越黑的遮罩**。参考实现用 Canvas 生成三张贴图，这里全部用项目自己的 \`FillGradient\`
    // （关卡水色和晕影用的就是它）——\`src/\` 里不该出现第二套造贴图的办法，而且探针在 SSR 里没有 \`document\`。
    //
    // **图层顺序是这张效果的一半**，见 \`src/menuBackdrop.ts\`：
    //
    //     后层珊瑚 → 【遮罩】 → 光柱 → 鱼 + 海星海胆 → 【光晕】 → 前层珊瑚
    //
    // 也就是说**遮罩盖的是水**（后层珊瑚和光柱一起压黑），**鱼和海星海胆画在它上面、永远全亮**，光晕在鱼
    // 之上、光柱在鱼之下。参考实现把遮罩盖在整幅场景上方；这里没有那样做，因为那样下半屏的鱼会游着游着消失。
    //
    // 长度单位全部是**泳道宽 / 屏高**的比例，和 \`backdrop\` 一样，所以换窗口大小观感不变。
    //
    // 注意纵向数字是**从屏幕下边界往上量**的（和 \`backCoralBottom\` 同一套），所以"在屏幕上方之外"是**大于 1**，
    // 不是参考实现里的负数——参考用的是屏幕坐标系。
    "lighting": {
      // 顶部光晕：一个圆心在屏幕上方之外的径向渐变。三档：圆心、中段、边缘（透明）。
      //
      // 它是**椭圆**（\`textureSpace: "local"\` 把两个轴都按图形自身的比例归一化），不是正圆。这是量出来的，
      // 不是口味：\`"global"\` 下半径是**屏高**的比例，泳道比屏高宽的时候光在到边之前就衰减没了，两侧变黑，
      // 只剩四根光柱在黑色里晃 —— 正是"四条细线 + KTV 聚光灯"。
      //
      // \`"local"\` 是**按图形比例**的，所以不管窗口多宽多矮，光永远铺满泳道横向。它同时还能上下漂：矩形画得比
      // 泳道高（\`slack\`），下面的代码把这里"占屏高几分之几"的数字换算成图形的归一化坐标，所以这两个数的含义
      // 不受影响。
      "glowColour": 0x64c8ff,
      "glowCentreY": 1.1,
      "glowRadius": 0.85,
      "glowAlpha": 0.4,
      "glowMidOffset": 0.4,
      "glowMidAlpha": 0.16,
      // 光晕也呼吸，但**比光柱慢得多、也小得多**：它是所有光柱的"底"，跟着一起抖就没有层次了。
      // \`GlowPulse\` 是亮度的起伏（占基础亮度的比例），\`GlowDrift\` 是它整体上下移动多少（占屏高）。
      "glowPulse": 0.08,
      "glowDrift": 0.02,
      "glowSeconds": 23,

      // 光柱：每条都是"顶上窄、底下宽"的梯形，横向中间亮两边透、纵向越往下越淡。
      //
      // \`beamNarrow\` 是顶上那条边占自身宽度的比例（0.19 ≈ 参考实现）。摆动的**几何只在 layout 时画一次**，
      // 之后每帧只改旋转和整体 alpha，所以它不花每帧的钱。
      //
      // 两个周期是分开的：\`SwaySeconds\` 是摆一圈多久，\`PulseSeconds\` 是明暗起伏多久。不一样才有"水在动"，
      // 一样就变成"一个东西在荡"。
      "beamColour": 0x82dcff,
      "beamCount": 4,
      // 一条光柱多宽（占泳道宽）、多高（占屏高），以及它的顶端锚点落在哪（大于 1 = 在屏幕上方之外）。
      "beamWidth": 0.5,
      "beamHeight": 0.95,
      "beamTop": 1.02,
      // 第一条的位置和相邻两条的横向间隔（都占泳道宽）。
      "beamFirstX": 0.25,
      "beamSpread": 0.16,
      // 倾角：四道**同一个角度**（\`Pitch\` 为 0 = 不放扇形），整排一起斜着下来。
      "beamLean": -0.18,
      "beamPitch": 0,
      // **顶部要宽**（0.45）。这一点比幅度更根本：原来 0.19 是"从顶部一个极窄的点向下拨开"的锥形，而**四道
      // 从同一点向不同方向拨开的锥形，形状上就是一组聚光灯**。真实的日光是平行光，穿过水面之后还是几乎平行的
      // 宽条，所以顶部要宽、四道要平。
      "beamNarrow": 0.45,
      // 最亮处的 alpha，以及纵向淡出的中段（\`FadeMidOffset\` 处降到 \`FadeMidAlpha\`，到底降到 0）。
      //
      // 0.18 是"和参考实现等效"的值：参考的贴图最亮 0.28 再乘上精灵自身的 0.65。四道光柱是**叠加**的，所以
      // 数值上去了会很快糊成一片灰白——想让它们更显眼，调 \`beamNarrow\` 或位置比调这里好。
      "beamAlpha": 0.18,
      "beamFadeMidOffset": 0.35,
      "beamFadeMidAlpha": 0.55,
      // -----------------------------------------------------------------------------------------
      // 海面的运动
      // -----------------------------------------------------------------------------------------
      //
      // 四样动作，各有自己的幅度和周期：**宽度伸缩**（水面在聚焦和发散光）、**亮度起伏**、**根部横移**（水面
      // 上的亮点在跑）、**角度抖**。周期取 5 / 7 / 11 / 13 秒——互不整除，所以整幅画面**不会循环**；每根
      // 光柱的相位再各错开，四根就不会同手同脚。
      //
      // **角度特别小（±1.5°），这是有意的**。真实水面下的光柱主要是**忽明忽暗、忽宽忽窄**地闪，角度变化其实
      // 很小——一束光从水上到水下，角度差不了多少，但哪一瞬被水面聚焦、哪一瞬被发散，差别很大。角度一大就
      // 变成"扫"，而扫就是聚光灯。
      //
      // 亮度只到 ±35%：**光柱彻底灭掉再亮回来正是灯光秀的动作**。真实的水面光斑是"强度在变"，不是"开关"。
      //
      // 这四样**都只改容器的属性**（角度/缩放/位置/透明度），几何仍然只在 layout 时画一次。宽度伸缩靠
      // \`scale.x\` 而不是重画那 240 个切片，这是它便宜的原因——横向渐变跟着缩，柔边还是柔的。
      "beamSway": 0.026,
      "beamSwaySeconds": 13,
      // 宽度伸缩：幅度占原宽的比例，周期是一张一合多久。
      "beamWidth": 0.15,
      "beamWidthSeconds": 7,
      // 根部横移：幅度占泳道宽的比例，周期是来回一趟多久。
      "beamDrift": 0.03,
      "beamDriftSeconds": 11,
      // 亮度起伏：幅度占基础亮度的比例。
      "beamPulse": 0.35,
      "beamPulseSeconds": 5,

      // 遮罩：三档 —— 0 处是 \`TopAlpha\`，\`MidOffset\` 处是 \`MidAlpha\`，1.0 处是纯黑。
      //
      // 它压的是**水**。屏幕底下 6% 那里已经黑到 0.93 以上，所以**后层珊瑚基本沉进黑里**，你能看到的礁石
      // 全部来自前层。这是有意的：远处的东西没有光。
      "darknessColour": 0x000000,
      "darknessTopAlpha": 0.05,
      "darknessMidOffset": 0.65,
      "darknessMidAlpha": 0.85
    },

    // ---------------------------------------------------------------------------------------------
    // 水里的东西：悬浮的小颗粒，和从海底冒上来的气泡
    // ---------------------------------------------------------------------------------------------
    //
    // 两样都**从下往上走**，两端各自淡入淡出（屏幕上下各留一段过渡带），所以看不到"凭空出现/消失"。
    // 它们都在泳道里，跟着 \`update(dt)\` 走 —— 菜单不更新时它们也不动。
    //
    // 颗粒**画在光柱之下**（遮罩之下、水里），亮度 = 底亮度 + 它当前**落在哪几道光柱里**算出来的加成。
    // 所以光束里的颗粒明显，光束之间的几乎看不见 —— 那是"阳光里的尘埃"，不是"到处有灰"。
    // 加成跟的是光柱**当前**的 alpha，所以颗粒会跟着光一起闪。
    //
    // 气泡画在**遮罩之上、前层珊瑚之下、鱼的后面**：从屏幕最底冒出来，被礁石挡一下再升上去。
    //
    // 尺寸的单位是**泳道宽的比例**（和水里的生物同一套），速度和上下位置的单位是**屏高的比例**（和光照同一套）。
    "water": {
      "motes": {
        // 同时在场多少颗。
        "count": 150,
        // 半径占泳道宽的比例，以及它在 ± 这个比例内的浮动。
        "size": 0.005,
        "sizeVariance": 0.7,
        // 上浮速度占屏高/秒的比例，以及浮动。
        "speed": 0.018,
        "speedVariance": 0.6,
        // 横向漂移占泳道宽/秒的比例（每颗各自一个方向），免得它们只会笔直向上。
        "drift": 0.002,
        "colour": 0xdff6ff,
        // **亮度**：完全没有光的时候的 alpha，以及站在最亮的灯光里**再加**多少。
        // 两个差别拉开，"光束里的尘埃"才成立。
        "baseAlpha": 0.16,
        "litAlpha": 0.7,
        // 屏幕上下各留多少（占屏高）用来淡入淡出。
        "fadeEdge": 0.14
      },
      "bubbles": {
        // **几个固定的喷口**（横向均匀撒开、带抖动），每个喷口每隔 \`everySeconds\` 冒**一串**。
        //
        // 每个喷口还带一个**深度**（0 最远、1 最近，按喷口顺序均分），一串气泡共享它——见 \`nearAlpha\`。
        // 深度是**喷口的属性**而不是每颗气泡的：一串是一个"漏点"，四颗深浅不一读起来就成了四个漏点；
        // 而且气泡在上升途中并不会真的靠近或远离镜头。
        "vents": 4,
        // 每串几颗，**在这个区间里随机**。固定 4 颗时四条串长得一模一样；2～6 让疏密本身成为变化的一部分。
        "perStringMin": 2,
        "perStringMax": 6,
        "everySeconds": 10,
        // 每次的间隔在这个比例内浮动（0.6 = ±30%），免得几个喷口渐渐同步。
        "everyJitter": 0.6,
        // 一串里相邻两颗的间距（占屏高）。它们在屏幕下出生，所以间距就是"串"的形状。
        "gap": 0.035,
        // **最大那颗气泡的直径**，占泳道宽。
        //
        // 单位从"半径"改成了"直径"，因为它现在描述的是一张**贴图**有多宽，而不是要画一个多大的圆。
        // 这一条是**整组的尺度**：十二张图是艺术家按不同大小画的（比例约 2.5 倍），导入时也按各自的原生比例
        // 定了纹素数，所以一个 scale 乘上去，十二颗自然得到十二个大小——这里只声明最大那颗画多宽。
        "size": 0.041,
        // 出生速度（占屏高/秒），以及它的抖动（0.8 = ±40%）。
        "speed": 0.05,
        "speedJitter": 0.8,
        // **越升越快**：每秒把速度乘上 (1 + accel × 已经升了多久)。水压随深度变小，真气泡就是这样。
        "accel": 0.75,
        // 左右摆：幅度占泳道宽、周期多少秒，**两者都逐颗随机**（1.0 = ±50%、0.7 = ±35%）。
        // 只随机相位的话，所有气泡画的是同一条正弦，只是出发时间不同——看起来是一队人在走同一条路。
        "sway": 0.006,
        "swayJitter": 1.0,
        "swaySeconds": 1.7,
        "swaySecondsJitter": 0.7,
        // 屏幕上下各留多少（占屏高）用来淡入淡出。
        "fadeEdge": 0.1,
        // **远近用透明度区分，不用模糊**——模糊会毁掉像素边缘，而这套图就是像素的。
        // 最近的那个喷口用 \`nearAlpha\`，最远的用 \`farAlpha\`，中间线性插值。
        "nearAlpha": 0.55,
        "farAlpha": 0.18,
        // **染色**。贴图自带颜色（深蓝描边 + 淡蓝高光），所以这里默认 \`0xffffff\` = 不染。
        // 想整体压成某个色调就改这里，形状和明暗关系跟着贴图走。
        "tint": 0xffffff
      }
    },

    // ---------------------------------------------------------------------------------------------
    // 标题上的水下焦散
    // ---------------------------------------------------------------------------------------------
    //
    // 一张网眼纹理，加法叠在**标题那张图的不透明部分**上，两层以不同速度漂移。实现见 \`src/caustics.ts\`。
    //
    // 纹理本身**不是无缝的**（左右边缘差是相邻列差的二十倍），所以它按棋盘镜像拼接——镜像拼接天然无缝。
    // 两层的图案各自在动、又互相错开，合起来就不像"一张图在滑"。
    //
    // **网眼自己也在变形**：两层各自被两样东西扭曲——**呼吸拉伸**（沿一条轴拉长再缩回，横向反着来，所以网眼是被拉长而不是
    // 变大）和**流动扭曲**（两层慢速的正弦波把采样点推来推去，网眼的边会游走，相邻的网眼会合并又分开）。
    // 真实的焦散就是这样：不是一张图在滑，而是形状在变。两层的轴和速度都不同，所以不会一起拉伸。
    //
    // **光是脉络**：贴图里网眼是透明的、脉络是不透明的，所以加上去的就是脉络（用 \`lightColor\` 画），网眼不动。
    "caustics": {
      // 一块砖画多宽，**设计像素**。这是网眼大小的旋钮：源图里网眼占宽度的 6.7%，所以砖越宽网眼越大。
      // 289 给到约 28 屏幕像素的网眼（横跨标题约 11 格）。**调离默认值会让细脉络变糊**——砖是一张像素图，
      // 非整数倍放大会让 1 纹素的脉络一会儿 1px 一会儿 2px。
      "tileWidth": 200,
      // 第一层的漂移，每秒钟多少个**自身箱体的宽/高**——所以换个窗口大小观感不变。
      // 正数是往右下。慢到看不出在移动才是对的：焦散是水在动，不是纹路在走。
      "driftX": 0.02,
      "driftY": 0.012,
      // 第二层：方向和速度都不同，两层相加才会"变形"而不是"平移"。
      "crossDriftX": -0.013,
      "crossDriftY": 0.021,
      // 两层各自的整体不透明度。第二层再乘 \`crossAlpha\`。
      "alpha": 0.12,
      "crossAlpha": 0.3,
      // 脉络（光）的颜色。贴图自己的脉络是暗青色，所以光很暗又偏青；这里换成白色，亮度全由 \`alpha\` 控制。
      "lightColor": 0xffffff,

      // **流动扭曲**。\`warpAmount\` 是一个点最多被推多远，单位是一块砖的宽度（0.022 约等于网眼大小的四分之一；
      // 0 = 关闭）。\`warpWavelength\` 是扭曲的波长，也是砖宽的比例（越小越碎，越大整片一起晃）。
      // \`warpSeconds\` 是一个相位转一圈的秒数（四个相位各按不同的倍数走，所以不会重复）。
      "warpAmount": 0.022,
      "warpWavelength": 0.32,
      "warpSeconds": 6,
      // **呼吸拉伸**。0.2 = 沿轴向拉长 20%、横向缩短 20%（0 = 关闭）；\`breatheSeconds\` 是一次呼吸的秒数。
      // 两层的轴（度，相对水平）不同，第二层的变形速度是第一层的 \`crossSpeedRatio\` 倍。
      "breatheAmount": 0.05,
      "breatheSeconds": 5,
      "axisDegrees": 10,
      "crossAxisDegrees": -25,
      "crossSpeedRatio": 0.73
    },

    // ---------------------------------------------------------------------------------------------
    // 界面上的气泡：标题和三个石头按钮各自往外冒的
    // ---------------------------------------------------------------------------------------------
    //
    // 和上面 \`water.bubbles\` 是**两套东西**，不是一个开关：那几个在泳道的水里，坐标是"y 向上 = 离海面多远"
    // （整个背景容器 y 翻转）；这几个在界面自己的坐标系里，y 向下。所以它们是两个类，各自上升的方向相反。
    //
    // **冒出来和放出来不一样**：背景的气泡是"直接出现"的，这六个点是**吹**出来的——每颗在 \`growSeconds\` 里
    // 从零长到全尺寸，而且一边长一边已经在上升。长好之前不动的话，看起来像黏在石头上。
    //
    // **点在哪不在配置里**：那是"这张图上哪个位置有喷口"的事实，和 \`button.aspect\`、保留段同类，写在
    // \`src/menu.ts\` 里贴着各自的图。这里放的是速率、尺度、生长这些可调的旋钮。
    "uiBubbles": {
      // 每个点大约多久冒一颗（带抖动）。
      "everySeconds": 2.4,
      "everyJitter": 0.6,
      // 和背景那套同一个意思：最大那颗的直径占屏宽的比例。两边默认相同，但**不是一个旋钮**——
      // 界面上的气泡在标题前面，可以比水里的更显眼，不该逼着它们一起改。
      "size": 0.021,
      // 上升速度（占屏高/秒）与它的抖动，以及加速度。比水里的略快：它们是从石头里挤出来的。
      "speed": 0.055,
      "speedJitter": 0.8,
      "accel": 0.5,
      // 从小到大用多久。0.4 秒：看得见生长，但不会在石头上停住。
      "growSeconds": 0.4,
      // 左右摆，和水里那套同样的三个数。
      "sway": 0.004,
      "swayJitter": 1.0,
      "swaySeconds": 1.5,
      "swaySecondsJitter": 0.7,
      // 整体不透明度。比水里高一点：它们在前面，而且水里的那套还要乘上远近两档。
      "alpha": 1,
      "tint": 0xffffff
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 设置面板
  // ---------------------------------------------------------------------------------------------
  //
  // 面板自己的**家具**——面板多宽多高、每一行的纵向偏移、按钮圆角——**不在这里**，写在 \`src/settings.ts\`
  // 的 \`ROW\` 里：那些是在一个由视口推出来的盒子里做比例偏移，放进配置就得和它看不见的算术保持同步。
  //
  // 这里放的是**玩家看得见的东西**。关卡行是一整块有自己颜色、字号和圆角的控件，所以它在。
  "settings": {
    // 关卡行：这一局玩哪一关。
    //
    // 它**原来在主菜单上**，现在跟着设置面板走——因为它是**调试梯子**（只在「调试模式」开着时才有内容），
    // 而打开它的那个开关就在这个面板里。键名跟着行一起搬过来，理由和上一轮 \`buttonRadius → levelRadius\`
    // 那次改名一样：一个键要说它真正在哪。
    //
    // 两个门槛缺一不可：调试模式开，**且**面板是从菜单打开的（\`setInRun(false)\`）。第二个是因为一局进行中
    // 选关卡改的是**下一局**的起点——当场毫无反馈，是个没人看得懂的副作用。
    "levels": {
      // 一行放几颗。名字是 4~5 个汉字，面板内容区约 268px，所以 3 颗每颗约 85px，留量充足。
      "perRow": 3,
      // 一行**最多**占内容区宽度的多少。1 = 铺满。留着它是因为关卡数不是 3 的倍数时（比如只剩 4 关），不
      // 想让一行里的两颗药丸被拉成两根大横条。
      "maxRowWidthRatio": 1,
      "rowHeight": 40,
      "radius": 10,
      "rowGap": 8,
      "textSize": 14,
      // 三种状态：选中（填充）、可选（描边）、**锁着**（更暗、更冷，文字也暗）。锁着的那一格按下去不会有
      // 反应——不是报错，是"还不能选"。
      //
      // 这四个颜色是**照着面板的底色挑的**，不是照菜单的水面：面板里普通按钮的填充是 \`0x16293f\`，所以未选中
      // 的填充必须明显比它**更暗更冷**，否则药丸看起来不像一个凹进去的格子，而像按钮上的一块污渍。
      "selectedFill": 0x2f6f8f,
      "selectedStroke": 0xd8fbff,
      "selectedTextColour": 0xeafcff,
      "idleFill": 0x0a1a29,
      "idleStroke": 0x4f86a8,
      "idleTextColour": 0x9fc4d8,
    },

    // 成长段：局内暂停时，面板顶部（标题之下、音量之前）列出这一局到目前为止拿到的所有成长。
    // 只在**局内**暂停时出现；从主菜单打开的设置面板没有这一段（那时没有一局）。实现见 \`src/growth.ts\` 和 \`src/settings.ts\`。
    //
    // 上半是**五项当前数值**（血上限、枪管、射速、伤害、护甲），读的是模拟正在用的那些字段；
    // 下半是**拿过的卡**：路线在最上，其余突变按**第一次拿到**的顺序，同一张拿多次合成一行写 ×次数。
    // 每行名字下面小字是卡自己的说明，原样复用三选一面板上的那句，所以两边不会说法不一致。
    //
    // 卡片列表放在一个**可拖动滚动**的窗口里（手指或鼠标按住往上拖）。面板在局内会变高（见 \`panelMaxHeightRatio\`），
    // 窗口拿剩下的高度，不超过 \`windowMaxHeight\`，也不低于 \`windowMinHeight\`——屏幕太矮时窗口会比想要的小，靠滚动补。
    "growth": {
      // 局内面板最高占屏高的多少。从主菜单打开的面板不看这个，仍是原来的 0.66。
      "panelMaxHeightRatio": 0.92,
      // 卡片窗口的高度范围，设计像素。一张卡（名字 + 说明）约 36，所以 300 ≈ 8 张。
      "windowMaxHeight": 300,
      "windowMinHeight": 96,
      // 字号。
      "headingSize": 13,
      "statSize": 13,
      "nameSize": 14,
      "blurbSize": 12,
      // 同一张卡的名字行和说明行之间、两张卡之间、两个分组之间的间距，设计像素。
      "blurbGap": 2,
      "lineGap": 8,
      "groupGap": 12,
      // 颜色。
      "headingColour": 0x8fd6ff,
      "statLabelColour": 0x9fc4d8,
      "statValueColour": 0xeafcff,
      "groupColour": 0x8fd6ff,
      "nameColour": 0xeafcff,
      "countColour": 0xffd479,
      "noteColour": 0x6fe3ff,
      "blurbColour": 0x9fc4d8,
      "windowFill": 0x0a1a29,
      "windowStroke": 0x4f86a8,
      // 一张都还没拿时窗口里写的话。
      "emptyText": "还没有拿到任何突变"
    },
  },

  //
  // 这些是已有机制的**靶子**：冲锋撞碎东西（暴怒气泡），体积碾压（大过阈值就撞得动）。
  // 枪的子弹**故意**不碰障碍（见 \`bullets\` 段）：破障碍从来不是免费火力的事。
  //
  // 四种障碍是**四个不同的答案**，而不是四档耐久：
  //
  // | 种类 | 怎么过 | 为什么是这样 |
  // |---|---|---|
  // | 木箱 crate | **撞碎它**（体积够大），或者从缺口绕 | 大体积的奖励 |
  // | 珊瑚 coral | **绕开**，或者变小穿缝 | 唯一让"小"成为优势的东西 |
  // | 封路木箱 wall | **撞不碎也打不碎**（暴怒气泡的冲撞/爆破除外），只能从最小缺口挤过去 | "必须走缝"的强制题 |
  // | 渔网 net | **推进去撕开**（不疼） | 唯一对小的玩家不惩罚的障碍 |
  //
  // **最重要的一条规则**：每一排障碍都必须留出一个**玩家最小时也能通过**的缺口。
  // 这不是体贴，而是让"变小"成为**选择**而不是必需——如果某排能把泳道封死，玩家就必须在那个时刻是小的，
  // 否则死，于是"这里该不该大"就不再是一个问题。留了缺口之后，大气泡永远可以选择绕（慢、贵、大概要挨
  // 一下），小气泡可以穿线。两种都可行，选择才是真的。
  // （墙的"耐久"现在只对暴怒气泡有意义：它们的冲撞和爆破仍然吃 \`health.wall\` 这笔账；其他气泡对墙只有一个
  // 答案——缺口。第二刀的类型→分支重构里再决定要不要给吞噬路线一个破墙动词。）
  "obstacles": {
    // 撞上障碍物扣多少血。
    //
    // **一个数，不是每种障碍一行**：它们对玩家的意义是同一件事（"这条路堵着"），区别在打不打得碎、
    // 挡不挡子弹，而那些各有各的键。渔网不吃这一条——它不挡路也不伤人，它拖慢你（\`hurt: false\`）。
    //
    // 20 和一只普通的鱼一样：撞墙的代价和撞鱼一样大，因为两者都是"你没看路"。
    "contactDamage": 20,

    // 每种障碍的"要做多少功才能弄掉它"。
    //
    // 木箱/珊瑚/封路木箱/管虫的单位是**伤害点**（撞击伤害，或暴怒气泡的冲撞/爆破伤害），和生物血量同
    // 一个量纲，所以两者一起缩放。
    // **渔网的单位是秒**——它不是被打碎的，是被**撕开**的：挂在网上每过一秒就算 1 点，所以
    // 0.4 就是"在网里待 0.4 秒"。**这一行不跟着伤害缩放**，它是时间不是伤害。
    //
    // 0.4 秒这个数是被**物理**定下来的，不是手感：玩家被卷轴以 25m/s 带着走，和一张网的重叠大概只有 0.5 秒
    // （接触距离约 13m）。任何比这更长的撕裂时间都意味着"一次穿过永远撕不开"，而那会让网看起来什么都没做。
    "health": {
      // 木箱：和下落木箱同一档 50 点。**子弹也能打它**（基础伤害 5/发，10 发碎），撞/爆破/装甲也按这 50 点扣。
      "crate": 50.0,
      "coral": 17.5,
      // 15：暴怒气泡的冲撞（\`angry.armour.obstacleDamage\` 10）两下、爆破（\`angry.burst.obstacleDamage\` 8）两下。
      // **子弹也能打它**，和木箱同一条规则、每发同样固定基础 5 点，所以 15 点是 3 发。想要更硬的墙就调这个数。
      "wall": 15.0,
      // 0.4 秒的撕开时间，见上面的说明。**单位是秒，不跟着伤害缩放。**
      "net": 0.4,
      // 管虫：软体，受刺激才伸出来。和封路木箱一样厚——它挡的是路线，不是血量。
      "tube": 15.0
    },

    // 每种障碍的半径（相对泳道宽度的比例）。
    // 网给得最大：它挡路但不伤人，所以就算宽一点也不会变成惩罚。
    "radius": {
      "crate": 0.075,
      "coral": 0.1,
      "wall": 0.1,
      "net": 0.115,
      // 管虫比网细一点：它是一丛管子，不是一张网。
      "tube": 0.075
    },

    // 撞碎某种障碍需要的体积，**按种类覆盖**。没写的用下面的 \`ramVolumeThreshold\`。
    // \`null\` = 撞不碎（不管多大），这时候只能绕开，或者从缺口挤过去。
    //
    // 用 null 而不是一个"足够大的数"：上限 \`volume.max\` 以后可能调大，而 99 会某天变成可达的。
    "ramVolume": {
      "wall": null,
      "net": null,
      // 管虫可以撞碎，但需要长到很大——小的只能等它缩回去，或者绕开。
      "tube": 5
    },

    // 一排障碍之间**必须**留出的最小缺口（相对泳道宽度的比例）。
    // 0.17 大致等于"体积 1 的气泡直径的 1.6 倍"，刚好够最小状态擦过去。
    // 调小 = 窄缝更难；调大到 0.5 以上基本等于取消珊瑚的阻挡作用。
    "minGapFraction": 0.17,

    // **撞**障碍：只有体积够大才能撞碎，否则就是自己挨一下。
    // 这是"巨物碾压"对障碍的版本：大到一定程度，木箱就只是路上的纸片。
    // 这个值是默认值，\`ramVolume\` 里按种类覆盖。
    "ramVolumeThreshold": 4.0,
    // 每多一点体积多打多少伤害（点）。量纲和 \`obstacles.health\` 一致。
    "ramDamagePerVolume": 5.5,

    // 渔网的**拖拽**：在网里的移动速度乘这个系数（两个轴都乘），以及离开网之后拖拽还残留多久（秒）。
    //
    // 这是渔网唯一的"手感"。一个又挡不住你、又不掉血的障碍，如果什么都不做，就**和空水域完全没区别**——
    // 玩家冲过去不会知道那里有东西。拖慢是能感觉到的，而且它顺带解释了"为什么会被撕开"：你被拖住的时间
    // 刚好够把它磨开（接触距离约 13m，0.35 倍速下大约 1.9 秒，而耐久是 1.6 秒）。
    // 调小 = 网几乎粘住你；调到 1 = 网只剩"几秒后自己破"。
    "netDrag": 0.35,
    "netDragSeconds": 0.2,

    // 撞碎/撞上之后的短暂无敌（秒），防止连续几排把玩家秒了。
    "collideInvulnerableSeconds": 0.6,

    // ---------------------------------------------------------------------------------------------
    // 外观
    // ---------------------------------------------------------------------------------------------
    "crateColor": 0xb98a4e,
    "crateRimColor": 0x6d5232,
    "coralColor": 0xff9ec4,
    "coralRimColor": 0xd86a9c,
    // 封路木箱：比木箱暗一档，看起来就是"同一批木头、更厚"，而不是一种新东西。
    "wallColor": 0x8f6537,
    "wallRimColor": 0x4a3620,
    // 渔网：绳子的颜色和网眼边界的颜色。
    "netColor": 0x9fd8c8,
    "netRimColor": 0x4f8f7c,
    // 渔网每行/每列的网格线数（横竖各这么多条线）。调大 = 网眼更密。
    "netMesh": 4,
    // 管虫群的颜色：苍白偏粉的管子 + 更亮的冠。
    "tubeColor": 0xe8cfd6,
    "tubeRimColor": 0xfff0f4,

    // 受损程度如何表现在外观上：裂纹的线宽，以及受损后轮廓变暗的程度。
    "crackWidthRatio": 0.12,
    "damagedDarken": 0.45,

    // ---------------------------------------------------------------------------------------------
    // 障碍物的**贴图**（可选，一种一行的稀疏表）
    // ---------------------------------------------------------------------------------------------
    //
    // 没写在这里的障碍物照旧用代码画（\`paintObstacles\` 里那条 if/else 链）——**贴图和代码画是二选一**，
    // 不是叠加。写了但图还没加载出来时也会自动落回代码画的那一版，所以"图还没到"不会变成"东西不见了"。
    //
    //   variants     **一组长相**，每个障碍物按自己的 id 稳定地挑一个（\`id % variants.length\`）。
    //                同一种障碍物、多种长相，**碰撞和玩法完全不变**——半径、血量、碎裂、缺口计算都一样，
    //                变的只有图。一丛珊瑚本来就该是"同一个东西的不同长相"，而不是几种不同的障碍物。
    //                每项是 { image, scale }，所以**大小差是每张自己的事**：
    //                  image   图片名（\`src/assets/<名字>.png\`，不写扩展名）
    //                  scale   "图片宽度 = 碰撞直径 × scale"（碰撞直径 = 2 × obstacles.radius × 泳道宽度）
    //                **scale 不是"想多大就多大"**：它和 radius 一起决定画出来宽度，画出来宽度决定像素网格
    //                （网格 = 画出来宽度 ÷ 1.4），所以改它就要按新宽度重跑导入。
    //   alpha        不透明度。
    //   swayDegrees  **摇摆的幅度**：整张图绕它自己的**底部中心**来回转多少度。0 = 完全静止。
    //                珊瑚是硬骨架，摆 3 度以内；管虫是软管子，可以摆到 6 度以上。
    //   swaySeconds  摇摆一个来回用多少秒。**越大越慢**——珊瑚 6 秒一个来回是"水下很慢的水流"，
    //                管虫 3 秒就是"有水流过来"。
    //
    // **为什么要摇摆而不是做几帧动画**：这张图只有一张，"绕底部转"是渲染器里一行，身体是同一份像素
    // （和 compose-swim-tail 那条路线一样的取舍：**稳定**优先于"艺术家画的好几个姿势"）。
    // 生成四帧那条路在这里更不能用——实测过，四帧完整重渲染平均差 30–40/255，而合成的是 1.5/255。
    //
    // 每一株的**相位是不同的**（用障碍物自己的 id 错开），否则一整排管虫会像列队一样同时摆。
    "art": {
      "coral": {
        // 六种珊瑚，**同一个障碍物种类的六张脸**。半径全是 0.1，所以碰撞圈一模一样；
        // \`scale\` 各不相同，这就是"不同形状不同大小"里"大小"那一半。
        // 都在 88–120px 之间，围着碰撞直径 82.4px 上下浮动：比圈小的看着"好过"，比圈大的看着"占地方"。
        "variants": [
          // 珊瑚 2 × 0.1 × 412 × 1.35 = 111px（网格 79）
          { "image": "珊瑚", "scale": 1.35 },
          // 116px（网格 83）——团状的，最接近原来代码画的那种"一坨"
          { "image": "珊瑚-团状", "scale": 1.41 },
          // 120px（网格 86）——低而宽，全场最大的珊瑚
          { "image": "珊瑚-桌状", "scale": 1.46 },
          // 88px（网格 63）——高而细，全场最小的珊瑚
          { "image": "珊瑚-枝状", "scale": 1.07 },
          // 104px（网格 74）——一把摊开的扇
          { "image": "珊瑚-扇形", "scale": 1.26 },
          // 112px（网格 80）——一小丛管状珊瑚
          { "image": "珊瑚-管状", "scale": 1.36 },
          // 后加的：珊瑚-鹿角。scale 是按"画出来多大"反推的，和旁边那些一样——
          // 改它就要按新宽度重跑一遍导入，否则密度会和邻居对不上。
          { "image": "珊瑚-鹿角", "scale": 1.3 }
        ],
        "alpha": 1,
        // 珊瑚摆得很含蓄：3 度就已经能看出来在动，再大就像整块石头要倒了。
        "swayDegrees": 3,
        "swaySeconds": 6
      },
      "tube": {
        "variants": [{ "image": "管虫", "scale": 1 }],
        "alpha": 1,
        // 管虫摆得明显得多：它是软管子，而且第一关里它是一整排（barrier），摆起来才不像栅栏。
        "swayDegrees": 6,
        "swaySeconds": 3.2
      },
      // crate：木箱。scale 是按"画出来多大"反推的，和 coral 那行一样。
      "crate": {
        "variants": [
          { "image": "木箱", "scale": 1.4 }
        ],
        "alpha": 1,
        "swayDegrees": 1.5,
        "swaySeconds": 5
      },
      // wall：封路木箱。scale 是按"画出来多大"反推的，和 coral 那行一样。
      "wall": {
        "variants": [
          { "image": "封路木箱", "scale": 1.15 }
        ],
        "alpha": 1,
        "swayDegrees": 0,
        "swaySeconds": 6
      },
      // net：渔网。scale 是按"画出来多大"反推的，和 coral 那行一样。
      "net": {
        "variants": [
          { "image": "渔网", "scale": 1.05 }
        ],
        "alpha": 0.8,
        "swayDegrees": 5,
        "swaySeconds": 4
      }
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 音频
  // ---------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------
  // 暴躁气泡（第二种气泡类型）
  // ---------------------------------------------------------------------------------------------
  //
  // 设计见 \`.scratch/bubble-ascent/types/angry.md\`。一句话：**越挨打越强，把怒气撞出去**。
  //
  // 这一轮只做了主干：**积怒（受伤）→ 压缩蓄力 → 冲撞（按怒气决定破坏力、撞中花怒气）**。
  // 没做的（爆破、失控自爆、专属环境互动）在设计文档的切分表里排在 D/E/G，不在这里假装有。
  //
  // 和吞噬气泡的关系：**一局选一种**，所以两套外观各自独立——成长阶段管速度与大小，
  // 怒气阶段管**颜色和形变**。这解决了设计文档里"两套外观系统抢同一块画布"的问题（见文档第一条）。
  // ---------------------------------------------------------------------------------------------
  // 普通气泡的外观块已删：那个"什么都不随"的灰白配色随角色选择一起走了。
  // 现在每个形态的配色只有两套：成长阶段（青→金→粉，基础与吞噬路线）和怒气（蓝→橙→红，沸腾路线）。
  //
  "angry": {
    // 怒气值范围。所有阈值都按这个上限的百分比意识来写，但数值本身是绝对值。
    //
    // 设计文档给的两个数（+25 / −5）决定了整个节奏：四次受伤到满，而满怒自然衰减要 20 秒——
    // 也就是"挨够四下之后怒气基本不会自己掉回去"。这是有意让受伤成为**不可逆的承诺**。
    "rage": {
      "max": 100,
      "perHit": 25,
      "decayPerSecond": 5,
      "decayDelaySeconds": 3
    },

    // ---------------------------------------------------------------------------------------------
    // 怒甲：暴怒形态**没有主动按钮**，近战靠这个
    // ---------------------------------------------------------------------------------------------
    //
    // 它和怒气是**两条独立的线**：怒气是引信（挨打攒、满了自动放爆破），怒甲是弹药（按固定节拍攒、
    // 撞人时消耗）。让怒气影响攒甲速度会把"我现在能不能撞"变成第二张要读的表，所以两者不挂钩。
    //
    // 一次接触消耗一个：**你不挨打**、敌人吃 \`damage\` 点、并且中**破甲**。没有甲时接触照旧挨打——
    // "碰到就疼"这条全游戏最基础的规则没有消失，它只是**被变成了资源**。
    "armour": {
      // 每几秒攒一个。5 秒大致是"一波怪过去"的尺度（一屏 5-11 秒）。
      "secondsPerPlate": 5.0,
      // 最多存几个。2 = 进 BOSS 前可以存两下连着撞。
      "max": 2,
      // 撞击伤害（点）。够撞死最薄的那一档（鱼、虾、水母、鱼雷），撞不死的才吃破甲。
      "damage": 20,
      // 破甲：被撞的敌人**受到的所有伤害**乘这个，持续几秒。霰弹贴脸那一枪就是靠它变成"秒杀一切"。
      "vulnerableMultiplier": 1.5,
      "vulnerableSeconds": 4,
      /**
       * 撞击算不算"撞碎障碍"，以及能不能撞开"任何体积都撞不开"的封路木箱。
       *
       * 这不是顺手保留：**子弹打不坏障碍物**，而爆破按设计也打不开砖石——那条冲刺没了之后，
       * 怒甲撞击是暴怒形态**唯一**能开墙的动作。
       */
      "obstacleDamage": 10,
      "breaksUnrammable": true
    },

    // ---------------------------------------------------------------------------------------------
    // 贴身灼烧：常驻的近身伤害
    // ---------------------------------------------------------------------------------------------
    //
    // 暴怒的第三条线，也是唯一**不花怒甲、也不靠挨打**的伤害来源——没有它，这条路线在"没挨打、怒气也没满"
    // 的时候完全无害，而近战特化不该有那种空窗。破甲的敌人被它烧得更疼（破甲乘的是**所有**伤害）。
    //
    // 半径跟着气泡长（\`playerRadiusRadii\` 是玩家当前半径的倍数），和游戏里其它半径一个规矩，
    // 所以它永远是"贴着你"，不会因为你长大了就变成一堵墙。
    "aura": {
      "playerRadiusRadii": 2.5,
      // 每几秒跳一次。**不是每帧**：命中反馈和音效都按次计数，每帧跳会变成一片白噪音。
      "tickSeconds": 0.5,
      // 每跳伤害（点）。每跳 ×每秒两跳 = 每秒 5 点 = 普通枪的四分之一，所以它是底噪而不是主输出；
      // 要靠卡把它喂大。和枪共用一个血池，所以枪的基数动时它也要跟着动。
      "damagePerTick": 2.5
    },

/**
     * 外观：**只有颜色随怒气变**，几何与透明度共用下面的 \`look\` 段。
     *
     * 这是刻意的：设计文档要求蓝色 → 橙色 → 红色，而这三个阶段共用同一个气泡形状，
     * 差别全在色相上。把二十项几何复制三遍，只会让"改一下光晕半径"变成改三处。
     *
     * 阶段按 \`minRage\` 从小到大排列，取"不超过当前怒气的最后一个"。
     */
    "appearance": [
      {
        "name": "平静", "minRage": 0,
        "rim": 0x6fc7f0, "glow": 0x9fe4ff, "sheen": 0xffffff, "specular": 0xffffff, "hudColor": 0x9fe4ff,
        // 抖动幅度（泳道宽度的比例）与周期性膨胀（半径的比例）。平静时两者都是 0。
        "shake": 0.0, "swell": 0.0
      },
      {
        "name": "烦躁", "minRage": 25,
        "rim": 0xffa64d, "glow": 0xffc46b, "sheen": 0xfff0d0, "specular": 0xfff0d0, "hudColor": 0xffb862,
        "shake": 0.008, "swell": 0.02
      },
      {
        "name": "暴怒", "minRage": 55,
        "rim": 0xff5a4d, "glow": 0xff8a63, "sheen": 0xffe0d0, "specular": 0xffe0d0, "hudColor": 0xff8a72,
        "shake": 0.022, "swell": 0.05
      },
    ],

    // 三个怒气阶段共用    ],

    // 四个怒气阶段共用的几何与透明度（颜色在上面每一阶段里）。
    "look": {
      "radius": 1.0,
      "inner": 0xeafcff,
      "innerAlpha": 0.16,
      "rimAlpha": 0.95,
      "rimWidthRatio": 0.14,
      "glowInnerAlpha": 0.2,
      "glowInnerRadiusRatio": 1.22,
      // 内侧的第二道细环：最高那一段用**形状**再加一层信号，因为橙和红在小尺寸下不好区分。
      "innerRing": true,
      "innerRingAlpha": 0.5,
      "innerRingWidthRatio": 0.06,
      "sheenAlpha": 0.5,
      "specularAlpha": 0.7
    },


    // ---------------------------------------------------------------------------------------------
    // 怒气爆破（设计文档第四节）
    // ---------------------------------------------------------------------------------------------
    //
    // **消耗全部怒气**，以气泡为中心放一圈冲击波：清掉周围的小型敌人、弹开摧毁不了的尖锐危险物、
    // 震碎脆弱障碍。**怒气越高，范围越大**——所以它既是清场键，也是失控时的保命键。
    //
    // 它没有冷却，因为**怒气就是它的价格**：没有怒气就放不出第二次。也不需要"最低怒气"的门槛——
    // 0 怒气时它是一圈很小的波，没用但不会撒谎；一个按下去什么都不发生的按钮读起来就是坏的。
    "burst": {
      // 冲击波半径（泳道宽度的比例）：0 怒气时用 base，满怒气时用 max，中间线性。怒气越高范围越大。
      "radiusBaseRatio": 0.22,
      "radiusMaxRatio": 0.85,

      /**
       * 冲击波打在障碍上的伤害。
       *
       * **刻意只够震碎"脆弱岩层"**：木箱和渔网一击碎掉，珊瑚和封路木箱只掉一层皮。撞开木箱是
       * **冲撞**的活（\`slam\`），如果爆破也能一键开路，那冲撞就没有存在理由了——两条路必须各有各的答案。
       *
       * 量纲和 \`obstacles.health\` 一致：8 点对木箱的 5 点是一击碎，对封路木箱的 15 点只掉一层皮。
       */
      "obstacleDamage": 8,

      // 冲击波推力的**基准**（总米数）。原来是喷吐共用的 \`spit.knockbackMeters\`；喷吐删了，这个数搬来这里，
      // 数值不变——被冲击波推开的距离仍然是"基准 × pushImpact ÷ 目标质量"，手感不该跟着机制一起变。
      "knockbackMeters": 26,

      // 推力系数：基准之外再乘多少。调"爆炸推多重的东西"就调它。
      "pushImpact": 1.4,

      /**
       * 每种危险物被冲击波怎么处理（设计文档第四节的两条：清除小型敌人 / 弹开摧毁不了的尖锐障碍）。
       *
       * 用一张**按种类**的表而不是一份写死的名单，理由和 \`obstacles.ramVolume\` 一样：加一种危险物时，
       * 这里缺一行应该是**加载报错**，而不是"它恰好免疫冲击波"——后者没有任何症状。
       *
       * - \`destroy\` 清掉：软体的小型敌人（鱼、水母、垃圾袋）
       * - \`push\` 推开：尖锐或沉重的（海胆、电鳗、炸弹鱼）——它们推得动但清不掉，
       *   所以冲击波对它们是"给我让开"，而不是"删掉"。螃蟹也是 push：它是机会不是敌人，炸掉它等于毁掉一个奖励。
       */
      "hazardMode": {
        "fish": "destroy",
        // 金枪鱼和鱼一样是软体的小型敌人：冲击波把它清掉，不是推开。它只是更大，不是更硬。
        "tuna": "destroy",
        // 第 4 关：海豚是软体的小型猎食者，和鱼、金枪鱼一样被怒火清掉；
        // 鲨鱼、章鱼、座头鲸是 push——**被推得动，但清不掉**，和螃蟹、海胆同档。这是刻意的：
        // 一关的招牌如果可以被一个技能直接删掉，那玩家记住的就不是那个东西，而是那个技能。
        "dolphin": "destroy",
        "octopus": "push",
        "shark": "push",
        "whale": "push",
        "jelly": "destroy",
        "trash": "destroy",
        "crab": "push",
        "urchin": "push",
        "bombfish": "push",
        "eel": "push",
        "rot": "push",
        "oil": "push",
        // 四位枪手：软的清掉（射水鱼、海星），硬的/精英的推开（手枪虾、刺魨）——
        // 刺魨被推走也仍是"推得动但清不掉"，和海胆同档。
        "archer": "destroy",
        "pistol": "push",
        "puffer": "push",
        "starfish": "destroy",
        // 下落木箱：爆破直接清掉。它是一块会碎的木头，不是被推开的软体。
        "fallcrate": "destroy",
        // 墨雾：冲击波把它吹散；它不是能"推开"的东西。
        "ink": "destroy",
        // BOSS 也是 push：怒气爆发推得动它，但清不掉。**这是刻意的**——一个能被技能删掉的 BOSS
        // 会让"这一关的终点"取决于你有没有那个技能，那它就不是终点了。
        "boss": "push",
        "boss-crab": "push",
        "boss-octopus": "push",
        "boss-jelly": "push",
        "boss-shark": "push",
        "boss-netshark": "push",
        "boss-eye": "push",
        // 热液喷口和它的矿物颗粒是**地形**：冲击波推不动它们（喷口长在海床上），也清不掉。
        "vent": "push",
        "mineral": "push",
        "zapper": "destroy",
        "foam": "push",
        "rain": "push",
        "shrimp": "destroy",
        "angler": "push",
        "torpedo": "push"
      },

      // 冲击波环从 0 扩到半径用的时间（秒），以及环的线宽（相对半径）。
      "waveSeconds": 0.35,
      "waveWidthRatio": 0.1,
      // 环的颜色。默认给一个偏白的高亮色，让它在任何怒气阶段都看得见。
      "waveColour": 0xfff0e0
    },

    // ---------------------------------------------------------------------------------------------
    // 失控与自爆（设计文档第三节）
    // ---------------------------------------------------------------------------------------------
    //
    // **怒气满了就进入失控**，一段倒计时开始：这段时间里气泡更强、更笨、更大，而且**必须在倒计时结束前
    // 把怒气放掉**——用爆破，或者撞碎一个大型目标。没放掉的话，气泡**不会破裂**，而是**受一次重伤
    // （体积大幅下降）并被强制清空怒气**：惩罚是真的（体积和怒气都没了），但不需要把玩家拆成多个实体。
    //
    // 这是"怒气既是资源也是倒计时"（设计文档第一节）的落地：满怒不是终点，是一个必须马上做点什么的时刻。
    // ---------------------------------------------------------------------------------------------
    // 怒气槽（HUD 上的一根条）
    // ---------------------------------------------------------------------------------------------
    //
    // 设计文档第一节要求"怒气槽与阶段"。**现在才做它，是因为现在才有花的去处**：在爆破之前，怒气只会堆到满
    // 然后待在那里，一根槽只是在报一个没有用途的数字；现在爆破一次清空全部怒气，"还剩多少、够不够放一次"
    // 才是一个真问题。
    //
    // 槽画在怒气文字下面（那行文字是"怒气 60 暴怒"），填充色直接用当前怒气阶段的 hudColor——
    // 所以条的颜色和气泡的颜色永远是同一个答案，不需要第二套映射。
    "gauge": {
      // 宽度是泳道宽度的比例，高度是设计像素。放在文字下面居中对齐。
      "widthRatio": 0.4,
      "height": 7,
      // 文字与槽之间的间距（设计像素）。
      "gap": 5,
      "radius": 3.5,
      "trackColour": 0x0a1c2e,
      "trackAlpha": 0.7,
      "trackStroke": 0x3d7fa8,
      "trackStrokeAlpha": 0.5,
      "fillAlpha": 0.95,
      // 阶段阈值上的刻度线：让"再挨一下就到下一阶段"看得见，而不必去记数字。
      "tickColour": 0xffffff,
      "tickAlpha": 0.3,
      "tickWidth": 1
    }
  },

  // ---------------------------------------------------------------------------------------------
  // 音频
  // ---------------------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------------------
  // 结算界面（六关全部通关之后）
  // ---------------------------------------------------------------------------------------------
  "summary": {
    // 面板最大宽度与高度（设计像素），实际会再按画布比例收一收。
    "maxWidth": 420,
    "maxHeight": 470,
    // 总分字号与颜色。
    "scoreSize": 54,
    "scoreColour": 0xffd479,
    // 下面几行小字（通关数 / 用时 / 最佳）的字号与颜色。
    "lineSize": 14,
    "lineColour": 0x9fd8f0,
    // 面板与遮罩的颜色、不透明度。
    "panelColour": 0x0e1c2f,
    "panelRimColour": 0x6dc7e8,
    "scrimColour": 0x02060d,
    "scrimAlpha": 0.86,
    // 返回主菜单按钮的颜色与文字。
    "buttonColour": 0x1d3c58,
    "buttonLabel": "返回主菜单"
  },

  "audio": {
    // **Boss 还有多少秒登场时出预警声。** 距离是用这个秒数乘本关的 \`scrollSpeed\` 算出来的，所以换关卡节奏不用改这里。
    "bossWarnSeconds": 4,

    // -----------------------------------------------------------------------------------------
    // 血量告急的心跳声
    // -----------------------------------------------------------------------------------------
    // 血量低于这个比例（0..1）之后开始按固定间隔播放心跳。0.3 = 三成血。
    "lowHealthFraction": 0.3,
    // 心跳的间隔（秒）。太密会盖过战斗音，太疏就不像警告。1.1 约等于静息心率的一半。
    "lowHealthIntervalSeconds": 1.1,

    // ---------------------------------------------------------------------------------------------
    // 背景音乐：每关一段，**合成而不是文件**
    // ---------------------------------------------------------------------------------------------
    //
    // 这个项目没有任何二进制素材：所有声音都是 WebAudio 现场合成的。六段音乐要是做成文件，体积会翻好几个
    // 数量级，而且变成六件"改关卡列表时要同步维护"的东西。所以一段音乐是一份**配方**：调性、速度、波形、
    // 和弦进行、琶音型。
    //
    // 三个数字决定一段音乐的"性格"：\`rootHz\` 调性（低=沉、高=亮）、\`stepPerMinute\` 琶音速度（慢=平静）、
    // \`cutoffHz\` 低通截止（低=水下、闷，高=明亮、开阔）。**想换一关的气氛，改这四个数就够了。**
      // **过关音乐**：攻克 BOSS 之后单独播一段，播完气泡才向上飞走。
      //
      // \`notes\` 是相对主音的半音（大调上行琶音：do-mi-sol-do），\`gapSeconds\` 是每个音之间的间隔。
      // \`stingSeconds\` 由这两个数算出来（音数 × 间隔），代码里读的是同一个数，所以"音乐播完"和"气泡起飞"
      // 不会各说各话。
      "clearSting": {
        "notes": [0, 4, 7, 12, 16],
        "gapSeconds": 0.22
      },

      // 过关后气泡"停住不动"的额外时间（秒）：音乐播完之后再多留一拍，让玩家看清自己赢了。
      "clearHoldSeconds": 0.4,

      // 气泡向上飞出屏幕的速度（屏幕高/秒）。
      "ascendScreensPerSecond": 1.1,

    "sfx": {
      // 音效：每个声音一行配方，名字是 src/soundIds.ts 里的 id。想换成真实录音，把 <名字>.wav（或 .mp3）放进 src/assets/audio/sfx/，
      // 同名文件会自动盖过这里的配方，不用改任何别的东西。每个 id 都必须有一行（启动时会检查）。
      //
      // 配方 = 若干层。tone 层：wave 波形、hz 起始频率、endRatio 结束频率是起始的几倍（默认 1，不滑音）、seconds 时长、gain 音量、
      //   delay 延后多久开始、attack 起音时间、vibratoHz/vibratoDepth 音高颤动。
      // noise 层：filter 滤波类型、hz 滤波中心（或截止）、endRatio 结束时是起始的几倍、q 滤波锐度、seconds/gain/delay 同上。
      // 整行：gap 同一个声音最少隔多久才能再响（防叠成一团）、gain 整体音量、pitchJitter 每次随机偏多少音高、
      //   pitchPerIntensity / gainPerIntensity 强度越大音高 / 音量越高（强度由触发处决定，例如吸收的泡泡越大）、fileGain 录音版的音量。
      //
      // 分组音量（界面 / 战斗 / 玩家 / 环境）：
      "buses": { "ui": 1, "combat": 0.9, "player": 1, "env": 0.8 },
      // 世界里的声音按位置分配左右声道的幅度（0 = 全部居中，1 = 最边上的声音完全在一侧）。手机外放基本听不出，耳机下才明显。
      "panWidth": 0.7,
      // 同时发声的上限。超过就不再响新的（界面音不受限）。
      "maxVoices": 20,
      "sounds": {
        // ---- 界面与流程
        "ui.click": { "label": "按钮按下", "bus": "ui", "gap": 0.03, "layers": [
          { "type": "tone", "wave": "sine", "hz": 1200, "endRatio": 0.6, "seconds": 0.05, "gain": 0.18 },
          { "type": "noise", "filter": "bandpass", "hz": 3000, "seconds": 0.02, "gain": 0.05 }
        ] },
        "ui.back": { "label": "返回 / 关闭", "bus": "ui", "gap": 0.03, "layers": [
          { "type": "tone", "wave": "sine", "hz": 800, "endRatio": 0.6, "seconds": 0.07, "gain": 0.16 }
        ] },
        "ui.toggle": { "label": "开关切换", "bus": "ui", "gap": 0.05, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 700, "endRatio": 1.5, "seconds": 0.05, "gain": 0.14 },
          { "type": "tone", "wave": "triangle", "hz": 1050, "seconds": 0.05, "gain": 0.12, "delay": 0.05 }
        ] },
        "ui.slider": { "label": "滑条刻度", "bus": "ui", "gap": 0.05, "pitchJitter": 0.05, "layers": [
          { "type": "tone", "wave": "sine", "hz": 900, "seconds": 0.025, "gain": 0.08 }
        ] },
        "menu.start": { "label": "点「开始游戏」：气泡出发", "bus": "ui", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 300, "endRatio": 2.5, "seconds": 0.5, "gain": 0.22, "attack": 0.05 },
          { "type": "tone", "wave": "triangle", "hz": 450, "endRatio": 2.5, "seconds": 0.5, "gain": 0.14 },
          { "type": "noise", "filter": "bandpass", "hz": 1200, "endRatio": 2.5, "seconds": 0.45, "gain": 0.1 }
        ] },
        "ui.pause": { "label": "打开设置 / 暂停", "bus": "ui", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 500, "endRatio": 0.5, "seconds": 0.15, "gain": 0.16 },
          { "type": "tone", "wave": "sine", "hz": 350, "endRatio": 0.6, "seconds": 0.18, "gain": 0.12, "delay": 0.05 }
        ] },
        "ui.resume": { "label": "关闭设置 / 继续", "bus": "ui", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 350, "endRatio": 1.6, "seconds": 0.15, "gain": 0.16 },
          { "type": "tone", "wave": "sine", "hz": 520, "endRatio": 1.5, "seconds": 0.15, "gain": 0.12, "delay": 0.05 }
        ] },
        "levelup.open": { "label": "突变三选一弹出", "bus": "ui", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 523, "seconds": 0.25, "gain": 0.16 },
          { "type": "tone", "wave": "sine", "hz": 659, "seconds": 0.25, "gain": 0.16, "delay": 0.08 },
          { "type": "tone", "wave": "sine", "hz": 784, "seconds": 0.3, "gain": 0.16, "delay": 0.16 },
          { "type": "noise", "filter": "highpass", "hz": 5000, "seconds": 0.3, "gain": 0.05, "delay": 0.1 }
        ] },
        // 慢动作预告开始的提示音。**不降速**（界面那组），因为它说的是"接下来这一下不算数"，
        // 拖慢它反而会让预告听起来像卡住。
        "levelup.ramp": { "label": "突变预告：慢动作开始", "bus": "ui", "gap": 0.5, "layers": [
          { "type": "tone", "wave": "square", "hz": 300, "endRatio": 3, "seconds": 0.5, "gain": 0.13 },
          { "type": "noise", "filter": "bandpass", "hz": 900, "endRatio": 3, "seconds": 0.5, "gain": 0.07, "q": 1.2 }
        ] },
        "levelup.pick": { "label": "选定一张突变卡", "bus": "ui", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "sine", "hz": 660, "endRatio": 1.5, "seconds": 0.12, "gain": 0.2 },
          { "type": "tone", "wave": "square", "hz": 990, "seconds": 0.18, "gain": 0.1, "delay": 0.06 },
          { "type": "noise", "filter": "highpass", "hz": 4000, "seconds": 0.2, "gain": 0.07 }
        ] },
        "level.start": { "label": "关卡开始：气泡出生", "bus": "ui", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 200, "endRatio": 3, "seconds": 0.4, "gain": 0.2, "attack": 0.02 },
          { "type": "noise", "filter": "bandpass", "hz": 800, "endRatio": 3, "seconds": 0.35, "gain": 0.1 }
        ] },
        // level.surface：原来的 surface
        "level.surface": { "label": "到达水面 / 过关", "bus": "ui", "gap": 0.2, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 4200, "seconds": 0.5, "gain": 0.42 },
          { "type": "tone", "wave": "sine", "hz": 720, "endRatio": 2.4, "seconds": 0.5, "gain": 0.3 }
        ] },
        "boss.warn": { "label": "Boss 预警", "bus": "ui", "gap": 0.5, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 110, "endRatio": 0.8, "seconds": 0.8, "gain": 0.2, "attack": 0.1, "vibratoHz": 6, "vibratoDepth": 0.03 },
          { "type": "tone", "wave": "sine", "hz": 55, "seconds": 0.9, "gain": 0.25 }
        ] },
        "boss.enter": { "label": "Boss 登场", "bus": "ui", "gap": 0.5, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 70, "endRatio": 0.5, "seconds": 0.9, "gain": 0.28 },
          { "type": "noise", "filter": "lowpass", "hz": 400, "seconds": 0.8, "gain": 0.3 },
          { "type": "tone", "wave": "sine", "hz": 40, "seconds": 1, "gain": 0.3 }
        ] },
        "summary.show": { "label": "结算页出现", "bus": "ui", "gap": 0.5, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 523, "seconds": 0.4, "gain": 0.18 },
          { "type": "tone", "wave": "triangle", "hz": 659, "seconds": 0.4, "gain": 0.18, "delay": 0.12 },
          { "type": "tone", "wave": "triangle", "hz": 784, "seconds": 0.4, "gain": 0.18, "delay": 0.24 },
          { "type": "tone", "wave": "triangle", "hz": 1046, "seconds": 0.7, "gain": 0.2, "delay": 0.36 }
        ] },
        // ---- 战斗反馈
        // gun.fire：原来的 bulletFire；强度来自 audio.bulletFireVolume
        "gun.fire": { "label": "小泡泡子弹射出", "bus": "combat", "gap": 0.04, "pitchJitter": 0.04, "gainPerIntensity": 0.83, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 430, "endRatio": 0.55, "seconds": 0.055, "gain": 0.06 },
          { "type": "noise", "filter": "bandpass", "hz": 1300, "seconds": 0.022, "gain": 0.03 }
        ] },
        // gun.hit：原来的 bulletHit；强度来自 audio.bulletHitVolume
        "gun.hit": { "label": "小泡泡子弹命中", "bus": "combat", "gap": 0.05, "gainPerIntensity": 0.8, "layers": [
          { "type": "tone", "wave": "square", "hz": 1050, "endRatio": 1.5, "seconds": 0.045, "gain": 0.09 },
          { "type": "noise", "filter": "bandpass", "hz": 3200, "seconds": 0.028, "gain": 0.05 }
        ] },
        "enemy.hit.small": { "label": "小型鱼类被打中", "bus": "combat", "gap": 0.08, "pitchJitter": 0.08, "layers": [
          { "type": "tone", "wave": "sine", "hz": 700, "endRatio": 0.7, "seconds": 0.06, "gain": 0.14 },
          { "type": "noise", "filter": "bandpass", "hz": 2500, "seconds": 0.03, "gain": 0.06 }
        ] },
        "enemy.hit.predator": { "label": "大型捕食者被打中", "bus": "combat", "gap": 0.1, "pitchJitter": 0.05, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 180, "endRatio": 0.6, "seconds": 0.1, "gain": 0.22 },
          { "type": "noise", "filter": "lowpass", "hz": 900, "seconds": 0.08, "gain": 0.12 }
        ] },
        "enemy.hit.jelly": { "label": "水母 / 电类被打中", "bus": "combat", "gap": 0.1, "pitchJitter": 0.06, "layers": [
          { "type": "tone", "wave": "sine", "hz": 400, "endRatio": 2.2, "seconds": 0.1, "gain": 0.16 },
          { "type": "noise", "filter": "bandpass", "hz": 600, "seconds": 0.1, "gain": 0.08 }
        ] },
        "enemy.hit.shell": { "label": "硬壳带刺被打中", "bus": "combat", "gap": 0.08, "pitchJitter": 0.06, "layers": [
          { "type": "tone", "wave": "square", "hz": 900, "endRatio": 0.5, "seconds": 0.04, "gain": 0.12 },
          { "type": "noise", "filter": "bandpass", "hz": 4000, "seconds": 0.04, "gain": 0.12 }
        ] },
        "enemy.hit.ranged": { "label": "远程射手被打中", "bus": "combat", "gap": 0.08, "pitchJitter": 0.06, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 520, "endRatio": 0.8, "seconds": 0.07, "gain": 0.15 },
          { "type": "noise", "filter": "bandpass", "hz": 1800, "seconds": 0.04, "gain": 0.07 }
        ] },
        "enemy.hit.boss": { "label": "Boss 被打中", "bus": "combat", "gap": 0.1, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 110, "endRatio": 0.5, "seconds": 0.18, "gain": 0.26 },
          { "type": "noise", "filter": "lowpass", "hz": 1200, "seconds": 0.12, "gain": 0.18 },
          { "type": "tone", "wave": "sine", "hz": 70, "endRatio": 0.8, "seconds": 0.2, "gain": 0.2 }
        ] },
        "enemy.leave.small": { "label": "小型鱼类逃走", "bus": "combat", "gap": 0.08, "layers": [
          { "type": "tone", "wave": "sine", "hz": 500, "endRatio": 2.5, "seconds": 0.15, "gain": 0.2 },
          { "type": "noise", "filter": "bandpass", "hz": 2800, "seconds": 0.05, "gain": 0.08 }
        ] },
        "enemy.leave.predator": { "label": "大型捕食者逃走", "bus": "combat", "gap": 0.1, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 120, "endRatio": 2.2, "seconds": 0.3, "gain": 0.18 },
          { "type": "noise", "filter": "lowpass", "hz": 700, "seconds": 0.2, "gain": 0.12 }
        ] },
        "enemy.leave.jelly": { "label": "水母 / 电类逃走", "bus": "combat", "gap": 0.1, "layers": [
          { "type": "tone", "wave": "sine", "hz": 350, "endRatio": 0.4, "seconds": 0.3, "gain": 0.18, "vibratoHz": 12, "vibratoDepth": 0.12 },
          { "type": "noise", "filter": "bandpass", "hz": 500, "endRatio": 0.5, "seconds": 0.2, "gain": 0.08 }
        ] },
        "enemy.leave.shell": { "label": "硬壳带刺逃走", "bus": "combat", "gap": 0.1, "layers": [
          { "type": "tone", "wave": "square", "hz": 300, "endRatio": 0.3, "seconds": 0.12, "gain": 0.15 },
          { "type": "noise", "filter": "highpass", "hz": 3000, "seconds": 0.15, "gain": 0.18 }
        ] },
        "enemy.leave.ranged": { "label": "远程射手逃走", "bus": "combat", "gap": 0.1, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 400, "endRatio": 2, "seconds": 0.2, "gain": 0.18 },
          { "type": "tone", "wave": "triangle", "hz": 600, "endRatio": 2, "seconds": 0.2, "gain": 0.12, "delay": 0.08 }
        ] },
        "enemy.leave.boss": { "label": "Boss 被击败", "bus": "combat", "gap": 0.5, "layers": [
          { "type": "noise", "filter": "lowpass", "hz": 1500, "endRatio": 0.13, "seconds": 1.2, "gain": 0.4 },
          { "type": "tone", "wave": "sawtooth", "hz": 100, "endRatio": 0.3, "seconds": 1, "gain": 0.3 },
          { "type": "tone", "wave": "sine", "hz": 50, "endRatio": 0.6, "seconds": 1.2, "gain": 0.3 }
        ] },
        "hit.crit": { "label": "暴击", "bus": "combat", "gap": 0.12, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 1000, "endRatio": 0.5, "seconds": 0.1, "gain": 0.2 },
          { "type": "tone", "wave": "sine", "hz": 200, "endRatio": 0.5, "seconds": 0.12, "gain": 0.25 }
        ] },
        // enemy.fire：原来是 hit 的 0.25 强度
        "enemy.fire": { "label": "敌人开火", "bus": "combat", "gap": 0.12, "pitchJitter": 0.06, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 300, "endRatio": 0.5, "seconds": 0.08, "gain": 0.1 },
          { "type": "noise", "filter": "bandpass", "hz": 1500, "seconds": 0.05, "gain": 0.07 }
        ] },
        "enemy.charge": { "label": "敌人冲锋", "bus": "combat", "gap": 0.15, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 400, "endRatio": 5, "seconds": 0.35, "gain": 0.15, "q": 1 },
          { "type": "tone", "wave": "sawtooth", "hz": 150, "endRatio": 2.5, "seconds": 0.3, "gain": 0.1 }
        ] },
        "enemy.discharge": { "label": "放电", "bus": "combat", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 1200, "endRatio": 0.2, "seconds": 0.25, "gain": 0.14, "vibratoHz": 40, "vibratoDepth": 0.2 },
          { "type": "noise", "filter": "highpass", "hz": 3000, "seconds": 0.25, "gain": 0.12 }
        ] },
        "chain.zap": { "label": "连锁放电", "bus": "combat", "gap": 0.3, "layers": [
          { "type": "noise", "filter": "highpass", "hz": 4000, "seconds": 0.4, "gain": 0.2 },
          { "type": "tone", "wave": "square", "hz": 800, "endRatio": 0.3, "seconds": 0.4, "gain": 0.12, "vibratoHz": 60, "vibratoDepth": 0.3 }
        ] },
        // bomb.blast：原来是 pop
        "bomb.blast": { "label": "炸弹鱼爆炸", "bus": "combat", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "sine", "hz": 120, "endRatio": 0.3, "seconds": 0.6, "gain": 0.35 },
          { "type": "noise", "filter": "lowpass", "hz": 2500, "endRatio": 0.08, "seconds": 0.7, "gain": 0.4 }
        ] },
        "puffer.counter": { "label": "河豚反击", "bus": "combat", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 200, "endRatio": 2.5, "seconds": 0.15, "gain": 0.2 },
          { "type": "noise", "filter": "bandpass", "hz": 1500, "seconds": 0.12, "gain": 0.12 }
        ] },
        "boss.attack": { "label": "Boss 攻击", "bus": "combat", "gap": 0.3, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 3000, "endRatio": 0.17, "seconds": 0.3, "gain": 0.22 },
          { "type": "tone", "wave": "sawtooth", "hz": 200, "endRatio": 0.4, "seconds": 0.3, "gain": 0.15 }
        ] },
        "bullet.hurt": { "label": "弹幕命中玩家", "bus": "combat", "gap": 0.08, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 260, "endRatio": 0.5, "seconds": 0.1, "gain": 0.22 },
          { "type": "noise", "filter": "bandpass", "hz": 2000, "seconds": 0.05, "gain": 0.15 }
        ] },
        "graze": { "label": "擦边", "bus": "combat", "gap": 0.12, "layers": [
          { "type": "tone", "wave": "sine", "hz": 1400, "endRatio": 1.3, "seconds": 0.08, "gain": 0.1 },
          { "type": "noise", "filter": "highpass", "hz": 5000, "seconds": 0.05, "gain": 0.08 }
        ] },
        // ---- 玩家动作与警告
        // player.hurt：原来的 hit
        "player.hurt": { "label": "玩家受伤", "bus": "player", "gap": 0.09, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 150, "endRatio": 0.55, "seconds": 0.18, "gain": 0.3 },
          { "type": "noise", "filter": "bandpass", "hz": 700, "seconds": 0.09, "gain": 0.22 }
        ] },
        // player.pop：原来的 pop
        "player.pop": { "label": "气泡破裂（死亡）", "bus": "player", "gap": 0.2, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 2600, "seconds": 0.22, "gain": 0.5 },
          { "type": "tone", "wave": "sine", "hz": 660, "endRatio": 0.35, "seconds": 0.26, "gain": 0.34 }
        ] },
        // player.eat：原来借用 pop
        "player.eat": { "label": "吞下一只敌人", "bus": "player", "gap": 0.1, "layers": [
          { "type": "tone", "wave": "sine", "hz": 300, "endRatio": 2.6, "seconds": 0.16, "gain": 0.26 },
          { "type": "tone", "wave": "sine", "hz": 200, "endRatio": 0.5, "seconds": 0.2, "gain": 0.2, "delay": 0.12 },
          { "type": "noise", "filter": "lowpass", "hz": 700, "seconds": 0.12, "gain": 0.15 }
        ] },
        // player.absorb：原来的 absorb：音高随泡泡大小升高
        "player.absorb": { "label": "吸收小泡泡", "bus": "player", "gap": 0.045, "pitchPerIntensity": 1.24, "gainPerIntensity": 0.625, "layers": [
          { "type": "tone", "wave": "sine", "hz": 420, "endRatio": 1.9, "seconds": 0.09, "gain": 0.16 }
        ] },
        "stage.grow": { "label": "成长阶段提升", "bus": "player", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 400, "seconds": 0.2, "gain": 0.2 },
          { "type": "tone", "wave": "sine", "hz": 500, "seconds": 0.2, "gain": 0.2, "delay": 0.09 },
          { "type": "tone", "wave": "sine", "hz": 630, "seconds": 0.35, "gain": 0.22, "delay": 0.18 }
        ] },
        "mutation.gain": { "label": "获得突变", "bus": "player", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 880, "endRatio": 1.5, "seconds": 0.2, "gain": 0.14 },
          { "type": "tone", "wave": "sine", "hz": 1320, "endRatio": 1.2, "seconds": 0.25, "gain": 0.12, "delay": 0.08 },
          { "type": "noise", "filter": "highpass", "hz": 6000, "seconds": 0.3, "gain": 0.08 }
        ] },
        "suction.on": { "label": "开始吸附", "bus": "player", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 250, "endRatio": 0.5, "seconds": 0.3, "gain": 0.14 },
          { "type": "noise", "filter": "bandpass", "hz": 800, "endRatio": 0.4, "seconds": 0.3, "gain": 0.1 }
        ] },
        // rage.slam：原来借用 crab / hit
        "rage.slam": { "label": "怒气冲撞 / 撞碎障碍", "bus": "player", "gap": 0.15, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 100, "endRatio": 0.4, "seconds": 0.25, "gain": 0.35 },
          { "type": "noise", "filter": "lowpass", "hz": 1500, "seconds": 0.15, "gain": 0.3 }
        ] },
        // rage.burst：原来借用 crab
        "rage.burst": { "label": "怒气释放（冲击波）", "bus": "player", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sine", "hz": 80, "endRatio": 0.3, "seconds": 0.8, "gain": 0.35 },
          { "type": "noise", "filter": "lowpass", "hz": 3000, "endRatio": 0.07, "seconds": 0.8, "gain": 0.3 },
          { "type": "tone", "wave": "sawtooth", "hz": 300, "endRatio": 0.2, "seconds": 0.5, "gain": 0.15 }
        ] },
        // rage.overload：原来借用 slow
        "rage.overload": { "label": "怒气失控警告", "bus": "player", "gap": 0.5, "layers": [
          { "type": "tone", "wave": "square", "hz": 660, "seconds": 0.12, "gain": 0.16 },
          { "type": "tone", "wave": "square", "hz": 440, "seconds": 0.12, "gain": 0.16, "delay": 0.18 },
          { "type": "tone", "wave": "square", "hz": 660, "seconds": 0.12, "gain": 0.16, "delay": 0.36 }
        ] },
        // rage.punish：原来借用 pop
        "rage.punish": { "label": "怒气失控惩罚", "bus": "player", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 200, "endRatio": 0.3, "seconds": 0.5, "gain": 0.28 },
          { "type": "noise", "filter": "lowpass", "hz": 800, "seconds": 0.4, "gain": 0.25 }
        ] },
        "health.low": { "label": "血量告急（心跳）", "bus": "player", "gap": 0.5, "layers": [
          { "type": "tone", "wave": "sine", "hz": 60, "endRatio": 0.8, "seconds": 0.12, "gain": 0.4 },
          { "type": "tone", "wave": "sine", "hz": 55, "endRatio": 0.8, "seconds": 0.12, "gain": 0.3, "delay": 0.16 }
        ] },
        // player.slow：原来的 slow
        "player.slow": { "label": "被减速 / 被缠住", "bus": "player", "gap": 0.3, "layers": [
          { "type": "tone", "wave": "sawtooth", "hz": 300, "endRatio": 0.4, "seconds": 0.4, "gain": 0.26 }
        ] },
        // crab.launch：原来的 crab
        "crab.launch": { "label": "螃蟹把你弹起来", "bus": "player", "gap": 0.2, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 240, "endRatio": 3.4, "seconds": 0.3, "gain": 0.3 }
        ] },
        // defeat.sting：死亡那一小段曲子，你做好后用 sting 录音替换这一个
        "defeat.sting": { "label": "死亡 sting（占位）", "bus": "player", "gap": 1, "layers": [
          { "type": "tone", "wave": "triangle", "hz": 392, "seconds": 0.9, "gain": 0.2, "attack": 0.04 },
          { "type": "tone", "wave": "triangle", "hz": 330, "seconds": 0.9, "gain": 0.2, "delay": 0.55, "attack": 0.04 },
          { "type": "tone", "wave": "triangle", "hz": 262, "seconds": 0.9, "gain": 0.2, "delay": 1.1, "attack": 0.04 },
          { "type": "tone", "wave": "sine", "hz": 196, "endRatio": 0.97, "seconds": 2, "gain": 0.22, "delay": 1.65, "attack": 0.05 }
        ] },
        // ---- 环境
        "vent.erupt": { "label": "喷口喷发", "bus": "env", "gap": 0.4, "layers": [
          { "type": "noise", "filter": "lowpass", "hz": 600, "endRatio": 3, "seconds": 0.8, "gain": 0.25 },
          { "type": "tone", "wave": "sine", "hz": 70, "seconds": 0.8, "gain": 0.2 }
        ] },
        "obstacle.break.crate": { "label": "木箱被撞碎", "bus": "env", "gap": 0.1, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 1500, "seconds": 0.18, "gain": 0.3 },
          { "type": "tone", "wave": "square", "hz": 200, "endRatio": 0.4, "seconds": 0.1, "gain": 0.15 }
        ] },
        "crate.warn": { "label": "下落木箱预警", "bus": "env", "gap": 2.0, "layers": [
          { "type": "tone", "wave": "square", "hz": 880, "endRatio": 0.9, "seconds": 0.12, "gain": 0.12 },
          { "type": "tone", "wave": "square", "hz": 660, "seconds": 0.12, "gain": 0.11, "delay": 0.16 }
        ] },
        "crate.drop": { "label": "下落木箱释放", "bus": "env", "gap": 0.3, "layers": [
          { "type": "noise", "filter": "lowpass", "hz": 500, "endRatio": 0.6, "seconds": 0.3, "gain": 0.2 },
          { "type": "tone", "wave": "sine", "hz": 90, "endRatio": 0.6, "seconds": 0.3, "gain": 0.18 }
        ] },
        "obstacle.break.coral": { "label": "珊瑚被撞碎", "bus": "env", "gap": 0.1, "layers": [
          { "type": "noise", "filter": "bandpass", "hz": 3500, "seconds": 0.25, "gain": 0.3 },
          { "type": "tone", "wave": "triangle", "hz": 500, "endRatio": 0.3, "seconds": 0.15, "gain": 0.15 }
        ] },
        "obstacle.break.net": { "label": "渔网被撕开", "bus": "env", "gap": 0.1, "layers": [
          { "type": "noise", "filter": "highpass", "hz": 2000, "endRatio": 1.8, "seconds": 0.3, "gain": 0.2 }
        ] },
        "obstacle.hit.wall": { "label": "撞上岩壁", "bus": "env", "gap": 0.15, "layers": [
          { "type": "tone", "wave": "sine", "hz": 90, "endRatio": 0.6, "seconds": 0.2, "gain": 0.3 },
          { "type": "noise", "filter": "lowpass", "hz": 600, "seconds": 0.12, "gain": 0.2 }
        ] },
        "rain.press": { "label": "雨压下来", "bus": "env", "gap": 0.2, "layers": [
          { "type": "noise", "filter": "highpass", "hz": 3000, "endRatio": 0.5, "seconds": 0.3, "gain": 0.15 },
          { "type": "tone", "wave": "sine", "hz": 200, "endRatio": 0.5, "seconds": 0.25, "gain": 0.12 }
        ] },
        "foam.pop": { "label": "泡沫破裂", "bus": "env", "gap": 0.08, "layers": [
          { "type": "tone", "wave": "sine", "hz": 900, "endRatio": 0.4, "seconds": 0.05, "gain": 0.14 },
          { "type": "noise", "filter": "highpass", "hz": 6000, "seconds": 0.04, "gain": 0.1 }
        ] },
        "mineral.hit": { "label": "矿物颗粒撞上", "bus": "env", "gap": 0.08, "layers": [
          { "type": "tone", "wave": "square", "hz": 1200, "endRatio": 0.5, "seconds": 0.05, "gain": 0.1 },
          { "type": "noise", "filter": "bandpass", "hz": 5000, "seconds": 0.04, "gain": 0.1 }
        ] }
      }
    },
      // 音乐总音量（再乘以设置里的音量）。
    "music": {
      "volume": 0.5,
      // -----------------------------------------------------------------------------------------
      // **录好的曲子**（和上面按关卡合成的那套并存，两条路各自独立）
      // -----------------------------------------------------------------------------------------
      //
      // 文件放在 \`src/assets/audio/music/\`，文件名就是槽位名：
      //   <关卡 id>.mp3   这一关的曲子（替换掉上面 tracks 里同名的合成版；没有文件就用合成版）
      //   boss.mp3        Boss 战。Boss 登场时从关卡曲淡出、淡入这一首；Boss 死后回到关卡曲或结算曲
      //   summary.mp3     通关结算页
      // 主菜单那一首固定在 \`src/assets/audio/menu/\`（见 menuMusic.ts 顶部）。死亡的一小段是音效 \`defeat.sting\`，
      // 用 \`src/assets/audio/sfx/defeat.sting.wav\` 替换。
      //
      // 全部边下边播，第一次点击屏幕之后才开始下载；设置里的音乐滑条和静音键照常管它们。
      // **现在一个文件都没有**，所以听到的还是合成版——这是支持的状态，不是缺东西。
      "menu": { "volume": 0.5 },
      "recorded": {
        // 淡入多久（秒）：曲子开始播，以及每次循环回到开头。
        "fadeInSeconds": 2,
        // 淡出多久（秒）：这首不再是当前要播的（换关、Boss 登场、离开菜单）。
        "leaveFadeSeconds": 1,
        // 距曲末还剩多少秒时开始淡出并绕回开头（秒）。曲末本来就在渐弱时，这个数不用很大。
        "loopFadeSeconds": 2,
        // 突变三选一把音乐**暂时按住**时，淡出用多久（秒）。让这个数和 \`slowMotion.pick.slowSeconds\` 一致：
        // 那样卡片出现的同一刻音乐刚好静音，"暂停"和"弹卡"就是同一个瞬间。
        "holdFadeSeconds": 0.6,
        // 四个槽位各自的音量（0..1，再乘设置里的音乐滑条）。分开是因为它们的录制响度不会一样：
        // 主菜单那首原曲峰值 -3.9 dBFS、平均 -15.7 dBFS，没做过响度归一，所以偏响。
        "menuVolume": 0.5,
        "levelVolume": 0.5,
        "bossVolume": 0.55,
        "summaryVolume": 0.6
      },
      // 每关一段。键是关卡的 id；没写的关卡就是没有音乐。
      "tracks": {
        // 第一关 黑烟囱墓场：压抑、安静、几乎没有光。低音区、极慢、闷。
        "black-smokers": {
          "rootHz": 55,
          "stepPerMinute": 44,
          "stepsPerChord": 8,
          "chords": [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-2, 2, 7]],
          "pattern": [0, 1, 2, 1],
          "wave": "triangle",
          "padWave": "sine",
          "arpGain": 0.16,
          "padGain": 0.1,
          "noteSeconds": 0.9,
          "cutoffHz": 420,
          "detuneCents": 7
        },
        // 第二关 沉船幽谷：昏暗但有灯、有反光金属，所以比第一关暖一点、亮一点。
        "wreck-gorge": {
          "rootHz": 65.4,
          "stepPerMinute": 56,
          "stepsPerChord": 6,
          "chords": [[0, 4, 7], [-3, 0, 4], [2, 5, 9], [-1, 2, 7]],
          "pattern": [0, 2, 1, 2],
          "wave": "triangle",
          "padWave": "sawtooth",
          "arpGain": 0.15,
          "padGain": 0.075,
          "noteSeconds": 0.7,
          "cutoffHz": 640,
          "detuneCents": 9
        },
        // 第三关 发光水母林：蓝紫、飘、生物荧光。大调色彩 + 高一些的琶音，像在发光。
        "jelly-forest": {
          "rootHz": 87.3,
          "stepPerMinute": 72,
          "stepsPerChord": 8,
          "chords": [[0, 4, 9], [2, 7, 11], [-3, 4, 7], [0, 5, 9]],
          "pattern": [0, 1, 2, 1, 2, 0],
          "wave": "sine",
          "padWave": "triangle",
          "arpGain": 0.17,
          "padGain": 0.09,
          "noteSeconds": 0.55,
          "cutoffHz": 1500,
          "detuneCents": 12
        },
        // 第四关 猎食者温跃层：开阔、有温差与折射。中音区、流动、稍快。
        "thermocline": {
          "rootHz": 73.4,
          "stepPerMinute": 84,
          "stepsPerChord": 6,
          "chords": [[0, 5, 9], [3, 7, 10], [-2, 3, 7], [1, 5, 8]],
          "pattern": [0, 2, 1, 0, 2, 1],
          "wave": "triangle",
          "padWave": "sawtooth",
          "arpGain": 0.15,
          "padGain": 0.07,
          "noteSeconds": 0.42,
          "cutoffHz": 1100,
          "detuneCents": 8
        },
        // 第五关 风暴暗流：明亮却混乱。小调、有推进感、滤波器开得更大。
        "storm-surge": {
          "rootHz": 61.7,
          "stepPerMinute": 96,
          "stepsPerChord": 4,
          "chords": [[0, 3, 7], [5, 8, 12], [-2, 3, 7], [0, 7, 10]],
          "pattern": [0, 1, 2, 1],
          "wave": "square",
          "padWave": "sawtooth",
          "arpGain": 0.11,
          "padGain": 0.075,
          "noteSeconds": 0.34,
          "cutoffHz": 1700,
          "detuneCents": 14
        },
        // 第六关 破晓海面：最终关，最亮、最上行。大调、最亮的滤波器。
        "dawn-surface": {
          "rootHz": 98,
          "stepPerMinute": 80,
          "stepsPerChord": 8,
          "chords": [[0, 4, 7], [5, 9, 12], [7, 11, 14], [2, 7, 11]],
          "pattern": [0, 1, 2, 1, 2, 1],
          "wave": "sine",
          "padWave": "triangle",
          "arpGain": 0.16,
          "padGain": 0.1,
          "noteSeconds": 0.5,
          "cutoffHz": 2400,
          "detuneCents": 10
        }
      }
    },
    // --- 音效（下面这些直接挂主增益） -------------------------------------------
    //
    // 这是一个**独立的增益节点**，不是乘在主增益上。两个原因：
    //   1. 主增益承载的是**玩家的音量**，把它压小会连音效一起压小，而音效没人要求变轻
    //   2. 滑块显示 100% 就该意味着"这游戏能有多响"，所以"音乐相对音效多响"属于配置，
    //      不该混进玩家的设置里
    //
    // 只有环境音床经过这个节点。音效走 \`play()\` 直连主增益，所以这项**影响不到音效**。
    // 1.0 = 和原来一样响；0 = 只有音效、没有背景音乐。
    "musicVolume": 0.7,

    // **环境噪声床的音量**（0 = 关掉，1 = 最大）。
    //
    // 它以前是**跟着深度变强**的：越往上越响、越亮，听起来像游戏自己在加大音量，而不是像海。现在它是一个
    // **固定值**，只有这一个旋钮。调大声会让你更"在水里"，调小则更干净。
    "ambientVolume": 0.35,

    // 小泡泡子弹**打中生物**那一下的音量（0 = 静音，1 = 最大）。
    //
    // 单独一项，是因为它是全游戏唯一一个**每秒响好几次**的音效：枪 4 发/秒，打中一条鱼时就连着响，
    // 所以"它多响"直接决定混音能不能听。其它音效都是偶发事件，写死在 src/audio.ts 里就够了。
    // 打空、打在木箱上都不出声——只有真的掉血的那一下才有反馈，否则这个音就变成了背景噪音。
    // 把生物打跑的那一发会按这个值再响一点（×1.4），给"这条搞定了"一个收尾。
    "bulletHitVolume": 0.5,

    // 小泡泡**打出去**那一下的音量（0 = 静音）。和上面一样是独立的，因为两者的分工不同：
    // 开枪是节奏，打中是信息，所以默认比打中轻（0.3 对 0.5），让"打中了"能听出来。
    //
    // 打出去的声音**每一发音高会随机飘几个百分点**（见 src/audio.ts）：一秒四发、音高完全一样的话，
    // 它就不再是音效而是节拍器。音色本身是"往下掉的一小声 + 一记气声"，和打中的"往上挑"正好相反，
    // 所以光凭方向就能分出是出膛还是命中。
    "bulletFireVolume": 0.3
  },

  // ---------------------------------------------------------------------------------------------
  // 涌现规则
  // ---------------------------------------------------------------------------------------------
  //
  // 这三条是"涌现"这个主题的实际内容：简单规则相互作用，产生没人直接编排的结果。
  "emergence": {
    // 鱼的感知半径（米），在体积 = 1.0 时。**随玩家体积增长**。
    // 这是"变大很危险"的机制本体，而不只是一种氛围。
    "fishPerceptionBaseMeters": 150,

    // 每多 1.0 体积，感知半径增加多少米。
    "fishPerceptionPerVolume": 90,

    // 一条鱼吃掉几个收集物后分裂成两条。这是游戏里唯一的指数增长规则，
    // 也是让一堆食物变成雪崩的那一环。
    "fishFeedToSplit": 3,

    // 鱼的数量硬上限。超过就完全不生成新鱼。
    // 没有这道护栏，上面那条指数规则就是手机上的崩溃。
    "fishHardCap": 44,

    // 水母/垃圾袋优先追"最大"的泡泡时，搜索范围（米）。
    "seekBiggestRangeMeters": 190
  },

  // ---------------------------------------------------------------------------------------------
  // 刷怪的进场方式（每个关卡可以在 config/levels.json5 里逐块覆盖）
  // ---------------------------------------------------------------------------------------------
  //
  // 关卡内容本身（刷什么、刷几个、从哪边进来）在 \`config/levels.json5\`，那是**内容**；
  // 这里放的是"从侧面/下方进场"这件事的**手感默认值**，所有关卡共用，避免每个方块重复写一遍。
  "spawning": {
    // 进场速度（米/秒，相对屏幕）。从左右/下方进场的东西以这个速度游进画面，
    // 直到进入泳道/视野为止，之后交给它自己的 AI。
    //
    // 从**下方**进场时这个速度要盖过生物的下落速度（关卡的 driftSpeed，默认 25），否则它会一直被往下带，
    // 永远追不上来。默认 45 对 25 有明显余量。
    "enterSpeedMps": 45,

    // 从左右进场时，出生点放在泳道外多远（泳道宽度的比例）。太小会看到它凭空出现在边缘。
    "offscreenMarginRatio": 0.25,

    // 从下方进场时，出生点放在视野下方多远（泳道宽度的比例）。
    "bottomMarginRatio": 0.12,

    // 判定"已经进场"的余量（泳道宽度的比例）：横向进到泳道内这么深，就认为它进来了。
    "insideMarginRatio": 0.02,

    // 从左右进场时，默认在屏幕的哪个高度切入。0 = 下边缘，1 = 上边缘。
    // 偏上一点是有意的：从上面进来是预警，从眼睛高度进来是惊喜。
    "entryDepth": 0.72
  },

  // ---------------------------------------------------------------------------------------------
  // 调试覆盖层：把**碰撞盒**用线描出来
  // ---------------------------------------------------------------------------------------------
  //
  // **这是给人看的工具，不是游戏的一部分。** 设置面板的作弊区有一个「调试模式」开关（默认开）。
  // 打开时，把所有判定形状描边画在场景里，用来对照"美术看上去多大"和"实际撞到多大"。
  //
  // 覆盖层是**纯读取者**：它读的就是判定真正在读的那些数（\`h.radiusFraction\`、\`radiusOf\`、
  // \`stageRadiusFraction\`……），所以它不可能和判定说两套话——**线画在哪，就打到哪**。
  //
  // 这一点决定了什么**不**画：BOSS 身上那圈"往这打"的提示环（\`weakPointWidthRatio\`）只是一条描边，
  // 没有任何弱点判定，画进来会让这个覆盖层撒谎；玩家气泡也没有自己的擦边圈。
  //
  // 实线 = 主判定（碰上去就生效）。虚线 = 擦边圈（贴着过去但没碰到才给分），它和主判定是分开的两档。
  //
  // 颜色刻意挑得彼此远：屏幕上会同时出现六种线，红/橙/黄三种最容易糊在一起。
  "debug": {
    // 线宽（设计像素）与不透明度。**只描边不填充**——填充会挡住它正要对照的那块美术。
    "width": 1.4,
    "alpha": 0.9,
    // 虚线的线长与间隔（设计像素），给擦边圈用。
    "dashLength": 6,
    "dashGap": 5,

    // 六类主判定。
    "creatureColour": 0xff4d4d,
    "environmentColour": 0xffa64d,
    "obstacleColour": 0xb07cff,
    "playerBulletColour": 0x6fe3ff,
    "enemyBulletColour": 0xff6bd6,
    "playerColour": 0x7dffb0,

    // 擦边圈（虚线）。生物和子弹共用一种颜色，因为它们是同一件事的两处应用。
    "grazeColour": 0xffffff
  }
}















































`;function W(e){throw Error(`config/mechanics.json5 is invalid: ${e}\nThe file is JSON5, so it allows // comments, trailing commas, unquoted keys and hex literals.`)}function Gc(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.values(e);return t.length>0&&t.every(e=>typeof e==`number`&&Number.isFinite(e))}function Kc(e,t=!1){return[{path:`${e}.patrolCenterRatio`,check:G,describe:`a fraction of the visible band; where the vertical patrol is centred`},{path:`${e}.patrolVerticalAmplitudeRatio`,check:G,describe:`a fraction of the visible band; how far the vertical patrol rises and falls`},{path:`${e}.verticalPatrolPeriodSeconds`,check:G,describe:`seconds for one vertical patrol cycle`},{path:`${e}.verticalSeekPerSecond`,check:G,describe:`how quickly the boss eases toward its vertical target, per second`},{path:`${e}.patrolAmplitude`,check:G,describe:`a lane fraction`},{path:`${e}.patrolPeriodSeconds`,check:G,describe:`seconds`},{path:`${e}.seekSpeedFactor`,check:G,describe:`lane widths per second`},{path:`${e}.radiusRatio`,check:G,describe:`a lane fraction`},{path:`${e}.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`${e}.eyeColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`${e}.armourColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`${e}.weakPointWidthRatio`,check:G,describe:`a lane fraction`},{path:`${e}.hitFlashColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`${e}.hitFlashStrength`,check:G,describe:`an intensity for the DRAWN boss body; 0 means it does not flash`},{path:`${e}.knockbackScale`,check:G,describe:`a multiplier on hitKnockback.meters; the boss holds station, so 0.5 is a nudge rather than a shove`},{path:`${e}.attackEverySeconds`,check:G,describe:`seconds between claw swings`},{path:`${e}.attackSprayFrame`,check:Qc,describe:`a frame number of the attack animation`},...t?[]:[{path:`${e}.attackSprayCount`,check:e=>e===void 0||Qc(e),describe:`a whole number of grit pieces; 0 makes the swing a pure animation`},{path:`${e}.attackSpraySpread`,check:e=>e===void 0||G(e),describe:`a lane fraction`},{path:`${e}.attackSpraySeconds`,check:e=>e===void 0||G(e),describe:`seconds of travel; this is the dodge window, so short is unfair and long is harmless`},{path:`${e}.attackSprayFromX`,check:e=>e===void 0||G(e),describe:`a multiple of the boss radius`},{path:`${e}.attackSprayFromY`,check:e=>e===void 0||G(e),describe:`a multiple of the boss radius; negative is below the body, which is where a claw is`},{path:`${e}.attackSprayBowRatio`,check:e=>e===void 0||G(e),describe:`a bow as a fraction of the distance travelled`}]]}function qc(){let e=nl?.hazards?.bosses;return e&&typeof e==`object`?Object.keys(e):[]}function Jc(){let e=nl?.hazards?.bossSkills;return e&&typeof e==`object`?Object.keys(e):[]}function Yc(e){return[{path:`${e}.lifeSeconds`,check:G,describe:`seconds`},{path:`${e}.risePx`,check:G,describe:`design pixels`},{path:`${e}.riseEase`,check:G,describe:`an exponent`},{path:`${e}.size`,check:G,describe:`a font size`},{path:`${e}.colour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`${e}.alpha`,check:G,describe:`an opacity`},{path:`${e}.weight`,check:e=>e===`bold`||e===`normal`,describe:`'bold' or 'normal'`},{path:`${e}.prefix`,check:e=>typeof e==`string`&&e.length<=8,describe:`a string of at most 8 characters; the empty string is allowed`},{path:`${e}.fadeFrom`,check:G,describe:`a fraction of the life`},{path:`${e}.fadeEase`,check:G,describe:`an exponent`},{path:`${e}.anchorX`,check:G,describe:`a fraction`},{path:`${e}.anchorY`,check:G,describe:`a fraction`},{path:`${e}.max`,check:Qc,describe:`a whole number of popups; 0 turns this style of number off entirely`}]}function Xc(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.values(e);if(t.length===0)return!1;let n=[`triggerMeters`,`telegraphSeconds`,`travelSeconds`,`cooldownSeconds`];return t.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return n.every(e=>typeof t[e]==`number`&&Number.isFinite(t[e]))?typeof t.bowRatio==`number`&&Number.isFinite(t.bowRatio):!1})}function Zc(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.values(e);if(t.length===0)return!1;let n=[`perSecond`,`speedPerSecond`,`spread`,`spreadRadians`,`damage`];return t.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;if(t.shape!==void 0&&t.shape!==`bolt`&&t.shape!==`spike`||t.radiusRatio!==void 0&&(typeof t.radiusRatio!=`number`||!Number.isFinite(t.radiusRatio)))return!1;for(let e of[`coreColour`,`rimColour`]){let n=t[e];if(n!==void 0&&!K(n))return!1}if(t.image!==void 0&&(typeof t.image!=`string`||t.image.trim()===``))return!1;for(let e of[`imageScale`,`imageAlpha`]){let n=t[e];if(n!==void 0&&(typeof n!=`number`||!Number.isFinite(n)))return!1}return n.every(e=>typeof t[e]==`number`&&Number.isFinite(t[e]))})}function G(e){return typeof e==`number`&&Number.isFinite(e)}function Qc(e){return typeof e==`number`&&Number.isFinite(e)&&Number.isInteger(e)}function K(e){return typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=16777215||typeof e==`string`&&/^#[0-9a-fA-F]{6}$/.test(e)}function $c(e){return typeof e==`string`&&e.length>0}function el(e){return typeof e!=`object`||!e||Array.isArray(e)?!1:Object.values(e).every(e=>{if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=e;return!(typeof t.frames==`string`&&t.frames.length>0&&typeof t.count==`number`&&Number.isInteger(t.count)||Array.isArray(t.frames)&&t.frames.length>=1&&t.frames.every(e=>typeof e==`string`&&e.length>0))||t.once!==void 0&&typeof t.once!=`boolean`?!1:typeof t.framesPerSecond==`number`&&Number.isFinite(t.framesPerSecond)&&typeof t.maxSeconds==`number`&&Number.isFinite(t.maxSeconds)})}function tl(e){let t=nl;for(let n of e.split(`.`)){if(typeof t!=`object`||!t)return;t=t[n]}return t}var nl;try{nl=Uc.default.parse(Wc)}catch(e){W(`it is not valid JSON5 (${e.message})`)}(typeof nl!=`object`||!nl)&&W(`the top level must be an object`);var rl=[{key:`radius`,what:`radius multiplier`,ok:G},...[`inner`,`rim`,`glow`,`sheen`,`specular`,`hudColor`].map(e=>({key:e,what:`colour, either 0xrrggbb or "#rrggbb"`,ok:e=>typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=16777215||typeof e==`string`&&/^#[0-9a-fA-F]{6}$/.test(e)})),...[`innerAlpha`,`rimAlpha`,`glowInnerAlpha`,`innerRingAlpha`,`sheenAlpha`,`specularAlpha`].map(e=>({key:e,what:`opacity`,ok:G})),...[`rimWidthRatio`,`innerRingWidthRatio`].map(e=>({key:e,what:`stroke width as a fraction of the radius`,ok:G})),...[`glowInnerRadiusRatio`].map(e=>({key:e,what:`radius as a multiple of the bubble radius`,ok:G})),{key:`innerRing`,what:`true or false`,ok:e=>typeof e==`boolean`},{key:`name`,what:`the stage name shown on the HUD`,ok:e=>typeof e==`string`&&e.length>0}],il=[`headingColour`,`statLabelColour`,`statValueColour`,`groupColour`,`nameColour`,`countColour`,`noteColour`,`blurbColour`,`windowFill`,`windowStroke`],al=[`crate`,`coral`,`wall`,`net`,`tube`],ol=[...[`drivenOff`,`absorb`,`eaten`,`boss`].map(e=>({path:`score.${e}`,check:G,describe:`points for this event; 0 takes the event out of the score`})),{path:`enemyBullets.shooters`,check:e=>Zc(e),describe:`an object of hazard kind to a shooter row`},{path:`enemyBullets.rangeMeters`,check:G,describe:`metres`},{path:`enemyBullets.radiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`enemyBullets.lifeSeconds`,check:G,describe:`seconds`},{path:`enemyBullets.coreColour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`enemyBullets.rimColour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`enemyBullets.rimAlpha`,check:G,describe:`an opacity`},{path:`charges.chargers`,check:e=>Xc(e),describe:`an object of hazard kind to { triggerMeters, telegraphSeconds, travelSeconds, bowRatio, cooldownSeconds, approach }`},...[`telegraphColour`,`trailColour`].map(e=>({path:`charges.${e}`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`})),...[`telegraphAlpha`,`trailAlpha`].map(e=>({path:`charges.${e}`,check:G,describe:`an opacity`})),{path:`graze.radiusMultiplier`,check:G,describe:`a multiple of the contact radius`},{path:`slowMotion.graze.factor`,check:G,describe:`a timescale (1 is no slow at all)`},{path:`slowMotion.graze.slowSeconds`,check:G,describe:`seconds`},{path:`slowMotion.graze.recoverSeconds`,check:G,describe:`seconds`},{path:`slowMotion.pick.factor`,check:G,describe:`a timescale (1 is no slow at all)`},{path:`slowMotion.pick.slowSeconds`,check:G,describe:`seconds`},{path:`slowMotion.pick.recoverSeconds`,check:G,describe:`seconds`},{path:`graze.playerFlash.seconds`,check:G,describe:`seconds`},{path:`graze.playerFlash.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`graze.playerFlash.alpha`,check:G,describe:`an opacity`},{path:`graze.playerFlash.widthRatio`,check:G,describe:`a stroke width ratio`},...Yc(`grazePopups`),{path:`mutation.autoPerSecond`,check:G,describe:`mutation points per second`},...[`absorb`,`drivenOff`,`eaten`,`graze`,`bulletGraze`,`pointBlank`,`defuse`,`boss`].map(e=>({path:`mutation.gain.${e}`,check:G,describe:`mutation points for this event; 0 takes the event out of the economy`})),{path:`mutation.pointBlankRadius`,check:G,describe:`a multiple of the contact radius`},{path:`mutation.bossPointBlankCooldownSeconds`,check:G,describe:`seconds between 贴脸 payouts on a boss; 0 pays every hit`},{path:`mutation.pool.shotgun.rateScale`,check:G,describe:`a multiplier on the firing rate`},{path:`mutation.pool.shotgun.pellets`,check:G,describe:`rounds per stream, on top of one`},{path:`mutation.pool.shotgun.totalSpreadDegrees`,check:G,describe:`degrees`},{path:`mutation.pool.shotgun.pelletsPerPick`,check:G,describe:`rounds`},{path:`mutation.pool.shotgun.closeRangeMeters`,check:G,describe:`metres`},{path:`mutation.pool.shotgun.closeDamagePerPick`,check:G,describe:`a fraction of the damage`},{path:`mutation.pool.shotgun.narrowPerPick`,check:G,describe:`a fraction of the cone`},{path:`mutation.pool.shotgun.narrowFloor`,check:G,describe:`a fraction of the base cone`},{path:`mutation.pool.shotgun.knockbackPerPick`,check:G,describe:`a fraction of the base knockback`},{path:`mutation.pool.rage.plateSecondsPerPick`,check:G,describe:`a fraction of the plate interval`},{path:`mutation.pool.rage.plateSecondsFloor`,check:G,describe:`a fraction of the base interval`},{path:`mutation.pool.rage.plateMaxPerPick`,check:G,describe:`plates`},{path:`mutation.pool.rage.plateMaxCap`,check:G,describe:`plates`},{path:`mutation.pool.rage.breakPerPick`,check:G,describe:`a multiplier on the vulnerability`},{path:`mutation.pool.rage.burnRatePerPick`,check:G,describe:`a multiplier on the aura tick damage`},...Yc(`mutation.callouts`),{path:`mutation.first`,check:G,describe:`the cost of the first level`},{path:`mutation.growth`,check:G,describe:`the per-level cost multiplier`},{path:`mutation.resumeInvulnerableSeconds`,check:G,describe:`seconds`},...[`damagePerPick`,`ragePerPick`,`suctionPerPick`,`eatInvulnSecondsPerPick`,`appetiteTiersPerPick`,`burstRadiusPerPick`,`rageDecayReductionPerPick`,`bulletSpeedPerPick`,`bulletRadiusPerPick`,`bulletRangePerPick`,`sizeDamagePerPick`,`speedDamagePerPick`].map(e=>({path:`mutation.pool.${e}`,check:G,describe:`a per-pick amount`})),{path:`mutation.pool.defensePerPick`,check:G,describe:`defence points`},{path:`mutation.pool.defenseBigPerPick`,check:G,describe:`defence points`},{path:`mutation.gauge.widthRatio`,check:G,describe:`a fraction of the lane width`},{path:`mutation.gauge.height`,check:G,describe:`design pixels`},{path:`mutation.gauge.gap`,check:G,describe:`design pixels`},{path:`mutation.gauge.bossGap`,check:G,describe:`design pixels below the boss bar slot`},{path:`mutation.gauge.radius`,check:G,describe:`design pixels`},{path:`mutation.gauge.trackColour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.trackAlpha`,check:G,describe:`an opacity`},{path:`mutation.gauge.trackStroke`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.trackStrokeAlpha`,check:G,describe:`an opacity`},{path:`mutation.gauge.fillColour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.fillAlpha`,check:G,describe:`an opacity`},{path:`mutation.gauge.readyStroke`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.readyStrokeAlpha`,check:G,describe:`an opacity`},{path:`mutation.gauge.rampStroke`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`mutation.gauge.rampStrokeAlpha`,check:G,describe:`an opacity`},{path:`mutation.gauge.rampStrokeScale`,check:G,describe:`a thickness ratio`},{path:`mutation.gauge.labelSize`,check:G,describe:`a font size`},{path:`mutation.gauge.labelColour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},...Yc(`score.popups`),...Yc(`damagePopups`),{path:`hud.score.x`,check:G,describe:`design pixels`},{path:`hud.score.y`,check:G,describe:`design pixels`},{path:`hud.score.size`,check:G,describe:`a font size`},{path:`hud.score.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.score.alpha`,check:G,describe:`an opacity`},{path:`hud.healthBar.x`,check:G,describe:`design pixels`},{path:`hud.healthBar.y`,check:G,describe:`design pixels`},{path:`hud.healthBar.widthRatio`,check:G,describe:`a fraction of the lane width`},{path:`hud.healthBar.height`,check:G,describe:`design pixels`},{path:`hud.healthBar.trackColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.healthBar.trackAlpha`,check:G,describe:`an opacity`},{path:`hud.healthBar.fillColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.healthBar.fillAlpha`,check:G,describe:`an opacity`},{path:`hud.healthBar.lowColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.healthBar.lowThreshold`,check:G,describe:`a proportion`},{path:`hud.healthBar.borderColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.healthBar.borderAlpha`,check:G,describe:`an opacity`},{path:`hud.healthBar.labelSize`,check:G,describe:`a font size`},{path:`hud.healthBar.labelColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.healthBar.labelGap`,check:G,describe:`design pixels`},{path:`hud.brokenScreen.threshold`,check:G,describe:`a health proportion, where the warning starts`},{path:`hud.brokenScreen.maxThreshold`,check:G,describe:`a health proportion, where the warning maxes out`},{path:`hud.brokenScreen.reachRatio`,check:G,describe:`a fraction of the short screen side`},{path:`hud.brokenScreen.crackCountNear`,check:G,describe:`a crack count`},{path:`hud.brokenScreen.crackCountDeep`,check:G,describe:`a crack count`},{path:`hud.brokenScreen.branchChance`,check:G,describe:`a probability`},{path:`hud.brokenScreen.branchAtRatio`,check:G,describe:`a fraction along the main crack`},{path:`hud.brokenScreen.branchLengthRatio`,check:G,describe:`a length ratio`},{path:`hud.brokenScreen.branchAngleRadians`,check:G,describe:`radians`},{path:`hud.brokenScreen.segmentsPerCrack`,check:G,describe:`a segment count`},{path:`hud.brokenScreen.segmentJitter`,check:G,describe:`a proportion`},{path:`hud.brokenScreen.segmentTurn`,check:G,describe:`radians`},{path:`hud.brokenScreen.width`,check:G,describe:`design pixels`},{path:`hud.brokenScreen.glowWidthRatio`,check:G,describe:`a width multiple`},{path:`hud.brokenScreen.glowAlphaRatio`,check:G,describe:`an opacity proportion`},{path:`hud.brokenScreen.alphaNear`,check:G,describe:`an opacity`},{path:`hud.brokenScreen.alphaDeep`,check:G,describe:`an opacity`},{path:`hud.brokenScreen.seed`,check:G,describe:`a number of 0 or more (0 means re-roll each time)`},{path:`hud.brokenScreen.vignette.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.brokenScreen.vignette.alpha`,check:G,describe:`an opacity`},{path:`hud.brokenScreen.vignette.reachRatio`,check:G,describe:`a fraction of an edge`},{path:`hud.brokenScreen.vignette.pulseHz`,check:G,describe:`pulses per second (0 is steady)`},{path:`hud.brokenScreen.vignette.pulseDepth`,check:G,describe:`a proportion`},{path:`hud.bossBar.y`,check:G,describe:`design pixels`},{path:`hud.bossBar.widthRatio`,check:G,describe:`a fraction of the lane width`},{path:`hud.bossBar.height`,check:G,describe:`design pixels`},{path:`hud.bossBar.nameSize`,check:G,describe:`a font size`},{path:`hud.bossBar.nameOffset`,check:G,describe:`design pixels`},{path:`hud.bossBar.nameColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.fillColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.backColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.backAlpha`,check:G,describe:`an opacity`},{path:`hud.bossBar.borderColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.borderAlpha`,check:G,describe:`an opacity`},{path:`touch.buttonRadius`,check:G,describe:`design pixels`},{path:`touch.buttonMaxRadiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`touch.rightInset`,check:G,describe:`design pixels`},{path:`touch.bottomInset`,check:G,describe:`design pixels`},{path:`touch.buttonGap`,check:G,describe:`design pixels`},{path:`text.fontFamily`,check:e=>typeof e==`string`&&e.trim().length>0,describe:`a CSS font-family list, with a font that has the Chinese glyphs FIRST`},{path:`stages.speedMultiplier`,check:e=>Array.isArray(e)&&e.length>=2&&e.every(e=>typeof e==`number`),describe:`an array of at least two numbers`},{path:`stages.minSpeedMultiplier`,check:G,describe:`a number`},{path:`stages.absorbToStage2`,check:G,describe:`a number of 0 or more`},{path:`stages.absorbToStage3`,check:G,describe:`a number of 0 or more`},{path:`stages.growInvulnerableSeconds`,check:G,describe:`a number of 0 or more`},{path:`stages.appearance`,check:e=>Array.isArray(e)&&e.length>=2&&e.every(e=>typeof e==`object`&&!!e),describe:`an array of at least two stage objects`},{path:`volume.max`,check:G,describe:`a number`},{path:`volume.healthBands`,check:e=>Array.isArray(e)&&e.length>=1&&e.every(e=>typeof e==`object`&&!!e&&typeof e.minRatio==`number`&&typeof e.volume==`number`),describe:`an array of { minRatio, volume } bands, lowest first`},{path:`volume.healthPerVolume`,check:G,describe:`hit points per volume point`},{path:`volume.laneRatio`,check:G,describe:`a small number`},{path:`health.start`,check:G,describe:`hit points`},{path:`health.regenPerSecond`,check:G,describe:`hit points per second`},{path:`health.minDamageRatio`,check:G,describe:`a fraction of the damage`},{path:`health.healPerPick`,check:G,describe:`points`},{path:`health.maxPerPick`,check:G,describe:`points`},{path:`movement.keyboardCrossingSeconds`,check:G,describe:`seconds`},{path:`movement.verticalSpeedScale`,check:G,describe:`a number`},{path:`movement.drag.sensitivity`,check:G,describe:`a displacement multiplier; 1 is finger-for-finger`},{path:`movement.drag.penaltiesApply`,check:e=>typeof e==`boolean`,describe:`true or false; false keeps the drag a strict 1:1 with the finger`},{path:`background.tileScreens`,check:G,describe:`screen heights`},{path:`background.countScale`,check:G,describe:`a multiplier`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&K(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.riseMin`,check:G,describe:`a number`},{path:`background.tileScreens`,check:G,describe:`screen heights`},{path:`background.countScale`,check:G,describe:`a multiplier`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&K(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.riseMax`,check:e=>typeof e==`number`&&e>=tl(`collectables.riseMin`),describe:`at least riseMin`},{path:`background.tileScreens`,check:G,describe:`screen heights`},{path:`background.countScale`,check:G,describe:`a multiplier`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&K(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.riseSpeedExponent`,check:G,describe:`a number`},{path:`background.tileScreens`,check:G,describe:`screen heights`},{path:`background.countScale`,check:G,describe:`a multiplier`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&K(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.wobbleMin`,check:G,describe:`a number of 0 or more`},{path:`background.tileScreens`,check:G,describe:`screen heights`},{path:`background.countScale`,check:G,describe:`a multiplier`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&K(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.wobbleMax`,check:e=>typeof e==`number`&&e>=tl(`collectables.wobbleMin`),describe:`at least wobbleMin`},{path:`hazards.radius`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>typeof e==`number`&&e>.001&&e<=.5),describe:`an object of kind -> radius fraction between 0.001 and 0.5`},{path:`hazards.vent.baseRadiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.vent.jetHalfWidthRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.vent.jetLengthRatio.up`,check:G,describe:`a multiple of the lane width`},{path:`hazards.vent.jetLengthRatio.flat`,check:G,describe:`a multiple of the lane width`},{path:`hazards.vent.jetLengthRatio.down`,check:G,describe:`a multiple of the lane width`},{path:`hazards.vent.diagonalRadians`,check:G,describe:`radians`},{path:`hazards.vent.startDelaySeconds`,check:G,describe:`seconds`},{path:`hazards.vent.periodSeconds`,check:G,describe:`seconds`},{path:`hazards.vent.activeSeconds`,check:G,describe:`seconds`},{path:`hazards.vent.warnSeconds`,check:G,describe:`seconds`},{path:`hazards.vent.plumeColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.vent.glowColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.vent.edgeColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.vent.edgeAlpha`,check:G,describe:`an opacity`},{path:`hazards.vent.art.base`,check:e=>typeof e==`string`,describe:`a picture name`},{path:`hazards.vent.art.flame`,check:e=>typeof e==`string`,describe:`an animation name`},{path:`hazards.vent.flameAlpha`,check:G,describe:`an opacity`},{path:`hazards.vent.flameWidthScale`,check:G,describe:`a multiplier on the collision width`},{path:`hazards.vent.flameLengthScale`,check:G,describe:`a multiplier on the collision length`},{path:`hazards.vent.tipFadeFraction`,check:G,describe:`a fraction of the flame height`},{path:`hazards.vent.artFadeSeconds`,check:G,describe:`seconds`},{path:`hazards.vent.warnLengthFraction`,check:G,describe:`a fraction of the erupting length`},{path:`hazards.vent.warnFlickerHz`,check:G,describe:`cycles per second`},{path:`hazards.vent.warnAlphaMin`,check:G,describe:`an opacity`},{path:`hazards.vent.warnAlphaMax`,check:G,describe:`an opacity`},{path:`hazards.mineral.riseSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.mineral.wobbleAmplitude`,check:G,describe:`a fraction of the lane width`},{path:`hazards.mineral.wobblePeriodSeconds`,check:G,describe:`seconds`},{path:`hazards.mineral.lifeMeters`,check:G,describe:`metres`},{path:`hazards.jelly.climbRatio`,check:G,describe:`a fraction of the current fall speed`},{path:`hazards.jelly.pulse`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>typeof e==`number`&&Number.isFinite(e)&&e>=0),describe:`one speed multiplier per jelly-idle frame (four frames)`},{path:`hazards.shrimp.driftSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.angler.driftFactor`,check:G,describe:`a fraction of the current`},{path:`hazards.angler.lureMeters`,check:G,describe:`metres`},{path:`hazards.angler.telegraphSeconds`,check:G,describe:`seconds`},{path:`hazards.angler.travelSeconds`,check:G,describe:`seconds`},{path:`hazards.angler.cooldownSeconds`,check:G,describe:`seconds`},{path:`hazards.angler.bowRatio`,check:G,describe:`a curve amount from -2 to 2`},{path:`hazards.angler.lureColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.angler.lureRadiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.angler.lurePulsePerSecond`,check:G,describe:`cycles per second`},{path:`hazards.angler.lureOffsetRatio`,check:G,describe:`a multiple of the body radius`},{path:`hazards.zapper.ringRadiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.zapper.ringDamage`,check:G,describe:`hit points`},{path:`hazards.zapper.ringSeconds`,check:G,describe:`seconds`},{path:`hazards.zapper.ringCooldownSeconds`,check:G,describe:`seconds`},{path:`hazards.zapper.dischargesWhenHit`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`hazards.zapper.bellColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.zapper.ringColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.zapper.ringAlpha`,check:G,describe:`an opacity`},{path:`hazards.charge.max`,check:G,describe:`a number`},{path:`hazards.charge.chainAt`,check:G,describe:`a threshold`},{path:`hazards.charge.perRingHit`,check:G,describe:`charge`},{path:`hazards.charge.perSecondNearZapper`,check:G,describe:`charge per second`},{path:`hazards.charge.decayPerSecond`,check:G,describe:`charge per second`},{path:`hazards.charge.nearMeters`,check:G,describe:`metres`},{path:`hazards.charge.chainRangeMeters`,check:G,describe:`metres`},{path:`hazards.charge.chainJumpMeters`,check:G,describe:`metres`},{path:`hazards.charge.chainDamage`,check:G,describe:`hit points`},{path:`hazards.charge.chainMaxTargets`,check:Qc,describe:`a whole number of targets`},{path:`hazards.charge.chainSelfDamage`,check:G,describe:`hit points`},{path:`hazards.charge.bubbleRingColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.charge.bubbleRingWidthRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.charge.burstColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.charge.burstAlpha`,check:G,describe:`an opacity`},{path:`hazards.charge.burstSeconds`,check:G,describe:`seconds`},{path:`hazards.foam.radiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.foam.lifeSeconds`,check:G,describe:`seconds`},{path:`hazards.foam.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.foam.rimColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.foam.alpha`,check:G,describe:`an opacity`},{path:`hazards.foam.rimAlpha`,check:G,describe:`an opacity`},{path:`hazards.rain.fallSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.rain.pushMeters`,check:G,describe:`metres`},{path:`hazards.rain.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.rain.lengthRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.ink.throwSeconds`,check:G,describe:`seconds of flight before the cloud lands`},{path:`hazards.ink.lifeSeconds`,check:G,describe:`seconds the cloud lasts after landing`},{path:`hazards.ink.fadeSeconds`,check:G,describe:`seconds of fade after the life runs out`},{path:`hazards.ink.slowFactor`,check:G,describe:`a multiplier on movement speed inside the cloud`},{path:`hazards.ink.slowRefreshSeconds`,check:G,describe:`seconds the slow outlives the bubble leaving the cloud`},{path:`hazards.ink.throwRadiusRatio`,check:G,describe:`a fraction of the cloud radius`},{path:`hazards.ink.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.ink.rimColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.ink.alpha`,check:G,describe:`an opacity`},{path:`hazards.fallcrate.warnSeconds`,check:G,describe:`seconds of telegraph before the crate is released`},{path:`hazards.fallcrate.fallSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.fallcrate.warnStripHeightRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.fallcrate.warnColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.fallcrate.warnExclamationColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.fallcrate.warnFlashHz`,check:G,describe:`flashes per second`},{path:`hazards.fallcrate.warnAlphaMin`,check:G,describe:`an opacity`},{path:`hazards.fallcrate.warnAlphaMax`,check:G,describe:`an opacity`},{path:`hazards.fallcrate.rotationDegrees`,check:G,describe:`degrees; 45 puts a corner down, 0 falls on a flat face`},{path:`hazards.torpedo.runSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.torpedo.runMeters`,check:G,describe:`metres`},{path:`hazards.torpedo.seekSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.torpedo.seekSeconds`,check:G,describe:`seconds`},{path:`hazards.bombfish.seekSpeedFactor`,check:G,describe:`lane widths per second`},{path:`hazards.bombfish.armMeters`,check:G,describe:`metres`},{path:`hazards.bombfish.fuseSeconds`,check:G,describe:`seconds`},{path:`hazards.bombfish.blastRadiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`hazards.bombfish.blastDamage`,check:G,describe:`hit points`},{path:`hazards.bombfish.blastShakePixels`,check:G,describe:`design pixels; 0 disables the shake`},{path:`hazards.bombfish.blastShakeSeconds`,check:G,describe:`seconds`},{path:`hazards.slowFactor`,check:G,describe:`a number`},{path:`hazards.slowSeconds`,check:G,describe:`a number of 0 or more`},{path:`hazards.health`,check:e=>Gc(e)&&Object.values(e).every(e=>e>=0),describe:`an object of hazard kind to hit points, e.g. { fish: 3, jelly: 0 }; 0 means the bullets pass through`},{path:`pacing.threat`,check:e=>Gc(e)&&Object.values(e).every(e=>e>=0&&e<=3),describe:`an object of spawnable kind to a threat weight, 0-3`},{path:`hazards.hitboxScale`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>typeof e==`number`&&Number.isFinite(e)),describe:`an object of hazard kind to a hitbox multiplier; anything not listed is 1`},{path:`hazards.contactDamage`,check:e=>Gc(e)&&Object.values(e).every(e=>e>=0&&e<=400),describe:`an object of hazard kind to the hit points it costs the player, e.g. { fish: 20, whale: 35 }; defence comes straight out of these`},{path:`hazards.fleeScreensPerSecond`,check:G,describe:`screen heights per second; 0.9 is about a second to leave the screen`},{path:`hazards.fleeAlpha`,check:G,describe:`an opacity for a creature that is leaving`},...[[`spawnSpread`,`a fraction of the lane width, the radius of the cloud a school is born in`],[`neighbourRadius`,`a fraction of the lane width, how far a fish sees its neighbours`],[`separationRadius`,`a fraction of the lane width; closer neighbours push apart`],[`separationAccel`,`lane widths per second squared`],[`alignmentRate`,`per second; how fast velocity is pulled toward the neighbours' average`],[`cohesionAccel`,`lane widths per second squared`],[`leaderReach`,`a fraction of the lane width: only fish this close to the invisible leader feel it`],[`leaderSteer`,`per second; how hard a fish in reach turns toward the leader's velocity`],[`leaderTether`,`a fraction of the lane width: past this distance a weak pull toward the leader begins`],[`tetherAccel`,`lane widths per second squared; the cap on that pull`],[`leaderWaitFloor`,`a share of the leader's own pace, above 0 and at most 1: the slowest it walks while it waits for its school`],[`minSpeed`,`lane widths per second; a school never hovers`],[`maxSpeed`,`lane widths per second`],[`maxAccel`,`lane widths per second squared; the cap on the sum of all four forces`],[`speedJitter`,`a fraction of the leader's speed; 0 makes every fish identical`],[`wobbleAmplitude`,`a fraction of the lane width; 0 disables the snaking`],[`wobbleSeconds`,`seconds, the main period of the snaking`],[`depthRange`,`a fraction of the lane width, the thickness of the school in depth`]].map(([e,t])=>({path:`hazards.boids.${e}`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0,describe:`${t}; 0 or more`})),{path:`hazards.boids.scale`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>0&&e<=2,describe:`a size multiplier above 0, up to 2; 1 is an ordinary fish`},{path:`hazards.boids.depthDim`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction from 0 (no dimming) to 1`},{path:`hazards.boids.depthTint`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},...[[`scaleNear`,`a size multiplier above 0, up to 2: how big a fish at distance 0 is`],[`scaleFar`,`a size multiplier above 0, up to 2: how big a fish at distance 1 is`]].map(([e,t])=>({path:`hazards.boids.back.${e}`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>0&&e<=2,describe:t})),...[[`dimNear`,"a fraction from 0 to 1: how far toward `tint` a fish at distance 0 is"],[`dimFar`,"a fraction from 0 to 1: how far toward `tint` a fish at distance 1 is"]].map(([e,t])=>({path:`hazards.boids.back.${e}`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:t})),{path:`hazards.boids.back.tint`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.boids.neighbours`,check:e=>Qc(e)&&e>=1&&e<=30,describe:`a whole number from 1 to 30: how many of the nearest fish alignment and cohesion listen to`},{path:`hazards.boids.cohesionAcrossRatio`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=1&&e<=20,describe:`a ratio from 1 (round) to 20: how much harder cohesion pulls across the neighbours' heading than along it`},{path:`hazards.boids.leaderAllowAhead`,check:e=>Qc(e)&&e>=0,describe:`a whole number of real fish that may be ahead of the leader before it speeds up to take the front back`},{path:`hazards.boids.leaderCatchUp`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=1&&e<=4,describe:`a multiple from 1 (never speeds up) to 4: the most the leader speeds up, as a multiple of its own pace`},{path:`hazards.boids.leaderWantFish`,check:e=>Qc(e)&&e>=1,describe:`a whole number of real fish the leader needs in reach to walk at full pace`},{path:`hazards.crab.armDistanceMeters`,check:G,describe:`metres of 0 or more; the distance at which the fuse is lit`},{path:`hazards.crab.fuseSeconds`,check:G,describe:`seconds`},{path:`hazards.crab.launchMps`,check:G,describe:`metres per second, 0 or more`},{path:`hazards.crab.apexSeconds`,check:G,describe:`seconds`},{path:`hazards.crab.launchScreenBonus`,check:G,describe:`a multiplier of 0 or more`},{path:`hazards.launchDecaySeconds`,check:G,describe:`seconds`},{path:`hazards.trash.drainPerSecond`,check:G,describe:`hit points per second`},{path:`hazards.trash.drainPerHit`,check:G,describe:`hit points`},{path:`hazards.trash.minGripSeconds`,check:G,describe:`seconds`},{path:`hazards.eel.paralysisSeconds`,check:G,describe:`seconds between 0 and 10; 0 disables the control loss an eel's touch or bolt causes`},{path:`hazards.eel.invertVertical`,check:e=>typeof e==`boolean`,describe:`whether the vertical axis is inverted as well while paralysed`},...[`archer`,`pistol`,`puffer`,`starfish`].map(e=>({path:`hazards.${e}.driftFactor`,check:G,describe:`a multiple of the current; smaller loiters longer`})),{path:`hazards.puffer.countersWhenHit`,check:e=>typeof e==`boolean`,describe:`whether a hit is answered with a ring of spikes`},{path:`hazards.puffer.counterCooldownSeconds`,check:G,describe:`seconds`},{path:`hazards.puffer.spikeCount`,check:Qc,describe:`a whole number of spikes`},{path:`hazards.starfish.volleyCount`,check:Qc,describe:`a whole number of directions`},{path:`hazards.starfish.volleySpinRadians`,check:G,describe:`radians; 0 means the rosette never turns`},{path:`hazards.eel.paralysisColour`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.eel.paralysisWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`hazards.eel.bulletRingRadiusRatio`,check:G,describe:`a multiple of the round radius`},{path:`hazards.invulnerableSeconds`,check:G,describe:`a number of 0 or more`},{path:`consumption.tierVolume`,check:e=>Array.isArray(e)&&e.length>=2&&e.every(e=>typeof e==`number`&&Number.isFinite(e))&&e[0]===0,describe:`an array of volumes, at least two, starting at 0 (index 0 is tier 1)`},{path:`consumption.mass`,check:e=>Gc(e)&&Object.keys(e).length>=1,describe:`an object of hazard kind to mass, e.g. { fish: 0.28, jelly: 0.42 }`},{path:`consumption.edibleAtTier`,check:e=>Gc(e)&&Object.keys(e).length>=1,describe:`an object of hazard kind to the volume tier that can eat it`},{path:`consumption.massEfficiency`,check:G,describe:`a number`},{path:`consumption.bumpDamage`,check:G,describe:`hit points`},{path:`consumption.eatInvulnerableSeconds`,check:G,describe:`a number of 0 or more`},{path:`consumption.marker.edibleColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`consumption.marker.widthRatio`,check:G,describe:`a stroke width ratio`},{path:`consumption.marker.edibleAlpha`,check:G,describe:`an opacity`},{path:`consumption.marker.blockedAlpha`,check:G,describe:`an opacity`},{path:`consumption.marker.showBlocked`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`suction.radiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`suction.radiusPerVolume`,check:G,describe:`fraction of the lane width`},{path:`suction.maxRadiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`suction.pullPerSecond`,check:G,describe:`a number`},{path:`suction.heavyRatio`,check:G,describe:`a ratio`},{path:`suction.heavyFloor`,check:G,describe:`a fraction`},{path:`suction.moveSpeedFactor`,check:G,describe:`a fraction`},{path:`suction.fieldColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`suction.fieldAlpha`,check:G,describe:`an opacity`},{path:`suction.fieldWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`suction.tetherAlpha`,check:G,describe:`an opacity`},{path:`suction.tetherWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`bullets.image`,check:e=>typeof e==`string`,describe:`a file name in src/assets/ without its extension, or an empty string for the drawn dot`},{path:`bullets.imageAlpha`,check:G,describe:`an opacity`},{path:`bullets.imageTint`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`bullets.imageScale`,check:G,describe:`a multiplier`},{path:`bullets.rateTiers`,check:e=>Array.isArray(e)&&e.length>=1&&e.every(e=>typeof e==`number`&&Number.isFinite(e)),describe:`a non-empty list of rounds-per-second values, one per rate tier; the FIRST is what a run starts at`},{path:`bullets.speedStartPerSecond`,check:G,describe:`lane widths per second`},{path:`bullets.accelerationPerSecond`,check:G,describe:`lane widths per second squared`},{path:`bullets.speedMaxPerSecond`,check:G,describe:`lane widths per second`},{path:`bullets.radiusRatio`,check:G,describe:`a fraction of the lane width`},{path:`bullets.radiusGrowthPerSecond`,check:G,describe:`a fraction of the lane width per second`},{path:`bullets.upgradeSpreadRatio`,check:G,describe:`a fraction of the lane width`},{path:`bullets.maxStreams`,check:Qc,describe:`a whole number of gun rows`},{path:`bullets.damage`,check:G,describe:`a number of hit points`},{path:`bullets.lifeSeconds`,check:G,describe:`seconds`},{path:`bullets.alpha`,check:G,describe:`an opacity`},{path:`bullets.rimAlpha`,check:G,describe:`an opacity`},...[`colour`,`rimColour`].map(e=>({path:`bullets.${e}`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`bullets.homing.chance`,check:G,describe:`a probability, 0 to 1`},{path:`bullets.homing.lateralMaxPerSecond`,check:G,describe:`lane widths per second`},{path:`bullets.homing.steerPerSecond`,check:G,describe:`lane widths per second squared`},{path:`bullets.homing.approachPerSecond`,check:G,describe:`a rate, per second`},{path:`bullets.homing.arcPerSecond`,check:G,describe:`lane widths per second squared`},{path:`bullets.homing.rangeMarginMeters`,check:G,describe:`metres`},...[`colour`,`rimColour`,`imageTint`].map(e=>({path:`bullets.homing.${e}`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`hazardArt`,check:e=>typeof e!=`object`||!e||Array.isArray(e)?!1:Object.values(e).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;if(t.front!==void 0&&t.front!==`left`&&t.front!==`right`||t.charge!==void 0&&!$c(t.charge)||t.dead!==void 0&&!$c(t.dead)||t.spriteFlashScale!==void 0&&(typeof t.spriteFlashScale!=`number`||!Number.isFinite(t.spriteFlashScale))||t.spin!==void 0&&(typeof t.spin!=`number`||!Number.isFinite(t.spin))||t.volleyAligned!==void 0&&typeof t.volleyAligned!=`boolean`||t.volleyBaseRadians!==void 0&&(typeof t.volleyBaseRadians!=`number`||!Number.isFinite(t.volleyBaseRadians))||t.facesPlayer!==void 0&&typeof t.facesPlayer!=`boolean`||t.fixedFacing!==void 0&&typeof t.fixedFacing!=`boolean`||t.attackSeconds!==void 0&&(typeof t.attackSeconds!=`number`||!Number.isFinite(t.attackSeconds)))return!1;let n=t.variants;if(n!==void 0){if(!Array.isArray(n)||n.length===0||t.move!==void 0||t.scale!==void 0||!n.every(e=>e&&typeof e==`object`&&$c(e.move)&&typeof e.scale==`number`&&Number.isFinite(e.scale)))return!1}else if(!$c(t.move)||typeof t.scale!=`number`||!Number.isFinite(t.scale))return!1;return typeof t.alpha==`number`&&Number.isFinite(t.alpha)}),describe:`an object of kind -> { move, scale } or { variants: [{ move, scale }], and either way charge?, attack?, dead?, front?, spriteFlashScale?, spin?, volleyAligned?, volleyBaseRadians?, attackSeconds?, alpha, lure? }, where each state is a picture name or an animation`},{path:`animations`,check:e=>el(e),describe:'an object of animation name -> { frames, count?, framesPerSecond, maxSeconds, once? }; `frames` is a "{n}" pattern plus `count`, or a list of picture names'},{path:`hazardFront`,check:e=>e===`left`||e===`right`,describe:`"left" or "right": which way round a creature with a picture counts as facing`},{path:`hazardFacing.cooldownSeconds`,check:G,describe:`seconds; 0 lets a creature turn every frame`},{path:`hazardFacing.turnSeconds`,check:G,describe:`seconds; 0 turns instantly with no animation`},{path:`angry.look.inner`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},...Kc(`hazards.boss`),...qc().flatMap(e=>Kc(`hazards.bosses.${e}`,Jc().includes(e))),{path:`hazards.bossSkills`,check:e=>{if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=tl(`hazards.bosses`),n=t&&typeof t==`object`&&!Array.isArray(t)?t:{};return Object.entries(e).every(([e,t])=>{if(!(e in n)||typeof t!=`object`||!t||Array.isArray(t))return!1;let r=t;return typeof r.ringCount==`number`&&Number.isFinite(r.ringCount)&&typeof r.ringRotationRadians==`number`&&Number.isFinite(r.ringRotationRadians)})},describe:`an object of boss kind -> { ringCount, ringRotationRadians }; only bosses that use the three-skill set appear here`},{path:`chargeTrail.image`,check:e=>typeof e==`string`,describe:`a file name in src/assets/ without its extension, or an empty string to disable it`},{path:`chargeTrail.columns`,check:Qc,describe:`whole columns`},{path:`chargeTrail.rows`,check:Qc,describe:`whole rows`},{path:`chargeTrail.count`,check:Qc,describe:`whole bubbles`},{path:`chargeTrail.spread`,check:G,describe:`a multiple`},{path:`chargeTrail.jitter`,check:G,describe:`radians of jitter`},{path:`chargeTrail.scaleVariance`,check:G,describe:`a fraction`},{path:`chargeTrail.sizeFalloff`,check:G,describe:`a fraction`},{path:`chargeTrail.behindFactor`,check:G,describe:`a multiple`},{path:`chargeTrail.frameSeconds`,check:G,describe:`seconds per frame`},{path:`chargeTrail.sizeRatio`,check:G,describe:`a lane fraction`},{path:`chargeTrail.alpha`,check:G,describe:`an opacity`},{path:`particles.maxParticles`,check:G,describe:`a count`},{path:`particles.hitCount`,check:G,describe:`a count`},{path:`particles.hitSpeed`,check:G,describe:`metres per second`},{path:`particles.hitLife`,check:G,describe:`seconds`},{path:`particles.hitSize`,check:G,describe:`metres`},{path:`particles.defeatCount`,check:G,describe:`a count`},{path:`particles.defeatSpeed`,check:G,describe:`metres per second`},{path:`particles.defeatLife`,check:G,describe:`seconds`},{path:`particles.defeatSize`,check:G,describe:`metres`},{path:`particles.defeatColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`particles.defeatJitter`,check:G,describe:`radians of jitter`},{path:`particles.drag`,check:G,describe:`a per-frame retention`},{path:`particles.descentSpeed`,check:G,describe:`metres per second`},{path:`explosions.seconds`,check:G,describe:`seconds`},{path:`explosions.strokeColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`explosions.strokeAlpha`,check:G,describe:`an opacity`},{path:`explosions.strokeStartRatio`,check:G,describe:`a multiple of the blast radius`},{path:`explosions.strokeEndRatio`,check:G,describe:`a multiple of the blast radius`},{path:`explosions.strokeWidthRatio`,check:G,describe:`a stroke width as a fraction of the radius`},{path:`explosions.coreColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`explosions.coreAlpha`,check:G,describe:`an opacity`},{path:`explosions.coreStartRatio`,check:G,describe:`a multiple of the blast radius`},{path:`explosions.coreEndRatio`,check:G,describe:`a multiple of the blast radius`},{path:`loading.scrimColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.scrimAlpha`,check:G,describe:`an opacity`},{path:`loading.trackColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.barColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.barHeight`,check:G,describe:`design pixels`},{path:`loading.maxWidth`,check:G,describe:`design pixels`},{path:`loading.label`,check:e=>typeof e==`string`,describe:`a string`},{path:`loading.titleSize`,check:G,describe:`a font size`},{path:`loading.titleColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.textColour`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.textSize`,check:G,describe:`a font size`},{path:`loading.lineHeight`,check:G,describe:`a line height design pixels`},{path:`loading.gapTitle`,check:G,describe:`design pixels`},{path:`loading.gapBar`,check:G,describe:`design pixels`},{path:`loading.gapStats`,check:G,describe:`design pixels`},{path:`loading.speedWindowSeconds`,check:G,describe:`seconds that the reported rate is averaged over`},{path:`loading.musicLabel`,check:e=>typeof e==`string`,describe:`a string`},{path:`loading.minSeconds`,check:G,describe:`seconds`},{path:`loading.bootTimeoutSeconds`,check:G,describe:`seconds`},{path:`hitFlash.seconds`,check:G,describe:`seconds`},{path:`hitFlash.peakIntensity`,check:G,describe:`an intensity; 0 disables the full-body flash`},{path:`hitFlash.riseFraction`,check:G,describe:`a fraction of the flash spent rising to its peak`},{path:`hitFlash.cooldownSeconds`,check:G,describe:`seconds; 0 lets every hit restart the flash`},{path:`hitFlash.colour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`hitFlash.alpha`,check:G,describe:`an opacity`},{path:`hitFlash.radiusScale`,check:G,describe:`a multiplier`},{path:`hitFeedback.critDamage`,check:G,describe:`damage at which a hit counts as critical`},{path:`hitFeedback.critOutlineColour`,check:K,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`hitFeedback.critOutlineAlpha`,check:G,describe:`an opacity`},{path:`hitFeedback.critOutlineRadiusScale`,check:G,describe:`a multiple of the body radius`},{path:`hitFeedback.critOutlineWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`hitFeedback.critOutlineSeconds`,check:G,describe:`seconds`},{path:`hitFeedback.critShakePixels`,check:G,describe:`design pixels; 0 disables the critical hit shake`},{path:`hitFeedback.critShakeSeconds`,check:G,describe:`seconds`},{path:`hitKnockback.meters`,check:G,describe:`metres of recoil per landed hit; 0 turns the knockback off`},{path:`hitKnockback.seconds`,check:G,describe:`seconds, over which the recoil is spent`},{path:`playerBubble.image`,check:e=>typeof e==`string`,describe:`a file name in src/assets/ without its extension, or an empty string for the drawn bubble`},{path:`playerBubble.imageAlpha`,check:G,describe:`an opacity`},{path:`playerBubble.imageTint`,check:K,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`playerBubble.imageRotation`,check:G,describe:`degrees`},{path:`playerBubble.imageScale`,check:G,describe:`a multiplier`},{path:`playerBubble.keepDetails`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`collectableArt.pictures`,check:e=>Array.isArray(e)&&e.length>0&&e.every(e=>typeof e==`string`),describe:`a non-empty list of file names in src/assets/ without their extensions`},{path:`collectableArt.smallRatio`,check:G,describe:`a multiple of the player radius`},{path:`collectableArt.largeRatio`,check:G,describe:`a multiple of the player radius`},{path:`collectableArt.imageScale`,check:G,describe:`a multiplier`},{path:`routePick.backdropColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.backdropAlpha`,check:G,describe:`an opacity`},{path:`routePick.headingColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.headingSize`,check:G,describe:`a font size`},{path:`routePick.subheadingColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.subheadingSize`,check:G,describe:`a font size`},{path:`routePick.nameColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.nameSize`,check:G,describe:`a font size`},{path:`routePick.titleColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.titleSize`,check:G,describe:`a font size`},{path:`routePick.mutedColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.blurbSize`,check:G,describe:`a font size`},{path:`routePick.lockColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.lockSize`,check:G,describe:`a font size`},{path:`routePick.lockedAlpha`,check:G,describe:`an opacity`},{path:`routePick.cardHeight`,check:G,describe:`design pixels`},{path:`routePick.cardGap`,check:G,describe:`design pixels`},{path:`routePick.cardRadius`,check:G,describe:`design pixels`},{path:`routePick.maxWidthRatio`,check:G,describe:`a fraction of the canvas`},{path:`routePick.maxWidth`,check:G,describe:`design pixels`},{path:`routePick.topMargin`,check:G,describe:`design pixels`},{path:`routePick.headingGap`,check:G,describe:`design pixels`},{path:`routePick.subheadingGap`,check:G,describe:`design pixels`},{path:`routePick.cardFillColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.cardAlpha`,check:G,describe:`an opacity`},{path:`routePick.cardStrokeColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.cardStrokeWidth`,check:G,describe:`design pixels`},{path:`routePick.selectedStrokeColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`routePick.selectedStrokeWidth`,check:G,describe:`design pixels`},{path:`menu.buttonHeight`,check:G,describe:`the shared height of the stones, in design pixels`},{path:`menu.buttonGap`,check:G,describe:`design pixels`},{path:`menu.buttonPressDrop`,check:G,describe:`design pixels`},{path:`menu.groupCentreRatio`,check:G,describe:`a fraction of the screen height`},{path:`menu.titleWidthRatio`,check:G,describe:`a fraction of the lane width`},{path:`menu.titleAspect`,check:G,describe:`width divided by height of the title picture`},{path:`menu.titleButtonGap`,check:G,describe:`design pixels`},{path:`menu.intro.titleSeconds`,check:G,describe:`seconds`},{path:`menu.intro.buttonSeconds`,check:G,describe:`seconds`},{path:`menu.intro.buttonStaggerSeconds`,check:G,describe:`seconds`},...[[`minAlive`,`a count of creatures`],[`maxAlive`,`a count of creatures`],[`spawnGapSeconds`,`seconds`],[`speedMin`,`screen widths per second`],[`speedMax`,`screen widths per second`],[`driftRatio`,`a fraction of the horizontal speed`],[`turnEverySeconds`,`seconds`],[`fishTurnEverySeconds`,`seconds`],[`turnBand`,`a fraction of the screen width`],[`burstScale`,`a speed multiple`],[`burstSeconds`,`seconds at full speed`],[`burstFallSeconds`,`seconds spent slowing back down`],[`burstEverySeconds`,`seconds`],[`creatureScale`,`a size multiple`],[`creatureAlpha`,`an opacity`],[`schoolChance`,`a probability`],[`schoolMin`,`a count of creatures`],[`schoolMax`,`a count of creatures`],[`fishSchoolChance`,`a probability`],[`fishSchoolMin`,`a count of creatures`],[`fishSchoolMax`,`a count of creatures`],[`fishChance`,`a probability`],[`crawlerSpeedScale`,`a speed multiple`],[`crawlerBandTop`,`a fraction of the screen height`],[`backCoralCount`,`a count of corals`],[`backCoralHalfWidth`,`a fraction of the screen width`],[`backCoralBottom`,`a fraction of the screen height; negative is below the edge`],[`frontCoralCount`,`a count of corals`],[`frontCoralHalfWidth`,`a fraction of the screen width`],[`frontCoralBottom`,`a fraction of the screen height; negative is below the edge`],[`exitSeconds`,`seconds`],[`fadeSeconds`,`seconds`]].map(([e,t])=>({path:`menu.backdrop.${e}`,check:G,describe:t})),{path:`menu.backdrop.loners`,check:e=>Array.isArray(e)&&e.every(e=>typeof e==`string`),describe:`a list of hazard kind names that never arrive in a batch`},{path:`menu.lighting.glowColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`menu.lighting.beamColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`menu.lighting.darknessColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},...[[`glowCentreY`,`a fraction of the screen height; negative is above the top`],[`glowRadius`,`a fraction of the screen`],[`glowAlpha`,`an opacity`],[`glowMidOffset`,`a fraction along the gradient`],[`glowMidAlpha`,`an opacity`],[`glowPulse`,`a fraction of the base brightness`],[`glowDrift`,`a fraction of the screen height`],[`glowSeconds`,`seconds`],[`beamCount`,`a count of beams`],[`beamWidth`,`a fraction of the lane width`],[`beamHeight`,`a fraction of the screen height`],[`beamTop`,`a fraction of the screen height; negative is above the top`],[`beamFirstX`,`a fraction of the lane width`],[`beamSpread`,`a fraction of the lane width`],[`beamLean`,`radians`],[`beamPitch`,`radians`],[`beamNarrow`,`a fraction of the beam width`],[`beamAlpha`,`an opacity`],[`beamFadeMidOffset`,`a fraction along the beam`],[`beamFadeMidAlpha`,`a fraction`],[`beamSway`,`radians`],[`beamSwaySeconds`,`seconds`],[`beamWidthSeconds`,`seconds`],[`beamDrift`,`a fraction of the lane width`],[`beamDriftSeconds`,`seconds`],[`beamPulse`,`an opacity`],[`beamPulseSeconds`,`seconds`],[`darknessTopAlpha`,`an opacity`],[`darknessMidOffset`,`a fraction of the screen height`],[`darknessMidAlpha`,`an opacity`]].map(([e,t])=>({path:`menu.lighting.${e}`,check:G,describe:t})),{path:`menu.water.motes.colour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`menu.water.bubbles.tint`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},...[[`count`,`a count of specks`],[`size`,`a fraction of the lane width`],[`sizeVariance`,`a fraction of the size`],[`speed`,`screen heights per second`],[`speedVariance`,`a fraction of the speed`],[`drift`,`a fraction of the lane width per second`],[`baseAlpha`,`an opacity; the speck with no light on it`],[`litAlpha`,`an opacity; what the brightest light adds`],[`fadeEdge`,`a fraction of the screen height`]].map(([e,t])=>({path:`menu.water.motes.${e}`,check:G,describe:t})),...[[`vents`,`a count of vents`],[`perStringMin`,`a count of bubbles`],[`perStringMax`,`a count of bubbles`],[`everySeconds`,`seconds`],[`everyJitter`,`a fraction of the interval`],[`gap`,`a fraction of the screen height`],[`size`,`the largest bubble's diameter, as a fraction of the lane width`],[`speed`,`screen heights per second`],[`speedJitter`,`a fraction of the speed`],[`accel`,`a multiple per second`],[`sway`,`a fraction of the lane width`],[`swayJitter`,`a fraction of the swell`],[`swaySeconds`,`seconds`],[`swaySecondsJitter`,`a fraction of the period`],[`fadeEdge`,`a fraction of the screen height`],[`nearAlpha`,`an opacity; the nearest vent`],[`farAlpha`,`an opacity; the furthest vent`]].map(([e,t])=>({path:`menu.water.bubbles.${e}`,check:G,describe:t})),...[[`everySeconds`,`seconds`],[`everyJitter`,`a fraction of the interval`],[`size`,`the largest bubble's diameter, as a fraction of the screen width`],[`speed`,`screen heights per second`],[`speedJitter`,`a fraction of the speed`],[`accel`,`a multiple per second`],[`growSeconds`,`seconds`],[`sway`,`a fraction of the screen width`],[`swayJitter`,`a fraction of the swell`],[`swaySeconds`,`seconds`],[`swaySecondsJitter`,`a fraction of the period`],[`alpha`,`an opacity`]].map(([e,t])=>({path:`menu.uiBubbles.${e}`,check:G,describe:t})),{path:`menu.uiBubbles.tint`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},...[[`tileWidth`,`design pixels`],[`driftX`,`a fraction of the box width per second`],[`driftY`,`a fraction of the box height per second`],[`crossDriftX`,`a fraction of the box width per second`],[`crossDriftY`,`a fraction of the box height per second`],[`alpha`,`an opacity`],[`crossAlpha`,`a fraction of the first layer's opacity`],[`axisDegrees`,`degrees from the horizontal`],[`crossAxisDegrees`,`degrees from the horizontal`]].map(([e,t])=>({path:`menu.caustics.${e}`,check:G,describe:t})),{path:`menu.caustics.lightColor`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`menu.caustics.warpAmount`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=.2,describe:`a fraction of a tile, 0 to 0.2: how far the flow warp moves a point (0 turns it off)`},{path:`menu.caustics.warpWavelength`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=.05&&e<=2,describe:`a fraction of a tile, 0.05 to 2: the wavelength of the warp ripples`},{path:`menu.caustics.warpSeconds`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=.5&&e<=120,describe:`seconds, 0.5 to 120: how long a warp phase takes to go round`},{path:`menu.caustics.breatheAmount`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=.8,describe:`a fraction, 0 to 0.8: how far the breathing stretch pulls (0 turns it off)`},{path:`menu.caustics.breatheSeconds`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=.5&&e<=120,describe:`seconds, 0.5 to 120: one breath of the stretch`},{path:`menu.caustics.crossSpeedRatio`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>0&&e<=4,describe:`a ratio above 0, up to 4: the second layer's deformation rate as a share of the first's`},...[[`perRow`,`how many pills fit on a row`],[`maxRowWidthRatio`,`a fraction of the panel content width`],[`rowHeight`,`design pixels`],[`radius`,`a corner radius`],[`rowGap`,`design pixels`],[`textSize`,`a font size`]].map(([e,t])=>({path:`settings.levels.${e}`,check:G,describe:t})),...[`selectedFill`,`selectedStroke`,`selectedTextColour`,`idleFill`,`idleStroke`,`idleTextColour`].map(e=>({path:`settings.levels.${e}`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`settings.growth.panelMaxHeightRatio`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=.5&&e<=1,describe:`a fraction of the screen height, 0.5 to 1`},{path:`settings.growth.windowMaxHeight`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=40,describe:`design pixels, at least 40`},{path:`settings.growth.windowMinHeight`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=40,describe:`design pixels, at least 40`},...[[`headingSize`,`a font size`],[`statSize`,`a font size`],[`nameSize`,`a font size`],[`blurbSize`,`a font size`],[`blurbGap`,`design pixels`],[`lineGap`,`design pixels`],[`groupGap`,`design pixels`]].map(([e,t])=>({path:`settings.growth.${e}`,check:G,describe:t})),...il.map(e=>({path:`settings.growth.${e}`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`settings.growth.emptyText`,check:e=>typeof e==`string`&&e.length>0,describe:`a non-empty string`},{path:`audio.clearSting.notes`,check:e=>Array.isArray(e)&&e.length>=1&&e.every(e=>typeof e==`number`&&Number.isFinite(e)),describe:`a non-empty list of semitone offsets from the track root`},{path:`audio.clearSting.gapSeconds`,check:G,describe:`seconds`},{path:`audio.clearHoldSeconds`,check:G,describe:`seconds`},{path:`audio.ascendScreensPerSecond`,check:G,describe:`screen heights per second`},{path:`summary.maxWidth`,check:G,describe:`design pixels`},{path:`summary.maxHeight`,check:G,describe:`design pixels`},{path:`summary.scoreSize`,check:G,describe:`a font size`},{path:`summary.scoreColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.lineSize`,check:G,describe:`a font size`},{path:`summary.lineColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.panelColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.panelRimColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.scrimColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.scrimAlpha`,check:G,describe:`an opacity`},{path:`summary.buttonColour`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.buttonLabel`,check:e=>typeof e==`string`&&e.length>=1,describe:`a non-empty label`},{path:`audio.bossWarnSeconds`,check:G,describe:`seconds`},{path:`audio.lowHealthFraction`,check:G,describe:`a fraction, 0..1`},{path:`audio.lowHealthIntervalSeconds`,check:G,describe:`seconds`},{path:`audio.sfx.panWidth`,check:G,describe:`a fraction, 0..1`},{path:`audio.sfx.maxVoices`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1,describe:`a whole number of voices`},{path:`audio.sfx.buses`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Fc.every(t=>typeof e[t]==`number`),describe:`an object with a level for each of ${Fc.join(`, `)}`},{path:`audio.sfx.sounds`,check:e=>{if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=e;if(Ic.some(e=>!(e in t))||Object.keys(t).some(e=>!Ic.includes(e)))return!1;let n=e=>e===void 0||typeof e==`number`&&Number.isFinite(e),r=[`sine`,`square`,`sawtooth`,`triangle`],i=[`bandpass`,`lowpass`,`highpass`];return Object.values(t).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.label!=`string`||!Fc.includes(t.bus)||![t.gap,t.gain,t.fileGain,t.pitchJitter,t.pitchPerIntensity,t.gainPerIntensity].every(n)||!Array.isArray(t.layers)||t.layers.length<1?!1:t.layers.every(e=>{if(!e||typeof e!=`object`)return!1;let t=e;return typeof t.hz!=`number`||t.hz<=0||typeof t.seconds!=`number`||t.seconds<=0||typeof t.gain!=`number`||![t.endRatio,t.delay,t.attack].every(n)?!1:t.type===`tone`?(t.wave===void 0||r.includes(t.wave))&&n(t.vibratoHz)&&n(t.vibratoDepth):t.type===`noise`&&(t.filter===void 0||i.includes(t.filter))&&n(t.q)})})},describe:`an object of sound id to a recipe ({ label, bus, layers: [...] }) with a row for EVERY id in src/soundIds.ts`},{path:`audio.music.volume`,check:G,describe:`a level`},{path:`audio.music.menu.volume`,check:G,describe:`a level, 0..1`},{path:`audio.music.recorded.fadeInSeconds`,check:G,describe:`seconds`},{path:`audio.music.recorded.leaveFadeSeconds`,check:G,describe:`seconds`},{path:`audio.music.recorded.loopFadeSeconds`,check:G,describe:`seconds`},{path:`audio.music.recorded.holdFadeSeconds`,check:G,describe:`seconds`},{path:`audio.music.recorded.menuVolume`,check:G,describe:`a level, 0..1`},{path:`audio.music.recorded.levelVolume`,check:G,describe:`a level, 0..1`},{path:`audio.music.recorded.bossVolume`,check:G,describe:`a level, 0..1`},{path:`audio.music.recorded.summaryVolume`,check:G,describe:`a level, 0..1`},{path:`audio.music.tracks`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e,n=e=>e===`sine`||e===`square`||e===`sawtooth`||e===`triangle`;return typeof t.rootHz==`number`&&t.rootHz>20&&t.rootHz<2e3&&typeof t.stepPerMinute==`number`&&t.stepPerMinute>4&&t.stepPerMinute<=600&&typeof t.stepsPerChord==`number`&&Number.isInteger(t.stepsPerChord)&&t.stepsPerChord>=1&&t.stepsPerChord<=32&&Array.isArray(t.chords)&&t.chords.length>=1&&t.chords.every(e=>Array.isArray(e)&&e.length>=1&&e.every(e=>typeof e==`number`))&&Array.isArray(t.pattern)&&t.pattern.length>=1&&t.pattern.every(e=>typeof e==`number`&&Number.isInteger(e))&&n(t.wave)&&n(t.padWave)&&typeof t.arpGain==`number`&&t.arpGain>=0&&t.arpGain<=1&&typeof t.padGain==`number`&&t.padGain>=0&&t.padGain<=1&&typeof t.noteSeconds==`number`&&t.noteSeconds>.02&&t.noteSeconds<=8&&typeof t.cutoffHz==`number`&&t.cutoffHz>=80&&t.cutoffHz<=12e3&&typeof t.detuneCents==`number`&&Math.abs(t.detuneCents)<=100}),describe:`an object of level id to a music recipe (rootHz, stepPerMinute, stepsPerChord, chords, pattern, wave, padWave, arpGain, padGain, noteSeconds, cutoffHz, detuneCents)`},{path:`audio.ambientVolume`,check:G,describe:`a level`},{path:`audio.musicVolume`,check:G,describe:`an opacity-like level`},{path:`audio.bulletHitVolume`,check:G,describe:`a level; 0 mutes the bullet hit`},{path:`audio.bulletFireVolume`,check:G,describe:`a level; 0 mutes the shot`},{path:`obstacles.contactDamage`,check:G,describe:`hit points`},{path:`obstacles.health`,check:e=>Gc(e)&&Object.keys(e).length>=1,describe:`an object of obstacle kind to hit points`},{path:`obstacles.radius`,check:e=>Gc(e)&&Object.keys(e).length>=1,describe:`an object of obstacle kind to a radius fraction`},{path:`obstacles.ramVolume`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.entries(e).every(([,e])=>e===null||typeof e==`number`&&Number.isFinite(e)),describe:`an object of obstacle kind to a volume, or to null for "cannot be rammed at all"`},{path:`obstacles.minGapFraction`,check:G,describe:`a fraction`},{path:`obstacles.ramVolumeThreshold`,check:G,describe:`a volume of 0 or more`},{path:`obstacles.ramDamagePerVolume`,check:G,describe:`a number`},{path:`obstacles.collideInvulnerableSeconds`,check:G,describe:`a number of 0 or more`},{path:`obstacles.netDrag`,check:G,describe:`a speed multiplier`},{path:`obstacles.netDragSeconds`,check:G,describe:`a number of 0 or more`},{path:`obstacles.crateColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.crateRimColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.coralColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.coralRimColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.wallColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.wallRimColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.netColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.netRimColor`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.tubeColor`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.tubeRimColor`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.netMesh`,check:Qc,describe:`a whole number of mesh lines`},{path:`obstacles.crackWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`obstacles.damagedDarken`,check:G,describe:`a fraction`},{path:`obstacles.art`,check:e=>typeof e!=`object`||!e||Array.isArray(e)?!1:Object.values(e).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return!Array.isArray(t.variants)||t.variants.length===0||!t.variants.every(e=>e&&typeof e==`object`&&typeof e.image==`string`&&e.image.length>0&&typeof e.scale==`number`&&Number.isFinite(e.scale))?!1:typeof t.alpha==`number`&&Number.isFinite(t.alpha)&&typeof t.swayDegrees==`number`&&Number.isFinite(t.swayDegrees)&&typeof t.swaySeconds==`number`&&Number.isFinite(t.swaySeconds)}),describe:`an object of obstacle kind -> { variants: [{ image, scale }], alpha, swayDegrees, swaySeconds }; each obstacle picks one variant by its own id`},{path:`emergence.fishPerceptionBaseMeters`,check:G,describe:`a number`},{path:`emergence.fishPerceptionPerVolume`,check:G,describe:`a number of 0 or more`},{path:`emergence.fishFeedToSplit`,check:G,describe:`2 or more, or nothing would ever split`},{path:`emergence.fishHardCap`,check:G,describe:`1 or more`},{path:`emergence.seekBiggestRangeMeters`,check:G,describe:`a number`},{path:`spawning.enterSpeedMps`,check:G,describe:`a number`},{path:`spawning.offscreenMarginRatio`,check:G,describe:`a fraction`},{path:`spawning.bottomMarginRatio`,check:G,describe:`a fraction`},{path:`spawning.insideMarginRatio`,check:G,describe:`a fraction`},{path:`spawning.entryDepth`,check:G,describe:`a fraction`},{path:`angry.rage.max`,check:G,describe:`a number`},{path:`angry.rage.perHit`,check:G,describe:`a number, or no hit would ever matter`},{path:`angry.rage.decayPerSecond`,check:G,describe:`a number of 0 or more`},{path:`angry.rage.decayDelaySeconds`,check:G,describe:`a number of 0 or more`},{path:`angry.armour.secondsPerPlate`,check:G,describe:`seconds`},{path:`angry.armour.max`,check:G,describe:`a plate count`},{path:`angry.armour.damage`,check:G,describe:`hit points`},{path:`angry.armour.vulnerableMultiplier`,check:G,describe:`a damage multiplier`},{path:`angry.armour.vulnerableSeconds`,check:G,describe:`seconds`},{path:`angry.armour.obstacleDamage`,check:G,describe:`a number`},{path:`angry.armour.breaksUnrammable`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`angry.aura.playerRadiusRadii`,check:G,describe:`a multiple of the player radius`},{path:`angry.aura.tickSeconds`,check:G,describe:`seconds`},{path:`angry.aura.damagePerTick`,check:G,describe:`hit points`},{path:`angry.burst.radiusBaseRatio`,check:G,describe:`a fraction of the lane`},{path:`angry.burst.radiusMaxRatio`,check:G,describe:`a fraction of the lane`},{path:`angry.burst.obstacleDamage`,check:G,describe:`a number`},{path:`angry.burst.knockbackMeters`,check:G,describe:`a number`},{path:`angry.burst.pushImpact`,check:G,describe:`a number`},{path:`angry.burst.hazardMode`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>e===`destroy`||e===`push`),describe:`an object of hazard kind to "destroy" or "push"`},{path:`angry.burst.waveSeconds`,check:G,describe:`a number`},{path:`angry.burst.waveWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`angry.burst.waveColour`,check:e=>K(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`angry.gauge.widthRatio`,check:G,describe:`a fraction of the lane`},{path:`angry.gauge.height`,check:G,describe:`design pixels`},{path:`angry.gauge.gap`,check:G,describe:`design pixels`},{path:`angry.gauge.radius`,check:G,describe:`a corner radius`},{path:`angry.gauge.trackAlpha`,check:G,describe:`an opacity`},{path:`angry.gauge.trackStrokeAlpha`,check:G,describe:`an opacity`},{path:`angry.gauge.fillAlpha`,check:G,describe:`an opacity`},{path:`angry.gauge.tickAlpha`,check:G,describe:`an opacity`},{path:`angry.gauge.tickWidth`,check:G,describe:`a stroke width`},...[`trackColour`,`trackStroke`,`tickColour`].map(e=>({path:`angry.gauge.${e}`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`angry.look.radius`,check:G,describe:`a multiplier`},{path:`angry.look.innerAlpha`,check:G,describe:`an opacity`},{path:`angry.look.rimAlpha`,check:G,describe:`an opacity`},{path:`angry.look.rimWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`angry.look.glowInnerAlpha`,check:G,describe:`an opacity`},{path:`angry.look.glowInnerRadiusRatio`,check:G,describe:`a radius ratio`},{path:`angry.look.innerRing`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`angry.look.innerRingAlpha`,check:G,describe:`an opacity`},{path:`angry.look.innerRingWidthRatio`,check:G,describe:`a stroke width ratio`},{path:`angry.look.sheenAlpha`,check:G,describe:`an opacity`},{path:`angry.look.specularAlpha`,check:G,describe:`an opacity`},...[[`width`,`design pixels`],[`alpha`,`an opacity`],[`dashLength`,`design pixels`],[`dashGap`,`design pixels`]].map(([e,t])=>({path:`debug.${e}`,check:G,describe:t})),...[`creatureColour`,`environmentColour`,`obstacleColour`,`playerBulletColour`,`enemyBulletColour`,`playerColour`,`grazeColour`].map(e=>({path:`debug.${e}`,check:K,describe:`a colour, either 0xrrggbb or "#rrggbb"`}))],sl=[{path:`angry.appearance`,by:`RAGE_APPEARANCE_RULES, key by key`}];function cl(e,t,n){if(!(typeof e==`object`&&e&&!Array.isArray(e)&&Object.keys(e).length>0)){n.push(t);return}for(let[r,i]of Object.entries(e))cl(i,t?`${t}.${r}`:r,n)}(typeof nl!=`object`||!nl)&&W(`the top level must be an object`);for(let e of ol){let t=tl(e.path);t===void 0&&W(`"${e.path}" is missing. It should be ${e.describe}.`),e.check(t)||W(`"${e.path}" is ${JSON.stringify(t)}, but it should be ${e.describe}.`)}{let e=ol.map(e=>e.path),t=t=>{let n=e=>t===e||t.startsWith(`${e}.`);return e.some(n)||sl.some(e=>n(e.path))},n=[];cl(nl,``,n);let r=n.filter(e=>!t(e));r.length&&W(`${r.length} value(s) in the file are validated by nothing: ${r.join(`, `)}. Every knob needs a rule in REQUIRED (so a bad value names itself), or an entry in VALIDATED_AS_A_WHOLE saying which pass does check it. An unvalidated key is a key that silently does nothing when it is misspelled.`)}var q=nl;for(let e of[`health`,`radius`]){let t=Object.keys(q.obstacles[e]).sort(),n=[...al].sort(),r=n.filter(e=>!t.includes(e)),i=t.filter(e=>!n.includes(e));(r.length||i.length)&&W(`obstacles.${e} must have exactly one row per obstacle kind`+(r.length?`; missing: ${r.join(`, `)}`:``)+(i.length?`; not a kind: ${i.join(`, `)}`:``))}{let e=Object.keys(q.obstacles.ramVolume).filter(e=>!al.includes(e));e.length&&W(`obstacles.ramVolume names kinds that do not exist: ${e.join(`, `)}`)}{let e=al.filter(e=>!(e in zc)),t=Object.keys(zc).filter(e=>!al.includes(e));(e.length||t.length)&&W(`soundIds.OBSTACLE_BREAK_SOUNDS must have exactly one cue per obstacle kind`+(e.length?`; missing: ${e.join(`, `)}`:``)+(t.length?`; not a kind: ${t.join(`, `)}`:``))}var ll=Object.keys(q.consumption.mass).sort(),ul=Object.keys(q.consumption.edibleAtTier).sort();if(ll.join(`,`)!==ul.join(`,`)){let e=ll.filter(e=>!ul.includes(e)),t=ul.filter(e=>!ll.includes(e));W(`consumption.mass and consumption.edibleAtTier must list the same hazard kinds`+(e.length?`; missing from edibleAtTier: ${e.join(`, `)}`:``)+(t.length?`; missing from mass: ${t.join(`, `)}`:``))}for(let[e,t]of Object.entries(q.consumption.edibleAtTier))(t<1||t>q.consumption.tierVolume.length)&&W(`consumption.edibleAtTier.${e} is ${t}, but consumption.tierVolume defines only ${q.consumption.tierVolume.length} tiers (1..${q.consumption.tierVolume.length})`);q.stages.appearance.forEach((e,t)=>{for(let n of rl){let r=e[n.key];r===void 0&&W(`stages.appearance[${t}].${n.key} is missing. It should be ${n.what}.`),n.ok(r)||W(`stages.appearance[${t}].${n.key} is ${JSON.stringify(r)}, but it should be ${n.what}.`)}});function dl(e,t){if(typeof e==`number`)return e;let n=Number.parseInt(e.slice(1),16);return Number.isFinite(n)||W(`${t} is "${e}", which is not a colour`),n}var fl=[`inner`,`rim`,`glow`,`sheen`,`specular`,`hudColor`];q.stages.appearance.forEach((e,t)=>{for(let n of fl)e[n]=dl(e[n],`stages.appearance[${t}].${n}`)});var pl=[{key:`name`,ok:e=>typeof e==`string`&&e.length>0,what:`a non-empty name`},{key:`minRage`,ok:G,what:`a rage of 0 or more`},{key:`rim`,ok:K,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`glow`,ok:K,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`sheen`,ok:K,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`specular`,ok:K,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`hudColor`,ok:K,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`shake`,ok:G,what:`a fraction`},{key:`swell`,ok:G,what:`a fraction`}],ml=[`rim`,`glow`,`sheen`,`specular`,`hudColor`];q.angry.appearance.forEach((e,t)=>{for(let n of pl){let r=e[n.key];r===void 0&&W(`angry.appearance[${t}].${n.key} is missing. It should be ${n.what}.`),n.ok(r)||W(`angry.appearance[${t}].${n.key} is ${JSON.stringify(r)}, but it should be ${n.what}.`)}let n=e;for(let e of ml)n[e]=dl(n[e],`angry.appearance[${t}].${e}`)});{let e=q.angry.look;e.inner=dl(e.inner,`angry.look.inner`)}q.angry.burst.waveColour=dl(q.angry.burst.waveColour,`angry.burst.waveColour`);{let e=q.angry.gauge;for(let t of[`trackColour`,`trackStroke`,`tickColour`])e[t]=dl(e[t],`angry.gauge.${t}`)}{let e=Object.keys(q.angry.burst.hazardMode).sort(),t=Object.keys(q.consumption.mass).sort(),n=t.filter(t=>!e.includes(t)),r=e.filter(e=>!t.includes(e));(n.length||r.length)&&W(`angry.burst.hazardMode must say what a wave does to every hazard kind`+(n.length?`; missing: ${n.join(`, `)}`:``)+(r.length?`; not a hazard kind: ${r.join(`, `)}`:``))}{let e=Object.keys(q.hazards.health).sort(),t=Object.keys(q.consumption.mass).sort(),n=t.filter(t=>!e.includes(t)),r=e.filter(e=>!t.includes(e));(n.length||r.length)&&W(`hazards.health must state hit points for every hazard kind (0 = immune to the bullets)`+(n.length?`; missing: ${n.join(`, `)}`:``)+(r.length?`; not a hazard kind: ${r.join(`, `)}`:``))}{let e=Object.keys(q.pacing.threat).sort(),t=[`bubble`,...Object.keys(q.hazards.health),...Object.keys(q.obstacles.health)].sort(),n=t.filter(t=>!e.includes(t)),r=e.filter(e=>!t.includes(e));(n.length||r.length)&&W(`pacing.threat must state a weight for every kind a level can place`+(n.length?`; missing: ${n.join(`, `)}`:``)+(r.length?`; not a spawnable kind: ${r.join(`, `)}`:``))}{let e=Object.keys(q.hazards.contactDamage).sort(),t=Object.keys(q.consumption.mass).sort(),n=t.filter(t=>!e.includes(t)),r=e.filter(e=>!t.includes(e));(n.length||r.length)&&W(`hazards.contactDamage must state a damage for every hazard kind`+(n.length?`; missing: ${n.join(`, `)}`:``)+(r.length?`; not a hazard kind: ${r.join(`, `)}`:``))}{let e=Object.keys(q.consumption.mass),t=Object.keys(q.hazards.hitboxScale).filter(t=>!e.includes(t));t.length&&W(`hazards.hitboxScale names something that is not a hazard kind: ${t.join(`, `)}`)}{let e=Object.keys(q.consumption.mass),t=Object.keys(q.charges.chargers).filter(t=>!e.includes(t));t.length&&W(`charges.chargers names something that is not a hazard kind: ${t.join(`, `)}`);let n=Object.keys(q.enemyBullets.shooters).filter(t=>!e.includes(t));n.length&&W(`enemyBullets.shooters names something that is not a hazard kind: ${n.join(`, `)}`)}{let e=q.hazards.boids;e.minSpeed>e.maxSpeed&&W(`hazards.boids.minSpeed (${e.minSpeed}) is above maxSpeed (${e.maxSpeed})`),e.maxSpeed>0||W(`hazards.boids.maxSpeed must be above 0, or the school never moves`),e.separationRadius>e.neighbourRadius&&W(`hazards.boids.separationRadius (${e.separationRadius}) is wider than neighbourRadius (${e.neighbourRadius})`),e.maxAccel>0||W(`hazards.boids.maxAccel must be above 0, or no force can ever act`),e.wobbleSeconds>0||W(`hazards.boids.wobbleSeconds must be above 0: it is a period`),e.back.scaleFar>e.back.scaleNear&&W(`hazards.boids.back.scaleFar (${e.back.scaleFar}) is above scaleNear (${e.back.scaleNear}): a far fish would be bigger than a near one`),e.back.dimFar<e.back.dimNear&&W(`hazards.boids.back.dimFar (${e.back.dimFar}) is below dimNear (${e.back.dimNear}): a far fish would be brighter than a near one`),(!(e.leaderWaitFloor>0)||e.leaderWaitFloor>1)&&W(`hazards.boids.leaderWaitFloor (${e.leaderWaitFloor}) must be above 0 and at most 1: at 0 the leader would stop for good the moment it lost its school`),e.leaderReach>0||W(`hazards.boids.leaderReach must be above 0, or the leader reaches no fish and the school does not follow it`),e.leaderTether<e.leaderReach&&W(`hazards.boids.leaderTether (${e.leaderTether}) is inside leaderReach (${e.leaderReach}): the tether would pull fish the leader is already steering`)}{let e=q.angry.appearance;e.length||W(`angry.appearance must have at least one row`),e[0].minRage!==0&&W(`angry.appearance[0].minRage is ${e[0].minRage}, but the first row must start at 0`);for(let t=1;t<e.length;t++)e[t].minRage<=e[t-1].minRage&&W(`angry.appearance[${t}].minRage is ${e[t].minRage}, which is not above angry.appearance[${t-1}].minRage (${e[t-1].minRage}); the rows must ascend`);let t=e[e.length-1].minRage;t>q.angry.rage.max&&W(`angry.appearance's last stage starts at ${t}, above angry.rage.max (${q.angry.rage.max}) -- unreachable`)}for(let[e,t,n]of[[`consumption.marker.edibleColor`,()=>q.consumption.marker.edibleColor,e=>q.consumption.marker.edibleColor=e],[`suction.fieldColor`,()=>q.suction.fieldColor,e=>q.suction.fieldColor=e],[`hazards.eel.paralysisColour`,()=>q.hazards.eel.paralysisColour,e=>q.hazards.eel.paralysisColour=e],[`obstacles.crateColor`,()=>q.obstacles.crateColor,e=>q.obstacles.crateColor=e],[`obstacles.crateRimColor`,()=>q.obstacles.crateRimColor,e=>q.obstacles.crateRimColor=e],[`obstacles.coralColor`,()=>q.obstacles.coralColor,e=>q.obstacles.coralColor=e],[`obstacles.coralRimColor`,()=>q.obstacles.coralRimColor,e=>q.obstacles.coralRimColor=e],[`obstacles.wallColor`,()=>q.obstacles.wallColor,e=>q.obstacles.wallColor=e],[`obstacles.wallRimColor`,()=>q.obstacles.wallRimColor,e=>q.obstacles.wallRimColor=e],[`obstacles.netColor`,()=>q.obstacles.netColor,e=>q.obstacles.netColor=e],[`obstacles.netRimColor`,()=>q.obstacles.netRimColor,e=>q.obstacles.netRimColor=e]])n(dl(t(),e));{let e=q.settings.growth;for(let t of il)e[t]=dl(e[t],`settings.growth.${t}`)}var hl={width:540,height:960},gl=5.5,_l=q.movement.keyboardCrossingSeconds,vl=2.5,yl=6.5,bl=1/120,xl=.38,Sl={get volumeMax(){return q.volume.max},set volumeMax(e){q.volume.max=e},get bubbleLaneRatio(){return q.volume.laneRatio},set bubbleLaneRatio(e){q.volume.laneRatio=e},get verticalSpeedScale(){return q.movement.verticalSpeedScale},set verticalSpeedScale(e){q.movement.verticalSpeedScale=e},get bubbleRiseMin(){return q.collectables.riseMin},set bubbleRiseMin(e){q.collectables.riseMin=e},get bubbleRiseMax(){return q.collectables.riseMax},set bubbleRiseMax(e){q.collectables.riseMax=e},get riseSpeedExponent(){return q.collectables.riseSpeedExponent},set riseSpeedExponent(e){q.collectables.riseSpeedExponent=e},get bubbleWobbleMin(){return q.collectables.wobbleMin},set bubbleWobbleMin(e){q.collectables.wobbleMin=e},get bubbleWobbleMax(){return q.collectables.wobbleMax},set bubbleWobbleMax(e){q.collectables.wobbleMax=e},get hazardSlowFactor(){return q.hazards.slowFactor},set hazardSlowFactor(e){q.hazards.slowFactor=e},get hazardSlowSeconds(){return q.hazards.slowSeconds},set hazardSlowSeconds(e){q.hazards.slowSeconds=e},get hazardLaunchDecaySeconds(){return q.hazards.launchDecaySeconds},set hazardLaunchDecaySeconds(e){q.hazards.launchDecaySeconds=e},get invulnerableSeconds(){return q.hazards.invulnerableSeconds},set invulnerableSeconds(e){q.hazards.invulnerableSeconds=e}},Cl={frames:JSON.parse(`{"冠冕水母-attack-1.png":{"frame":{"h":323,"w":163,"x":2,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-2.png":{"frame":{"h":323,"w":163,"x":169,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-3.png":{"frame":{"h":323,"w":163,"x":336,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-4.png":{"frame":{"h":323,"w":163,"x":503,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-5.png":{"frame":{"h":323,"w":163,"x":670,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-6.png":{"frame":{"h":323,"w":163,"x":837,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-7.png":{"frame":{"h":323,"w":163,"x":1004,"y":2},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-attack-8.png":{"frame":{"h":323,"w":163,"x":2,"y":329},"rotated":false,"sourceSize":{"h":323,"w":163},"trimmed":false},"冠冕水母-dead-1.png":{"frame":{"h":304,"w":163,"x":169,"y":329},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-dead-2.png":{"frame":{"h":304,"w":163,"x":336,"y":329},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-dead-3.png":{"frame":{"h":304,"w":163,"x":503,"y":329},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-dead-4.png":{"frame":{"h":304,"w":163,"x":670,"y":329},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-move-1.png":{"frame":{"h":304,"w":163,"x":837,"y":329},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-move-2.png":{"frame":{"h":304,"w":163,"x":1004,"y":329},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-move-3.png":{"frame":{"h":304,"w":163,"x":2,"y":656},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冠冕水母-move-4.png":{"frame":{"h":304,"w":163,"x":169,"y":656},"rotated":false,"sourceSize":{"h":304,"w":163},"trimmed":false},"冲锋拖尾.png":{"frame":{"h":284,"w":284,"x":336,"y":656},"rotated":false,"sourceSize":{"h":284,"w":284},"trimmed":false},"刺魨-瘪.png":{"frame":{"h":40,"w":46,"x":1171,"y":329},"rotated":false,"sourceSize":{"h":40,"w":46},"trimmed":false},"刺魨.png":{"frame":{"h":41,"w":46,"x":1171,"y":373},"rotated":false,"sourceSize":{"h":41,"w":46},"trimmed":false},"墨汁.png":{"frame":{"h":175,"w":177,"x":624,"y":656},"rotated":false,"sourceSize":{"h":175,"w":177},"trimmed":false},"大白鲨-游动-1.png":{"frame":{"h":61,"w":98,"x":1171,"y":418},"rotated":false,"sourceSize":{"h":61,"w":98},"trimmed":false},"大白鲨-游动-2.png":{"frame":{"h":61,"w":98,"x":1171,"y":483},"rotated":false,"sourceSize":{"h":61,"w":98},"trimmed":false},"大白鲨-游动-3.png":{"frame":{"h":61,"w":98,"x":1171,"y":548},"rotated":false,"sourceSize":{"h":61,"w":98},"trimmed":false},"大白鲨-游动-4.png":{"frame":{"h":61,"w":98,"x":1171,"y":2},"rotated":false,"sourceSize":{"h":61,"w":98},"trimmed":false},"失控鱼雷.png":{"frame":{"h":12,"w":42,"x":169,"y":637},"rotated":false,"sourceSize":{"h":12,"w":42},"trimmed":false},"寄居沉船章鱼-attack-1.png":{"frame":{"h":163,"w":168,"x":805,"y":656},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-2.png":{"frame":{"h":163,"w":168,"x":977,"y":656},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-3.png":{"frame":{"h":163,"w":168,"x":2,"y":964},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-4.png":{"frame":{"h":163,"w":168,"x":174,"y":964},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-5.png":{"frame":{"h":163,"w":168,"x":346,"y":964},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-6.png":{"frame":{"h":163,"w":168,"x":518,"y":964},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-7.png":{"frame":{"h":163,"w":168,"x":690,"y":964},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-attack-8.png":{"frame":{"h":163,"w":168,"x":862,"y":964},"rotated":false,"sourceSize":{"h":163,"w":168},"trimmed":false},"寄居沉船章鱼-dead-1.png":{"frame":{"h":160,"w":168,"x":1034,"y":964},"rotated":false,"sourceSize":{"h":160,"w":168},"trimmed":false},"寄居沉船章鱼-dead-2.png":{"frame":{"h":160,"w":168,"x":2,"y":1131},"rotated":false,"sourceSize":{"h":160,"w":168},"trimmed":false},"寄居沉船章鱼-dead-3.png":{"frame":{"h":160,"w":168,"x":174,"y":1131},"rotated":false,"sourceSize":{"h":160,"w":168},"trimmed":false},"寄居沉船章鱼-dead-4.png":{"frame":{"h":160,"w":168,"x":346,"y":1131},"rotated":false,"sourceSize":{"h":160,"w":168},"trimmed":false},"寄居沉船章鱼-move-1.png":{"frame":{"h":156,"w":168,"x":518,"y":1131},"rotated":false,"sourceSize":{"h":156,"w":168},"trimmed":false},"寄居沉船章鱼-move-2.png":{"frame":{"h":156,"w":168,"x":690,"y":1131},"rotated":false,"sourceSize":{"h":156,"w":168},"trimmed":false},"寄居沉船章鱼-move-3.png":{"frame":{"h":156,"w":168,"x":862,"y":1131},"rotated":false,"sourceSize":{"h":156,"w":168},"trimmed":false},"寄居沉船章鱼-move-4.png":{"frame":{"h":156,"w":168,"x":1034,"y":1131},"rotated":false,"sourceSize":{"h":156,"w":168},"trimmed":false},"封路木箱.png":{"frame":{"h":38,"w":68,"x":1221,"y":329},"rotated":false,"sourceSize":{"h":38,"w":68},"trimmed":false},"射水鱼.png":{"frame":{"h":21,"w":40,"x":1221,"y":373},"rotated":false,"sourceSize":{"h":21,"w":40},"trimmed":false},"小鱼-游动-1.png":{"frame":{"h":21,"w":41,"x":1265,"y":373},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼-游动-2.png":{"frame":{"h":21,"w":41,"x":1206,"y":1131},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼-游动-3.png":{"frame":{"h":21,"w":41,"x":1251,"y":1131},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼-游动-4.png":{"frame":{"h":21,"w":41,"x":1206,"y":1156},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼2-游动-1.png":{"frame":{"h":14,"w":41,"x":1221,"y":398},"rotated":false,"sourceSize":{"h":14,"w":41},"trimmed":false},"小鱼2-游动-2.png":{"frame":{"h":14,"w":41,"x":336,"y":944},"rotated":false,"sourceSize":{"h":14,"w":41},"trimmed":false},"小鱼2-游动-3.png":{"frame":{"h":14,"w":41,"x":381,"y":944},"rotated":false,"sourceSize":{"h":14,"w":41},"trimmed":false},"小鱼2-游动-4.png":{"frame":{"h":14,"w":41,"x":426,"y":944},"rotated":false,"sourceSize":{"h":14,"w":41},"trimmed":false},"小鱼3-游动-1.png":{"frame":{"h":21,"w":41,"x":1251,"y":1156},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼3-游动-2.png":{"frame":{"h":21,"w":41,"x":1206,"y":1181},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼3-游动-3.png":{"frame":{"h":21,"w":41,"x":1251,"y":1181},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼3-游动-4.png":{"frame":{"h":21,"w":41,"x":1206,"y":1206},"rotated":false,"sourceSize":{"h":21,"w":41},"trimmed":false},"小鱼4-游动-1.png":{"frame":{"h":22,"w":41,"x":1206,"y":1231},"rotated":false,"sourceSize":{"h":22,"w":41},"trimmed":false},"小鱼4-游动-2.png":{"frame":{"h":22,"w":41,"x":1251,"y":1231},"rotated":false,"sourceSize":{"h":22,"w":41},"trimmed":false},"小鱼4-游动-3.png":{"frame":{"h":22,"w":41,"x":1206,"y":1257},"rotated":false,"sourceSize":{"h":22,"w":41},"trimmed":false},"小鱼4-游动-4.png":{"frame":{"h":22,"w":41,"x":1251,"y":1257},"rotated":false,"sourceSize":{"h":22,"w":41},"trimmed":false},"废网巨鲨-attack-1.png":{"frame":{"h":94,"w":172,"x":624,"y":835},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-2.png":{"frame":{"h":94,"w":172,"x":800,"y":835},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-3.png":{"frame":{"h":94,"w":172,"x":976,"y":835},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-4.png":{"frame":{"h":94,"w":172,"x":2,"y":1295},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-5.png":{"frame":{"h":94,"w":172,"x":178,"y":1295},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-6.png":{"frame":{"h":94,"w":172,"x":354,"y":1295},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-7.png":{"frame":{"h":94,"w":172,"x":530,"y":1295},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-attack-8.png":{"frame":{"h":94,"w":172,"x":706,"y":1295},"rotated":false,"sourceSize":{"h":94,"w":172},"trimmed":false},"废网巨鲨-dead-1.png":{"frame":{"h":96,"w":172,"x":2,"y":1393},"rotated":false,"sourceSize":{"h":96,"w":172},"trimmed":false},"废网巨鲨-dead-2.png":{"frame":{"h":96,"w":172,"x":178,"y":1393},"rotated":false,"sourceSize":{"h":96,"w":172},"trimmed":false},"废网巨鲨-dead-3.png":{"frame":{"h":96,"w":172,"x":354,"y":1393},"rotated":false,"sourceSize":{"h":96,"w":172},"trimmed":false},"废网巨鲨-dead-4.png":{"frame":{"h":96,"w":172,"x":530,"y":1393},"rotated":false,"sourceSize":{"h":96,"w":172},"trimmed":false},"废网巨鲨-move-1.png":{"frame":{"h":90,"w":171,"x":882,"y":1295},"rotated":false,"sourceSize":{"h":90,"w":171},"trimmed":false},"废网巨鲨-move-2.png":{"frame":{"h":90,"w":171,"x":1057,"y":1295},"rotated":false,"sourceSize":{"h":90,"w":171},"trimmed":false},"废网巨鲨-move-3.png":{"frame":{"h":90,"w":171,"x":706,"y":1393},"rotated":false,"sourceSize":{"h":90,"w":171},"trimmed":false},"废网巨鲨-move-4.png":{"frame":{"h":90,"w":171,"x":881,"y":1393},"rotated":false,"sourceSize":{"h":90,"w":171},"trimmed":false},"座头鲸-游动-1.png":{"frame":{"h":70,"w":111,"x":1056,"y":1393},"rotated":false,"sourceSize":{"h":70,"w":111},"trimmed":false},"座头鲸-游动-2.png":{"frame":{"h":70,"w":111,"x":1171,"y":1393},"rotated":false,"sourceSize":{"h":70,"w":111},"trimmed":false},"座头鲸-游动-3.png":{"frame":{"h":70,"w":111,"x":1152,"y":835},"rotated":false,"sourceSize":{"h":70,"w":111},"trimmed":false},"座头鲸-游动-4.png":{"frame":{"h":70,"w":111,"x":1171,"y":67},"rotated":false,"sourceSize":{"h":70,"w":111},"trimmed":false},"手枪虾.png":{"frame":{"h":40,"w":51,"x":1232,"y":1295},"rotated":false,"sourceSize":{"h":40,"w":51},"trimmed":false},"按钮-图鉴-Hover.png":{"frame":{"h":49,"w":169,"x":2,"y":1493},"rotated":false,"sourceSize":{"h":49,"w":169},"trimmed":false},"按钮-图鉴.png":{"frame":{"h":49,"w":169,"x":175,"y":1493},"rotated":false,"sourceSize":{"h":49,"w":169},"trimmed":false},"按钮-开始游戏-Hover.png":{"frame":{"h":49,"w":169,"x":348,"y":1493},"rotated":false,"sourceSize":{"h":49,"w":169},"trimmed":false},"按钮-开始游戏.png":{"frame":{"h":49,"w":169,"x":521,"y":1493},"rotated":false,"sourceSize":{"h":49,"w":169},"trimmed":false},"按钮-设置-Hover.png":{"frame":{"h":49,"w":169,"x":694,"y":1493},"rotated":false,"sourceSize":{"h":49,"w":169},"trimmed":false},"按钮-设置.png":{"frame":{"h":49,"w":169,"x":867,"y":1493},"rotated":false,"sourceSize":{"h":49,"w":169},"trimmed":false},"木箱.png":{"frame":{"h":68,"w":62,"x":1206,"y":964},"rotated":false,"sourceSize":{"h":68,"w":62},"trimmed":false},"标题.png":{"frame":{"h":90,"w":233,"x":2,"y":1546},"rotated":false,"sourceSize":{"h":90,"w":233},"trimmed":false},"气泡-1.png":{"frame":{"h":5,"w":5,"x":624,"y":933},"rotated":false,"sourceSize":{"h":5,"w":5},"trimmed":false},"气泡-10.png":{"frame":{"h":12,"w":12,"x":215,"y":637},"rotated":false,"sourceSize":{"h":12,"w":12},"trimmed":false},"气泡-11.png":{"frame":{"h":6,"w":6,"x":805,"y":823},"rotated":false,"sourceSize":{"h":6,"w":6},"trimmed":false},"气泡-12.png":{"frame":{"h":9,"w":9,"x":1296,"y":1131},"rotated":false,"sourceSize":{"h":9,"w":9},"trimmed":false},"气泡-2.png":{"frame":{"h":10,"w":9,"x":1296,"y":1156},"rotated":false,"sourceSize":{"h":10,"w":9},"trimmed":false},"气泡-3.png":{"frame":{"h":5,"w":5,"x":633,"y":933},"rotated":false,"sourceSize":{"h":5,"w":5},"trimmed":false},"气泡-4.png":{"frame":{"h":12,"w":12,"x":231,"y":637},"rotated":false,"sourceSize":{"h":12,"w":12},"trimmed":false},"气泡-5.png":{"frame":{"h":9,"w":10,"x":1296,"y":1181},"rotated":false,"sourceSize":{"h":9,"w":10},"trimmed":false},"气泡-6.png":{"frame":{"h":5,"w":5,"x":642,"y":933},"rotated":false,"sourceSize":{"h":5,"w":5},"trimmed":false},"气泡-7.png":{"frame":{"h":9,"w":9,"x":1296,"y":1231},"rotated":false,"sourceSize":{"h":9,"w":9},"trimmed":false},"气泡-8.png":{"frame":{"h":5,"w":5,"x":651,"y":933},"rotated":false,"sourceSize":{"h":5,"w":5},"trimmed":false},"气泡-9.png":{"frame":{"h":5,"w":5,"x":660,"y":933},"rotated":false,"sourceSize":{"h":5,"w":5},"trimmed":false},"水母-待机-1.png":{"frame":{"h":77,"w":52,"x":1206,"y":1036},"rotated":false,"sourceSize":{"h":77,"w":52},"trimmed":false},"水母-待机-2.png":{"frame":{"h":77,"w":52,"x":239,"y":1546},"rotated":false,"sourceSize":{"h":77,"w":52},"trimmed":false},"水母-待机-3.png":{"frame":{"h":77,"w":52,"x":295,"y":1546},"rotated":false,"sourceSize":{"h":77,"w":52},"trimmed":false},"水母-待机-4.png":{"frame":{"h":77,"w":52,"x":351,"y":1546},"rotated":false,"sourceSize":{"h":77,"w":52},"trimmed":false},"海星.png":{"frame":{"h":51,"w":52,"x":407,"y":1546},"rotated":false,"sourceSize":{"h":51,"w":52},"trimmed":false},"海胆.png":{"frame":{"h":48,"w":51,"x":1040,"y":1493},"rotated":false,"sourceSize":{"h":48,"w":51},"trimmed":false},"海豚-游动-1.png":{"frame":{"h":50,"w":66,"x":463,"y":1546},"rotated":false,"sourceSize":{"h":50,"w":66},"trimmed":false},"海豚-游动-2.png":{"frame":{"h":50,"w":66,"x":533,"y":1546},"rotated":false,"sourceSize":{"h":50,"w":66},"trimmed":false},"海豚-游动-3.png":{"frame":{"h":50,"w":66,"x":603,"y":1546},"rotated":false,"sourceSize":{"h":50,"w":66},"trimmed":false},"海豚-游动-4.png":{"frame":{"h":50,"w":66,"x":673,"y":1546},"rotated":false,"sourceSize":{"h":50,"w":66},"trimmed":false},"渔网.png":{"frame":{"h":58,"w":71,"x":1171,"y":141},"rotated":false,"sourceSize":{"h":58,"w":71},"trimmed":false},"火山底座.png":{"frame":{"h":44,"w":44,"x":1262,"y":1036},"rotated":false,"sourceSize":{"h":44,"w":44},"trimmed":false},"火山火焰-1.png":{"frame":{"h":298,"w":27,"x":2,"y":1640},"rotated":false,"sourceSize":{"h":298,"w":27},"trimmed":false},"火山火焰-2.png":{"frame":{"h":298,"w":27,"x":33,"y":1640},"rotated":false,"sourceSize":{"h":298,"w":27},"trimmed":false},"火山火焰-3.png":{"frame":{"h":298,"w":27,"x":64,"y":1640},"rotated":false,"sourceSize":{"h":298,"w":27},"trimmed":false},"火山火焰-4.png":{"frame":{"h":298,"w":27,"x":95,"y":1640},"rotated":false,"sourceSize":{"h":298,"w":27},"trimmed":false},"灯笼鱼-冲锋.png":{"frame":{"h":80,"w":80,"x":1171,"y":203},"rotated":false,"sourceSize":{"h":80,"w":80},"trimmed":false},"灯笼鱼-移动.png":{"frame":{"h":80,"w":80,"x":1149,"y":656},"rotated":false,"sourceSize":{"h":80,"w":80},"trimmed":false},"炸弹鱼-move-1.png":{"frame":{"h":36,"w":39,"x":1267,"y":835},"rotated":false,"sourceSize":{"h":36,"w":39},"trimmed":false},"炸弹鱼-move-2.png":{"frame":{"h":36,"w":39,"x":1171,"y":287},"rotated":false,"sourceSize":{"h":36,"w":39},"trimmed":false},"炸弹鱼-move-3.png":{"frame":{"h":36,"w":39,"x":1214,"y":287},"rotated":false,"sourceSize":{"h":36,"w":39},"trimmed":false},"炸弹鱼-move-4.png":{"frame":{"h":36,"w":39,"x":1257,"y":287},"rotated":false,"sourceSize":{"h":36,"w":39},"trimmed":false},"烟囱蟹王-attack-1.png":{"frame":{"h":130,"w":177,"x":126,"y":1640},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-2.png":{"frame":{"h":130,"w":177,"x":307,"y":1640},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-3.png":{"frame":{"h":130,"w":177,"x":488,"y":1640},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-4.png":{"frame":{"h":130,"w":177,"x":669,"y":1640},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-5.png":{"frame":{"h":130,"w":177,"x":850,"y":1640},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-6.png":{"frame":{"h":130,"w":177,"x":1031,"y":1640},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-7.png":{"frame":{"h":130,"w":177,"x":126,"y":1774},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-attack-8.png":{"frame":{"h":130,"w":177,"x":307,"y":1774},"rotated":false,"sourceSize":{"h":130,"w":177},"trimmed":false},"烟囱蟹王-dead-1.png":{"frame":{"h":102,"w":177,"x":488,"y":1774},"rotated":false,"sourceSize":{"h":102,"w":177},"trimmed":false},"烟囱蟹王-dead-2.png":{"frame":{"h":102,"w":177,"x":669,"y":1774},"rotated":false,"sourceSize":{"h":102,"w":177},"trimmed":false},"烟囱蟹王-dead-3.png":{"frame":{"h":102,"w":177,"x":850,"y":1774},"rotated":false,"sourceSize":{"h":102,"w":177},"trimmed":false},"烟囱蟹王-dead-4.png":{"frame":{"h":102,"w":177,"x":1031,"y":1774},"rotated":false,"sourceSize":{"h":102,"w":177},"trimmed":false},"烟囱蟹王-move-1.png":{"frame":{"h":106,"w":177,"x":2,"y":1942},"rotated":false,"sourceSize":{"h":106,"w":177},"trimmed":false},"烟囱蟹王-move-2.png":{"frame":{"h":106,"w":177,"x":183,"y":1942},"rotated":false,"sourceSize":{"h":106,"w":177},"trimmed":false},"烟囱蟹王-move-3.png":{"frame":{"h":106,"w":177,"x":364,"y":1942},"rotated":false,"sourceSize":{"h":106,"w":177},"trimmed":false},"烟囱蟹王-move-4.png":{"frame":{"h":106,"w":177,"x":545,"y":1942},"rotated":false,"sourceSize":{"h":106,"w":177},"trimmed":false},"焦散.png":{"frame":{"h":84,"w":149,"x":726,"y":1942},"rotated":false,"sourceSize":{"h":84,"w":149},"trimmed":false},"玩家子弹.png":{"frame":{"h":12,"w":12,"x":247,"y":637},"rotated":false,"sourceSize":{"h":12,"w":12},"trimmed":false},"玩家气泡.png":{"frame":{"h":36,"w":36,"x":1232,"y":1339},"rotated":false,"sourceSize":{"h":36,"w":36},"trimmed":false},"珊瑚-团状.png":{"frame":{"h":87,"w":87,"x":1212,"y":1774},"rotated":false,"sourceSize":{"h":87,"w":87},"trimmed":false},"珊瑚-扇形.png":{"frame":{"h":75,"w":78,"x":1149,"y":740},"rotated":false,"sourceSize":{"h":75,"w":78},"trimmed":false},"珊瑚-枝状.png":{"frame":{"h":71,"w":67,"x":1231,"y":740},"rotated":false,"sourceSize":{"h":71,"w":67},"trimmed":false},"珊瑚-桌状.png":{"frame":{"h":66,"w":90,"x":1212,"y":1640},"rotated":false,"sourceSize":{"h":66,"w":90},"trimmed":false},"珊瑚-管状.png":{"frame":{"h":58,"w":84,"x":1212,"y":1710},"rotated":false,"sourceSize":{"h":58,"w":84},"trimmed":false},"珊瑚-鹿角.png":{"frame":{"h":65,"w":77,"x":879,"y":1942},"rotated":false,"sourceSize":{"h":65,"w":77},"trimmed":false},"珊瑚.png":{"frame":{"h":71,"w":83,"x":2,"y":2052},"rotated":false,"sourceSize":{"h":71,"w":83},"trimmed":false},"电击水母-move-1.png":{"frame":{"h":56,"w":48,"x":1246,"y":141},"rotated":false,"sourceSize":{"h":56,"w":48},"trimmed":false},"电击水母-move-2.png":{"frame":{"h":56,"w":48,"x":1255,"y":203},"rotated":false,"sourceSize":{"h":56,"w":48},"trimmed":false},"电击水母-move-3.png":{"frame":{"h":56,"w":48,"x":960,"y":1942},"rotated":false,"sourceSize":{"h":56,"w":48},"trimmed":false},"电击水母-move-4.png":{"frame":{"h":56,"w":48,"x":1012,"y":1942},"rotated":false,"sourceSize":{"h":56,"w":48},"trimmed":false},"电鳗-放电.png":{"frame":{"h":53,"w":78,"x":1064,"y":1942},"rotated":false,"sourceSize":{"h":53,"w":78},"trimmed":false},"电鳗.png":{"frame":{"h":66,"w":78,"x":89,"y":2052},"rotated":false,"sourceSize":{"h":66,"w":78},"trimmed":false},"电鳗闪电.png":{"frame":{"h":25,"w":24,"x":1262,"y":1084},"rotated":false,"sourceSize":{"h":25,"w":24},"trimmed":false},"盲虾-蓄力.png":{"frame":{"h":56,"w":56,"x":171,"y":2052},"rotated":false,"sourceSize":{"h":56,"w":56},"trimmed":false},"盲虾.png":{"frame":{"h":56,"w":56,"x":231,"y":2052},"rotated":false,"sourceSize":{"h":56,"w":56},"trimmed":false},"矿物颗粒.png":{"frame":{"h":18,"w":18,"x":726,"y":2030},"rotated":false,"sourceSize":{"h":18,"w":18},"trimmed":false},"章鱼-游动-1.png":{"frame":{"h":79,"w":79,"x":2,"y":2127},"rotated":false,"sourceSize":{"h":79,"w":79},"trimmed":false},"章鱼-游动-2.png":{"frame":{"h":79,"w":79,"x":85,"y":2127},"rotated":false,"sourceSize":{"h":79,"w":79},"trimmed":false},"章鱼-游动-3.png":{"frame":{"h":79,"w":79,"x":168,"y":2127},"rotated":false,"sourceSize":{"h":79,"w":79},"trimmed":false},"章鱼-游动-4.png":{"frame":{"h":79,"w":79,"x":251,"y":2127},"rotated":false,"sourceSize":{"h":79,"w":79},"trimmed":false},"管虫.png":{"frame":{"h":78,"w":48,"x":334,"y":2127},"rotated":false,"sourceSize":{"h":78,"w":48},"trimmed":false},"螃蟹-BOSS-待机-1.png":{"frame":{"h":192,"w":192,"x":2,"y":2210},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-待机-2.png":{"frame":{"h":192,"w":192,"x":198,"y":2210},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-待机-3.png":{"frame":{"h":192,"w":192,"x":394,"y":2210},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-待机-4.png":{"frame":{"h":192,"w":192,"x":590,"y":2210},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-1.png":{"frame":{"h":221,"w":192,"x":2,"y":2406},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-2.png":{"frame":{"h":221,"w":192,"x":198,"y":2406},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-3.png":{"frame":{"h":221,"w":192,"x":394,"y":2406},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-4.png":{"frame":{"h":221,"w":192,"x":590,"y":2406},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-5.png":{"frame":{"h":221,"w":192,"x":786,"y":2406},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-6.png":{"frame":{"h":221,"w":192,"x":982,"y":2406},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-7.png":{"frame":{"h":221,"w":192,"x":2,"y":2631},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-攻击-8.png":{"frame":{"h":221,"w":192,"x":198,"y":2631},"rotated":false,"sourceSize":{"h":221,"w":192},"trimmed":false},"螃蟹-BOSS-死亡-1.png":{"frame":{"h":192,"w":192,"x":786,"y":2210},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-死亡-2.png":{"frame":{"h":192,"w":192,"x":982,"y":2210},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-死亡-3.png":{"frame":{"h":192,"w":192,"x":394,"y":2631},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-BOSS-死亡-4.png":{"frame":{"h":192,"w":192,"x":590,"y":2631},"rotated":false,"sourceSize":{"h":192,"w":192},"trimmed":false},"螃蟹-move-1.png":{"frame":{"h":20,"w":34,"x":1272,"y":1339},"rotated":false,"sourceSize":{"h":20,"w":34},"trimmed":false},"螃蟹-move-2.png":{"frame":{"h":20,"w":34,"x":1255,"y":263},"rotated":false,"sourceSize":{"h":20,"w":34},"trimmed":false},"螃蟹-move-3.png":{"frame":{"h":20,"w":34,"x":1272,"y":964},"rotated":false,"sourceSize":{"h":20,"w":34},"trimmed":false},"螃蟹-move-4.png":{"frame":{"h":20,"w":34,"x":1272,"y":988},"rotated":false,"sourceSize":{"h":20,"w":34},"trimmed":false},"金枪鱼-游动-1.png":{"frame":{"h":38,"w":70,"x":1233,"y":656},"rotated":false,"sourceSize":{"h":38,"w":70},"trimmed":false},"金枪鱼-游动-2.png":{"frame":{"h":38,"w":70,"x":1233,"y":698},"rotated":false,"sourceSize":{"h":38,"w":70},"trimmed":false},"金枪鱼-游动-3.png":{"frame":{"h":38,"w":70,"x":1095,"y":1493},"rotated":false,"sourceSize":{"h":38,"w":70},"trimmed":false},"金枪鱼-游动-4.png":{"frame":{"h":38,"w":70,"x":1169,"y":1493},"rotated":false,"sourceSize":{"h":38,"w":70},"trimmed":false},"长尾鲨-attack-1.png":{"frame":{"h":106,"w":168,"x":786,"y":2631},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-2.png":{"frame":{"h":106,"w":168,"x":958,"y":2631},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-3.png":{"frame":{"h":106,"w":168,"x":1130,"y":2631},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-4.png":{"frame":{"h":106,"w":168,"x":2,"y":2856},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-5.png":{"frame":{"h":106,"w":168,"x":174,"y":2856},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-6.png":{"frame":{"h":106,"w":168,"x":346,"y":2856},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-7.png":{"frame":{"h":106,"w":168,"x":518,"y":2856},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-attack-8.png":{"frame":{"h":106,"w":168,"x":690,"y":2856},"rotated":false,"sourceSize":{"h":106,"w":168},"trimmed":false},"长尾鲨-dead-1.png":{"frame":{"h":121,"w":169,"x":2,"y":2966},"rotated":false,"sourceSize":{"h":121,"w":169},"trimmed":false},"长尾鲨-dead-2.png":{"frame":{"h":121,"w":169,"x":175,"y":2966},"rotated":false,"sourceSize":{"h":121,"w":169},"trimmed":false},"长尾鲨-dead-3.png":{"frame":{"h":121,"w":169,"x":348,"y":2966},"rotated":false,"sourceSize":{"h":121,"w":169},"trimmed":false},"长尾鲨-dead-4.png":{"frame":{"h":121,"w":169,"x":521,"y":2966},"rotated":false,"sourceSize":{"h":121,"w":169},"trimmed":false},"长尾鲨-move-1.png":{"frame":{"h":92,"w":169,"x":862,"y":2856},"rotated":false,"sourceSize":{"h":92,"w":169},"trimmed":false},"长尾鲨-move-2.png":{"frame":{"h":92,"w":169,"x":1035,"y":2856},"rotated":false,"sourceSize":{"h":92,"w":169},"trimmed":false},"长尾鲨-move-3.png":{"frame":{"h":92,"w":169,"x":694,"y":2966},"rotated":false,"sourceSize":{"h":92,"w":169},"trimmed":false},"长尾鲨-move-4.png":{"frame":{"h":92,"w":169,"x":867,"y":2966},"rotated":false,"sourceSize":{"h":92,"w":169},"trimmed":false},"风暴之眼-attack-1.png":{"frame":{"h":114,"w":168,"x":2,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-2.png":{"frame":{"h":114,"w":168,"x":174,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-3.png":{"frame":{"h":114,"w":168,"x":346,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-4.png":{"frame":{"h":114,"w":168,"x":518,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-5.png":{"frame":{"h":114,"w":168,"x":690,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-6.png":{"frame":{"h":114,"w":168,"x":862,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-7.png":{"frame":{"h":114,"w":168,"x":1034,"y":3091},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-attack-8.png":{"frame":{"h":114,"w":168,"x":2,"y":3209},"rotated":false,"sourceSize":{"h":114,"w":168},"trimmed":false},"风暴之眼-dead-1.png":{"frame":{"h":103,"w":168,"x":174,"y":3209},"rotated":false,"sourceSize":{"h":103,"w":168},"trimmed":false},"风暴之眼-dead-2.png":{"frame":{"h":103,"w":168,"x":346,"y":3209},"rotated":false,"sourceSize":{"h":103,"w":168},"trimmed":false},"风暴之眼-dead-3.png":{"frame":{"h":103,"w":168,"x":518,"y":3209},"rotated":false,"sourceSize":{"h":103,"w":168},"trimmed":false},"风暴之眼-dead-4.png":{"frame":{"h":103,"w":168,"x":690,"y":3209},"rotated":false,"sourceSize":{"h":103,"w":168},"trimmed":false},"风暴之眼-move-1.png":{"frame":{"h":112,"w":168,"x":2,"y":3327},"rotated":false,"sourceSize":{"h":112,"w":168},"trimmed":false},"风暴之眼-move-2.png":{"frame":{"h":112,"w":168,"x":174,"y":3327},"rotated":false,"sourceSize":{"h":112,"w":168},"trimmed":false},"风暴之眼-move-3.png":{"frame":{"h":112,"w":168,"x":346,"y":3327},"rotated":false,"sourceSize":{"h":112,"w":168},"trimmed":false},"风暴之眼-move-4.png":{"frame":{"h":112,"w":168,"x":518,"y":3327},"rotated":false,"sourceSize":{"h":112,"w":168},"trimmed":false}}`),meta:JSON.parse(`{"app":"pack-atlas.py","decodedBytes":18019008,"encoding":"lossless WebP","encodingNote":"pixel exact","format":"RGBA8888","image":"atlas-1.webp","page":1,"scale":"1","size":{"h":3444,"w":1308},"sources":{"冠冕水母-attack-1.png":{"bytes":62679,"sha256":"0d544b8b9f3782a2e4ddd2e9e14c01ba09a581422520542919cda7b3cfec191d"},"冠冕水母-attack-2.png":{"bytes":63301,"sha256":"290ae634ca48fec2a081fa913394538896a56f3d14647361713d294e9e79e1d2"},"冠冕水母-attack-3.png":{"bytes":64318,"sha256":"9fd0c7ff1b687fe8c726e49b748d3b0bf28e5df47b900027da046ecb45132b86"},"冠冕水母-attack-4.png":{"bytes":61438,"sha256":"9d44355dfce798bb7f1afcafae075c069af9b2019dffeb1c6233bd170b712c91"},"冠冕水母-attack-5.png":{"bytes":65351,"sha256":"bb3d40779240f7d3d44f430445cadd404a37e8f6539faffa8802f893943986fa"},"冠冕水母-attack-6.png":{"bytes":56015,"sha256":"56604b22335df24e17eb8f2b858af06a8eb0203c8b22c0be9d8fe58d9116a66b"},"冠冕水母-attack-7.png":{"bytes":60832,"sha256":"d139c7467290ca2fcd26a00ca8de29e4a6230cdddcc8870a6ed3356f39ef9097"},"冠冕水母-attack-8.png":{"bytes":64357,"sha256":"20335a8ebda6ed03abb1df0d717c93eb173c030bff3c8f6050a4eb31d3b5641d"},"冠冕水母-dead-1.png":{"bytes":62584,"sha256":"d6b14992bfcee222a9330f8606a519228b2396959405fe1d06350ae24700a167"},"冠冕水母-dead-2.png":{"bytes":65275,"sha256":"094d8139f4a0fef180ef05d068b6839661c4841ed008796051f67acf52cd0caa"},"冠冕水母-dead-3.png":{"bytes":65474,"sha256":"7fb3e521779280a7f6d19700084ae3fc9254ce26760e5255269d5af97645a426"},"冠冕水母-dead-4.png":{"bytes":53244,"sha256":"3685fd251cf6325035d1d94b305b57ba716fa12f74e0da27f508d5412821a6ff"},"冠冕水母-move-1.png":{"bytes":62584,"sha256":"d6b14992bfcee222a9330f8606a519228b2396959405fe1d06350ae24700a167"},"冠冕水母-move-2.png":{"bytes":65628,"sha256":"4199c5d364113fb49d4afa888acacb1e595b8d269e5342fbb9025e3b6bd8d53d"},"冠冕水母-move-3.png":{"bytes":63662,"sha256":"81e786c769abc18f92c1fe538fe0cf10bdf7201897f2e9ae68d89b3b46d94730"},"冠冕水母-move-4.png":{"bytes":57971,"sha256":"1981024cfc306a22d39324020d646858f434d460a6a1aa5e404f389576eb7408"},"冲锋拖尾.png":{"bytes":11149,"sha256":"66e08d504bb19a6ca537ac344a8849cafb253747c116350d42ca0af56ffdf632"},"刺魨-瘪.png":{"bytes":1662,"sha256":"e2c3d073dcc99a8b3200d26e6e469aad1fd4fe875610ab54ae8cffca41b16821"},"刺魨.png":{"bytes":3299,"sha256":"1269a32d44046571a1e012bb79f6476f5bd26948277314e7d63ae2648db0b626"},"墨汁.png":{"bytes":25639,"sha256":"85d6cbc73dc25caebf203a4fbf0c2ffa6edb7cc3f859e0e2f13fd1ac8f5be1ed"},"大白鲨-游动-1.png":{"bytes":7058,"sha256":"29273eb44cda9b874dbdc2ea1c6544b3a64c7e053a737b51758ac8774f112bef"},"大白鲨-游动-2.png":{"bytes":6883,"sha256":"2289e4564e6577800612e4221520bb396c6b609d8ae7e7c69b13dee0c0143563"},"大白鲨-游动-3.png":{"bytes":7176,"sha256":"954274e11cdf864e5d1890036ab5680d76f61daaf00f56534230369a7307cde6"},"大白鲨-游动-4.png":{"bytes":7150,"sha256":"fd5b8fdf2814f9f6140cdfe58a0b7e5a53397ed4e13be92abce7c364812a81e1"},"失控鱼雷.png":{"bytes":943,"sha256":"576ad5ca3a5c79cfd5afb28ee7eca8d9928676edbee23fe87b6b158872da48e9"},"寄居沉船章鱼-attack-1.png":{"bytes":36702,"sha256":"5a33cfa4c50470a29634695f8e82d975d216044ee2d18372a363766680d9a93f"},"寄居沉船章鱼-attack-2.png":{"bytes":37802,"sha256":"db616542b354507cf67d22e70ac6c6044c6f1e7c1a2c553bd1651a18aa76fd6b"},"寄居沉船章鱼-attack-3.png":{"bytes":37585,"sha256":"5926e53a2a5bf847b1e2bfdc4615433d71cfd69ac7a605b2385c38804951930e"},"寄居沉船章鱼-attack-4.png":{"bytes":37127,"sha256":"3dbced9d6a07a5a4a3f0ce938fa0670abf5ceed51c2c1214b474f785a325ef0a"},"寄居沉船章鱼-attack-5.png":{"bytes":40177,"sha256":"9b260a9bf700ba96941239bf57ed40bbde8be2291bf28606c4ec2656b60704c2"},"寄居沉船章鱼-attack-6.png":{"bytes":38477,"sha256":"94938b18a0cd8b51460d214da5cf869032f71efa495692719a8736748b6f4655"},"寄居沉船章鱼-attack-7.png":{"bytes":34383,"sha256":"5057cc3da554a3abede49acf8f0a55879cd3ef3c04195780fa6eb71cc57ff008"},"寄居沉船章鱼-attack-8.png":{"bytes":36484,"sha256":"5eb0479d1b4f2c3e8a1f932ff460cd840fbfbd36ae53011280a26fa9e45177a9"},"寄居沉船章鱼-dead-1.png":{"bytes":36652,"sha256":"cacc80585e78181db3f2d6e84feae82140700bbc41940cb7b0330fac77d75a21"},"寄居沉船章鱼-dead-2.png":{"bytes":29517,"sha256":"a367c2f8351fb65d8744928a6af94e2bd45b74c1aa98a2f61e4ff71102dc25da"},"寄居沉船章鱼-dead-3.png":{"bytes":15601,"sha256":"29fc4e55d2385bf5664e128415113e3a4443b178f262f79d7224d9c122e3786c"},"寄居沉船章鱼-dead-4.png":{"bytes":24493,"sha256":"c67b6c9ed4f7ae9f9514216a0ed690b764903eefe71b11851f35df8a78b5d3cd"},"寄居沉船章鱼-move-1.png":{"bytes":36635,"sha256":"c1922889b321bd041750b2795e5338d7627ada942e698e204738d109869ab69d"},"寄居沉船章鱼-move-2.png":{"bytes":36854,"sha256":"056ba5fb82b1997031937b336489a615aeffeb1e31a059e0a6b81e3450f2f70a"},"寄居沉船章鱼-move-3.png":{"bytes":36210,"sha256":"d41d6c34e73c9b0d119c2ce456a08266d7fb36d0a4567cf461a8be7a9028881c"},"寄居沉船章鱼-move-4.png":{"bytes":36354,"sha256":"f13fcdeeb121d29e09cf4b0db427a94d3665b1c0d65c91d21498f03eec5fd146"},"封路木箱.png":{"bytes":2242,"sha256":"f77a90dc607b24437ec575e08e60a3a05d19b8ec50cc481d4e955adb834da516"},"射水鱼.png":{"bytes":1259,"sha256":"54be0faa21127588a8ef7b1278fd615fda3d027a2d2887fe3e839e549c1d0567"},"小鱼-游动-1.png":{"bytes":1532,"sha256":"5d0b51ed4069fb354acc3c1f4916558df75272435bd8cd976455294ae7c9255a"},"小鱼-游动-2.png":{"bytes":1539,"sha256":"0f96fc63b7374a8cf7b9b2f2b19c4cf2aa9f50ce9b674316d85efb4e62215c56"},"小鱼-游动-3.png":{"bytes":1524,"sha256":"b69564cb28fd575900a33a015f858a95e99c1c6551f508b38238ccf29aca80b0"},"小鱼-游动-4.png":{"bytes":1520,"sha256":"a7d065af753f91bc0a848356ebd1293c4c89aa5db9cf7b18f8729ba2eb36794a"},"小鱼2-游动-1.png":{"bytes":1069,"sha256":"7e0360e98a93ede46c732eed52c40ab80f6c50e5cf7412c85c2fde92bdf94a73"},"小鱼2-游动-2.png":{"bytes":1053,"sha256":"b8ec60d3c2d56811c4d01a46ed601e3cf7d996dca36b1fdf999c823f4b457c9d"},"小鱼2-游动-3.png":{"bytes":1062,"sha256":"6f9b8ce9ae3c2404593c18fb40c81f7ec8e7428fee78a3df7e52c9e963f0fb27"},"小鱼2-游动-4.png":{"bytes":1067,"sha256":"a4ee690a67e5b9ceb1b6006538c3474d00c1749d8e9cdf6dba5bda758782431a"},"小鱼3-游动-1.png":{"bytes":1491,"sha256":"a7f09fbf40ee9c1236676a867443478635f7a2b1b0f0e9f3cc88c18bc8c8eac4"},"小鱼3-游动-2.png":{"bytes":1501,"sha256":"a092897482a535ebf0abf021a2484865906377e4f7ba67ed5b3a334688b22727"},"小鱼3-游动-3.png":{"bytes":1485,"sha256":"56880e775f62a8f4c91a9b1b728e3627b55ed3095d12cd295e5d82e907b3829d"},"小鱼3-游动-4.png":{"bytes":1487,"sha256":"93de02157f089a830f5c71a08e30c43c99db6d7f2274b6299c81a8c6f5c19912"},"小鱼4-游动-1.png":{"bytes":1745,"sha256":"ac616c7b7336c14ee29806f3fb7064732f233a415e96e1b21e3bd04ebbba8fb4"},"小鱼4-游动-2.png":{"bytes":1759,"sha256":"4786d96e1bda2479d8555e724d72c0e220b8adc766f056d773405c58b8020338"},"小鱼4-游动-3.png":{"bytes":1714,"sha256":"07dff23b0343d99d3e94e8ff82e7aea66f244ddc9eef9c9983910be89fc01c6d"},"小鱼4-游动-4.png":{"bytes":1739,"sha256":"90dc15f58004406bc98035112961ead74312fed805f051fe2c8f25702786ed6c"},"废网巨鲨-attack-1.png":{"bytes":17924,"sha256":"bc0d8bfd94ef85f5bdcb5afe48525bb4b215ae6d3da0cc90128e5fa3dc7c1031"},"废网巨鲨-attack-2.png":{"bytes":17181,"sha256":"8bfa41f3041f951cd5638caf53029c3984d85c5e73e457eff528036d6a7b305f"},"废网巨鲨-attack-3.png":{"bytes":18869,"sha256":"5e0725a8a1bc0d05548d4eb51c5d8ee12f3a0221890e4b0140a9547db2bb25ce"},"废网巨鲨-attack-4.png":{"bytes":18336,"sha256":"e22c4a8a58b0aaaa3c2c5aa160698df882a513a4fd3e9367ad6f80a70104dbd7"},"废网巨鲨-attack-5.png":{"bytes":16829,"sha256":"594163e5635e86206c31a8fce4ae69029f8cb4e0f9e6098bbfc07fc08a47d9ea"},"废网巨鲨-attack-6.png":{"bytes":17401,"sha256":"b2cec15ea0727f0ab2685f34aac817f3a5d709540692a2c6d9e87346acb872ab"},"废网巨鲨-attack-7.png":{"bytes":17714,"sha256":"4ab8c28978c6c32cc0c42eafb00508cc2abad76aa5a3d2505cc62ff5efb75de3"},"废网巨鲨-attack-8.png":{"bytes":17629,"sha256":"67e606458a2eb168c425571c378a51cdf71920961dcbb4869861b64dc70b6c7b"},"废网巨鲨-dead-1.png":{"bytes":17951,"sha256":"916939d729dee0928c5bd945e24f7ac228b3cebe3ceba273b2251708f198c57a"},"废网巨鲨-dead-2.png":{"bytes":17687,"sha256":"9d3fde0c19369feee2bbe49bbf3afcf311816707bf02b6a25d6429a3cd98a6c0"},"废网巨鲨-dead-3.png":{"bytes":17940,"sha256":"e9b0306eb9362c7b46f4a6b829d201c4dde6ff1bcf56dc4cbc252c163b5bacc5"},"废网巨鲨-dead-4.png":{"bytes":20242,"sha256":"685e3439e605c3b4445a766dc69531049331a6a322ea0d15cbe2305f37c16558"},"废网巨鲨-move-1.png":{"bytes":17887,"sha256":"eb3c7121e80ecc4b8b1e21cf06b29426e1bbf697e7da45b7c0aaa72e31537993"},"废网巨鲨-move-2.png":{"bytes":16472,"sha256":"8c5c6add03b49dfe04de131375001b3cdc8f37dcefc1559f27c624485bf00a89"},"废网巨鲨-move-3.png":{"bytes":17145,"sha256":"c5c8311a844ec6bc8d6d029a27be1d661b0daf968555fb8fa007b97e5ec69842"},"废网巨鲨-move-4.png":{"bytes":17711,"sha256":"1680133994a2c6a4e6f749b7df9f69e0245c9f405173c0a00c12b6883b1bf14c"},"座头鲸-游动-1.png":{"bytes":8341,"sha256":"b877f6087c68feadb60553b81f41eb8570ff135177ba2683fafe6225a1b3e3fc"},"座头鲸-游动-2.png":{"bytes":8252,"sha256":"6b21a644a40636a3709002e4ddb4f64b98f631a5c63f679c8439475b3827dced"},"座头鲸-游动-3.png":{"bytes":8424,"sha256":"68edf1b4ff601f71e546d917033c26824eb824513526c9b9f82b357cfeb48d92"},"座头鲸-游动-4.png":{"bytes":8410,"sha256":"ce63c164dafa8c1337fb623a8033a78de2cb8476bb66dd98f94afdfe73c22e90"},"手枪虾.png":{"bytes":2729,"sha256":"a4c12db2a92f4d190622866c083c829ddf92361d81c700d1598feaeef072e04b"},"按钮-图鉴-Hover.png":{"bytes":9835,"sha256":"ee83029fae220274fc0b3c90c2a6ff9cf438010db586866730e8076fd142476c"},"按钮-图鉴.png":{"bytes":10506,"sha256":"1fe086714eeda2e926334a9eabcecc38bae26f0b007cd80b921b46d5aa321d53"},"按钮-开始游戏-Hover.png":{"bytes":10777,"sha256":"6dd44e7bc0302ae02cc0234354510770959b6fd814fc9cbadd6f3ca22cc0c747"},"按钮-开始游戏.png":{"bytes":11749,"sha256":"7e8a47575770a69d6d55bec25c3fa416ad128bfa954222d60e511a5140a350d9"},"按钮-设置-Hover.png":{"bytes":9460,"sha256":"b6cfac5da4b824459912bc3d3173b60dd4456273132bab26495808aff200a5d0"},"按钮-设置.png":{"bytes":9407,"sha256":"be0aeaecff6f12e3aeb7791ee4590cebf6b24bde12336678bf7937c97337bd6e"},"木箱.png":{"bytes":5976,"sha256":"85529c14446c2679eb434cb734ee2188efb938d3c92958da1903ac5258c73cea"},"标题.png":{"bytes":26678,"sha256":"77006cd6a422f8ae3bc30937ce98319d67881aa91d665ea0d7c1827d16f5fd68"},"气泡-1.png":{"bytes":169,"sha256":"d6f576ef03532a780e93fb89257fdea437e4ee12e1b3137ac0c20a70c459e4eb"},"气泡-10.png":{"bytes":443,"sha256":"183ac38ccc09341f531c6de7258fbfce22055048e0a1c09b68aed272c56ff5c4"},"气泡-11.png":{"bytes":205,"sha256":"c53a361891d1d254964fa00bd6c5e64b494275a2aca8c063ef0e139fc0b445af"},"气泡-12.png":{"bytes":324,"sha256":"992bbc1aa5ce0df53741dc6d317fbf783262b0e88d066cf407bfcbd64df9e470"},"气泡-2.png":{"bytes":348,"sha256":"87a0695faf5bc27f1a392cad1a07b4f88d4dbc34e563dd26bdd6e78ee0a8ca34"},"气泡-3.png":{"bytes":173,"sha256":"34530c663ddf5b2075cc5e81a3762b3dd7f28330afaa89115e3bbcf0ee45c2b2"},"气泡-4.png":{"bytes":437,"sha256":"644bca577e9ece342d357dc4ef253d7b54f4edb3ebdad7bcb1dbb3414b84f214"},"气泡-5.png":{"bytes":342,"sha256":"cbe83a5003ecb4f93b65dda180e7413b21c204a1e637e3159c35c480228eb723"},"气泡-6.png":{"bytes":173,"sha256":"044510718f64abdd7564d37f4fd295afaa69b7ba324eb08fd2518f072c1b5e72"},"气泡-7.png":{"bytes":341,"sha256":"8569826e34ec847d3057adad3b4a72943be0757303b81fb7b3720e2e1ca2d1f1"},"气泡-8.png":{"bytes":173,"sha256":"b4cd53c44d37726549da40c1768726cebb7f9ba5a285029c58668d3682fd0971"},"气泡-9.png":{"bytes":170,"sha256":"d66ee680b2c3ea92f68a3e4b0b8db6ac7373949e56790b46d5d5706d5192e980"},"水母-待机-1.png":{"bytes":5416,"sha256":"35b430545cd8bd91bc18d8f1e83707ff6ff7e44eef3b070fdccef21250c2bd77"},"水母-待机-2.png":{"bytes":4567,"sha256":"b572e39ef362f2d48b4d5a382fcd5e648eba05dcfb74977433d32f868f908ee9"},"水母-待机-3.png":{"bytes":7227,"sha256":"76c1f50e82bd8331ebb26e8c2e36a946d2388011acdda1e2d81dd472f6f9740a"},"水母-待机-4.png":{"bytes":4927,"sha256":"b1b6111d49c292adc74f809348c953240beb56d1e4c10f3fbc7de6e0325c0473"},"海星.png":{"bytes":2538,"sha256":"0597be35ef49ae3b2d3504aaeac528bb55bd8f8b3b29129a8270ac308514587e"},"海胆.png":{"bytes":5230,"sha256":"5677ed2df413f1a01cc4185f33102cc27a47bc5e1c5d4e1e14cf29cac62e831a"},"海豚-游动-1.png":{"bytes":3693,"sha256":"772cd61abafad7b1739a76998681b26617af8b7d5ab0e303b58667eb5f12f003"},"海豚-游动-2.png":{"bytes":3732,"sha256":"55ead9b10863f22a780f45e8a8242e931a0ac0c4f4900a6bb6aeba1e56d0621c"},"海豚-游动-3.png":{"bytes":3641,"sha256":"b7fba44042578bc33da0d682cd3b1728e4855d9147e14621bdeb9a26f09929ae"},"海豚-游动-4.png":{"bytes":3617,"sha256":"ad02702fce60f7acc4baa46d68f68c1c4655ef48e3b9caa8ea74b159acc2c249"},"渔网.png":{"bytes":11449,"sha256":"66eda62d2997ea9ac13713e59479c6b6c84906a51a0f590d8fe500d79d6f27f7"},"火山底座.png":{"bytes":3445,"sha256":"3502b1b84662a1c5234938b13b07334246c8afd4c2a42730fc42f1c30c6bdc02"},"火山火焰-1.png":{"bytes":7498,"sha256":"561c0ccdae9a2b4878246cd7128e68dc7970209d081a0801772a286f71c335fc"},"火山火焰-2.png":{"bytes":8166,"sha256":"9be0bbc8391cd51cd9f85a7c0fa05fe6fea520a742ee1eef531fcd62ec093a5b"},"火山火焰-3.png":{"bytes":7847,"sha256":"28e10a8393ef76d717b20a561ec5b2e706696038deb6d7afc67023b1333a0fbf"},"火山火焰-4.png":{"bytes":7426,"sha256":"2e973df899f2e9fa7cbbe3738bcd6cbf57303f8bc8c41e230cfb4da2b826f50f"},"灯笼鱼-冲锋.png":{"bytes":4820,"sha256":"16b124cf0963bd5c0d81ee5b5ae739803318a5a3e7ce606d4f544c7b41501f9f"},"灯笼鱼-移动.png":{"bytes":4641,"sha256":"3520a31ccfd2c8a879e1e487da7252a905ac01df3c522c0c921cf5b8393c56f7"},"炸弹鱼-move-1.png":{"bytes":1691,"sha256":"61b7dfe0490426398dc5c2b345a30dd385ca8579f0110c47135a7a2ade639acc"},"炸弹鱼-move-2.png":{"bytes":1521,"sha256":"f42787da0e7ab40a4593fc4c2d149f68b8216df2cb47a636555a86182bb465cb"},"炸弹鱼-move-3.png":{"bytes":1500,"sha256":"dc281e397f51c09d59fa03a1f94b14599f3da94212d9a192ae6db3355b10a393"},"炸弹鱼-move-4.png":{"bytes":1395,"sha256":"4ea6956d45586668279fe3783eca7444f6191bd7361579e0aae2486f5ff5b6f1"},"烟囱蟹王-attack-1.png":{"bytes":37581,"sha256":"cab52f8577a913283d11086ea466829bafb44a52b8f9aa7e84efb8e8ed6a0df6"},"烟囱蟹王-attack-2.png":{"bytes":37634,"sha256":"9e9d001bcaa0ee3a53a0489d8815f292de9e32bdc3e122359a58abbb39ab6bbd"},"烟囱蟹王-attack-3.png":{"bytes":40844,"sha256":"6be848b803be8d5250fbda705d88112d7a648bf8dcb1e3f4f5f40a3bedb9cb80"},"烟囱蟹王-attack-4.png":{"bytes":40284,"sha256":"8e7183ec86835f8212cb8f33a65f0751a1be2286950d488696e2bdeb9a457b09"},"烟囱蟹王-attack-5.png":{"bytes":37716,"sha256":"3a26281f82ad15c277b16e80a19c7fa991405dc3ddc774abe5d1a353a14732a1"},"烟囱蟹王-attack-6.png":{"bytes":38243,"sha256":"5e8e15c96b6814e3b74e3fa3f72fa856226e2adc571cfb2cf035d02d8ea63bb5"},"烟囱蟹王-attack-7.png":{"bytes":38085,"sha256":"2771cf5e8d6761a336946527ac46e8f7e9e9b1d4a73834ed9d47d45b4a67e5eb"},"烟囱蟹王-attack-8.png":{"bytes":38322,"sha256":"07723a5925b945a623a5fc87d43b9895399e8f4b0c96ca1edd17cb9fc1259331"},"烟囱蟹王-dead-1.png":{"bytes":37376,"sha256":"c18e6b23ccc5e1f2cbcbd6f20dc87633327a3d4f3456df999e8d1a1d4f5a587d"},"烟囱蟹王-dead-2.png":{"bytes":38476,"sha256":"58f3473a3cef6d0e3aa8163f7046624d5003394cbeaf8ecb4aa0daaf9c939ab7"},"烟囱蟹王-dead-3.png":{"bytes":37545,"sha256":"5dfb934a15fad249c567b2dad86a8c6ce5fb9c3f1bf3ace0c737f0a172063b61"},"烟囱蟹王-dead-4.png":{"bytes":34913,"sha256":"9e6276ca507402e73c39a8db004516fcc50a0d9dcfd3931b00339347c23e1450"},"烟囱蟹王-move-1.png":{"bytes":37470,"sha256":"fea6a52d0c8051861632d4648c3d54f6a83287a8e9ebc83ed2f6909b908ac6e5"},"烟囱蟹王-move-2.png":{"bytes":38633,"sha256":"584a68d540c3ece865fea2774ca918ba00117e2ec39cc2fd8d3902dc18221086"},"烟囱蟹王-move-3.png":{"bytes":38003,"sha256":"71d76cab5481b66d4df907b183ed83e1fec856c06491a56e0cd7c6c1ac206a94"},"烟囱蟹王-move-4.png":{"bytes":38152,"sha256":"068ca75b0b2d132ab149115acdd516b1f63daaa0cd0096b699722f106c5eaab4"},"焦散.png":{"bytes":13106,"sha256":"01c04e7d2b0a163b2464e2a5033369ff7ad4772963a318d22b5aba8fc9567bc5"},"玩家子弹.png":{"bytes":317,"sha256":"afc452bcb8e040136b43fb269867b697ff772cb8b182ef0c4892be41c5408a06"},"玩家气泡.png":{"bytes":1131,"sha256":"9c3625f8835fd1b4bc19b98aa849ef20c796ed336170d69b8419891dae9c51be"},"珊瑚-团状.png":{"bytes":10909,"sha256":"6e2ea9470b8b39e58e09a43d6c0f29a3449d1d690b02963042615207186079eb"},"珊瑚-扇形.png":{"bytes":13971,"sha256":"d88470b6d618114ffc05faf21ae1acaff897a30d65f0d4a1bc3f413c88c5347f"},"珊瑚-枝状.png":{"bytes":7189,"sha256":"ec58d64ca86a1c5f85709c2f7b7084307981c1d6c73fa1614466695dbe003d0c"},"珊瑚-桌状.png":{"bytes":8610,"sha256":"8f5b0b483ebb61b12d245b88dab06cf3203d3b7d9fae09a2309e5ccceaf8e33a"},"珊瑚-管状.png":{"bytes":7346,"sha256":"eb2ccb835261b5933042ad5fd1ef57c6ef8ff2ea8f68dc79ba28e525e6326739"},"珊瑚-鹿角.png":{"bytes":9124,"sha256":"e413dd7ba36b0f523289226a1d743d6cbc7a3e48e52ad2d9e5c0dc9462692ce9"},"珊瑚.png":{"bytes":11377,"sha256":"116e542855d0b0dc26b9c30e8ad885879acb4f2c0a32ed6ab16b834c526a6a1f"},"电击水母-move-1.png":{"bytes":5479,"sha256":"584969b1ffeadbf5905478495697aa697acf823307cf369fb533f9f75e301396"},"电击水母-move-2.png":{"bytes":5330,"sha256":"d1cbd5bea66f7bbf1df86ebda9550064c9d89eb7eaa41da39e480eb94f3de0bc"},"电击水母-move-3.png":{"bytes":5016,"sha256":"9551ffab0728d6e1bbe49a4512962508cd0fd6c0f2c882bf62ead904dc17db12"},"电击水母-move-4.png":{"bytes":5059,"sha256":"c1e1f78467caffcb63985cf8e35cb225cd69251c92f278baa8a0e3beb373c803"},"电鳗-放电.png":{"bytes":5767,"sha256":"5e52e9cfb24f1f7ffa017e9ba4c15fcef6a41da64c06449d6fb26b77ade8f860"},"电鳗.png":{"bytes":3332,"sha256":"7f5648a14dbb8ea588b8f305d02a70f78df2284289a16f851b65305561e3b2a7"},"电鳗闪电.png":{"bytes":1069,"sha256":"e269b5faae4e34c5c24647b545b8de25b4d1e5c57b906ddf5506e884762f58df"},"盲虾-蓄力.png":{"bytes":2952,"sha256":"fc4f18d0f6b631a57f5263fdb3c216aff9f509c44737423a67caea54b8fffb06"},"盲虾.png":{"bytes":2381,"sha256":"1b58ca5c485936a93eb82068e698fb3584bf7f08111ddf69ecd480d488416fd6"},"矿物颗粒.png":{"bytes":725,"sha256":"8db5b6168bbb67a57ad32462e747ed735165b124075c618fb62ccf1006907caf"},"章鱼-游动-1.png":{"bytes":9396,"sha256":"10516bbf5198457e676cfac5bb2e1ba5cb532ffdfec51b2a36a539aa8f554117"},"章鱼-游动-2.png":{"bytes":9486,"sha256":"21ea0277fd60f100be341b5dfb16a276059303ce96068d23862d30590a9f4490"},"章鱼-游动-3.png":{"bytes":9291,"sha256":"587a19f06cc161cfe3dfe943f05fa15f6fc26c9fc006ba7cc19e67f6d565438e"},"章鱼-游动-4.png":{"bytes":9317,"sha256":"b5c45a27fa350642273d0ea2fdd5bd367c3313eec650acdd177a8167304c5a31"},"管虫.png":{"bytes":6238,"sha256":"eaf2f735433d917016b63727f9e5dbffb660c3751bfdf400a1916d2e5854a80e"},"螃蟹-BOSS-待机-1.png":{"bytes":28746,"sha256":"f680b0e9202d74e6275f476be728732a8e4c7d53d3b518751666c09f23ba34e8"},"螃蟹-BOSS-待机-2.png":{"bytes":29998,"sha256":"6a1f5c9c81ec0c36cb1006b922cc60d9dbfa3009fef76133d4f746c3a4f5e548"},"螃蟹-BOSS-待机-3.png":{"bytes":29226,"sha256":"4f2d0e91ee3a3aab93e5eb276222431a788731b13d36f721c144eebc50efa86f"},"螃蟹-BOSS-待机-4.png":{"bytes":27826,"sha256":"589d662b5b04c5edc23c40a23ffed382419e3abf960a70f3e0dedccc16c70fc4"},"螃蟹-BOSS-攻击-1.png":{"bytes":30894,"sha256":"e7e44519940487e41c475e591c0af299ed98966516b6555c30b436dc6a799a17"},"螃蟹-BOSS-攻击-2.png":{"bytes":32198,"sha256":"1b072a2525f65d23e6eaface82b738802e63a9ba8fb2dfb858b8fb32cf1fc407"},"螃蟹-BOSS-攻击-3.png":{"bytes":26332,"sha256":"b99ca767cc5ab272dd7113958e615a8f6d6a0af243fd65fa36ecb9396e29304f"},"螃蟹-BOSS-攻击-4.png":{"bytes":34212,"sha256":"6e27dc184050a87229f7d3425a4aa2bcc27a1f1b2787c2fee6d338db2329ce39"},"螃蟹-BOSS-攻击-5.png":{"bytes":32716,"sha256":"60684c2cc70e7e748b052b337e352103297521e2d9068bcf629ba1f71d5a2789"},"螃蟹-BOSS-攻击-6.png":{"bytes":30378,"sha256":"c92346b8ed0c50f05646f51e4393bc762405669c3ac386025b3910a2c6464b66"},"螃蟹-BOSS-攻击-7.png":{"bytes":29460,"sha256":"6f696ef2208523690eb4b5f69d72bb1fd70142229de7c26b3f655f5784b650e2"},"螃蟹-BOSS-攻击-8.png":{"bytes":31036,"sha256":"54861770a6530cda24e777a1a5567d84e328b9ddb71543d76e55dd9207309b21"},"螃蟹-BOSS-死亡-1.png":{"bytes":29170,"sha256":"86a494ad5cfe1dcf680c605974f8bc98be5b7c06344dc3ebea34e8b1e74c680b"},"螃蟹-BOSS-死亡-2.png":{"bytes":29153,"sha256":"ae8fae2de6474b6cd8a31fc90494ea9d873b9098729462afb1bac385a96b0afa"},"螃蟹-BOSS-死亡-3.png":{"bytes":38203,"sha256":"d2ac2b37a84dde6f5669a7280991b6ca7f99dfa77acad7ba5287929297d67e99"},"螃蟹-BOSS-死亡-4.png":{"bytes":13729,"sha256":"0fc2ad3d2c24e9dd6fd297f12821c2df37dae2a8e6cf4fcc6ce97eda5b0bf6a8"},"螃蟹-move-1.png":{"bytes":1736,"sha256":"c5cbbf3adb96c9d53eb22f82438fe99a4a0a2ad315b5eed3c928ac24321676db"},"螃蟹-move-2.png":{"bytes":1750,"sha256":"af1107665909b26602278e81b11354d9272745d2b2e7d06462f96d0354eaf3da"},"螃蟹-move-3.png":{"bytes":1734,"sha256":"cfb31dc8eaf686279db4e8088abfa93d12b8f3d6272894bc7aeef4a548a166be"},"螃蟹-move-4.png":{"bytes":1707,"sha256":"77ea773c4806a4589cd664a66ff0efa55761b265e1ac6c99d976ce73f4e481fa"},"金枪鱼-游动-1.png":{"bytes":3092,"sha256":"35b861eb10fd44f0a67e6ff1c159d98f5d26438eb655c46edad7c2f581b179b0"},"金枪鱼-游动-2.png":{"bytes":3058,"sha256":"96e9bcc6aa2bb00026c479fdcab98f7ed26eaa40fc2d745f6450d8f3ccd0cdc2"},"金枪鱼-游动-3.png":{"bytes":3048,"sha256":"a2210a8f7af324574c64e4a376dc5e2b599e5b8b770ede3bfbb7ed4fc9711f7a"},"金枪鱼-游动-4.png":{"bytes":3062,"sha256":"c5f17cde9ff9364db5b4a0643a51c80e01c7fde4ab2d6c84a7b8f0cf1c118627"},"长尾鲨-attack-1.png":{"bytes":7929,"sha256":"50491c3fa1b49542eebcf63b3d9e36de1f58caeed5ec15749da7f78ae05d7576"},"长尾鲨-attack-2.png":{"bytes":8931,"sha256":"068163ae06f7d0cf08fd0dffa2f44c3b35abaa3f4d8901ff3e8e72df25dfb7c8"},"长尾鲨-attack-3.png":{"bytes":7370,"sha256":"23cd1016327a216a7e57aefdaa7545b7c4bca7c7683d339619824a0aa4cb9bdc"},"长尾鲨-attack-4.png":{"bytes":7865,"sha256":"6e0fe06d266a7c6cdf201d1f2b931a53ee910612d587137a2967852845d020b6"},"长尾鲨-attack-5.png":{"bytes":7738,"sha256":"978e7d651a46f42c17390473303eb3ade4fbcc0d164d429a891ea164d9ff786b"},"长尾鲨-attack-6.png":{"bytes":7825,"sha256":"3c35944f6e5c8782817939423e837dd15f803904d36da9bca024b143d0c5d5c4"},"长尾鲨-attack-7.png":{"bytes":7789,"sha256":"21b12ce9a779574e4d092035dc58afa0fabd5e6345a6d579146decc0fdb26e61"},"长尾鲨-attack-8.png":{"bytes":7482,"sha256":"315c9fcbea0c404f14bf06537fe9be8b062d7ff8f4f4ba964b2f230e7016d582"},"长尾鲨-dead-1.png":{"bytes":7956,"sha256":"a4f29d3d5bfdcebfcb8c2f0d325aa6f680860c62bec8ccd2a3905f3c654aefdb"},"长尾鲨-dead-2.png":{"bytes":7582,"sha256":"452b54d13bb59294404e990483646ec1e895cbc4c5c671b2a0d6a5d0b605d737"},"长尾鲨-dead-3.png":{"bytes":7132,"sha256":"a79947eedf4909754eea8f41efab9027e5af19954fde5e41b07d487a21576424"},"长尾鲨-dead-4.png":{"bytes":7711,"sha256":"cb6f15f741f6b06928949c0d4423eccbd62e6b3a4389e39332c0a4f077c0d3c7"},"长尾鲨-move-1.png":{"bytes":7872,"sha256":"e3501ea22cdbfb5a5f9e16d851d52a208647af4f1397ac8d8bc7b936753e9954"},"长尾鲨-move-2.png":{"bytes":7512,"sha256":"471c751ce64a846b19b2e36577ee3885903a1dd34c067c414ad94e72797af08d"},"长尾鲨-move-3.png":{"bytes":7831,"sha256":"220f7eb743fc1d8b9afd0c1d85bb8b0ac25bd60ddcb2cec71f737bc250b31c86"},"长尾鲨-move-4.png":{"bytes":7634,"sha256":"8331d426987482d3fd8bb87366a638fb2f1cadd9ecd0e37530a2db3bdd59a326"},"风暴之眼-attack-1.png":{"bytes":22073,"sha256":"38d99aecc8afe016d4925bf82cc09145932a519ec7074feee981253cf872f898"},"风暴之眼-attack-2.png":{"bytes":23100,"sha256":"0d3e074c46d1074c2519b0d29bd2750c773f8f6441cd5f5048fb51c8b18267dd"},"风暴之眼-attack-3.png":{"bytes":22009,"sha256":"b254ad5a51d746c4a5f18680ac0e0d2665ba8fbba45467499a4d65375a514e66"},"风暴之眼-attack-4.png":{"bytes":24324,"sha256":"6805855f5c53f4958a072de17fbd175811222901145b79dad4d9ab4a2fd5ec35"},"风暴之眼-attack-5.png":{"bytes":23785,"sha256":"7d23dbb02dc1636498c7ffd6705f680e9e7f44d2723d37397fd4423b24c4fec3"},"风暴之眼-attack-6.png":{"bytes":22729,"sha256":"0c850d6a6ebf427345b23f362940ea80e599e1ebbe6930aacb30e5fa1c097943"},"风暴之眼-attack-7.png":{"bytes":22942,"sha256":"7439999734b281d7c1d134bf43805481e7f6254ad92736d039fe1e2cf1d6aa98"},"风暴之眼-attack-8.png":{"bytes":23091,"sha256":"ae21a511c1f099842d76299c821a26d3c4cf308e28c62f90a52ba29a6cdf9dab"},"风暴之眼-dead-1.png":{"bytes":22010,"sha256":"c9f3880411bd340543cee27f54cca86d7798d0c872861225ffffda70c2f04029"},"风暴之眼-dead-2.png":{"bytes":9440,"sha256":"ef2419f272934bb0aacddd97ab7d7257cbf093bea9e59bace9277efaf1a259bb"},"风暴之眼-dead-3.png":{"bytes":7103,"sha256":"c76cc7f3cb03d36186d8b6916a7533446fe31eb29eb0b97b255d9b61d24c5422"},"风暴之眼-dead-4.png":{"bytes":8448,"sha256":"3d6f6d65083d1fbfb7020d662694947a9a087fcde609f6bdf1083fb371c13d60"},"风暴之眼-move-1.png":{"bytes":22065,"sha256":"3b747abe204ae09df936e9acdc1c7f055845242fa280b05fa530fb8297b47c04"},"风暴之眼-move-2.png":{"bytes":23517,"sha256":"ecf885539dc29de65acd0b185d3d09181594be16b96555962a2383e14c5909c9"},"风暴之眼-move-3.png":{"bytes":22263,"sha256":"56331fd5fa4f430f9804bc6ce02fd1608f77861bb2bb7ec20061256300745412"},"风暴之眼-move-4.png":{"bytes":23869,"sha256":"356ae26b7afe3f17806ecbb04da1fe86f8cf9277039fa881ebc2f6d71739fc33"}},"textureBytes":1490192,"version":"1.0"}`)},wl=new URL(`atlas-1-C9zZX0i5.webp`,import.meta.url).href,Tl=new URL(`黑烟囱墓场-最远景-Dp7Td2Af.jpg`,import.meta.url).href,El=new URL(`黑烟囱墓场-远景-CiyQc9A6.jpg`,import.meta.url).href;function Dl(e){let{frames:t}=e;if(Array.isArray(t))return t;let n=Math.max(1,Math.round(e.count??1));return Array.from({length:n},(e,n)=>t.replace(`{n}`,String(n+1)))}function Ol(e){let t=Math.max(1,Dl(e).length);return Math.min(e.maxSeconds,t/Math.max(.01,e.framesPerSecond))}function kl(e,t){let n=Math.max(1,Dl(e).length),r=Ol(e),i=Math.floor(n/r*Math.max(0,t));return e.once?Math.min(n-1,i):i%n}function Al(e){let t=1;for(let n=e.parent;n;n=n.parent)t*=n.scale?.y??1;return t<0}var jl=Object.assign({"./assets/atlas/atlas-1.json":Cl}),Ml=Object.assign({"./assets/atlas/atlas-1.webp":wl}),Nl=Object.assign({"./assets/黑烟囱墓场-最远景.jpg":Tl,"./assets/黑烟囱墓场-远景.jpg":El});function Pl(e){return e.replace(/^.*\//,``).replace(/\.[^.]+$/,``)}var Fl=new Map,Il=new Map,Ll=new Map;for(let[e,t]of Object.entries(jl)){let n=Pl(e),r=Object.entries(Ml).find(([e])=>Pl(e)===n)?.[1];if(!r){console.warn(`[assets] the atlas manifest ${n}.json has no texture beside it -- was the pack interrupted?`);continue}Il.set(n,{id:n,data:t,url:r});for(let[e,r]of Object.entries(t.frames??{}))Fl.has(Pl(e))||Fl.set(Pl(e),{page:n,key:e,width:r.frame.w,height:r.frame.h})}for(let[e,t]of Object.entries(Nl))Ll.set(Pl(e),t);var Rl=new Map,zl=new Map;async function Bl(e){let t=Rl.get(e);if(t)return t;let n=zl.get(e);if(n)return n;let r=Il.get(e);if(!r)return null;let i=(async()=>{let t=await Cr.load(r.url);t.source.scaleMode=`nearest`,t.source.update();let n=new Xt(t,r.data);return await n.parse(),Rl.set(e,n),n})().catch(t=>(console.warn(`[assets] could not load atlas page ${e}: ${t instanceof Error?t.message:String(t)}`),null)).finally(()=>{zl.delete(e)});return zl.set(e,i),i}function Vl(e){let t=Fl.get(e);if(!t)return null;let n=Rl.get(t.page)?.textures[t.key];return n&&n.width>0?n:null}function Hl(e){if(!e)return``;let t=Pl(e);return Ll.get(t)||(Fl.has(t)||console.warn(`[assets] no separate file called "`+e+`". Its own file: `+[...Ll.keys()].join(`, `)),``)}function Ul(){return[...[...Fl.values()].map(e=>e.key),...Object.keys(Nl).map(e=>e.replace(/^\.\/assets\//,``))]}function Wl(){return[...Fl.values()].map(e=>e.key)}async function Gl(e){let t=Pl(e),n=Fl.get(t);if(n){let t=(await Bl(n.page))?.textures[n.key];return!t||t.width<=0?(console.warn(`[assets] ${e} is in ${n.page} but came out empty`),null):t}let r=Ll.get(t);if(!r)return console.warn(`[assets] no picture called "`+e+`". Available: `+Ul().join(`, `)),null;try{let t=await Cr.load(r);return!t||t.width<=0?(console.warn(`[assets] `+e+` decoded to an empty texture`),null):t}catch(t){return console.warn(`[assets] could not load `+e+`: `+(t instanceof Error?t.message:String(t))),null}}function Kl(e){return Promise.all(Dl(e).map(e=>Gl(e))).then(e=>e.filter(e=>e!==null))}function ql(e){let t=Pl(e);if(Fl.has(t))return Vl(t);let n=Ll.get(t);if(!n)return null;let r=Cr.get(n);return r&&r.width>0?r:null}function Jl(e){let t=Fl.get(Pl(e));return t?{width:t.width,height:t.height}:null}var Yl=new Map;async function Xl(e){let t=new Map;return await Promise.all(e.map(async e=>{let n=Yl.get(e);if(n!==void 0){t.set(e,n);return}let r=0;try{let t=(await fetch(e,{method:`HEAD`})).headers.get(`content-length`),n=t===null?NaN:Number(t);Number.isFinite(n)&&n>0&&(r=n)}catch{}Yl.set(e,r),t.set(e,r)})),t}async function Zl(e,t){let n=new Set,r=new Set;for(let t of e){if(t.length===0)continue;let e=Pl(t),i=Fl.get(e);i?n.add(i.page):Ll.has(e)&&r.add(e)}let i=[...[...n].sort().map(e=>({url:Il.get(e)?.url??``,load:()=>Bl(e)})),...[...r].sort().map(e=>({url:Ll.get(e)??``,load:()=>Gl(e)}))],a=performance.now(),o=new Map,s=[],c=e=>e.reduce((e,t)=>e+(o.get(t)??0),0),l=()=>t({done:s.length,total:i.length,bytesDone:c(s),bytesTotal:c(i.map(e=>e.url)),seconds:(performance.now()-a)/1e3});l(),Xl(i.map(e=>e.url).filter(e=>e.length>0)).then(e=>{for(let[t,n]of e)o.set(t,n);l()}),await Promise.all(i.map(async e=>{await e.load(),s.push(e.url),l()}))}function Ql(e){"@babel/helpers - typeof";return Ql=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},Ql(e)}function $l(e,t){if(Ql(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(Ql(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function eu(e){var t=$l(e,`string`);return Ql(t)==`symbol`?t:t+``}function J(e,t,n){return(t=eu(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var tu=class{constructor(e){J(this,`spec`,void 0),J(this,`root`,new P),J(this,`sprites`,[]),J(this,`loaded`,!1),J(this,`loadError`,``),J(this,`canvasWidth`,0),J(this,`canvasHeight`,0),J(this,`laneWidthMeters`,0),this.spec=e,this.root.eventMode=`none`;let t=new Image;t.decoding=`async`,t.onload=()=>{let n=O.from(t);for(let t=0;t<2;t++){let t=new F(n);t.anchor.set(.5,0),t.alpha=e.alpha,t.tint=e.tint,t.eventMode=`none`,this.root.addChild(t),this.sprites.push(t)}this.loaded=!0,this.loadError=``,this.applyLayout()},t.onerror=()=>{this.loaded=!1,this.loadError=`the image could not be loaded`,console.warn(`[backdrop] could not load `+e.image)};let n=Hl(e.image);if(!n){this.loadError=`no such image: `+e.image;return}t.src=n}get isLoaded(){return this.loaded}get error(){return this.loadError}layout(e,t,n=0){this.laneWidthMeters=n,this.canvasWidth=e,this.canvasHeight=t,this.applyLayout()}applyLayout(){this.sprites.length}draw(e,t){if(this.sprites.length===0||this.canvasWidth<=0||t<=0)return;let n=this.laneWidthMeters>0?this.laneWidthMeters*t:this.canvasWidth,r=this.canvasHeight*this.spec.heightScreens,i=r,a=(e*this.spec.speedFactor*t%i+i)%i;for(let[e,t]of this.sprites.entries())t.width=n,t.height=r,t.x=this.canvasWidth/2,t.y=a-e*i}},nu=class{constructor(){J(this,`root`,new P),J(this,`layers`,[]),J(this,`offsets`,[]),this.root.eventMode=`none`;for(let e=0;e<q.background.layers.length;e++){let e=new V;e.eventMode=`none`,this.root.addChild(e),this.layers.push({g:e,motes:[]})}}layout(e,t){let n=q.background;for(let[r,i]of this.layers.entries()){let a=n.layers[r],o=Math.max(40,t*n.tileScreens);i.motes.length=0;let s=Math.round(a.count*n.countScale);for(let t=0;t<s;t++)i.motes.push({x:Math.random()*e,y:Math.random()*o*2,r:e*a.sizeRatio*(.6+Math.random()*.8)})}}get layerOffsetsRef(){return this.offsets}draw(e,t,n){let r=q.background,i=Math.max(1,n-t),a=Math.max(40,i*r.tileScreens);for(let[i,o]of this.layers.entries()){let s=r.layers[i],c=o.g;if(c.clear(),s.alpha<=.005||s.count<=0)continue;let l=e*s.speedFactor;this.offsets[i]=l;for(let e of o.motes){let r=e.y+l;r=t+((r-t)%(a*2)+a*2)%(a*2);let i=r>n?r-a*2:r;i<t-a||i>n+a||c.circle(e.x,i,e.r)}c.fill({color:s.colour,alpha:s.alpha})}}},ru=`// =====================================================================================================
// 第 1 关：black-smokers
// =====================================================================================================
// 一个关卡一个文件。**文件名前面的编号就是关卡顺序**（加载顺序 = 解锁顺序），所以插入新关卡用 01b- 这样的号，
// 不用把后面所有文件改名。
//
// 这块水域有什么、刷什么怪、什么颜色，全在这个文件里；每一项能写什么见 config/levels.json5 顶部的说明。
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪个文件、哪一项）。
// =====================================================================================================

// =====================================================================================================
// 第一关：黑烟囱墓场
// =====================================================================================================
//
// 环境：深海热液喷口区。几乎没有自然光，海床是岩石裂隙和"黑烟囱"，高温矿物烟流不断往上喷。
// 气氛压抑、安静，颜色是黑 / 暗红 / 一点微弱的生物蓝光。**这是教学关**，所以节奏慢、威胁读得懂。
//
// 这一关教两件事，各有一个招牌：
//   1. **热流乘升**（\`vent\`）：喷口长在**左墙或右墙上**，朝向只有三种，且**解法不止一种**——
//      斜向的靠**横向挪开**，横贯整条泳道的横向喷流只能**靠时机**（往下压，等它喷完）。
//      喷发是周期性的，安全窗口看得见；底座是岩石，撞上去也疼，所以贴着墙等不是免费的。
//   2. **路会被封住**（\`tube\` 管虫群）：管虫受刺激才伸出来，所以"走哪条缝"是个要看一眼再决定的事。
{
  id: 'black-smokers',
  name: '黑烟囱墓场',
  // 黑烟囱墓场与沉船幽谷共用这首曲子（\`src/assets/audio/music/slow-100.mp3\`）。
  music: 'slow-100',
  // 黑烟囱墓场：几乎没有自然光。黑 + 暗红（热液的余晖）+ 一点微弱的生物蓝光。
  palette: {
    // 水体渐变的**不透明度**：0.62 让它成为一层"水色薄雾"，而不是一块不透明色板——于是最远景那张
    // 海底火山图能透出来（图是画在水里，不是画在水后面）。其它关没有手绘图，保持默认 1，观感不变。
    // **暂时设为 0**：水完全隐藏，先单独看这张图（0 = 不画水，1 = 完全不透明）。
    waterAlpha: 0,
    deep: 0x03060a,
    shallow: 0x101820,
    bloom: 0x6f8fa8,
    tint: 0x7a1f18,
    tintStrength: 0.14
  },
  scrollLength: 2090,

  // ---------------------------------------------------------------------------------------------
  // 路径（spline）：让一串鱼沿同一条曲线游过屏幕
  // ---------------------------------------------------------------------------------------------
  //
  // **坐标是两种不同的东西，这是刻意的**：
  //   \`x\` = **泳道比例**。0 是屏幕左边缘，1 是右边缘，<0 / >1 就是屏幕外——"从右边进、从左边出"就是这么写的。
  //         泳道宽度固定 361 米，所以比例在任何设备上都是同一个地方。
  //   \`y\` = **屏幕比例，相对出生点，正值朝上**。1 就是"一屏高"：
  //         0 = 出生点（顶边），-0.5 = 屏幕正中，-1 = 底边，正的 = 顶边外面。
  //
  //   为什么 \`y\` 不写米：**这个游戏一屏有多少米是看设备的**。泳道锁死 361 米宽，于是屏幕越高、一屏的米数越多，
  //   实测手机 781 米、桌面窗口 433 米——写米的话"屏幕中央"在两种设备上会变成两个地方，而"从屏幕右侧中央出发"
  //   正是这里要说的那句话。
  //
  //   曲线是**穿过**这些点的 Catmull-Rom spline，所以"从这里过一下"是真的从那里过（Bézier 只会被拉近）。
  //   **世界一直在往下卷**，所以你在屏幕上看到的斜度 = 这条曲线 **加上** 卷动带来的下沉，一秒约沉
  //   \`scrollSpeed / 一屏米数\` 屏。想让一条路线"看到的"就是画出来的样子，把 \`seconds\` 调短。
  //
  // \`seconds\` 是走完整条曲线的秒数。**一串里谁先谁后不靠出发时刻，靠各自的出发延迟**（\`pathSpacingSeconds\`）：
  // 整串一起出现在曲线**起点**排队，然后每隔 \`pathSpacingSeconds\` 走一条，所以看到的是一群鱼游进来，而不是
  // 几条鱼凭空出现在曲线中段。**这也是为什么每条路线的第一个点都在屏幕外**——排队的地方要是看得见，那就是一坨。
  // 想让一串更密就把 \`pathSpacingSeconds\` 调小，想让它更长就加 \`count\`。
  //
  // ---------------------------------------------------------------------------------------------
  // 背景（backdrops）：这一关的水是什么样
  // ---------------------------------------------------------------------------------------------
  //
  // 最远景：一张手绘的海底火山脊图（\`public/levels/\` 下的图片）。
  //
  // 这是全项目唯一一个"图片才是对的答案"的地方：一关的环境是一件**美术品**——海床上的火山脊——
  // 再多的程序化微粒也说不出这件事。按关卡给，理由和 palette 一样：六关是六个地方。
  // **背景层，由远到近**：数组顺序就是绘制顺序（第一个在最里面），也是深度顺序。
  // 每层一张图、各有各的速度；世界还在往下卷，"远处的几乎不动、近处的滑过去"不用画就有。
  backdrops: [
    {
      // 最远：海底火山脊。几乎不动（0.03）——动得快就变成"贴着镜头的一块布"。
      // 只写名字**不写扩展名**：换成 .png / .webp 同名文件也能直接用，换图不用改代码。
      image: '黑烟囱墓场-最远景',
      speedFactor: 0,
      heightScreens: 1.0,
      alpha: 0.62,
      // 乘进去的颜色：让它落在这关的暗红/黑里，而不是浮在上面。
      tint: 0x8f6a7a
    },
    {
      // 远景：比最远那层快，但仍是"远"的量级（视差四层微粒是 0.08 / 0.22 / 0.5 / 1.0，这一层压在它们后面）。
      // 调大就更像"中景"，调小就并进最远景。
      image: '黑烟囱墓场-远景',
      speedFactor: 0.07,
      heightScreens: 1,
      alpha: 0.5,
      tint: 0x9a7484
    }
  ],

  paths: {
    // ---------------------------------------------------------------------------------------------
    // 横穿型
    // ---------------------------------------------------------------------------------------------

    // 从一侧进、在屏幕内上下摆两次、从另一侧出去的一串鱼。教学用的那条。
    // 下面写的是**不镜像**时的样子；具体从哪一侧进，由这一块自己的硬币决定。
    weave: {
      points: [
        { x: 1.25, y: -0.2 },
        { x: 0.78, y: -0.75 },
        { x: 0.45, y: -0.15 },
        { x: 0.16, y: -0.8 },
        { x: -0.3, y: -0.25 }
      ],
      seconds: 7.5
    },

    // 左 1/4 起、拱过**屏幕正中**、到右 3/4 收的一个半圆（最后两个点只是把它送出画）。
    // 弦压在屏幕偏下的位置，所以这条弧是**从下面兜上来**的，不是贴在天花板上。
    // 名字不再承诺方向：每次生成时整块有 50% 概率水平镜像，右起的那一半由镜像得到。
    arc: {
      points: [
        { x: -0.25, y: -0.95 },
        { x: 0.25, y: -0.9 },
        { x: 0.5, y: -0.5 },
        { x: 0.75, y: -0.9 },
        { x: 1.25, y: -0.95 }
      ],
      seconds: 5.5
    },

    // ---------------------------------------------------------------------------------------------
    // 斜穿型
    // ---------------------------------------------------------------------------------------------

    // **左下角**到**右上角**，中途穿过屏幕正中。左下角是屏幕外，所以队列在画外等。
    // 同样由每块自己的硬币决定是否镜像成右下角到左上角。
    rise: {
      points: [
        { x: -0.3, y: -1.35 },
        { x: 0.05, y: -1.05 },
        { x: 0.5, y: -0.5 },
        { x: 0.95, y: 0.05 },
        { x: 1.3, y: 0.4 }
      ],
      seconds: 5.5
    },

    // ---------------------------------------------------------------------------------------------
    // 街机常见的那几手
    // ---------------------------------------------------------------------------------------------

    // 从正上方直冲下来，到底再贴着底边甩出去——正面留不出缝，玩家得**从底下钻过去**。
    dive: {
      points: [
        { x: 0.5, y: 0.35 },
        { x: 0.5, y: -0.55 },
        { x: 0.62, y: -1.05 },
        { x: 1.3, y: -1.2 }
      ],
      seconds: 4.5
    },

    // 绕整一圈再走：先在屏幕里打个环，收口的时候从顶边出去。九秒是刻意的，慢到玩家能看清它是个环。
    loop: {
      points: [
        { x: 0.15, y: 0.3 },
        { x: 0.2, y: -0.35 },
        { x: 0.8, y: -0.35 },
        { x: 0.8, y: -1.05 },
        { x: 0.2, y: -1.05 },
        { x: 0.62, y: 0.3 }
      ],
      seconds: 9
    },

    // 从画外斜插到屏幕正中再合流向下——要的就是中间那一小段窗口。
    // 两路**不再各写一份**：两块用同一个中性路径，各自掷自己的左/右；可能仍然一左一右，
    // 也可能两条都从同一边来（见下面的刷怪块）。
    pincer: {
      points: [
        { x: -0.3, y: -0.15 },
        { x: 0.2, y: -0.35 },
        { x: 0.5, y: -0.62 },
        { x: 0.52, y: -1.15 }
      ],
      seconds: 4
    }
  },

  boss: {
    at: 1900,
    health: 700,
    // 攀附在巨大热液烟囱上的蟹：横向挥螯、喷矿物颗粒、堵住喷口制造一次猛烈爆发。
    name: '烟囱蟹王',
    // **这一关的 BOSS 是哪一只**：它怎么动、多大、什么颜色、怎么开火，全在
    // config/mechanics.json5 的 \`hazards.bosses.boss-crab\`。这一关原来还写着一个 \`colour: 0x6b2f2a\` ——
    // "这一关的 BOSS 是什么颜色"从来不该由关卡来说，它属于那只 BOSS。
    kind: 'boss-crab'
  },

  // 教学关：慢。固定推进速度 32 m/s，一屏（190 米）约 5.9 秒，整关 2090 / 32 ≈ 65 秒。
  scrollSpeed: 32,
  // 生物在**屏幕上**的下落速度（米/秒）。以前它和 scrollSpeed 是同一个数：改关卡节奏会连带改每条鱼的速度。
  // 现在 scrollSpeed 只管关卡推进（时间线、进度、背景视差），生物的速度只看这个。写的是这一关原来的数值，所以屏幕上没变。
  driftSpeed: 30,
  playerLeadLimit: 110,
  // ---------------------------------------------------------------------------------------------
  // 刷怪表：**安静开场 → 平滑上升 → 三次爆发（间隔 2 屏 → 1 屏 → 1 屏）→ 进 BOSS 前收一屏**
  // ---------------------------------------------------------------------------------------------
  //
  // \`S<n>\` 是每一块落在第几屏（一屏 190 米，见 \`WORLD_HEIGHT\`）。形状对不对**看读数**，不要凭感觉：
  //
  //     node scripts/probe-pacing.mjs
  //
  // 它打出这一关的"每屏威胁"序列。这一关原来（2500 米、83 秒）是 \`9 10 35 30 38 33 15 0 0 0 0 0 0 0\`——
  // **一半挤爆、一半空掉**；现在应当是中间高两头低，最后两屏留给 BOSS 前那一口气。
  //
  // **11 屏 / 65 秒 / 约 125 分威胁**：米数比原来短（2090 对 2500），但**内容一点没少**（原来 170 分挤在 7 屏里，
  // 现在 125 分铺在 11 屏里），时长靠**放慢开头**补回来。密度 11.4/屏，是六关里最松的一关。
  //
  // 三次爆发越来越近（S3 → S5 → S6），因为"突然全来了"这件事**靠的是它来得比上一次快**，
  // 而不是靠底噪一点点升高。
  //
  // **收集物铺在每一屏的缝隙里**：起/落屏各 3-4 颗（一小串 \`spread\`，顺手就能吃到一颗），爆发屏**一颗都不放**
  // （那一屏只有威胁），开场那一屏 6 颗、收尾那屏 8 颗。它的定位是「击败怪物的间隙顺手捡到」，所以它得
  // **从头到尾都在**，而不是只在开头结尾各堆一撮——上一轮六关都是「两头两撮、中间 45-58 秒一颗都没有」。
  spawns: [
    // --- S0  安静开场：只有食物和一点颗粒。玩家在这里学"往上、吃泡泡"。
    { at: 30, span: 150, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.22, sizes: [0.4, 0.5, 0.35] },
    // 第一批颗粒**从下面上来**：这一关第一个新方向。
    { at: 120, span: 60, count: 3, kind: 'mineral', arrange: 'spread', x: 0.5, from: 'bottom' },

    // --- S1  起：一串会游动的鱼（\`weave\`）、一只盲虾，和**喷口第一次登场**。
    { at: 200, span: 170, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.22, sizes: [0.4, 0.5, 0.35] },
    { at: 240, kind: 'shrimp', x: 0.5 },
    { at: 290, kind: 'fish', count: 6, path: 'weave', x: 0.5, pathSpacingSeconds: 0.35 },
    // **喷口第一次登场，而且是早的**：它的三种朝向（\`up\` / \`down\` / \`flat\`）是这一关的招牌课，
    // 所以第一次放在一次爆发**之前**的安静里——玩家必须先见过它，才认得出爆发里那一次。
    // 顺序按难度：\`up\`（往旁边挪就行）在这一屏，\`down\` 在回落那屏，\`flat\`（横贯泳道、只能等时机）留到最后一次爆发。
    // 墙的左右不再写死：不写 \`side\` 就是每块独立掷一次左/右；写 left/right 才会钉死。
    { at: 340, kind: 'vent', aim: 'up' },

    // --- S2  起：**金枪鱼**——第一个会追你的，单独一条出场；再补一串矿物把这一屏填厚一点。
    { at: 400, span: 70, count: 4, kind: 'mineral', arrange: 'spread', x: 0.5 },
    { at: 440, kind: 'tuna', x: 0.85 },
    { at: 470, kind: 'shrimp', count: 2, arrange: 'spread', span: 30, x: 0.5, from: 'random', depth: 0.6 },

    { at: 380, span: 180, count: 4, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S3  **爆发一 · 黑烟囱群**：一串鱼从画外斜插上来，紧接着热流把矿物颗粒推上来。
    { at: 600, kind: 'fish', count: 14, path: 'rise', x: 0.0, pathSpacingSeconds: 0.28 },
    { at: 660, span: 70, count: 5, kind: 'mineral', arrange: 'spread', x: 0.25, from: 'bottom' },
    { at: 660, span: 70, count: 5, kind: 'mineral', arrange: 'spread', x: 0.75, from: 'bottom' },


    // --- S4  回落：一只鮟鱇 + 一只**向下喷的喷口** + 两只盲虾。刚被打过一顿，这一屏把位置找回来；
    // 喷口放在回落里（不在爆发里）是有意的：每一次见新朝向都要有一次能看懂的见面。
    { at: 800, kind: 'angler', x: 0.5 },
    // **朝下的喷口从视野上方进场**：\`aboveMeters: 250\` 把底座放在屏幕顶边之上 250 米——火焰竖直投影
    // 0.9 × 361 × sin45° ≈ 230 米，加上火焰半宽约 16 米，所以火焰尖端也刚好在屏幕外。
    // 玩家先看到火焰从顶边探进来，几秒后才看到底座；\`at: 850\` 仍然是“850 米时把它放进水面”，
    // 不是“第一次被看见”的时刻。这个数是按泳道宽 361 米算的，改泳道宽要跟着改。
    { at: 850, kind: 'vent', aim: 'down', aboveMeters: 250 },
    { at: 890, kind: 'shrimp', count: 2, arrange: 'spread', span: 30, x: 0.5, from: 'random', depth: 0.55 },

    { at: 770, span: 160, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S5  起（第二次爬升）：再来一串鱼，加两条金枪鱼——**第一条爆发和第二条之间是这一关最长的一段**，
    // 所以它需要一个能自己站住的节拍，而不是空着等下一次。
    { at: 980, kind: 'fish', count: 8, path: 'weave', x: 0.5, pathSpacingSeconds: 0.32 },
    { at: 1030, kind: 'tuna', count: 2, arrange: 'spread' },
    { at: 1080, kind: 'shrimp', count: 3, arrange: 'spread', span: 30, x: 0.5, from: 'random', depth: 0.6 },

    { at: 950, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S6  **爆发二 · 管虫丛**：一串鱼 + 枪手 + 一排管虫墙。重点在那排墙——你必须**改道**。
    { at: 1160, kind: 'fish', count: 12, path: 'arc', x: 0.2, pathSpacingSeconds: 0.28 },
    { at: 1220, kind: 'archer', x: 0.5 },
    { at: 1270, kind: 'tube', count: 3, arrange: 'barrier', gapAt: 0.4, gapWidth: 0.2 },

    // --- S7  回落：矿物 + 一条电鳗 + 两只虾。电鳗是这一关唯一的枪手类（第一次出现），单独给它一屏。
    { at: 1350, span: 70, count: 5, kind: 'mineral', arrange: 'spread', x: 0.5 },
    { at: 1400, kind: 'eel', x: 0.9 },
    { at: 1450, kind: 'shrimp', count: 2, arrange: 'spread', span: 30, x: 0.5, from: 'random', depth: 0.55 },

    { at: 1340, span: 160, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S8  **爆发三 · 热流区（最高点）**：两路合围 + **横贯泳道的喷口** + 最后一排管虫墙。
    // 间隔已经缩到 2 屏，到这里不再留余量——这是"突然全来了"最响的一次，而且它在最快的区间里。
    // 两块**各自**掷左/右：可能仍然是一边 12 条、一边 6 条，也可能两条都从同一边来。
    { at: 1540, kind: 'fish', count: 12, path: 'pincer', x: 0.0, pathSpacingSeconds: 0.26 },
    { at: 1540, kind: 'fish', count: 6, path: 'pincer', x: 1.0, pathSpacingSeconds: 0.26 },
    // **横向喷流**：它从一边铺到另一边，所以"往旁边挪"这次不管用——解法换成**时机**（压住气泡等它喷完）。
    { at: 1620, kind: 'vent', aim: 'flat' },
    { at: 1650, kind: 'tube', count: 3, arrange: 'barrier', gapAt: 0.28, gapWidth: 0.19 },

    // --- S9  收一屏：**只有食物，没有一个危险物**。BOSS 之前把手腾出来——血看回来、技能留着、怒气想清楚。
    { at: 1740, span: 140, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.5, 0.6, 0.45] },
  ],
}
`,iu=`// =====================================================================================================
// 第 2 关：wreck-gorge
// =====================================================================================================
// 一个关卡一个文件。**文件名前面的编号就是关卡顺序**（加载顺序 = 解锁顺序），所以插入新关卡用 01b- 这样的号，
// 不用把后面所有文件改名。
//
// 这块水域有什么、刷什么怪、什么颜色，全在这个文件里；每一项能写什么见 config/levels.json5 顶部的说明。
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪个文件、哪一项）。
// =====================================================================================================

// =====================================================================================================
// 第二关：沉船幽谷
// =====================================================================================================
//
// 环境：沉船、锚链和货物残骸构成的峡谷。破损船舱形成狭窄通道，漂浮物随暗流慢慢移动。
// 光线仍然昏暗，但船舱里的灯、荧光生物和反光金属让场景更容易辨认——所以这一关的颜色比第一关暖。
//
// 内容取向（不是长度）：通道更窄（木箱/船体/网混着来）、两侧都有东西进来、而且第一次出现**会转向的**敌人。
{
  id: 'wreck-gorge',
  name: '沉船幽谷',
  // 与黑烟囱墓场共用（\`slow-100.mp3\`）。
  music: 'slow-100',
  // 沉船幽谷：昏暗，但舱灯与反光金属让它更好辨认。褐绿 + 一点暖灯色。
  palette: {
    deep: 0x04090d,
    shallow: 0x1d4a4a,
    bloom: 0xbfe4d8,
    tint: 0x6b4a2a,
    tintStrength: 0.2
  },
  scrollLength: 1900,

  boss: {
    at: 1710,
    health: 900,
    // 藏在船头残骸里：用触手封锁通道，吸进附近的漂浮物再喷向玩家。触手被破坏后船体坍塌，战场改变。
    name: '寄居沉船章鱼',
    // **这一关的 BOSS 是哪一只**：它怎么动、多大、什么颜色、怎么开火，全在
    // config/mechanics.json5 的 \`hazards.bosses.boss-octopus\`。这一关原来还写着一个 \`colour: 0x6b4a3a\` ——
    // "这一关的 BOSS 是什么颜色"从来不该由关卡来说，它属于那只 BOSS。
    kind: 'boss-octopus'
  },

  // 固定推进速度 29 m/s：一屏约 6.6 秒，整关 1900 / 29 ≈ 65.5 秒。
  // 这一关的关键字是**改道**，速度保持不变才能让每一排障碍都读得懂。
  scrollSpeed: 29,
  driftSpeed: 32,
  playerLeadLimit: 110,
  // ---------------------------------------------------------------------------------------------
  // 刷怪表：**安静开场 → 起 → 三次爆发（间隔 3 屏 → 2 屏）→ 收一屏**
  // ---------------------------------------------------------------------------------------------
  //
  // \`S<n>\` 是每一块落在第几屏（一屏 190 米）。形状看读数，不要凭感觉：\`node scripts/probe-pacing.mjs\`。
  //
  // 这一关的**身份是布景**（木箱/渔网/封路墙/珊瑚），三次爆发都长在障碍上：
  // "你必须改道"这一件事在这一关是最贵的一种压力。这一轮又加了一种会改道的压力：
  // **下落木箱**——每段一次，2 秒预警后从三列之一垂直砸下。
  //
  // **10 屏 / 66 秒 / 约 165 分威胁 / 16.5 每屏**：比第一关高一档（11.7）。加入下落木箱后，
  // 它暂时比第三关还密（15.4）——\`pacing.threat.fallcrate\` 是调这个贡献的旋钮。
  //
  // **收集物铺在每一屏的缝隙里**：起/落屏各 3-4 颗（一小串 \`spread\`，顺手就能吃到一颗），爆发屏**一颗都不放**
  // （那一屏只有威胁），开场那一屏 6 颗、收尾那屏 8 颗。它的定位是「击败怪物的间隙顺手捡到」，所以它得
  // **从头到尾都在**，而不是只在开头结尾各堆一撮——上一轮六关都是「两头两撮、中间 45-58 秒一颗都没有」。
  spawns: [
    // --- S0  安静开场：只有食物和两只螃蟹。螃蟹是"机会不是敌人"——它把你弹上去，这一关先教这个。
    { at: 20, span: 120, count: 6, kind: 'bubble', arrange: 'spread', sizes: [0.4, 0.5, 0.45] },
    { at: 40, kind: 'net', count: 6, arrange: 'line' },
    { at: 60, kind: 'crab', count: 2, arrange: 'spread', from: 'random' },
    // 下落木箱：每段一次，列由屏幕三等分里随机选。预警 2 秒，木箱本身不可推、只垂直下落。
    { at: 150, kind: 'fallcrate' },

    // --- S1  起：第一排木箱（缺口是给你的）、一串渔网、第一位枪手，再补两只螃蟹把这一屏收住。
    { at: 200, kind: 'crate', count: 4, arrange: 'barrier', gapAt: 0.35, gapWidth: 0.2 },
    { at: 260, kind: 'net', count: 3, arrange: 'line' },
    { at: 320, kind: 'archer', x: 0.5 },
    { at: 350, kind: 'crab', count: 2, arrange: 'spread', from: 'random' },
    { at: 370, kind: 'fallcrate' },

    { at: 280, span: 95, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.45] },
    // --- S2  **爆发一 · 船首残骸**：木箱之后紧接着一排**撞不开的**封路墙——同一屏里两种答案，
    // 先给软的再给硬的。鮟鱇躲在墙后面（你改道的时候它正好扑上来），最后一张网封住退路。
    { at: 400, kind: 'crate', count: 5, arrange: 'barrier', gapAt: 0.45, gapWidth: 0.2 },
    { at: 450, kind: 'wall', count: 4, arrange: 'barrier', gapAt: 0.62, gapWidth: 0.2 },
    { at: 510, kind: 'angler', x: 0.5 },
    { at: 540, kind: 'crab', count: 3, arrange: 'spread', from: 'random' },
    { at: 560, kind: 'net', count: 3, arrange: 'line' },
    { at: 580, kind: 'fallcrate' },

    // --- S3  回落：水母（减速）和一张网，再补两只螃蟹。减速之后撞上网是这一关最有教育意义的一次挫折——
    // 而这次挫折现在**多了一屏**来读：被打完之后有三屏才到下一次爆发。
    { at: 600, kind: 'jelly', count: 3, arrange: 'line', from: 'random' },
    { at: 640, kind: 'net', count: 3, arrange: 'barrier', gapAt: 0.55, gapWidth: 0.2 },
    { at: 700, kind: 'crab', count: 2, arrange: 'spread', from: 'random' },
    { at: 730, kind: 'fallcrate' },

    { at: 700, span: 50, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.45] },
    // --- S4  起（第二次爬升）：木箱 + 枪手 + 两条鱼雷。**这是全关最长的一段安静**，所以它得自己站住：
    // 一条鱼雷是诚实的，两条就开始算账了；水母放在末尾，让这一屏的账单带到来不及。
    { at: 780, kind: 'crate', count: 4, arrange: 'barrier', gapAt: 0.4, gapWidth: 0.2 },
    { at: 840, kind: 'archer', x: 0.5 },
    { at: 880, kind: 'torpedo', count: 2, arrange: 'spread', from: 'random' },
    { at: 910, kind: 'crab', count: 2, arrange: 'spread', from: 'random' },
    { at: 920, kind: 'jelly', count: 2, arrange: 'spread', from: 'random' },
    { at: 940, kind: 'fallcrate' },

    { at: 900, span: 40, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.45] },
    // --- S5  **爆发二 · 货舱通道**：珊瑚（硬，变小有优势）+ 两条鱼雷 + 一排封路墙。
    // 珊瑚和封路墙在同一屏里是这一关最贵的一次"改道"：一个能打碎，一个打不碎，而且它们之间只有两秒。
    { at: 980, kind: 'coral', count: 5, arrange: 'barrier', gapAt: 0.5, gapWidth: 0.2 },
    { at: 1040, kind: 'torpedo', count: 2, arrange: 'spread', from: 'random' },
    { at: 1080, kind: 'wall', count: 3, arrange: 'barrier', gapAt: 0.3, gapWidth: 0.19 },
    { at: 1100, kind: 'fallcrate' },

    // --- S6  回落：水母 + 网 + 一排木箱。间隔已经从 3 屏缩到 2 屏，所以这一屏比上一次回落更短也更急。
    { at: 1160, kind: 'jelly', count: 3, arrange: 'line', from: 'random' },
    { at: 1200, kind: 'net', count: 3, arrange: 'line' },
    { at: 1250, kind: 'crate', count: 3, arrange: 'barrier', gapAt: 0.5, gapWidth: 0.2 },
    { at: 1270, kind: 'fallcrate' },

    { at: 1290, span: 30, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.45] },
    // --- S7  **爆发三 · 锚链（最高点）**：最后一排封路墙 + 三条鱼雷 + 两只鮟鱇 + 水母。
    // 间隔已经缩到 2 屏，到这里不再留余量——而且它在最快的区间里（每屏 5.6 秒）。
    { at: 1340, kind: 'wall', count: 5, arrange: 'barrier', gapAt: 0.3, gapWidth: 0.19 },
    { at: 1400, kind: 'torpedo', count: 3, arrange: 'spread', from: 'random' },
    { at: 1450, kind: 'angler', count: 2, arrange: 'line' },
    { at: 1490, kind: 'jelly', count: 2, arrange: 'spread', from: 'random' },
    { at: 1520, kind: 'fallcrate' },

    // --- S8  收一屏：**只有食物**，外加两只螃蟹（它们是往上的推力，不是威胁）。
    { at: 1560, span: 140, count: 8, kind: 'bubble', arrange: 'spread', sizes: [0.4, 0.5, 0.45] },
    { at: 1600, kind: 'fallcrate' },
    { at: 1650, kind: 'crab', count: 2, arrange: 'spread', from: 'random' },
  ],

}
`,au=`// =====================================================================================================
// 第 3 关：jelly-forest
// =====================================================================================================
// 一个关卡一个文件。**文件名前面的编号就是关卡顺序**（加载顺序 = 解锁顺序），所以插入新关卡用 01b- 这样的号，
// 不用把后面所有文件改名。
//
// 这块水域有什么、刷什么怪、什么颜色，全在这个文件里；每一项能写什么见 config/levels.json5 顶部的说明。
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪个文件、哪一项）。
// =====================================================================================================

// =====================================================================================================
// 第三关：发光水母林
// =====================================================================================================
//
// 环境：中层海域。巨型水母像树冠一样悬着，触须垂下形成垂直的"森林"。背景开始有微弱的阳光，
// 主色转成蓝紫 / 青 / 粉。**这一关强调路线观察**：战斗压力比前两关低，环境危险高。
//
// 招牌机制：**导电连锁**（已实现）。气泡不会被电立刻击破，而是**积累电荷**；带电时靠近另一只水母
// 就会引爆连锁，于是同一个机制同时是危险、武器、以及路线解谜（把电导向封路的触须）。
{
  id: 'jelly-forest',
  name: '发光水母林',
  // 与猎食者温跃层共用原第一关主题（\`black-smokers.mp3\`）。
  music: 'black-smokers',
  // 发光水母林：中层海域，蓝紫 / 青 / 粉。
  palette: {
    deep: 0x0a0a24,
    shallow: 0x4a6fd0,
    bloom: 0xd8b8ff,
    tint: 0x8a4fd0,
    tintStrength: 0.3
  },
  scrollLength: 1900,

  boss: {
    at: 1710,
    health: 1000,
    name: '冠冕水母',
    // **这一关的 BOSS 是哪一只**：它怎么动、多大、什么颜色、怎么开火，全在
    // config/mechanics.json5 的 \`hazards.bosses.boss-jelly\`。这一关原来还写着一个 \`colour: 0xb98cff\` ——
    // "这一关的 BOSS 是什么颜色"从来不该由关卡来说，它属于那只 BOSS。
    kind: 'boss-jelly'
  },

  // 固定推进速度 27 m/s：一屏约 7.0 秒，整关 1900 / 27 ≈ 70.4 秒。
  // 这一关的压力不来自速度，来自**读**——电水母碰它放电、打它也放电、还会连累旁边那只，所以它慢。
  scrollSpeed: 27,
  driftSpeed: 28,
  playerLeadLimit: 110,
  // ---------------------------------------------------------------------------------------------
  // 刷怪表：**安静开场 → 起 → 三次爆发（间隔 3 屏 → 2 屏）→ 收一屏**
  // ---------------------------------------------------------------------------------------------
  //
  // \`S<n>\` 是每一块落在第几屏（一屏 190 米）。形状看读数：\`node scripts/probe-pacing.mjs\`。
  //
  // 电水母是这一关唯一"越打越危险"的东西（碰它或打它都放电，而且导电链会传给旁边的同类），
  // 所以三次爆发都用电水母群：**一次群就是一道题**，而不是把它摊平当底噪。
  //
  // **10 屏 / 70 秒 / 约 154 分威胁 / 15.4 每屏。** 它的密度比第二关高一档、时长也长一点，
  // 但**比第四关低**——上一轮它是 20.1，比第四关还密，而第四关是它之后才玩的，那是个倒挂。
  //
  // **收集物铺在每一屏的缝隙里**：起/落屏各 3-4 颗（一小串 \`spread\`，顺手就能吃到一颗），爆发屏**一颗都不放**
  // （那一屏只有威胁），开场那一屏 6 颗、收尾那屏 8 颗。它的定位是「击败怪物的间隙顺手捡到」，所以它得
  // **从头到尾都在**，而不是只在开头结尾各堆一撮——上一轮六关都是「两头两撮、中间 45-58 秒一颗都没有」。
  spawns: [
    // --- S0  安静开场：食物，和**一只**电水母。让"它会放电"先单独出现一次。
    { at: 30, span: 150, count: 6, kind: 'bubble', arrange: 'spread', sizes: [0.4, 0.5, 0.35] },
    { at: 120, kind: 'zapper', x: 0.5 },

    // --- S1  起：两只一列，教导电链——打一只会牵动旁边那只。后面跟一串鱼，把"边躲边打"先轻轻演一遍。
    { at: 200, kind: 'zapper', x: 0.4 },
    { at: 300, kind: 'zapper', count: 2, arrange: 'column', x: 0.6 },
    { at: 340, kind: 'fish', count: 8, arrange: 'spread', from: 'random' },

    { at: 190, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S2  **爆发一 · 水母树冠**：一列四只 + 减速水母 + 一串鱼。这一屏开始要求你**边躲边挑目标**。
    { at: 420, kind: 'zapper', count: 4, arrange: 'column', x: 0.5 },
    { at: 480, kind: 'jelly', count: 4, arrange: 'line', from: 'random' },
    { at: 520, kind: 'fish', count: 4, arrange: 'spread', from: 'random' },

    // --- S3  回落：虾 + 海胆 + 两只电水母。刚被电过，这一屏把位置找回来——而且它比上一次回落**多了一屏**，
    // 因为电水母的教训消化得慢。
    { at: 600, kind: 'shrimp', count: 3, arrange: 'spread', from: 'random' },
    { at: 660, kind: 'urchin', x: 0.5 },
    { at: 700, kind: 'zapper', count: 2, arrange: 'spread' },

    { at: 570, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S4  起（第二次爬升）：一串鱼 + 两只电水母 + 一只海胆 + 两只虾。**这是最长的两次爆发之间的空档**，
    // 所以它得自己站住：海胆先给你一个"绕开就行"的靶子，电水母再把绕开的路线收窄。
    { at: 780, kind: 'fish', count: 8, arrange: 'spread', from: 'random' },
    { at: 840, kind: 'zapper', count: 2, arrange: 'column', x: 0.55 },
    { at: 880, kind: 'urchin', x: 0.4 },
    { at: 920, kind: 'shrimp', count: 2, arrange: 'spread', from: 'random' },

    { at: 760, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S5  **爆发二 · 触须森林**：五只一排 + 减速 + 两只海胆。横排的电水母是"整片不能碰"。
    { at: 1000, kind: 'zapper', count: 5, arrange: 'line' },
    { at: 1060, kind: 'jelly', count: 4, arrange: 'spread', from: 'random' },
    { at: 1110, kind: 'urchin', count: 2, arrange: 'spread' },

    // --- S6  回落：热流矿物 + 虾 + 两只电水母。间隔已经从 3 屏缩到 2 屏，矿物颗粒是这一屏的"呼吸"。
    { at: 1180, span: 60, count: 4, kind: 'mineral', arrange: 'spread', x: 0.5, from: 'bottom' },
    { at: 1230, kind: 'shrimp', count: 3, arrange: 'spread', from: 'random' },
    { at: 1280, kind: 'zapper', count: 2, arrange: 'spread' },

    { at: 1140, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.5, 0.35] },
    // --- S7  **爆发三 · 冠冕（最高点）**：两群电水母 + 海星 + 热流矿物。间隔已缩到 2 屏，
    // 而且它在最快的区间里（每屏 5.7 秒）——这一关的顶点是"整片都在放电，而你还得选打哪一只"。
    { at: 1350, kind: 'zapper', count: 5, arrange: 'line' },
    { at: 1410, kind: 'zapper', count: 3, arrange: 'spread' },
    { at: 1460, kind: 'starfish', x: 0.5 },
    { at: 1500, span: 60, count: 4, kind: 'mineral', arrange: 'spread', x: 0.5, from: 'bottom' },

    // --- S8  收一屏：**只有食物，没有一个危险物**。水母林的最上面是光，这一屏留给它。
    { at: 1560, span: 140, count: 8, kind: 'bubble', arrange: 'spread', sizes: [0.4, 0.5, 0.35] },
    { at: 1640, kind: 'fish', count: 6, arrange: 'spread', from: 'random' },
  ],

}
`,ou=`// =====================================================================================================
// 第 4 关：thermocline
// =====================================================================================================
// 一个关卡一个文件。**文件名前面的编号就是关卡顺序**（加载顺序 = 解锁顺序），所以插入新关卡用 01b- 这样的号，
// 不用把后面所有文件改名。
//
// 这块水域有什么、刷什么怪、什么颜色，全在这个文件里；每一项能写什么见 config/levels.json5 顶部的说明。
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪个文件、哪一项）。
// =====================================================================================================

// =====================================================================================================
// 第四关：猎食者温跃层
// =====================================================================================================
//
// 环境：上下水层温差明显，能看到折射造成的扭曲边界。鱼群大量出现，生态活动比深海激烈得多。
// 温跃层不断上下移动，把战场分成两种状态：下层寒冷黏滞（慢，但敌人不活跃）、上层温暖轻盈（快，但猎食者密集）。
//
// 招牌机制（**尚未实现**，见 .scratch/levels/issues/）：冷热形态——温水里子弹更大更慢、冷水里更小更快。
{
  id: 'thermocline',
  name: '猎食者温跃层',
  // 与发光水母林共用原第一关主题（\`black-smokers.mp3\`）。
  music: 'black-smokers',
  // 猎食者温跃层：水体折射与温差，开阔、偏冷绿。
  palette: {
    deep: 0x04202a,
    shallow: 0x2fa8b8,
    bloom: 0xd8ffe8,
    tint: 0x2f8f7a,
    tintStrength: 0.16
  },
  scrollLength: 2090,

  boss: {
    at: 1900,
    health: 1200,
    name: '长尾鲨',
    // **这一关的 BOSS 是哪一只**：它怎么动、多大、什么颜色、怎么开火，全在
    // config/mechanics.json5 的 \`hazards.bosses.boss-shark\`。这一关原来还写着一个 \`colour: 0x3f5f7a\` ——
    // "这一关的 BOSS 是什么颜色"从来不该由关卡来说，它属于那只 BOSS。
    kind: 'boss-shark'
  },

  // 固定推进速度 27 m/s：一屏约 7.0 秒，整关 2090 / 27 ≈ 77.4 秒。
  // \`driftSpeed\` 仍单独决定生物在屏幕上的速度：关卡推进快慢不改变它们的运动。
  scrollSpeed: 27,
  driftSpeed: 34,
  playerLeadLimit: 120,
  // ---------------------------------------------------------------------------------------------
  // 刷怪表：**安静开场 → 起 → 三次爆发（间隔 3 屏 → 2 屏）→ 收两屏**
  // ---------------------------------------------------------------------------------------------
  //
  // \`S<n>\` 是每一块落在第几屏（一屏 190 米）。形状看读数：\`node scripts/probe-pacing.mjs\`。
  //
  // 这一关没有障碍物，**威胁全是生物**，而且种类是六关里最多的（鱼、鱼雷、海豚、炸弹鱼、章鱼、
  // 鮟鱇、刺魨、螃蟹、鲨鱼、电鳗、座头鲸）。三次爆发因此按"这一层能碰到什么"来分层，
  // 而不是按"这里放了什么布景"：暖水层只有鱼群和海豚，温跃层把四个猎食者加进来，
  // 冷水层才是鲨鱼和鲸——**你过的是水层，不是关卡**。
  //
  // **收集物铺在每一屏的缝隙里**：起/落屏各 3-4 颗（一小串 \`spread\`，顺手就能吃到一颗），爆发屏**一颗都不放**
  // （那一屏只有威胁），开场那一屏 6 颗、收尾那屏 8 颗。它的定位是「击败怪物的间隙顺手捡到」，所以它得
  // **从头到尾都在**，而不是只在开头结尾各堆一撮——上一轮六关都是「两头两撮、中间 45-58 秒一颗都没有」。
  spawns: [
    // --- S0  安静开场：只有泡泡和一群鱼。鱼群本身就是内容（沙丁鱼群不主动攻击，受惊会集体转向）。
    { at: 30, span: 150, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    { at: 110, kind: 'fish', count: 4, arrange: 'line' },

    // --- S1  起：鱼群、一条鱼雷（第一段诚实）、**第一只海豚**和两只螃蟹。
    // 海豚是四个猎食者里最小最薄（3 点血）、食谱门槛最低的，所以它教的是"这一关的东西也可以很大、
    // 而且大的也能是食物"——**先让玩家赢一次，再给他看赢不了的**。
    { at: 200, kind: 'fish', count: 10, arrange: 'spread', span: 50, x: 0.5 },
    { at: 300, kind: 'torpedo', x: 0.5, from: 'random', enterSpeed: 46 },
    { at: 350, kind: 'dolphin', x: 0.78 },
    { at: 370, kind: 'crab', count: 2, arrange: 'line' },

    { at: 190, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    // --- S2  **爆发一 · 暖水层**：鱼群 + 两只海豚 + 炸弹鱼（会炸，"在哪挨"）+ 鮟鱇（会骗你）+ 章鱼。
    // 猎食者们第一次一起出现，但全是"吃得下"的那几个。
    { at: 400, kind: 'fish', count: 12, arrange: 'spread', span: 60, amplitude: 0.2, x: 0.5, from: 'bottom' },
    { at: 450, kind: 'dolphin', count: 2, arrange: 'spread', span: 30, x: 0.5, from: 'random', enterSpeed: 40 },
    { at: 480, kind: 'bombfish', count: 2, arrange: 'spread', span: 30, x: 0.5 },
    { at: 520, kind: 'angler', count: 2, arrange: 'line' },
    // 章鱼：从侧面**横着**进来（enterSpeed 比别的慢），因为它是四个里最懒的那个——前摇 0.9 秒、冷却 2.6 秒，
    // 它是"可以忽略一会儿"的猎食者，作用是让别的三个显得更快。
    { at: 550, kind: 'octopus', x: 0.3, from: 'random', enterSpeed: 34 },

    // --- S3  回落：鱼群 + 螃蟹 + 刺魨 + 一条鱼雷。刺魨是猎食者关里唯一"打它有代价"的东西，和冲锋的
    // 猎食者互为对照——它在这一屏出现，正好是下一次爆发前的呼吸。
    { at: 600, kind: 'fish', count: 9, arrange: 'spread', span: 50, x: 0.5 },
    { at: 660, kind: 'crab', count: 3, arrange: 'line' },
    { at: 700, kind: 'puffer', count: 2, arrange: 'spread', span: 40, x: 0.5 },
    { at: 730, kind: 'torpedo', count: 1, arrange: 'spread', x: 0.4, from: 'random', enterSpeed: 46 },

    { at: 570, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    // --- S4  起（第二次爬升）：上下同时来的两串鱼，逼玩家**换高度**——这是温跃层这一层的题目本身。
    // 加章鱼和炸弹鱼：一个慢到可以忽略、一个近到不能打，同一屏里两种"别碰我"。
    { at: 780, kind: 'fish', count: 6, arrange: 'spread', span: 40, from: 'random', depth: 0.62 },
    { at: 820, kind: 'fish', count: 6, arrange: 'spread', span: 40, from: 'random', depth: 0.42 },
    { at: 860, kind: 'octopus', x: 0.3, from: 'random', enterSpeed: 34 },
    { at: 890, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.4, from: 'random', enterSpeed: 46 },
    { at: 920, kind: 'bombfish', count: 2, arrange: 'spread', span: 30, x: 0.6 },

    { at: 760, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    // --- S5  **爆发二 · 温跃层**：四个猎食者全在同一屏——鮟鱇（诱饵就是陷阱）、章鱼、刺魨（打它有代价）、
    // 加两条鱼雷。这一屏的题目不是"躲开"，是"先解决谁"。
    { at: 980, kind: 'fish', count: 14, arrange: 'spread', span: 70, amplitude: 0.22, x: 0.5 },
    { at: 1030, kind: 'puffer', count: 2, arrange: 'spread', span: 40, x: 0.5 },
    { at: 1060, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.4, from: 'random', enterSpeed: 46 },
    { at: 1090, kind: 'angler', count: 2, arrange: 'line' },
    { at: 1120, kind: 'octopus', x: 0.65, from: 'random', enterSpeed: 34 },

    // --- S6  回落：**电鳗**（射速全表最高的射手，5 发赶跑；它也可以被吞——吞噬门槛比四位枪手低）+ 鱼群 + 螃蟹。
    // 间隔已经从 3 屏缩到 2 屏：这一屏比上一次回落短，而且射手不给你喘的机会。
    { at: 1160, kind: 'fish', count: 12, arrange: 'spread', span: 50, x: 0.5 },
    { at: 1210, kind: 'crab', count: 3, arrange: 'line' },
    { at: 1250, kind: 'puffer', count: 2, arrange: 'spread', span: 40, x: 0.5 },
    { at: 1290, kind: 'eel', x: 0.3 },

    { at: 1140, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    // --- S7  **爆发三 · 冷水层（最高点）**：大白鲨（前摇 0.6 秒、冲刺 0.4 秒，四个里最"已经决定了"的那个）
    // + 三条鱼雷 + 两条电鳗 + 三只鮟鱇 + 鱼群 + 炸弹鱼。它同时是**最快**的一屏（5.4 秒）和**最密**的一屏。
    //
    // 座头鲸一次只来一只：全场最慢（前摇 1.1 秒）也最厚（8 点血），放在收尾段是因为
    // **慢的东西在一段快的东西后面才最吓人**——玩家刚躲完一串快攻，会明显感到屏幕被占住了。
    { at: 1340, kind: 'shark', x: 0.55 },
    { at: 1380, kind: 'torpedo', count: 3, arrange: 'spread', span: 50, x: 0.5, from: 'random', enterSpeed: 46 },
    { at: 1420, kind: 'eel', count: 2, arrange: 'spread', span: 40, x: 0.5 },
    { at: 1450, kind: 'angler', count: 3, arrange: 'spread', span: 40, x: 0.4 },
    { at: 1480, kind: 'fish', count: 12, arrange: 'spread', span: 50, x: 0.5 },
    { at: 1500, kind: 'bombfish', count: 1, arrange: 'spread', x: 0.6 },
    { at: 1510, kind: 'whale', x: 0.45 },

    // --- S8  收：把**海豚**放回来两只。它现在是"已知的、吃得下的那种大东西"——
    // 一次补给，一次能赢的架，让最后一次爆发之后不是一口气泄掉。
    { at: 1560, span: 140, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    { at: 1660, kind: 'dolphin', count: 2, arrange: 'spread', span: 30, x: 0.5, from: 'random', enterSpeed: 40 },

    // --- S9  收一屏：**只有食物，没有一个危险物**。BOSS 之前把手腾出来。
    { at: 1740, span: 150, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.4, 0.55, 0.35] },
  ],

}
`,su=`// =====================================================================================================
// 第 5 关：storm-surge
// =====================================================================================================
// 一个关卡一个文件。**文件名前面的编号就是关卡顺序**（加载顺序 = 解锁顺序），所以插入新关卡用 01b- 这样的号，
// 不用把后面所有文件改名。
//
// 这块水域有什么、刷什么怪、什么颜色，全在这个文件里；每一项能写什么见 config/levels.json5 顶部的说明。
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪个文件、哪一项）。
// =====================================================================================================

// =====================================================================================================
// 第五关：风暴暗流
// =====================================================================================================
//
// 环境：接近海面，上方正在经历暴风雨。巨浪通过水体产生周期性压力，雨滴撞击海面形成向下穿透的冲击，
// 闪电照亮整个区域。**场景明亮，却比深海更混乱**：背景里能看到船只、浮标与渔网的剪影。
//
// 招牌机制（**尚未实现**）：压力节拍——海面变暗预告浪潮、水体向下压迫抵消浮力、暗流横向翻转、短暂平静。
{
  id: 'storm-surge',
  name: '风暴暗流',
  // 与破晓海面共用战斗曲（\`battle-1.mp3\`）。
  music: 'battle-1',
  // 风暴暗流：接近海面但正在暴风雨。明亮的铅灰蓝，闪电感。
  palette: {
    deep: 0x0a1420,
    shallow: 0x5f7f9f,
    bloom: 0xffffff,
    tint: 0x3a4a5f,
    tintStrength: 0.24
  },
  scrollLength: 2090,

  boss: {
    at: 1900,
    health: 1400,
    name: '废网巨鲨',
    // **这一关的 BOSS 是哪一只**：它怎么动、多大、什么颜色、怎么开火，全在
    // config/mechanics.json5 的 \`hazards.bosses.boss-netshark\`。这一关原来还写着一个 \`colour: 0x5a5f66\` ——
    // "这一关的 BOSS 是什么颜色"从来不该由关卡来说，它属于那只 BOSS。
    kind: 'boss-netshark'
  },

  // 固定推进速度 26 m/s：一屏约 7.3 秒，整关 2090 / 26 ≈ 80.4 秒。
  // 这一关的身份是"混乱"：速度快只会变成"快"，固定速度让每一排网都读得完，混乱来自改道，不来自加速。
  scrollSpeed: 26,
  driftSpeed: 36,
  playerLeadLimit: 130,
  // ---------------------------------------------------------------------------------------------
  // 刷怪表：**安静开场 → 起 → 三次爆发（间隔 3 屏 → 2 屏）→ 收两屏**
  // ---------------------------------------------------------------------------------------------
  //
  // \`S<n>\` 是每一块落在第几屏（一屏 190 米）。形状看读数：\`node scripts/probe-pacing.mjs\`。
  //
  // 这一关的**身份是把路切断**（渔网、封路墙、珊瑚——三种硬度不同的障碍，占它威胁值的一半以上），
  // 所以三次爆发都长在障碍上。填缝的东西是**风暴自己的碎片**：矿物颗粒和盲虾——它们又便宜又到处都是，
  // 正好是"雨从上面砸下来"这一件事在读数上的样子。
  //
  // **11 屏 / 81 秒 / 约 211 分威胁 / 19.2 每屏。** 密度比第四关高一档（17.0），
  // 但**每屏秒数也更长**（7.4 对 7.0）：它比第四关多出来的不只是更多的怪，还有更多读它们的时间。
  //
  // **收集物铺在每一屏的缝隙里**：起/落屏各 3-4 颗（一小串 \`spread\`，顺手就能吃到一颗），爆发屏**一颗都不放**
  // （那一屏只有威胁），开场那一屏 6 颗、收尾那屏 8 颗。它的定位是「击败怪物的间隙顺手捡到」，所以它得
  // **从头到尾都在**，而不是只在开头结尾各堆一撮——上一轮六关都是「两头两撮、中间 45-58 秒一颗都没有」。
  spawns: [
    // --- S0  安静开场：只有食物和两只螃蟹。风暴还没到。
    { at: 30, span: 150, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.45, 0.6, 0.4] },
    { at: 130, kind: 'crab', count: 2, arrange: 'line' },

    // --- S1  起：第一张网、一群鱼、两只螃蟹，然后是**从下往上推的矿物颗粒**——风暴的第一口气。
    { at: 200, kind: 'net', count: 4, arrange: 'line' },
    { at: 230, kind: 'fish', count: 5, arrange: 'spread', span: 40, x: 0.5, from: 'bottom' },
    { at: 280, kind: 'crab', count: 3, arrange: 'line' },
    { at: 330, kind: 'mineral', count: 3, arrange: 'spread', span: 40, amplitude: 0.3, x: 0.5, from: 'bottom' },

    { at: 190, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S2  **爆发一 · 浪涌**：一排**封路墙**（撞不开，只能打掉或从缺口过去）+ 两条鱼雷 + 一张网 + 三只盲虾。
    // 网在墙后面：你刚改完道，网正好在改道的方向上。
    { at: 400, kind: 'wall', count: 5, arrange: 'barrier', gapAt: 0.4, gapWidth: 0.19 },
    { at: 460, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'random', enterSpeed: 50 },
    { at: 500, kind: 'net', count: 4, arrange: 'line' },
    { at: 530, kind: 'shrimp', count: 3, arrange: 'spread', span: 40, x: 0.4, from: 'random', depth: 0.6 },

    // --- S3  回落：颗粒、盲虾、螃蟹、鱼群。刚被墙堵过一次，这一屏让你把高度和位置都找回来。
    { at: 600, kind: 'mineral', count: 12, arrange: 'spread', span: 50, amplitude: 0.3, x: 0.5, from: 'bottom' },
    { at: 650, kind: 'shrimp', count: 3, arrange: 'spread', span: 40, x: 0.4, from: 'random', depth: 0.6 },
    { at: 700, kind: 'crab', count: 3, arrange: 'line' },
    { at: 730, kind: 'fish', count: 6, arrange: 'spread', span: 50, x: 0.5 },

    { at: 570, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S4  起（第二次爬升）：网 + 鱼群 + 两条鱼雷 + 螃蟹，再补一串颗粒。
    // **这是全关最长的一段安静**（爆发一到爆发二之间三屏），所以它必须自己站得住。
    { at: 780, kind: 'net', count: 5, arrange: 'barrier', gapAt: 0.55, gapWidth: 0.19 },
    { at: 820, kind: 'fish', count: 10, arrange: 'spread', span: 60, amplitude: 0.24, x: 0.5, from: 'bottom' },
    { at: 870, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'random', enterSpeed: 50 },
    { at: 910, kind: 'crab', count: 3, arrange: 'line' },
    { at: 930, kind: 'mineral', count: 8, arrange: 'spread', span: 50, amplitude: 0.3, x: 0.5, from: 'bottom' },

    { at: 900, span: 40, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S5  **爆发二 · 暴雨层**：珊瑚（硬，3.5 血，"变小有优势"这句话本身）+ 三条鱼雷 + 网 + 盲虾 + 鱼群。
    // 珊瑚和网一起出现是这一关最贵的一次改道：一个打不动，一个一推就破。
    { at: 980, kind: 'coral', count: 5, arrange: 'barrier', gapAt: 0.35, gapWidth: 0.19 },
    { at: 1040, kind: 'torpedo', count: 3, arrange: 'spread', span: 50, x: 0.6, from: 'random', enterSpeed: 50 },
    { at: 1080, kind: 'net', count: 4, arrange: 'line' },
    { at: 1110, kind: 'shrimp', count: 4, arrange: 'spread', span: 50, x: 0.5, from: 'random', depth: 0.5 },
    { at: 1120, kind: 'fish', count: 4, arrange: 'spread', span: 40, x: 0.5 },

    // --- S6  回落：颗粒 + 鱼群 + 螃蟹，然后是**手枪虾**——风暴关的精英位，
    // 稀疏、快、重（一发电化弹），放在"雨最密"的一屏末尾，是这一关最贵的失误。
    { at: 1160, kind: 'mineral', count: 15, arrange: 'spread', span: 60, amplitude: 0.28, x: 0.5, from: 'bottom' },
    { at: 1200, kind: 'fish', count: 8, arrange: 'spread', span: 50, x: 0.5 },
    { at: 1240, kind: 'crab', count: 2, arrange: 'line' },
    { at: 1280, kind: 'pistol', x: 0.5 },

    { at: 1140, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S7  **爆发三 · 废网（最高点）**：最后一排封路墙 + 四块珊瑚 + 鱼雷 + 盲虾。
    // 间隔已经从 3 屏缩到 2 屏，而且它在最快的区间里（每屏 5.4 秒）——
    // 两种硬度不同的障碍**在同一屏里**，这就是这一关的顶点。
    { at: 1340, kind: 'wall', count: 6, arrange: 'barrier', gapAt: 0.65, gapWidth: 0.18 },
    { at: 1400, kind: 'coral', count: 4, arrange: 'barrier', gapAt: 0.3, gapWidth: 0.19 },
    { at: 1450, kind: 'torpedo', count: 2, arrange: 'spread', span: 30, x: 0.3, from: 'random', enterSpeed: 50 },
    { at: 1480, kind: 'shrimp', count: 4, arrange: 'spread', span: 50, x: 0.5, from: 'random', depth: 0.5 },

    // --- S8  收：一次补给 + 一群鱼 + 三只螃蟹。风暴还没有停，但这一段是给你把血看回来的。
    { at: 1560, span: 110, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.5, 0.65, 0.45] },
    { at: 1640, kind: 'crab', count: 3, arrange: 'line' },
    { at: 1660, kind: 'fish', count: 12, arrange: 'spread', span: 50, x: 0.5 },

    // --- S9  收一屏：**只有食物**。海面就在上面，BOSS 之前把手腾出来。
    { at: 1740, span: 150, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.28, sizes: [0.45, 0.6, 0.4] },
  ],

}
`,cu=`// =====================================================================================================
// 第 6 关：dawn-surface
// =====================================================================================================
// 一个关卡一个文件。**文件名前面的编号就是关卡顺序**（加载顺序 = 解锁顺序），所以插入新关卡用 01b- 这样的号，
// 不用把后面所有文件改名。
//
// 这块水域有什么、刷什么怪、什么颜色，全在这个文件里；每一项能写什么见 config/levels.json5 顶部的说明。
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪个文件、哪一项）。
// =====================================================================================================

// 第六关：破晓海面（最终关）
// =====================================================================================================
//
// 环境：最终区域横跨水下、海面与空气。阳光穿透水层，浪峰不断改变"终点"的高度。
// 这一关的干扰不是"打你"，而是"让你看不清"：泡沫长得像你的气泡，雨滴把你压回水下。
//
// 招牌（本轮实现的两件）：\`foam\` 碎浪泡沫（打不掉，遮蔽位置与判定，自己会散）、
// \`rain\` 雨滴冲击（比水流更快地落下，命中把气泡**压回**水里 \`pushMeters\` 米）。
//
// 尚未实现：海鸟群（俯冲啄击）、表层小鱼（跃出水面撞人并改变轨迹）、以及"水面 / 空气"这一层本身
// （玩家真的浮出水面）；最终 BOSS 风暴之眼现在是一只配置好的 BOSS。
{
  id: 'dawn-surface',
  name: '破晓海面',
  // 与风暴暗流共用战斗曲（\`battle-1.mp3\`）。
  music: 'battle-1',
  // 破晓海面：阳光穿透水层。暖金 + 浅青，是全场最亮的一关。
  palette: {
    deep: 0x10304a,
    shallow: 0x7fd0e8,
    bloom: 0xffe0a8,
    tint: 0xffb46b,
    tintStrength: 0.18
  },
  scrollLength: 2280,

  boss: {
    at: 2090,
    health: 1600,
    name: '风暴之眼',
    // **这一关的 BOSS 是哪一只**：它怎么动、多大、什么颜色、怎么开火，全在
    // config/mechanics.json5 的 \`hazards.bosses.boss-eye\`。这一关原来还写着一个 \`colour: 0x8fb8d8\` ——
    // "这一关的 BOSS 是什么颜色"从来不该由关卡来说，它属于那只 BOSS。
    kind: 'boss-eye'
  },

  // 固定推进速度 25 m/s：一屏约 7.6 秒，整关 2280 / 25 ≈ 91.2 秒。
  // 这一关的干扰不是"打你"，是**让你看不清**——泡沫长得像你的气泡，雨把你压回水里。
  // 慢的是推进，密的是内容，两者叠起来才是这一关的样子。
  scrollSpeed: 25,
  driftSpeed: 34,
  playerLeadLimit: 130,
  // ---------------------------------------------------------------------------------------------
  // 刷怪表：**安静开场 → 起 → 三次爆发（间隔 3 屏 → 2 屏）→ 收两屏**
  // ---------------------------------------------------------------------------------------------
  //
  // \`S<n>\` 是每一块落在第几屏（一屏 190 米）。形状看读数：\`node scripts/probe-pacing.mjs\`。
  //
  // 这一关的威胁几乎全在两样东西上：**泡沫**（打不掉、长得像你的泡泡）和**雨**（压你下沉、满屏挪不开）。
  // 两者都是第 2 档而不是第 1 档——它们拿走的不是"一条命"，是"你知道自己在哪"。
  //
  // 所以这一关和前五关的形状**有一处刻意不同**：它的"回落"屏也是厚的。
  // 前五关的回落是"把位置找回来"，这一关的回落只是**换了种看不清的方式**——
  // 那正是它 23.0 的每屏密度（全六关最高）的来源，也是它作为最终关的身份。
  //
  // **12 屏 / 92 秒 / 约 276 分威胁 / 23.0 每屏。**
  //
  // **收集物铺在每一屏的缝隙里**：起/落屏各 3-4 颗（一小串 \`spread\`，顺手就能吃到一颗），爆发屏**一颗都不放**
  // （那一屏只有威胁），开场那一屏 6 颗、收尾那屏 8 颗。它的定位是「击败怪物的间隙顺手捡到」，所以它得
  // **从头到尾都在**，而不是只在开头结尾各堆一撮——上一轮六关都是「两头两撮、中间 45-58 秒一颗都没有」。
  spawns: [
    // --- S0  安静开场：光进来了，鱼群也多了。**这一段是看得清的**——泡沫随后才出现，
    // 因为"看不清"只有在"看得清"之后才是一种损失。
    { at: 30, span: 150, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.28, sizes: [0.45, 0.6, 0.4] },
    { at: 110, kind: 'fish', count: 5, arrange: 'line' },

    // --- S1  起：鱼群 + 两条鱼雷。仍然是清水——这一屏是以后每一屏的参照物。
    { at: 200, kind: 'fish', count: 11, arrange: 'spread', span: 50, x: 0.5 },
    { at: 250, kind: 'fish', count: 5, arrange: 'spread', span: 50, x: 0.5, from: 'bottom' },
    { at: 320, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'random', enterSpeed: 48 },

    { at: 190, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S2  **爆发一 · 阳光层**：第一批泡沫，和**真泡泡混在一起**。这一屏不伤你，它只是让你分不清。
    { at: 400, kind: 'foam', count: 5, arrange: 'spread', span: 40, x: 0.5 },
    { at: 460, kind: 'foam', count: 8, arrange: 'line' },
    { at: 500, kind: 'fish', count: 4, arrange: 'spread', span: 40, x: 0.5 },

    // --- S3  回落：泡沫换了种排法（散开而不是一排），加两条鱼雷和一群鱼。回落**不减量，只换形**。
    { at: 600, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'random', enterSpeed: 48 },
    { at: 650, kind: 'fish', count: 8, arrange: 'spread', span: 60, amplitude: 0.22, x: 0.5, from: 'bottom' },
    { at: 720, kind: 'foam', count: 4, arrange: 'spread', span: 50, x: 0.5 },

    { at: 570, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S4  起（雨滴冲击登场）：雨从上面砸下来，**命中把你压回水里**——第一次出现就必须满屏，
    // 因为它不是"躲某一滴"，是"这一屏往下压"。
    { at: 780, span: 70, count: 8, kind: 'rain', arrange: 'spread', amplitude: 0.3, x: 0.5 },
    { at: 830, kind: 'fish', count: 6, arrange: 'spread', span: 50, x: 0.5, from: 'bottom' },
    { at: 890, kind: 'foam', count: 3, arrange: 'spread', span: 40, x: 0.5 },

    { at: 760, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S5  **爆发二 · 泡沫带**：雨幕 + 泡沫 + 鱼群，最后是**手枪虾**——
    // 雨幕挡视线时一发大弹，是这一关最贵的失误。只放一只。
    { at: 980, span: 80, count: 10, kind: 'rain', arrange: 'spread', amplitude: 0.3, x: 0.5 },
    { at: 1030, kind: 'foam', count: 5, arrange: 'spread', span: 50, x: 0.5 },
    { at: 1080, kind: 'fish', count: 6, arrange: 'spread', span: 50, x: 0.5 },
    { at: 1120, kind: 'pistol', x: 0.35 },

    // --- S6  回落：泡沫一排 + 两条鱼雷 + 鱼群。间隔已经从 3 屏缩到 2 屏。
    { at: 1160, kind: 'foam', count: 6, arrange: 'line' },
    { at: 1220, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'random', enterSpeed: 48 },
    { at: 1280, kind: 'fish', count: 8, arrange: 'spread', span: 60, x: 0.5, from: 'bottom' },

    { at: 1140, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S7  **爆发三 · 浪峰（最高点）**：泡沫十只 + 雨十滴 + 两只鮟鱇。能见度最低的一屏，
    // 而且它在最快的区间里（每屏 5.6 秒）。这一屏是"看不清"这件事的顶点：
    // 你甚至分不清哪一块该躲，只能靠**位置记忆**往下走。
    { at: 1340, kind: 'foam', count: 10, arrange: 'spread', span: 70, x: 0.5 },
    { at: 1400, span: 80, count: 10, kind: 'rain', arrange: 'spread', amplitude: 0.3, x: 0.5 },
    { at: 1460, kind: 'angler', count: 2, arrange: 'line' },

    // --- S8  回落：雨变少、泡沫变多——**同一种看不清，换了形状**。加一群鱼。
    { at: 1540, span: 70, count: 8, kind: 'rain', arrange: 'spread', amplitude: 0.28, x: 0.5 },
    { at: 1600, kind: 'foam', count: 3, arrange: 'spread', span: 50, x: 0.4 },
    { at: 1660, kind: 'fish', count: 8, arrange: 'spread', span: 60, x: 0.5, from: 'bottom' },

    { at: 1520, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S9  起：最后一次爬升，三种东西一起上（泡沫 + 雨 + 鱼群）。这是进 BOSS 之前的最后一屏压力，
    // 它比前面任何一次回落都厚——因为这一关不给你"爆发前先松一口气"这件事本身。
    { at: 1720, kind: 'foam', count: 8, arrange: 'spread', span: 60, x: 0.5 },
    { at: 1780, span: 70, count: 6, kind: 'rain', arrange: 'spread', amplitude: 0.3, x: 0.5 },
    { at: 1840, kind: 'fish', count: 8, arrange: 'spread', span: 60, x: 0.5, from: 'bottom' },

    { at: 1710, span: 180, count: 3, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.4] },
    // --- S10  收一屏：**只有食物**。海面就在上面，风暴之眼就在上面。
    { at: 1940, span: 140, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.45, 0.6, 0.4] },
  ],

}
`,lu=`// =====================================================================================================
// 关卡配置（手工编辑）
// =====================================================================================================
//
// 这个文件是**关卡的唯一来源**：一个关卡 = 一段水域 + 一张刷怪表。改这里就能改关卡，不需要动代码。
// 加载时会逐项校验，任何一项写错都会**指名报错**（哪一个关卡、第几块、哪一项），而不是安静地不生效。
//
// -----------------------------------------------------------------------------------------------------
// 一关的两个速度（都必填，米/秒）
// -----------------------------------------------------------------------------------------------------
//
//   scrollSpeed  **关卡推进有多快**：相机往上走的速度。它决定时间线什么时候刷到哪一块（at 是距离）、一关多长
//                （scrollLength / scrollSpeed 秒）、深度读数和背景的视差。**生物的运动不看它。**
//   driftSpeed   **生物在屏幕上下落有多快**：每种生物"下落 = 这个速度 ×（1 + 自己的系数）"。路径、冲锋、子弹都是
//                屏幕坐标里的运动，不受相机上升影响。
//
//   两个分开写，是为了能单独调其中一个：改 scrollSpeed 不会让每条鱼变快或变慢，改 driftSpeed 不会让一关变长。
//   障碍物、喷口、收集物和天气（泡沫、雨）仍然跟着世界走——它们往下掉本身就是"关卡在推进"。
//
// -----------------------------------------------------------------------------------------------------
// 录好的关卡曲（可选）
// -----------------------------------------------------------------------------------------------------
//
//   music       曲名，不带扩展名；文件在 src/assets/audio/music/<曲名>.mp3。
//               两关可以写同一个名字，共用一份文件；不写 = 按关卡 id 找（旧约定），再找不到就播该关的合成曲。
//

// -----------------------------------------------------------------------------------------------------
// 一块刷怪（spawns 里的一项）能写什么
// -----------------------------------------------------------------------------------------------------
//
//   at          必填。相机走过多少米时刷这一块。**按距离而不是按时间**：改 scrollSpeed 会整体重新计时，
//               而不是让每一块相对关卡错位（这是关卡，不是难度曲线）。
//   kind        必填。刷什么。可以是：
//                 收集物   bubble
//                 生物     **\`hazards.health\` 里列出的每一种**（就是 \`config/mechanics.json5\` 里那张表，
//                          只是不含 BOSS——BOSS 由关卡自己的 \`boss\` 字段安排，不写在刷怪表里）：
//                          fish / tuna / jelly / trash / crab / urchin / bombfish / eel / rot / oil /
//                          vent / mineral / shrimp / angler / torpedo / zapper / foam / rain
//                          **加一种新生物**：在 mechanics.json5 里给它补齐那几张"每种都要有一行"的表，
//                          这里就自动能刷了——加载器照那张表认，不是照着这里的手写清单认。
//                 能力升级 upgrade（火力 +1 排）
//                 射速升级 rate（射速 +1 档，最高三档）
//               掉落物可以**同时存在多个**，各自漂移、各自拾取：放在一起不会互相覆盖。
//                 障碍物   crate / coral / wall / net / tube（布景清单在 mechanics.json5 的 obstacles 段）
//   count       刷几个。默认 1。
//   arrange     怎么摆。single（默认，count=1 时）/ line（横排）/ column（竖列）/
//               spread（沿距离摊开，横向按正弦摆动，amplitude 控制幅度）/ barrier（留缺口的障碍横排）
//   x           横向位置，0..1（泳道宽度的比例）。single/column 用；weave 时是中心线。
//   xFrom,xTo   line 的起止位置。默认 0.12 / 0.88。
//   span        沿距离摊开多少米。spread / column 用。
//   amplitude   spread 的正弦摆动幅度（泳道比例，0 = 一条斜直线）。wavelength 可选，默认 6。
//   gapAt,gapWidth  barrier 的缺口位置与想要的宽度。缺口会被自动加宽到**可通行规则**要求的最小值，
//               所以手写的横排不可能把路封死（加载器最后还会逐排复查一遍）。
//   sizes       收集物的尺寸循环表，例如 [0.4, 0.5, 0.35] 表示依次大中小。只对 bubble 有意义。
//
//   ---- 水平镜像：每一块配置自己掷一次左/右 ----
//
//   每个 spawn 块在被时间线放出来的那一刻掷一次硬币。翻到"镜像"时，这一块的**所有水平量**一起翻：
//   \`x → 1-x\`、\`from\` 的随机侧换边、path 的每个点 x 取反；整排障碍、整条鱼队因此保持一个形状。
//   一个块里的多条 entry 共用同一次结果，所以缺口不会散、鱼群不会撕成两半。
//
//   **显式写的 side/from 不翻**：文件说了在哪边，就以文件为准。但 \`x\` 是坐标，不是侧别，所以仍然会镜像。
//
//   ---- 从屏幕的哪一边进来 ----
//
//   from        top（默认）/ random / left / right / bottom。
//
//               random  每块掷一次：约一半左、一半右。不写 from 仍然是 top，不是随机。
//
//               top     在视野上方生成，随水流向下漂进画面 —— 一直以来的方式。
//                       \`at\` 就是它所在的深度，横向位置由 arrange 决定。
//               left    在**泳道外**生成，横向游进来。arrange 给出的 x 是它**进场后要去的位置**；
//               right   \`depth\` 决定它在屏幕哪个高度切入（0 = 下边缘，1 = 上边缘，默认 0.72）。
//                       注意水流仍然在往下带，所以进场路线是斜的。
//               bottom  在视野**下方**生成，以比水流更快的速度向上追进来。进来的都是"追上来的东西"：
//                       进场结束后交给它自己的 AI —— 会咬人的（鱼、蟹）会一路追上来，
//                       只会漂的（水母、垃圾袋）会自己漂走。所以别指望水母从下面爬上来。
//
//               **障碍物只能写 top / left / right**：布景不会自己往上游，写成 bottom 会加载报错。
//               left/right 的障碍物会横着漂进来，停在 arrange 给它的位置（像被水冲过来的木箱）。
//
//   enterSpeed  进场速度，米/秒（相对屏幕）。默认取 config/mechanics.json5 的 spawning.enterSpeedMps。
//               往下方进场时，这个速度要盖过生物的下落速度（该关的 driftSpeed）才看得见它上来，默认值已经够用。
//
//   depth       只对 left / right 有意义，见上。默认取 spawning.entryDepth。
//
//   aboveMeters 在视野顶边**上方**多少米生成（默认 0 = 贴着顶边）。只给从 top 来的生物用。
//               朝下的喷口用它把本体停在屏幕外，让更长的火焰先从顶边探进来。它不改 \`at\`：
//               还是同一时刻放进水面，只是晚一点才被看见。收集物和障碍物写它会加载报错。
//
//   ---- 喷口（vent）专用 ----
//
//   side        left / right / random，也可以不写。**不写和 random 一样**：这一块掷一次左/右；
//               写 left/right 才会钉死在那一面墙。喷口没有 \`x\`，它的位置由墙推导。
//   aim         up（默认）/ flat / down。它相对自己那面墙；墙随机时方向也跟着镜像。
//   startDelaySeconds  出现后先安静多少秒。
//
//   ---- 鱼群（Boids），以及放在背景的鱼群 ----
//
//   path        一条本关 \`paths\` 里的路径名。\`count\` 条生物成一串，沿它游。
//   boids       true：这一块是一个**鱼群**——\`count\` 条鱼像一个整体游，路径驱动的是一个看不见的领队。
//               必须配 \`kind: 'fish'\` 和 \`path\`，起点必须在屏幕外。数值见 mechanics.json5 的 \`hazards.boids\`。
//   layer       'front'（默认）/ 'back'。**'back' 是背景鱼群**：同一套 Boids，但没有碰撞盒——子弹穿过去、
//               碰不到、吃不到——画在所有生物和障碍物后面、背景图前面。只有鱼群能放到背景，所以要同时写 \`boids: true\`。
//   distance    背景鱼群必填（前景写了会报错），0（近）~ 1（远）。**只决定大小和亮度**，两端的值在
//               mechanics.json5 的 \`hazards.boids.back\`。它**不改游速**：游多快是 \`path.seconds\` 说了算。
//               背景鱼群各自按自己的 \`at\` 出场，所以"先几群背景、再一群前景"就是把前者的 \`at\` 写小。
//               例子见 config/debug-level.json5。
//
// -----------------------------------------------------------------------------------------------------
// 举几个例子
// -----------------------------------------------------------------------------------------------------
//
//   一小队鱼从随机一侧游进来，分散在 20 米里，进场后各自停在 arrange 给的位置：
//     { at: 420, kind: 'fish', count: 3, arrange: 'spread', span: 20, from: 'random', depth: 0.7 }
//
//   同上，但钉死从左边来（显式侧别不会跟着镜像翻）：
//     { at: 420, kind: 'fish', count: 3, arrange: 'spread', span: 20, from: 'left', depth: 0.7 }
//
//   一个从下面追上来的电鳗（eel 会夺走操作，从背后出现最有威胁）：
//     { at: 900, kind: 'eel', x: 0.4, from: 'bottom', enterSpeed: 55 }
//
//   一个被水冲进来的木箱，停在泳道 0.3 处（侧别钉死；它仍可能镜像到 0.7 的落点）：
//     { at: 700, kind: 'crate', x: 0.3, from: 'left', enterSpeed: 30 }
//
// =====================================================================================================

{
  // 开哪一关。改这里换关卡；关卡本身在下面的 levels 里。
  start: 'black-smokers',

  levels: [  ],
}
`,uu=`// =====================================================================================================
// 调试关：想看哪种敌人、怎么动，就在这里写
// =====================================================================================================
// 入口：主菜单 → 设置 → 作弊区 →「进入调试关」（需要调试模式开着；游戏进行中的设置面板里没有这个按钮）。
//
// 它是一个**普通关卡**，格式和 config/levels/ 里的完全一样（每一项能写什么见 config/levels.json5 顶部的说明）：
// 同一个玩家、同样的卷动、同样要打败 BOSS 才算通关。不一样的只有三点：
//   · 它不在关卡阶梯里——通关**不会解锁任何东西，也不会写存档**；
//   · 它没有自己的水：水色、背景图、音乐都借第一关的（所以这里**不能写 palette / backdrop**，写了会在加载时报错）；
//   · 打通之后停在结算页，不会接着走进下一关。
//
// 本文件是数据，写完刷新页面即可，不用重新构建；写错会在控制台指名报错（哪一项）。
//
// 怎么用：把要试的东西加进下面的 spawns，\`at\` 是卷动了多少米时出现（30 米/秒，所以 \`at: 150\` 约 5 秒后）。
// 不想等就把前面的块注释掉。要试别的生物，把 \`kind\` 换成它的名字——名字就是 config/mechanics.json5 里
// \`hazards.health\` 的那些键（fish / jelly / shark / whale / crab …）。
// =====================================================================================================
{
  // 必须和 config/levels/ 里的任何一关不同，加载时会检查。
  id: 'debug',
  name: '调试关',

  // 30 米/秒 × 40 秒。想多留点时间看就把 scrollLength 加大（BOSS 的 \`at\` 必须小于它）。
  scrollSpeed: 30,
  // 生物在**屏幕上**的下落速度（米/秒）。以前它和 scrollSpeed 是同一个数：改关卡节奏会连带改每条鱼的速度。
  // 现在 scrollSpeed 只管关卡推进（时间线、进度、背景视差），生物的速度只看这个。写的是这一关原来的数值，所以屏幕上没变。
  driftSpeed: 30,
  scrollLength: 1200,
  playerLeadLimit: 110,

  // 这一关的 BOSS 只是为了让"通关"有个终点，从 hazards.bosses 里随便挑一只。血量写小一点，打得快。
  boss: {
    at: 1000,
    health: 200,
    name: '调试 BOSS',
    kind: 'boss-crab'
  },

  paths: {
    // 一条直线：从屏幕右边外面，平着游到左边外面。
    //
    // 坐标和别的关一样：\`x\` 是泳道比例（>1 / <0 是屏幕外），\`y\` 是屏幕比例、相对出生点（顶边），负值朝下。
    // 路径走的是**屏幕**：世界卷动不会再把它往下带，所以这条线在屏幕上就是水平的。
    //
    // 起点和终点都在屏幕外，所以鱼群是游进来、游出去的，不会凭空出现。领队沿路径**匀速**走，走到终点也不停，
    // 会带着速度继续往外走——鱼群因此是一路游出去的，不会在终点聚成一团。终点仍要写在屏幕外，免得鱼群还没出去路径就结束了。
    straight: {
      points: [
        { x: 1.4, y: -0.12 },
        { x: 0.3, y: -0.12 },
        { x: -0.7, y: -0.12 }
      ],
      seconds: 6.5
    },

    // 三条给背景鱼群用的路：高、中、低三个高度，方向交替，轻轻起伏。背景鱼群各走各的路，所以不会叠成一坨。
    // 终点离泳道边缘 0.7 个泳道，和上面那条一样远。
    // 背景鱼群走得比前景慢一点（\`seconds\` 大）：远处的东西看起来动得慢——但这是**路径**写的，\`distance\` 不会改游速。
    'back-high': {
      points: [
        { x: -0.7, y: -0.1 },
        { x: 0.5, y: -0.2 },
        { x: 1.7, y: -0.14 }
      ],
      seconds: 12
    },
    'back-mid': {
      points: [
        { x: 1.4, y: -0.42 },
        { x: 0.6, y: -0.52 },
        { x: -0.7, y: -0.46 }
      ],
      seconds: 10.5
    },
    'back-low': {
      points: [
        { x: -0.7, y: -0.72 },
        { x: 0.5, y: -0.64 },
        { x: 1.7, y: -0.72 }
      ],
      seconds: 9
    }
  },

  spawns: [
    // --- 背景鱼群：先有好几群鱼从远处游过，让玩家有心理准备 ---
    // \`layer: 'back'\` 配 \`boids: true\`、\`path\` 和 \`distance\`（0 近 ~ 1 远）。它们是**同一套 Boids**，但没有碰撞盒：
    // 子弹穿过去、碰不到、吃不到。画在最后面（背景图之上、所有生物之下）；\`distance\` 越大越小、越暗、越冷
    // （两端的值在 config/mechanics.json5 的 \`hazards.boids.back\`）。出场顺序就是 \`at\` 的顺序。
    { at: 30, kind: 'fish', count: 120, path: 'back-high', boids: true, layer: 'back', distance: 0.9 },
    { at: 105, kind: 'fish', count: 100, path: 'back-mid', boids: true, layer: 'back', distance: 0.65 },
    { at: 180, kind: 'fish', count: 80, path: 'back-low', boids: true, layer: 'back', distance: 0.4 },

    // --- 然后前景的一群：120 条同种小鱼，遵循 Boids（\`hazards.boids\`），沿 \`straight\` 游过去 ---
    // \`boids: true\` 必须配 \`kind: 'fish'\` 和 \`path\`。样条驱动的是一个**看不见的领队**，鱼自己涌出队形：
    // 它们不追你也不躲你，但每一条都是真的鱼——会碰伤你，能被打（画面缩到普通小鱼的 60%，碰撞盒一起缩）。
    { at: 330, kind: 'fish', count: 120, path: 'straight', boids: true },

    // --- 对照：同一条路上的一串普通小鱼（每条各走各的曲线，没有队形） ---
    { at: 520, kind: 'fish', count: 10, path: 'straight', pathSpacingSeconds: 0.5 },

    // --- 再来一群前景，换个品种（同一块是同一个品种，相邻两块自动不同），后面跟一群近的背景 ---
    { at: 640, kind: 'fish', count: 90, path: 'back-mid', boids: true, layer: 'back', distance: 0.15 },
    { at: 700, kind: 'fish', count: 120, path: 'straight', boids: true },

    // --- 别的敌人：想试哪个就取消注释 ---
    // { at: 900, kind: 'shark', x: 0.5 },
    // { at: 900, kind: 'jelly', x: 0.2 },
    // { at: 900, kind: 'crab', x: 0.8 },

    // 一点吃的，免得一直小着
    { at: 30, span: 500, count: 12, kind: 'bubble', arrange: 'spread', amplitude: 0.22, sizes: [0.4, 0.5, 0.35] }
  ]
}
`;function du(e){let t=q.consumption.tierVolume,n=1;for(let r=1;r<t.length;r++)e+1e-9>=t[r]&&(n=r+1);return n}function fu(e){return q.consumption.mass[e]??0}function pu(e){return q.consumption.edibleAtTier[e]??1/0}function mu(e,t,n=0){let r=pu(e);return r>=q.consumption.tierVolume.length?!1:du(t)+n>=r}function hu(e){return fu(e)*q.consumption.massEfficiency}function gu(e,t){let n=e.length;if(n===0)return{x:0,y:0};if(n===1)return e[0];let r=(n-1)*Math.min(1,Math.max(0,t)),i=Math.min(n-2,Math.floor(r)),a=r-i,o=e[Math.max(0,i-1)],s=e[i],c=e[i+1],l=e[Math.min(n-1,i+2)],u=a*a,d=u*a,f=(e,t,n,r)=>.5*(2*t+(n-e)*a+(2*e-5*t+4*n-r)*u+(-e+3*t-3*n+r)*d);return{x:f(o.x,s.x,c.x,l.x),y:f(o.y,s.y,c.y,l.y)}}var _u=256;function vu(e,t,n){let r=[0],i=0,a=gu(e,0);for(let o=1;o<=_u;o++){let s=gu(e,o/_u);i+=Math.hypot((s.x-a.x)*t,(s.y-a.y)*n),r.push(i),a=s}return r.map((e,t)=>i>1e-9?e/i:t/_u)}function yu(e,t){let n=Math.max(0,Math.min(1,t)),r=0,i=_u;for(;i-r>1;){let t=r+i>>1;e[t]<=n?r=t:i=t}let a=e[i]-e[r],o=a>1e-12?(n-e[r])/a:0;return(r+o)/_u}function bu(e,t,n,r){let i=yu(e.arc,t),a=gu(e.points,i),o=a.x*n,s=e.startY+a.y*r,c=q.hazards.boids;if(c.wobbleAmplitude>0){let a=.01,l=gu(e.points,Math.max(0,i-a)),u=gu(e.points,Math.min(1,i+a)),d=(u.x-l.x)*n,f=(u.y-l.y)*r,p=Math.hypot(d,f);if(p>1e-6){let r=t*e.seconds*2*Math.PI/Math.max(.1,c.wobbleSeconds),i=.6*Math.sin(r+e.wobblePhase)+.4*Math.sin(r*2.7+e.wobblePhase*1.9),a=Math.min(1,t/.15,(1-t)/.15),l=i*Math.max(0,a)*c.wobbleAmplitude*n;o+=-f/p*l,s+=d/p*l}}return{x:o,y:s}}function xu(e,t,n,r,i){let a=Math.max(.1,t.seconds),o={id:e,points:t.points,arc:vu(t.points,r,i),seconds:a,elapsed:0,startY:n,x:0,y:0,vx:0,vy:0,dirX:-1,dirY:0,finished:!1,wobblePhase:Math.random()*Math.PI*2,inReach:1/0,ahead:0,seeded:0},s=bu(o,0,r,i),c=.01,l=bu(o,c,r,i);return o.x=s.x,o.y=s.y,o.vx=(l.x-s.x)/(c*a),o.vy=(l.y-s.y)/(c*a),Su(o),o}function Su(e){let t=Math.hypot(e.vx,e.vy);t>1e-6&&(e.dirX=e.vx/t,e.dirY=e.vy/t)}function Cu(e,t,n){let r=q.hazards.boids,i=r.spawnSpread*t*Math.sqrt(Math.random()),a=Math.random()*Math.PI*2,o=e.seeded++,s=1+(Math.random()*2-1)*r.speedJitter,c=r.spawnSpread*t;return{x:e.x-e.dirX*c+Math.cos(a)*i,y:e.y-e.dirY*c+Math.sin(a)*i,vx:e.vx*s,vy:e.vy*s,boid:{vx:e.vx*s,vy:e.vy*s,speedVar:s,d:1-(o+.5)/Math.max(1,n)}}}function wu(e,t,n,r){if(t<=0)return;if(e.finished){e.x+=e.vx*t,e.y+=e.vy*t;return}let i=q.hazards.boids,a=Math.min(1,e.inReach/Math.max(1,i.leaderWantFish)),o=e.ahead>i.leaderAllowAhead?Math.min(i.leaderCatchUp,1+(e.ahead-i.leaderAllowAhead)/Math.max(1,i.leaderAllowAhead)):Math.max(i.leaderWaitFloor,a);e.elapsed+=t*o;let s=Math.min(1,e.elapsed/e.seconds),c=bu(e,s,n,r);s>=1?e.finished=!0:(e.vx=(c.x-e.x)/t,e.vy=(c.y-e.y)/t),e.x=c.x,e.y=c.y,Su(e)}function Tu(e,t,n,r){let i=q.hazards.boids,a=i.neighbourRadius*r,o=a*a,s=Math.max(1,Math.round(i.neighbours)),c=new Float64Array(s),l=Array(s),u=i.separationRadius*r,d=u*u,f=i.maxSpeed*r,p=i.minSpeed*r,m=i.maxAccel*r,h=i.separationAccel*r,g=i.cohesionAccel*r,_=i.depthRange*r,v=i.leaderReach*r,y=i.leaderTether*r,b=i.tetherAccel*r,x=0,S=0;for(let C of e){let w=C.boid;if(!w)continue;let T=0,E=0,D=0,ee=0,te=0,ne=0,re=0;for(let t of e){if(C===t||!t.boid)continue;let e=t.x-C.x,n=t.y-C.y,r=e*e+n*n;if(r>o)continue;if(re<s||r<c[s-1]){let e=re<s?re++:s-1;for(;e>0&&c[e-1]>r;)c[e]=c[e-1],l[e]=l[e-1],e--;c[e]=r,l[e]=t}let i=(t.boid.d-w.d)*_,a=r+i*i;if(a<d){let t=(1-Math.sqrt(a)/u)*h,i=Math.sqrt(r);if(i>1e-6)T-=e/i*t,E-=n/i*t;else{let e=Math.random()*Math.PI*2;T+=Math.cos(e)*t,E+=Math.sin(e)*t}}}let ie=0,O=0,k=t.x-C.x,ae=t.y-C.y,A=Math.hypot(k,ae);if(k*t.dirX+ae*t.dirY<0&&S++,A<v){x++;let e=(1-A/v)*i.leaderSteer;ie+=e*(t.vx*w.speedVar-w.vx),O+=e*(t.vy*w.speedVar-w.vy)}if(A>y){let e=Math.min(1,(A-y)/Math.max(1e-6,y))*b;ie+=k/A*e,O+=ae/A*e}ie+=T,O+=E;for(let e=0;e<re;e++){let t=l[e];D+=t.boid.vx,ee+=t.boid.vy,te+=t.x,ne+=t.y}if(re>0){ie+=i.alignmentRate*(D/re-w.vx),O+=i.alignmentRate*(ee/re-w.vy);let e=te/re-C.x,t=ne/re-C.y,n=Math.hypot(D,ee);if(i.cohesionAcrossRatio!==1&&n>1e-6){let r=D/n,a=ee/n,o=e*r+t*a,s=e-o*r,c=t-o*a;e=o*r+s*i.cohesionAcrossRatio,t=o*a+c*i.cohesionAcrossRatio}let r=Math.hypot(e,t);if(r>1e-6){let n=Math.min(1,r/a)*g;ie+=e/r*n,O+=t/r*n}}let oe=Math.hypot(ie,O);oe>m&&(ie*=m/oe,O*=m/oe),w.vx+=ie*n,w.vy+=O*n;let se=Math.hypot(w.vx,w.vy);if(se>f)w.vx*=f/se,w.vy*=f/se;else if(se<p){let e=se>1e-6?{x:w.vx/se,y:w.vy/se}:{x:Math.cos(C.seed),y:Math.sin(C.seed)};w.vx=e.x*p,w.vy=e.y*p}let j=re>0?D/re:w.vx;if(Math.abs(j)>.05*r&&(C.heading=Math.sign(j)),t.finished){let e=r*C.radiusFraction*3;C.x<-e?C.flee=`left`:C.x>r+e&&(C.flee=`right`)}}t.inReach=x,t.ahead=S}var Eu=(e,t,n)=>e+(t-e)*Math.max(0,Math.min(1,n));function Du(e){let t=q.hazards.boids.back;return Eu(t.scaleNear,t.scaleFar,e)}function Ou(e){let t=q.hazards.boids.back,n=Math.max(0,Math.min(1,Eu(t.dimNear,t.dimFar,e))),r=e=>Math.round(255+((t.tint>>e&255)-255)*n);return r(16)<<16|r(8)<<8|r(0)}var ku=class{constructor(){J(this,`schools`,new Map)}get fishCount(){let e=0;for(let t of this.schools.values())e+=t.members.length;return e}reset(){this.schools.clear()}place(e,t,n,r,i,a,o,s,c){let l=this.schools.get(e);l||(l={id:e,school:xu(e,t,n,r,i),variety:a,distance:o,members:[]},this.schools.set(e,l));let u=l.school,d=Cu(u,r,s),f={x:d.x,y:d.y,seed:Math.random()*Math.PI*2,heading:Math.abs(u.dirX)>.05?Math.sign(u.dirX):0,radiusFraction:c,flee:null,boid:{school:e,...d.boid},clock:Math.random()*4};return l.members.push(f),f}update(e,t,n,r,i){if(this.schools.size===0)return;let a=Math.max(1,r-n);for(let[o,s]of this.schools){if(s.members.length===0){this.schools.delete(o);continue}let c=s.school;if(i!==0){c.startY+=i,c.y+=i;for(let e of s.members)e.y+=i}wu(c,e,t,a),Tu(s.members,c,e,t);for(let t of s.members)t.x+=t.boid.vx*e,t.y+=t.boid.vy*e,t.clock+=e;s.members=s.members.filter(e=>e.flee===`left`||e.flee===`right`?!1:e.y>n-80&&e.y<r+120)}}};function Au(e){let t=q.suction.radiusRatio+Math.max(0,e)*q.suction.radiusPerVolume;return Math.min(q.suction.maxRadiusRatio,t)}function ju(e,t){if(e<=0)return 1;if(t<=0)return q.suction.heavyFloor;let n=e/t;return n<=1?1:n>=q.suction.heavyRatio?q.suction.heavyFloor:1-(n-1)/(q.suction.heavyRatio-1)*(1-q.suction.heavyFloor)}function Mu(e,t){return q.suction.pullPerSecond*ju(e,t)}var Nu=[`boss`,`boss-crab`,`boss-octopus`,`boss-jelly`,`boss-shark`,`boss-netshark`,`boss-eye`];function Pu(e){return Nu.includes(e)}function Fu(e){return q.hazards.bosses[e]??q.hazards.boss}function Iu(e){return q.hazards.contactDamage[e]??0}function Lu(e,t){let n=q.hazards.vent,r=e===`left`?1:-1;if(t===`flat`)return{x:r,y:0};let i=Math.cos(n.diagonalRadians),a=Math.sin(n.diagonalRadians);return{x:r*i,y:t===`up`?a:-a}}function Ru(e,t){let n=q.hazards.vent.baseRadiusRatio*t;return e===`left`?n:t-n}function zu(e){let t=q.hazards.vent,n=e.side??`left`,r=e.aim??`up`,i=Lu(n,r);return{aimX:i.x,aimY:i.y,lengthRatio:t.jetLengthRatio[r],startDelaySeconds:e.startDelaySeconds??t.startDelaySeconds}}var Y={minActive:2,maxActive:5,spawnEverySeconds:7,fishSpeedFactor:.34,fishTurnRate:.9,get insideMarginRatio(){return q.spawning.insideMarginRatio},trashSpeedFactor:.12,get trashDrainPerSecond(){return q.hazards.trash.drainPerSecond},get trashDrainPerHit(){return q.hazards.trash.drainPerHit},trashStruggleRelease:.55,get trashMinGripSeconds(){return q.hazards.trash.minGripSeconds},get crabArmDistanceMeters(){return q.hazards.crab.armDistanceMeters},get crabFuseSeconds(){return q.hazards.crab.fuseSeconds},get crabLaunchMps(){return q.hazards.crab.launchMps},get crabApexSeconds(){return q.hazards.crab.apexSeconds},get fishFeedToSplit(){return q.emergence.fishFeedToSplit},fishDigestSeconds:.9,get fishPerceptionBaseMeters(){return q.emergence.fishPerceptionBaseMeters},get fishPerceptionPerVolume(){return q.emergence.fishPerceptionPerVolume},get fishHardCap(){return q.emergence.fishHardCap},fishBiteMeters:34,get seekBiggestRangeMeters(){return q.emergence.seekBiggestRangeMeters},seekBiggestPullPerSecond:.35};function Bu(e){let t=Fu(e);return{radius:t.radiusRatio,colour:t.colour,spin:0}}var X={fish:{radius:.035,colour:10147839,spin:0},tuna:{radius:.045,colour:5211832,spin:0},dolphin:{radius:.055,colour:8366292,spin:0},octopus:{radius:.07,colour:14247482,spin:.1},shark:{radius:.07,colour:8688804,spin:0},whale:{radius:.085,colour:3951198,spin:0},jelly:{radius:.062,colour:13081599,spin:0},trash:{radius:.05,colour:11569754,spin:.6},crab:{radius:.045,colour:16751467,spin:0},urchin:{radius:.052,colour:4016762,spin:.2},bombfish:{radius:.048,colour:14240319,spin:0},boss:Bu(`boss`),"boss-crab":Bu(`boss-crab`),"boss-octopus":Bu(`boss-octopus`),"boss-jelly":Bu(`boss-jelly`),"boss-shark":Bu(`boss-shark`),"boss-netshark":Bu(`boss-netshark`),"boss-eye":Bu(`boss-eye`),vent:{radius:q.hazards.vent.baseRadiusRatio,colour:q.hazards.vent.plumeColour,spin:0},mineral:{radius:.018,colour:16756838,spin:2.4},shrimp:{radius:.033,colour:16767440,spin:0},angler:{radius:.045,colour:3099235,spin:0},torpedo:{radius:.036,colour:10135476,spin:0},zapper:{radius:.058,colour:q.hazards.zapper.bellColour,spin:0},foam:{radius:q.hazards.foam.radiusRatio,colour:q.hazards.foam.colour,spin:0},rain:{radius:.014,colour:q.hazards.rain.colour,spin:0},eel:{radius:.058,colour:13169226,spin:.3},archer:{radius:.038,colour:9425128,spin:0},pistol:{radius:.058,colour:16743787,spin:0},puffer:{radius:.05,colour:5925524,spin:0},starfish:{radius:.052,colour:16763299,spin:.35},fallcrate:{radius:.075,colour:12159566,spin:0},ink:{radius:.3,colour:460555,spin:0}};for(let e of Object.keys(X)){let t=q.hazards.radius[e];typeof t==`number`&&t>0&&(X[e].radius=t)}function Vu(e){return q.hazards.health[e]??0}var Hu=[`up`,`left`,`right`],Uu=[`vent`,`mineral`,`foam`,`rain`,`ink`];function Wu(e,t,n){return Pu(e.kind)||Uu.includes(e.kind)||e.flee===`dead`?0:e.kind===`fallcrate`||e.boid||e.path||e.charge||e.flee?n.cameraRise:n.cameraRise-n.driftSpeed*t}function Gu(e,t,n,r){let i=e.perceptionRadius(r.playerVolume);if(Math.hypot(r.playerX-t.x,r.playerY-t.y)>i){let e=Math.sin(t.phase*1.3+t.seed)*5*n;t.x+=e,e!==0&&(t.heading=Math.sign(e)),t.y-=r.driftSpeed*.42*n;return}let a=r.playerX-t.x,o=Math.max(-1,Math.min(1,a/Math.max(1,r.laneWidth*.25)));t.x+=o*r.laneWidth*Y.fishSpeedFactor*n,o!==0&&(t.heading=Math.sign(o)),t.y-=r.driftSpeed*.55*n}function Ku(e,t,n,r){let i=q.hazards.jelly,a=q.animations[`jelly-idle`],o=a?kl(a,t.phase):0,s=i.pulse[o]??1;t.y+=r.driftSpeed*(1+Math.max(0,i.climbRatio)*s)*n,t.squashed=Math.max(0,t.squashed-n*2.2)}function qu(e,t,n,r){t.gripping?(t.x=r.playerX,t.y=r.playerY):(t.y-=r.driftSpeed*Y.trashSpeedFactor*n,t.x+=Math.sin(t.phase*1.1+t.seed)*4*n)}function Ju(e,t,n,r){t.y-=r.driftSpeed*.18*n;let i=t.y<r.playerY+Y.crabArmDistanceMeters;!t.armed&&i&&(t.armed=!0,t.fuse=Y.crabFuseSeconds),t.armed&&(t.fuse=Math.max(0,t.fuse-n))}function Yu(e,t,n,r){t.y-=r.driftSpeed*.26*n,t.x+=Math.sin(t.phase*.8+t.seed)*2.5*n}function Xu(e,t,n,r,i){e.y-=n.driftSpeed*r*t,e.x+=Math.sin(e.phase*.8+e.seed)*i*t}function Zu(e,t,n,r){Xu(t,n,r,q.hazards.archer.driftFactor,2.5)}function Qu(e,t,n,r){Xu(t,n,r,q.hazards.pistol.driftFactor,1.2)}function $u(e,t,n,r){Xu(t,n,r,q.hazards.puffer.driftFactor,1.8),t.counterRest>0&&(t.counterRest=Math.max(0,t.counterRest-n))}function ed(e,t,n,r){Xu(t,n,r,q.hazards.starfish.driftFactor,1.5)}function td(e,t,n,r){let i=q.hazards.bombfish,a=r.playerX-t.x,o=r.playerY-t.y,s=Math.hypot(a,o),c=i.seekSpeedFactor*r.laneWidth;s>.001&&(t.x+=a/s*c*n,t.y+=o/s*c*n),t.y-=r.driftSpeed*.15*n,t.blastFuse===null&&s<=i.armMeters&&(t.blastFuse=i.fuseSeconds)}function nd(e,t,n,r){let i=Fu(t.kind),a=r.playerX+Math.sin(r.elapsed*(Math.PI*2/i.patrolPeriodSeconds))*i.patrolAmplitude*r.laneWidth-t.x,o=i.seekSpeedFactor*r.laneWidth*n;t.x+=Math.abs(a)<=o?a:Math.sign(a)*o;let s=Math.max(1,r.max-r.min),c=r.min+s*i.patrolCenterRatio+Math.sin(r.elapsed*(Math.PI*2/i.verticalPatrolPeriodSeconds))*s*i.patrolVerticalAmplitudeRatio,l=uf(t.kind,t.variety,t.scale),u=r.laneWidth*(l?l.halfH:t.radiusFraction),d=r.min+u,f=r.max-u,p=d<=f?Math.min(Math.max(c,d),f):(r.min+r.max)/2;t.y+=(p-t.y)*Math.min(1,n*i.verticalSeekPerSecond)}function rd(e,t,n,r){let i=q.hazards.vent;if(t.vent&&t.fed<t.vent.startDelaySeconds){t.fed+=n;return}t.phase=(t.phase+n)%Math.max(.2,i.periodSeconds)}function id(e){return!e.vent||e.fed<e.vent.startDelaySeconds?!1:e.phase<q.hazards.vent.activeSeconds}function ad(e){let t=q.hazards.vent;return e.vent?e.fed<e.vent.startDelaySeconds?e.vent.startDelaySeconds-e.fed<=t.warnSeconds:e.phase>t.periodSeconds-t.warnSeconds:!1}function od(e,t,n,r){let i=q.hazards.mineral;t.y+=r.laneWidth*i.riseSpeedFactor*n,t.x+=Math.sin(r.elapsed/Math.max(.2,i.wobblePeriodSeconds)*Math.PI*2+t.seed)*r.laneWidth*i.wobbleAmplitude*n,t.fed+=n,t.fed*r.laneWidth*i.riseSpeedFactor>i.lifeMeters&&(t.flee=`up`)}function sd(e,t,n,r){let i=q.hazards.shrimp;t.x+=t.seed%2<1?-r.laneWidth*i.driftSpeedFactor*n:r.laneWidth*i.driftSpeedFactor*n,t.y-=r.driftSpeed*.25*n}function cd(e,t,n,r){let i=q.hazards.angler;t.chargeRest>0&&(t.chargeRest-=n);let a=Math.hypot(r.playerX-t.x,r.playerY-t.y);if(t.chargeRest<=0&&a<=i.lureMeters){t.chargeRest=i.cooldownSeconds;let e=a;t.charge={fromX:t.x,fromY:t.y,toX:r.playerX,toY:r.playerY,bow:(t.x<r.playerX?1:-1)*i.bowRatio*e,elapsed:0,grazed:!1,hitPlayer:!1}}t.y-=r.driftSpeed*i.driftFactor*n}function ld(e,t,n,r){let i=q.hazards.torpedo,a=r.laneWidth*i.runSpeedFactor,o=r.laneWidth*i.seekSpeedFactor;if(t.fed<i.runMeters)t.fed+=a*n,t.y+=a*n;else if(t.digest<i.seekSeconds){t.digest+=n;let e=r.playerX-t.x,i=r.playerY-t.y,a=Math.hypot(e,i)||1;t.x+=e/a*o*n,t.y+=i/a*o*n}else t.y-=r.driftSpeed*.3*n}function ud(e,t,n,r){t.dischargeRest>0&&(t.dischargeRest-=n),t.discharge>0&&(t.discharge-=n),t.y-=r.driftSpeed*.28*n,t.x+=Math.sin(t.phase*.7+t.seed)*2.4*n}function dd(e,t,n,r){t.foamLife-=n,t.foamLife<=0&&(t.flee=`up`),t.y-=r.driftSpeed*.6*n,t.x+=Math.sin(t.phase*.9+t.seed)*3.2*n}function fd(e,t,n,r){t.y-=r.laneWidth*q.hazards.rain.fallSpeedFactor*n}function pd(e,t,n,r){let i=q.hazards.fallcrate;t.phase<i.warnSeconds||(t.y-=r.laneWidth*i.fallSpeedFactor*n)}function md(e,t,n,r){let i=q.hazards.ink;t.phase<i.throwSeconds||(t.foamLife=Math.max(0,t.foamLife-n),t.foamLife<=0&&t.deadSince===void 0&&(t.flee=`dead`,t.deadSince=0,t.deadDeadline=i.fadeSeconds))}function hd(e,t,n,r){t.y-=r.driftSpeed*.3*n,t.x+=Math.sin(t.phase*2.6+t.seed)*r.laneWidth*.055*n,t.attackSince!==null&&(t.attackSince+=n,t.attackSince>=(q.hazardArt.eel?.attackSeconds??.45)&&(t.attackSince=null))}var gd={fish:Gu,tuna:Gu,whale:Gu,dolphin:Gu,shark:Gu,octopus:Gu,jelly:Ku,trash:qu,crab:Ju,urchin:Yu,bombfish:td,boss:nd,"boss-crab":nd,"boss-octopus":nd,"boss-jelly":nd,"boss-shark":nd,"boss-netshark":nd,"boss-eye":nd,vent:rd,mineral:od,shrimp:sd,angler:cd,torpedo:ld,zapper:ud,foam:dd,rain:fd,fallcrate:pd,ink:md,eel:hd,archer:Zu,pistol:Qu,puffer:$u,starfish:ed};function _d(e,t,n,r){n.invulnerable||r.push({kind:`fish`,damage:Iu(t.kind),broke:!1})}function vd(e,t,n,r){n.invulnerable||(r.push({kind:`jelly`,damage:Iu(`jelly`),slowSeconds:Sl.hazardSlowSeconds,slowFactor:Sl.hazardSlowFactor,broke:!1}),t.squashed=1)}function yd(e,t,n,r){t.gripping||(t.gripping=!0,e.grabs++,r.push({kind:`trash`,broke:!1}))}function bd(e,t,n,r){t.fired||!t.armed||t.fuse>0||(r.push({kind:`crab`,impulse:Y.crabLaunchMps,broke:!0}),t.fired=!0)}function xd(e,t,n,r){n.invulnerable||r.push({kind:t.kind,damage:Iu(t.kind),broke:!1})}function Sd(e,t,n,r){t.phase<q.hazards.fallcrate.warnSeconds||xd(e,t,n,r)}function Cd(e,t,n,r){let i=q.hazards.ink;t.phase<i.throwSeconds||r.push({kind:t.kind,slowSeconds:i.slowRefreshSeconds,slowFactor:i.slowFactor,broke:!1})}function wd(e,t,n,r){n.invulnerable||r.push({kind:t.kind,damage:Iu(t.kind),paralysisSeconds:q.hazards.eel.paralysisSeconds,broke:!1})}function Td(e,t,n,r){n.invulnerable||r.push({kind:`shrimp`,damage:Iu(`shrimp`),broke:!1})}function Ed(e,t,n,r){let i=n.laneWidth*lf(t.kind),a=q.hazards.zapper,o=n.laneWidth*a.ringRadiusRatio,s=Math.hypot(n.playerX-t.x,n.playerY-t.y);s<=i+n.laneWidth*n.playerRadiusFraction&&t.discharge<=0&&t.dischargeRest<=0&&(t.discharge=a.ringSeconds,t.dischargeRest=a.ringCooldownSeconds),!(t.discharge<=0||s>o||n.invulnerable)&&(r.push({kind:`zapper`,damage:a.ringDamage,broke:!1}),r.push({kind:`zapper`,charge:q.hazards.charge.perRingHit,broke:!1}))}function Dd(e,t,n,r){r.push({kind:`foam`,damage:n.invulnerable?0:Iu(`foam`),broke:!0}),t.flee=`up`}function Od(e,t,n,r){if(n.invulnerable)return;let i=q.hazards.rain;r.push({kind:`rain`,damage:Iu(`rain`),pushDown:i.pushMeters,broke:!0}),t.flee=`down`}function kd(e,t,n,r){if(n.invulnerable)return;let i=n.laneWidth*n.playerRadiusFraction,a=n.laneWidth*lf(t.kind);(Math.hypot(t.x-n.playerX,t.y-n.playerY)<=i+a||id(t))&&r.push({kind:`vent`,damage:Iu(`vent`),broke:!1})}function Ad(e,t,n,r){n.invulnerable||(r.push({kind:`mineral`,damage:Iu(`mineral`),broke:!0}),t.flee=`up`)}function jd(e,t,n,r){n.invulnerable||r.push({kind:t.kind,damage:Iu(t.kind),broke:!1})}var Md={fish:_d,tuna:_d,whale:_d,dolphin:_d,shark:_d,octopus:_d,jelly:vd,trash:yd,crab:bd,urchin:xd,bombfish:xd,eel:wd,angler:xd,torpedo:xd,boss:jd,"boss-crab":jd,"boss-octopus":jd,"boss-jelly":jd,"boss-shark":jd,"boss-netshark":jd,"boss-eye":jd,shrimp:Td,zapper:Ed,mineral:Ad,foam:Dd,rain:Od,fallcrate:Sd,ink:Cd,archer:xd,pistol:xd,puffer:xd,starfish:xd,vent:kd};function Nd(e,t,n,r,i,a){let o=i-n,s=a-r,c=o*o+s*s;if(c<=0)return Math.hypot(e-n,t-r);let l=Math.min(1,Math.max(0,((e-n)*o+(t-r)*s)/c));return Math.hypot(e-(n+l*o),t-(r+l*s))}function Pd(e,t){let n=t.laneWidth*t.playerRadiusFraction,r=t.laneWidth*lf(e.kind);if(Math.hypot(e.x-t.playerX,e.y-t.playerY)<=n+r)return!0;if(!e.vent||!id(e))return!1;let i=t.laneWidth*e.vent.lengthRatio,a=e.x+e.vent.aimX*i,o=e.y+e.vent.aimY*i,s=t.laneWidth*q.hazards.vent.jetHalfWidthRatio;return Nd(t.playerX,t.playerY,e.x,e.y,a,o)<=n+s}var Fd={vent:Pd};function Id(e,t,n=q.angry.armour.vulnerableMultiplier){t<=0||(e.vulnerableLeft=t,e.vulnerableMultiplier=n)}function Ld(e,t){return e.vulnerableLeft===void 0||e.vulnerableLeft<=0?t:t*(e.vulnerableMultiplier??1)}function Rd(e,t,n,r){let i=r/Math.max(.05,fu(e.kind)),a=Math.hypot(t,n);if(a<.001){e.y+=i;return}e.x+=t/a*i,e.y+=n/a*i}var zd=class{constructor(){J(this,`hazards`,[]),J(this,`schools`,new Map),J(this,`back`,new ku),J(this,`grabs`,0),J(this,`charges`,0),J(this,`grazes`,0),J(this,`eaten`,0),J(this,`slammed`,0),J(this,`spawnTimer`,0),J(this,`splits`,0),J(this,`bubblesEaten`,0),J(this,`fled`,0),J(this,`killed`,0),J(this,`damaged`,0),J(this,`hitEvents`,[]),J(this,`critHits`,[]),J(this,`autoSpawn`,!1)}joinSchool(e,t,n,r,i){let a=this.schools.get(e);return a||(a=xu(e,t,n,r,i),this.schools.set(e,a)),a}newHazardId(){return nf++}spawnForTest(e,t,n,r=0){if(e===`vent`&&r>0){let i=t<r/2?`left`:`right`,a=this.spawnAt(e,Ru(i,r),n,{deterministic:!0,side:i});return this.hazards.push(a),a}let i=this.spawnAt(e,t,n,{deterministic:!0});return this.hazards.push(i),i}reset(){this.hazards=[],this.schools.clear(),this.back.reset(),this.hitEvents.length=0,this.critHits.length=0,this.spawnTimer=0,this.grabs=0,this.charges=0,this.grazes=0,this.eaten=0,this.slammed=0,this.splits=0,this.bubblesEaten=0,this.fled=0,this.killed=0,this.damaged=0}takeHitEvents(){return this.hitEvents.splice(0,this.hitEvents.length)}takeCritHits(){return this.critHits.splice(0,this.critHits.length)}get dying(){return this.hazards.some(e=>dp(e))}tickDeaths(e){if(this.hazards.length===0)return;let t=!1;for(let n of this.hazards)n.deadSince!==void 0&&(n.deadSince+=e,dp(n)||(t=!0));t&&(this.hazards=this.hazards.filter(e=>e.deadSince===void 0||dp(e)))}hit(e,t,n,r=e.phase){if(e.kind===`fallcrate`&&e.phase<q.hazards.fallcrate.warnSeconds||e.maxHealth<=0||e.flee)return`immune`;if(e.health=Math.max(0,e.health-t),Wd(e,r)&&(e.flashStarted=r,e.flashLastStarted=r),this.applyKnock(e,n),t>=q.hitFeedback.critDamage){let n=Math.min(1,t/Math.max(.01,q.hitFeedback.critDamage));e.critStarted=r,e.critStrength=n,this.critHits.push({x:e.x,y:e.y,strength:n})}if(e.kind===`zapper`&&q.hazards.zapper.dischargesWhenHit&&e.dischargeRest<=0&&(e.discharge=q.hazards.zapper.ringSeconds,e.dischargeRest=q.hazards.zapper.ringCooldownSeconds),e.kind===`puffer`&&q.hazards.puffer.countersWhenHit&&e.counterRest<=0&&e.health>0&&(e.counter++,e.counterRest=q.hazards.puffer.counterCooldownSeconds),e.health>0)return this.damaged++,this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`hit`,colour:X[e.kind].colour,hazard:e.kind}),`damaged`;if(e.kind===`bombfish`)return e.blastFuse=0,this.fled++,this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`defeat`,colour:X[e.kind].colour,hazard:e.kind}),`fled`;if(Pu(e.kind))return this.killed++,cp(e),this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`defeat`,colour:X[e.kind].colour,hazard:e.kind}),`killed`;if(e.kind===`fallcrate`){e.flee=`dead`,e.deadSince=0,e.deadDeadline=0;let t=Jd.get(e.id);return t&&(t.visible=!1),this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`defeat`,colour:X[e.kind].colour,hazard:e.kind}),`shattered`}return e.charge=null,e.flee=Hu[Math.floor(Math.random()*Hu.length)],this.fled++,this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`escaped`,colour:X[e.kind].colour,hazard:e.kind}),`fled`}perceptionRadius(e){let t=Math.max(0,e-1);return Y.fishPerceptionBaseMeters+t*Y.fishPerceptionPerVolume}update(e,t){let n=[];if(t.eatenBubbleIds=[],t.splitCount=0,this.autoSpawn){this.spawnTimer-=e;let n=Math.min(Y.maxActive,Y.minActive+Math.floor(t.elapsed/25));this.spawnTimer<=0&&(this.spawnTimer=Y.spawnEverySeconds,this.hazards.length<n&&this.hazards.push(this.spawn(t)))}if(t.suction&&this.applySuction(e,t),this.schools.size){let n=new Map;for(let e of this.hazards){if(!e.boid||e.flee||e.deadSince!==void 0)continue;let t=n.get(e.boid.school);t?t.push(e):n.set(e.boid.school,[e])}let r=t.max-t.min;for(let[i,a]of this.schools){let o=n.get(i);if(!o){this.schools.delete(i);continue}t.cameraRise!==0&&(a.startY+=t.cameraRise,a.y+=t.cameraRise),wu(a,e,t.laneWidth,r),Tu(o,a,e,t.laneWidth)}}this.back.update(e,t.laneWidth,t.min,t.max,t.cameraRise);for(let r of this.hazards){r.facingRest!==void 0&&r.facingRest>0&&(r.facingRest=Math.max(0,r.facingRest-e)),r.vulnerableLeft!==void 0&&r.vulnerableLeft>0&&(r.vulnerableLeft=Math.max(0,r.vulnerableLeft-e)),mf(r,e);let i=Wu(r,e,t);if(i!==0&&(r.y+=i,r.path&&(r.path.startY+=i),r.charge&&(r.charge.fromY+=i,r.charge.toY+=i)),this.advance(r,e,t),r.kind===`fallcrate`){let e=q.hazards.fallcrate;r.fired||(r.fired=!0,n.push({kind:`fallcrate`,broke:!1,cue:{what:`fallcrateWarn`,x:r.x,y:r.y}})),!r.armed&&r.phase>=e.warnSeconds&&(r.armed=!0,n.push({kind:`fallcrate`,broke:!1,cue:{what:`fallcrateDrop`,x:r.x,y:r.y}}))}if(this.updateShooting(r,e,t)){if(r.kind===`starfish`){let e=Math.max(1,Math.round(q.hazards.starfish.volleyCount)),t=[];for(let n=0;n<e;n++){let i=r.volleySpin+n/e*Math.PI*2;t.push({x:Math.cos(i),y:Math.sin(i)})}r.volleySpin+=q.hazards.starfish.volleySpinRadians,n.push({kind:r.kind,broke:!1,volley:{x:r.x,y:r.y,dirs:t}})}else n.push({kind:r.kind,broke:!1,shot:{x:r.x,y:r.y}});r.kind===`eel`&&(r.attackSince=0)}if(r.kind===`puffer`&&r.counter>0&&!r.flee&&!r.entry){r.counter=0;let e=Math.max(1,Math.round(q.hazards.puffer.spikeCount)),t=[];for(let n=0;n<e;n++){let i=n/e*Math.PI*2+r.seed/100*Math.PI*2;t.push({x:Math.cos(i),y:Math.sin(i)})}n.push({kind:r.kind,broke:!1,volley:{x:r.x,y:r.y,dirs:t}})}let a=this.updateAttack(r,e,t);a&&n.push(a)}this.resolveFishFeeding(t),this.resolveSeeking(e,t);let r=t.laneWidth*t.playerRadiusFraction;for(let e of this.hazards){let i=t.laneWidth*lf(e.kind,e.scale),a=e.x-t.playerX,o=e.y-t.playerY,s=r+i,c=Fd[e.kind],l=c?null:uf(e.kind,e.variety,e.scale);if(!(c?c(e,t):l?df(t.playerX,t.playerY,e.x,e.y,l.halfW*t.laneWidth,l.halfH*t.laneWidth)<=r:a*a+o*o<=s*s)){if(e.kind===`trash`&&e.gripping&&(e.gripping=!1),!t.invulnerable&&e.charge&&!e.charge.grazed&&!e.charge.hitPlayer&&e.charge.elapsed>=gf(e.kind).telegraphSeconds){let i=s*(q.graze.radiusMultiplier-1),c=s*q.graze.radiusMultiplier;if(l?df(t.playerX,t.playerY,e.x,e.y,l.halfW*t.laneWidth+i,l.halfH*t.laneWidth+i)<=r:a*a+o*o<=c*c){let r=_f(e.charge,gf(e.kind));r.x*(t.playerX-e.x)+r.y*(t.playerY-e.y)<=0&&(e.charge.grazed=!0,this.grazes++,n.push({kind:e.kind,broke:!1,graze:{x:(e.x+t.playerX)/2,y:(e.y+t.playerY)/2}}))}}continue}if(e.charge&&(e.charge.hitPlayer=!0),t.canEat(e.kind)){this.eaten++,n.push({kind:e.kind,broke:!0,eaten:{id:e.id}});continue}if(t.canSlam){this.slammed++,n.push({kind:e.kind,broke:!0,slammed:{id:e.id}});continue}e.flee||Md[e.kind](this,e,t,n)}for(let r of this.hazards)r.kind===`trash`&&r.gripping&&(r.gripSeconds+=e,n.push({kind:`trash`,drainPerSecond:!0,broke:!1}),t.struggling&&r.gripSeconds>=Y.trashMinGripSeconds&&(r.gripping=!1,r.gripSeconds=0,r.fired=!0,n.push({kind:`trash`,broke:!0})));let i=new Set;for(let r of this.hazards){if(r.blastFuse===null||(r.blastFuse-=e,r.blastFuse>0))continue;i.add(r.id);let a=q.hazards.bombfish,o=t.laneWidth*a.blastRadiusRatio,s=Math.hypot(t.playerX-r.x,t.playerY-r.y);n.push({kind:r.kind,broke:!0,blast:{x:r.x,y:r.y,radius:o},damage:s<=o?a.blastDamage:0})}let a=new Set(n.filter(e=>e.eaten).map(e=>e.eaten.id));return this.hazards=this.hazards.filter(e=>{if(a.has(e.id)||i.has(e.id))return!1;if(e.deadSince!==void 0)return dp(e);let n=e.y>t.min-80&&e.y<t.max+120+e.spawnAbove;if(e.flee&&e.flee!==`up`){let n=t.laneWidth*e.radiusFraction*2;if(e.x<-n||e.x>t.laneWidth+n)return!1}let r=e.fired&&(e.kind===`trash`||e.kind===`crab`);return n&&!r}),n}applySuction(e,t){let n=t.suction;if(!n)return;let r=t.laneWidth*Au(t.playerVolume)*Math.max(0,n.radiusFactor);if(r<=0)return;let i=r*r;for(let r of this.hazards){if(r.flee)continue;let a=n.x-r.x,o=n.y-r.y,s=a*a+o*o;if(s>i||s<1e-6)continue;let c=Math.sqrt(s);if(r.kind===`trash`&&r.gripping||r.kind===`crab`&&r.armed)continue;let l=t.laneWidth*Mu(fu(r.kind),t.playerVolume),u=Math.min(l*e,c);r.x+=a/c*u,r.y+=o/c*u}}resolveFishFeeding(e){let t=Y.fishBiteMeters,n=[];for(let r of this.hazards)if(r.kind===`fish`&&!r.flee&&(r.digest=Math.max(0,r.digest-1/60),!(r.digest>0))){for(let i of e.bubbles)if(!e.eatenBubbleIds.includes(i.id)&&!(Math.hypot(i.x-r.x,i.y-r.y)>t)){e.eatenBubbleIds.push(i.id),r.fed++,r.digest=Y.fishDigestSeconds,this.bubblesEaten++,r.fed>=Y.fishFeedToSplit&&this.hazards.length+n.length<Y.fishHardCap&&(r.fed=0,this.splits++,e.splitCount++,n.push({...r,id:this.newHazardId(),x:Math.max(0,Math.min(e.laneWidth,r.x+(Math.random()-.5)*e.laneWidth*.2)),y:r.y+14,radiusFraction:r.radiusFraction*.88,phase:Math.random()*Math.PI*2,seed:Math.random()*1e3,heading:0,variety:r.variety,fed:0,digest:Y.fishDigestSeconds,boid:r.boid?{...r.boid}:null}));break}}this.hazards.push(...n)}resolveSeeking(e,t){let n=Y.seekBiggestRangeMeters,r=Y.seekBiggestPullPerSecond;for(let i of this.hazards){if(i.kind!==`jelly`&&i.kind!==`trash`||i.kind===`trash`&&i.gripping||i.flee)continue;let a=null;for(let e of t.bubbles)t.eatenBubbleIds.includes(e.id)||Math.hypot(e.x-i.x,e.y-i.y)>n||(!a||e.volume>a.volume)&&(a={x:e.x,y:e.y,volume:e.volume});if(!a)continue;let o=a.x-i.x,s=a.y-i.y,c=Math.hypot(o,s);if(c<.001)continue;let l=Math.min(c,r*e*t.laneWidth*.05);i.x+=o/c*l,i.y+=s/c*l}}spawnAt(e,t,n,r={}){let i=X[e].radius,a=r.health??Vu(e),o=+!r.deterministic,s=e===`vent`?zu(r):null;return{id:this.newHazardId(),kind:e,x:t,y:n,radiusFraction:i,spawnAbove:r.aboveMeters??0,scale:r.scale??1,phase:e===`vent`||e===`fallcrate`||e===`ink`||r.deterministic?0:Math.random()*Math.PI*2,seed:r.deterministic?0:Math.random()*1e3,heading:0,variety:r.variety??0,squashed:0,gripping:!1,gripSeconds:0,fuse:e===`crab`?Y.crabFuseSeconds:0,fired:!1,armed:!1,fed:0,digest:0,entry:r.entry??null,health:a,maxHealth:a,flee:null,charge:null,blastFuse:null,knock:null,discharge:0,dischargeRest:0,foamLife:e===`foam`?q.hazards.foam.lifeSeconds:e===`ink`?q.hazards.ink.lifeSeconds:0,inkFrom:r.inkFrom??null,vent:s,chargeRest:o*Math.random()*(q.charges.chargers[e]?.cooldownSeconds??0),attackSince:null,attackRest:o*Math.random()*Fu(e).attackEverySeconds,attacked:!1,shootTimer:o*(Math.random()/Math.max(.01,q.enemyBullets.shooters[e]?.perSecond??1)),counter:0,counterRest:0,volleySpin:o*Math.random()*Math.PI*2,path:r.path??null,boid:r.boid??null}}spawn(e){let t=[`fish`,`tuna`,`jelly`,`trash`,`crab`,`urchin`,`bombfish`,`eel`,`boss`,`vent`,`mineral`,`shrimp`,`angler`,`torpedo`,`zapper`,`foam`,`rain`,`dolphin`,`octopus`,`shark`,`whale`,`archer`,`pistol`,`puffer`,`starfish`],n=t[Math.floor(Math.random()*t.length)]??`fish`,r=X[n].radius,i=e.laneWidth*r*1.4,a=Math.floor(Math.random()*8);if(n===`vent`){let t=Math.random()<.5?`left`:`right`,r=[`up`,`flat`,`down`][Math.floor(Math.random()*3)]??`up`;return this.spawnAt(n,Ru(t,e.laneWidth),e.max+20+Math.random()*40,{variety:a,side:t,aim:r})}return this.spawnAt(n,i+Math.random()*Math.max(.01,e.laneWidth-i*2),e.max+20+Math.random()*40,{variety:a})}applyKnock(e,t){let n=q.hitKnockback,r=n.meters*(e.kind===`fallcrate`?0:Pu(e.kind)?Math.max(0,Fu(e.kind).knockbackScale):1)*Math.max(0,t?.knockScale??1);if(r<=0||n.seconds<=0)return;let i=0,a=1;if(t){let n=e.x-t.x,r=e.y-t.y,o=Math.hypot(n,r);o>.001&&(i=n/o,a=r/o)}e.knock={dirX:i,dirY:a,meters:r,seconds:n.seconds,elapsed:0}}advanceKnock(e,t){let n=e.knock;if(!n)return;let r=Math.max(0,1-n.elapsed/n.seconds),i=2*n.meters/n.seconds*r;e.x+=n.dirX*i*t,e.y+=n.dirY*i*t,n.elapsed+=t,n.elapsed>=n.seconds&&(e.knock=null)}advance(e,t,n){this.advanceKind(e,t,n),this.advanceKnock(e,t)}advanceKind(e,t,n){e.phase+=t;let r=n.driftSpeed;if(e.flee){if(e.flee===`dead`)return;let r=Math.max(1,n.max-n.min)*q.hazards.fleeScreensPerSecond*t;e.flee===`up`?e.y+=r:e.x+=e.flee===`right`?r:-r;return}if(e.entry){let i=n.laneWidth*Y.insideMarginRatio,a=!1;switch(e.entry.from){case`left`:e.x+=e.entry.speed*t,a=e.x>=i;break;case`right`:e.x-=e.entry.speed*t,a=e.x<=n.laneWidth-i;break;case`bottom`:e.y+=(r+e.entry.speed)*t,a=e.y>=n.playerY}if(!a)return;e.entry=null}if(e.charge){let n=gf(e.kind);if(e.charge.elapsed+=t,e.charge.elapsed<n.telegraphSeconds)return;let r=Math.min(1,(e.charge.elapsed-n.telegraphSeconds)/Math.max(.05,n.travelSeconds)),{fromX:i,fromY:a,toX:o,toY:s,bow:c}=e.charge,l=(i+o)/2,u=(a+s)/2,d=Math.hypot(o-i,s-a)||1,f=l+-(s-a)/d*c,p=u+(o-i)/d*c,m=1-r;e.x=m*m*i+2*m*r*f+r*r*o,e.y=m*m*a+2*m*r*p+r*r*s,r>=1&&(e.charge=null,e.chargeRest=n.cooldownSeconds);return}let i=e.path||e.boid?void 0:q.charges.chargers[e.kind];if(i){e.chargeRest=Math.max(0,e.chargeRest-t);let r=Math.hypot(n.playerX-e.x,n.playerY-e.y);if(e.chargeRest<=0&&r<=i.triggerMeters){let t=e.x<n.playerX,r=Math.hypot(n.playerX-e.x,n.playerY-e.y);e.charge={fromX:e.x,fromY:e.y,toX:n.playerX,toY:n.playerY,bow:(t?1:-1)*i.bowRatio*r,elapsed:0,grazed:!1,hitPlayer:!1},e.heading=t?1:-1,this.charges++;return}}if(e.path){e.path.elapsed+=t;let r=Math.max(0,Math.min(1,e.path.elapsed/Math.max(.1,e.path.seconds))),i=gu(e.path.points,r),a={x:e.x,y:e.y};e.x=i.x*n.laneWidth,e.y=e.path.startY+i.y*(n.max-n.min),Math.abs(e.x-a.x)>.001&&(e.heading=Math.sign(e.x-a.x)),r>=1&&(e.flee=`up`);return}if(e.boid){e.x+=e.boid.vx*t,e.y+=e.boid.vy*t;return}gd[e.kind](this,e,t,n),e.path||(e.x=Math.max(0,Math.min(n.laneWidth,e.x)))}updateShooting(e,t,n){let r=q.enemyBullets.shooters[e.kind];if(!r||r.perSecond<=0||e.flee||e.entry||e.charge)return!1;let i=1/Math.max(.01,r.perSecond);return Math.hypot(n.playerX-e.x,n.playerY-e.y)>q.enemyBullets.rangeMeters?(e.shootTimer=Math.max(e.shootTimer,i),!1):(e.shootTimer-=t,e.shootTimer>0?!1:(e.shootTimer+=i,e.shootTimer<=0&&(e.shootTimer=i),!0))}updateAttack(e,t,n){if(!Pu(e.kind)||e.deadSince!==void 0||e.flee||e.entry)return null;let r=q.animations[q.hazardArt[e.kind]?.attack??``];if(!r)return null;let i=Fu(e.kind);if(e.attackSince===null){if(e.attackRest-=t,e.attackRest>0)return null;e.attackSince=0,e.attacked=!1}if(e.attackSince+=t,e.attackSince>=Ol(r))return e.attackSince=null,e.attackRest=Math.max(0,i.attackEverySeconds),null;if(e.attacked||kl(r,e.attackSince)<Math.max(0,i.attackSprayFrame-1))return null;e.attacked=!0;let a=q.hazards.bossSkills[e.kind];if(a){let t=Math.floor(Math.random()*3);if(t===0)return{kind:e.kind,broke:!1,inkThrow:{fromX:e.x,fromY:e.y,toX:Math.max(0,Math.min(n.laneWidth,n.playerX)),toY:n.playerY}};if(t===1)return{kind:e.kind,broke:!1,summonCrates:{openColumn:Math.floor(Math.random()*3),topY:n.max,laneWidth:n.laneWidth}};let r=Math.max(1,Math.round(a.ringCount)),i=[];for(let t=0;t<r;t++){let n=e.volleySpin+t/r*Math.PI*2;i.push({x:Math.cos(n),y:Math.sin(n)})}return e.volleySpin+=a.ringRotationRadians,{kind:e.kind,broke:!1,volley:{x:e.x,y:e.y,dirs:i}}}if(i.attackSprayCount===void 0||i.attackSpraySpread===void 0||i.attackSprayFromX===void 0||i.attackSprayFromY===void 0||i.attackSprayBowRatio===void 0)return null;let o=n.laneWidth*e.radiusFraction,s=n.playerX>=e.x?1:-1,c=e.x+i.attackSprayFromX*o*s,l=e.y+i.attackSprayFromY*o,u=Math.max(0,Math.round(i.attackSprayCount)),d=Math.max(0,i.attackSpraySpread)*n.laneWidth,f=[];for(let e=0;e<u;e++){let t=u<=1?0:e/(u-1)-.5;f.push({x:Math.max(0,Math.min(n.laneWidth,n.playerX+t*d)),y:n.playerY})}return f.length>0?{kind:e.kind,broke:!1,spray:{fromX:c,fromY:l,targets:f,bow:i.attackSprayBowRatio}}:null}};function Bd(e,t,n,r,i,a){let o=(e,t)=>Number.isFinite(e)?e:t,s=o(i.pulseMin,.6)+(o(i.pulseMax,1.2)-o(i.pulseMin,.6))*(.5+.5*Math.sin(o(a,0)*o(i.pulsePerSecond,1)*Math.PI*2)),{tipX:c,tipY:l,baseX:u,baseY:d}=Df(t,n,r,i,Al(e));jf.length>=Af&&jf.shift(),jf.push({x:t,y:n,r,tipX:c,tipY:l,angle:i.stemAngle,glowRadius:i.glowRadius}),i.stemWidth>0&&e.moveTo(u,d).lineTo(c,l).stroke({color:i.stemColour,width:Math.max(.5,r*i.stemWidth)}),Number.isFinite(c)&&Number.isFinite(l)&&e.circle(c,l,r*o(i.glowRadius,.8)).fill({color:i.glowColour,alpha:o(i.glowAlpha,.5)*s}),e.circle(c,l,r*o(i.bulbRadius,.2)).fill({color:i.bulbColour,alpha:Math.min(1,s)})}var Vd=!1;function Hd(e){return Vd=e,Vd}function Ud(e,t){let n=q.hitFlash,r=Math.max(.001,n.seconds);if(Vd||t<=0||e<0||e>=r)return 0;let i=e/r;if(i<n.riseFraction)return t*(i/Math.max(.001,n.riseFraction));let a=(i-n.riseFraction)/Math.max(.001,1-n.riseFraction);return t*(1-a)*(1-a)}function Wd(e,t){return e.flashLastStarted===void 0||t-e.flashLastStarted>=q.hitFlash.cooldownSeconds}function Gd(e,t){if(e.critStarted===void 0)return 0;let n=Math.max(.001,q.hitFeedback.critOutlineSeconds),r=(t-e.critStarted)/n;return r<0||r>=1?0:(e.critStrength??0)*(1-r)*(1-r)}var Kd=new WeakMap;function qd(e,t){let n=Kd.get(e);n||(n=new Ar,Kd.set(e,n));let r=Math.max(0,Math.min(1,t)),i=1-r;return n.matrix=[i,0,0,0,r,0,i,0,0,r,0,0,i,0,r,0,0,0,1,0],n}var Jd=new Map,Yd=new Map,Xd=new Map,Zd=new Map,Qd=null,$d=!1;function ef(){if($d)return Qd;if($d=!0,typeof document>`u`)return null;let e=Math.max(0,Math.min(1,q.hazards.vent.tipFadeFraction)),t=document.createElement(`canvas`);t.width=1,t.height=64;let n=t.getContext(`2d`);if(!n)return null;for(let t=0;t<64;t++){let r=t/63,i=e<=0?1:Math.max(0,Math.min(1,r/e));n.fillStyle=`rgba(255,255,255,${i*i*(3-2*i)})`,n.fillRect(0,t,1,1)}return Qd=O.from(t),Qd}var tf=0,nf=1,rf=new Map,af=new Set;function of(e){let t=q.animations[e];return!t||rf.has(e)||af.has(e)?Promise.resolve():(af.add(e),Kl(t).then(t=>{af.delete(e),t.length>0&&rf.set(e,t)}))}function sf(e){return rf.get(e)||(of(e),null)}function cf(){return Promise.all(Object.keys(q.animations).map(e=>of(e)))}function lf(e,t=1){return X[e].radius*Math.max(0,q.hazards.hitboxScale[e]??1)*t}function uf(e,t,n=1){let r=q.hazardArt[e];if(!r)return null;let i=r.variants,a=i&&i.length>0?i[(t%i.length+i.length)%i.length]:void 0,o=a?.move??r.move??``;if(!o)return null;let s=q.animations[o]?sf(o)?.[0]??null:ql(o);if(!s||!(s.width>0)||!(s.height>0))return null;let c=lf(e,n)*(a?.scale??r.scale??1);return{halfW:c,halfH:c*(s.height/s.width)}}function df(e,t,n,r,i,a){let o=Math.max(0,Math.abs(e-n)-i),s=Math.max(0,Math.abs(t-r)-a);return Math.hypot(o,s)}function ff(e){let t=e.facing??1,n=q.hazardFacing.turnSeconds;if(!e.turn||n<=0)return t;let r=1-e.turn.left/n;return r>=1?t:e.turn.from+(t-e.turn.from)*((1-Math.cos(Math.PI*r))/2)}function pf(e,t){if(e.facing===void 0||q.hazardFacing.turnSeconds<=0){e.facing=t,delete e.turn;return}t!==e.facing&&(e.turn={from:ff(e),left:q.hazardFacing.turnSeconds},e.facing=t)}function mf(e,t){e.turn&&(e.turn.left=Math.max(0,e.turn.left-t),e.turn.left<=0&&delete e.turn)}function hf(e,t){let n=q.animations[e];if(n){let r=sf(e);return r?r[kl(n,t)]??r[r.length-1]:null}return ql(e)}function gf(e){let t=q.hazards[e],n=q.charges.chargers[e];return{telegraphSeconds:t?.telegraphSeconds??n?.telegraphSeconds??.75,travelSeconds:t?.travelSeconds??n?.travelSeconds??.55,cooldownSeconds:t?.cooldownSeconds??n?.cooldownSeconds??2.2}}function _f(e,t){let n=Math.min(1,(e.elapsed-t.telegraphSeconds)/Math.max(.05,t.travelSeconds)),{fromX:r,fromY:i,toX:a,toY:o,bow:s}=e,c=(r+a)/2,l=(i+o)/2,u=Math.hypot(a-r,o-i)||1,d=c+-(o-i)/u*s,f=l+(a-r)/u*s,p=1-n;return{x:2*p*(d-r)+2*n*(a-d),y:2*p*(f-i)+2*n*(o-f)}}function vf(e,t,n,r){return e.charge!==null&&e.charge.elapsed<n?{state:t.charge??r,elapsed:e.charge.elapsed}:{state:r,elapsed:e.phase}}function yf(e,t,n,r){return e.charge===null?{state:r,elapsed:e.phase}:{state:t.charge??r,elapsed:e.charge.elapsed}}function bf(e,t,n,r){return e.counterRest>0&&t.charge?{state:t.charge,elapsed:0}:{state:r,elapsed:e.phase}}var xf={angler:yf,puffer:bf};function Sf(e,t,n,r=t.move??``){return e.deadSince===void 0?e.attackSince!==null&&t.attack!==void 0?{state:t.attack,elapsed:e.attackSince}:(xf[e.kind]??vf)(e,t,n,r):{state:t.dead,elapsed:e.deadSince}}var Cf=1;function wf(e){let t=q.hazards.boids,n=Math.max(0,Math.min(1,e))*Math.max(0,Math.min(1,t.depthDim)),r=t.depthTint,i=e=>Math.round(255+((r>>e&255)-255)*n);return i(16)<<16|i(8)<<8|i(0)}function Tf(){if(Jd.size===0)return;let e=tf;for(let[t,n]of Jd)e-Yd.get(t)>Cf&&(n.destroy(),Jd.delete(t),Yd.delete(t))}function Ef(){if(Xd.size===0)return;let e=tf;for(let[t,n]of Xd)e-(Zd.get(t)??0)>Cf&&(n.base.destroy(),n.flame.destroy(),n.mask?.destroy({texture:!1,textureSource:!1}),Xd.delete(t),Zd.delete(t))}function Df(e,t,n,r,i){let a=(e,t)=>typeof e==`number`&&Number.isFinite(e)?e:t,o=a(r.stemAngle,0)*Math.PI/180,s=Math.sin(o),c=Math.cos(o)*(i?1:-1),l=a(r.stemFrom,.3),u=a(r.stemLength,.8),d=e+s*n*l,f=t+c*n*l;return{baseX:d,baseY:f,tipX:d+s*n*u,tipY:f+c*n*u}}function Of(e){return Jd.get(e)??null}function kf(e){return{animations:Object.entries(q.animations).map(([e,t])=>({name:e,frames:rf.get(e)?.length??0,seconds:Ol(t),loading:af.has(e)})),dying:e.hazards.filter(e=>e.deadSince!==void 0).map(e=>{let t=q.hazardArt[e.kind],n=t?.dead?q.animations[t.dead]:void 0,r=n?kl(n,e.deadSince??0):0,i=Jd.get(e.id);return{id:e.id,kind:e.kind,since:e.deadSince??0,deadline:e.deadDeadline??0,frame:r,texture:i?`${i.texture.width}x${i.texture.height}`:`no sprite`}})}}var Af=8,jf=[];function Mf(e,t,n,r,i){let a=t.flee?t.flee===`left`?-1:1:Math.sign(t.x-0)||1;e.ellipse(t.x,t.y,n*1.5,n*.75).fill({color:X.fish.colour,alpha:.85}),e.moveTo(t.x-a*n*1.3,t.y).lineTo(t.x-a*n*2.2,t.y-n*.6).lineTo(t.x-a*n*2.2,t.y+n*.6).closePath().fill({color:X.fish.colour,alpha:.6}),e.circle(t.x+a*n*.7,t.y-n*.1,n*.2).fill({color:529183,alpha:.9})}function Nf(e,t,n,r,i){let a=1+t.squashed*.5;e.ellipse(t.x,t.y,n*a,1/a*n).fill({color:X.jelly.colour,alpha:.55}),e.ellipse(t.x,t.y,n*a,1/a*n).stroke({color:X.jelly.colour,alpha:.95,width:Math.max(1,n*.12)});for(let r=-2;r<=2;r++){let i=t.x+r/2*n*.6,a=Math.sin(t.phase*2.4+r)*n*.35;e.moveTo(i,t.y-n*.8).lineTo(i+a,t.y-n*2.3).stroke({color:X.jelly.colour,alpha:.5,width:Math.max(1,n*.1)})}}function Pf(e,t,n,r,i){let a=Math.sin(t.phase*.9+t.seed)*.25;e.moveTo(t.x-n,t.y+n*(.6+a)).lineTo(t.x+n*.9,t.y+n*(.8-a)).lineTo(t.x+n*.7,t.y-n*.9).lineTo(t.x-n*.8,t.y-n*.7).closePath().fill({color:X.trash.colour,alpha:.7}),e.moveTo(t.x-n*.6,t.y-n*.6).lineTo(t.x+n*.5,t.y-n*.5).stroke({color:7164466,alpha:.8,width:Math.max(1,n*.14)})}function Ff(e,t,n,r,i){tp(e,t,n),e.ellipse(t.x,t.y,n*1.35,n*.95).fill({color:X.crab.colour,alpha:.9});let a=t.fired?Math.sin(i*14)*.6:0;for(let r of[-1,1]){e.circle(t.x+r*n*1.35,t.y-n*.3,n*.4).stroke({color:X.crab.colour,alpha:.9,width:Math.max(1,n*.16)});for(let i=-1;i<=1;i++)e.moveTo(t.x+r*n*.9,t.y+n*.5).lineTo(t.x+r*n*1.7,t.y+n*(1.1+i*.3)+a*n*.6).stroke({color:X.crab.colour,alpha:.75,width:Math.max(1,n*.13)})}}function If(e,t,n,r,i){let a=t.phase*.35+t.seed;e.circle(t.x,t.y,n*.92).fill({color:X.urchin.colour,alpha:.55});for(let r=0;r<11;r++){let i=r/11*Math.PI*2+a;e.moveTo(t.x+Math.cos(i)*n*.7,t.y+Math.sin(i)*n*.7).lineTo(t.x+Math.cos(i)*n*1.55,t.y+Math.sin(i)*n*1.55).stroke({color:X.urchin.colour,alpha:.95,width:Math.max(1,n*.16)})}e.circle(t.x,t.y,n*.95).stroke({color:X.urchin.colour,alpha:1,width:Math.max(1,n*.2)})}function Lf(e,t,n,r,i){let a=Math.sin(t.phase*1.6+t.seed)*n*.08;e.ellipse(t.x,t.y+a,n*1.05,n*.72).fill({color:X.archer.colour,alpha:.6}),e.ellipse(t.x,t.y+a,n*1.05,n*.72).stroke({color:X.archer.colour,alpha:.95,width:Math.max(1,n*.14)}),e.moveTo(t.x-n*1,t.y+a).lineTo(t.x-n*1.6,t.y+a-n*.45).lineTo(t.x-n*1.6,t.y+a+n*.45).closePath().fill({color:X.archer.colour,alpha:.45}),e.moveTo(t.x-n*.3,t.y+a+n*.5).lineTo(t.x+n*.3,t.y+a+n*.5).lineTo(t.x+n*.16,t.y+a+n*1.15).lineTo(t.x-n*.16,t.y+a+n*1.15).closePath().fill({color:X.archer.colour,alpha:.9})}function Rf(e,t,n,r,i){let a=.55+.45*Math.abs(Math.sin(t.phase*2.2+t.seed)),o=Math.sin(t.phase*1.3+t.seed)*n*.06;e.ellipse(t.x+n*.15,t.y+o,n*.68,n*.5).fill({color:X.pistol.colour,alpha:.55}),e.ellipse(t.x+n*.15,t.y+o,n*.68,n*.5).stroke({color:X.pistol.colour,alpha:.9,width:Math.max(1,n*.13)});let s=t.x-n*.75,c=t.y+o,l=n*.55*a;e.moveTo(s-n*.9,c).lineTo(s,c-l).lineTo(s+n*.55,c-n*.12).lineTo(s+n*.55,c+n*.12).lineTo(s,c+l).closePath().fill({color:X.pistol.colour,alpha:.85}),e.moveTo(s-n*.9,c).lineTo(s+n*.55,c).stroke({color:X.pistol.colour,alpha:.6,width:Math.max(1,n*.12)})}function zf(e,t,n,r,i){let a=t.counterRest>0,o=a?n*.72:n*.95,s=a?n*.35:n*.75;e.circle(t.x,t.y,o).fill({color:X.puffer.colour,alpha:a?.35:.55});for(let r=0;r<9;r++){let i=r/9*Math.PI*2+t.seed;e.moveTo(t.x+Math.cos(i)*o*.8,t.y+Math.sin(i)*o*.8).lineTo(t.x+Math.cos(i)*(o+s),t.y+Math.sin(i)*(o+s)).stroke({color:X.puffer.colour,alpha:a?.4:.95,width:Math.max(1,n*.14)})}e.circle(t.x,t.y,o).stroke({color:X.puffer.colour,alpha:a?.5:1,width:Math.max(1,n*.18)})}function Bf(e,t,n,r,i){let a=Math.max(3,Math.round(q.hazards.starfish.volleyCount)),o=t.volleySpin;for(let r=0;r<a;r++){let i=o+r/a*Math.PI*2,s=Math.cos(i),c=Math.sin(i);e.moveTo(t.x+s*n*.3,t.y+c*n*.3).lineTo(t.x+s*n*1.45-c*n*.28,t.y+c*n*1.45+s*n*.28).lineTo(t.x+s*n*1.45+c*n*.28,t.y+c*n*1.45-s*n*.28).closePath().fill({color:X.starfish.colour,alpha:.75})}e.circle(t.x,t.y,n*.5).fill({color:X.starfish.colour,alpha:.9}),e.circle(t.x,t.y,n*.5).stroke({color:16777215,alpha:.4,width:Math.max(1,n*.1)})}function Vf(e,t,n,r,i){let a=q.hazards.vent;if(!t.vent)return;let o=id(t),s=ad(t),c=r*a.jetHalfWidthRatio,l=r*t.vent.lengthRatio,u=t.x+t.vent.aimX*l,d=t.y+t.vent.aimY*l,f=-t.vent.aimY*c,p=t.vent.aimX*c;if(e.circle(t.x,t.y,n).fill({color:a.plumeColour,alpha:1}),o||s){let n=o?1:.35;e.moveTo(t.x+f,t.y+p).lineTo(u+f,d+p).lineTo(u-f,d-p).lineTo(t.x-f,t.y-p).closePath().fill({color:a.plumeColour,alpha:.55*n}),e.circle(u,d,c).fill({color:a.plumeColour,alpha:.55*n}),e.moveTo(t.x+f*.55,t.y+p*.55).lineTo(u+f*.55,d+p*.55).lineTo(u-f*.55,d-p*.55).lineTo(t.x-f*.55,t.y-p*.55).closePath().fill({color:a.glowColour,alpha:.35*n})}if(o)for(let r of[1,-1])e.moveTo(t.x+f*r,t.y+p*r).lineTo(u+f*r,d+p*r).stroke({color:a.edgeColour,alpha:a.edgeAlpha,width:Math.max(1,n*.12)})}function Hf(e,t,n,r,i){let a=q.hazards.foam;e.circle(t.x,t.y,n).fill({color:a.colour,alpha:a.alpha}),e.circle(t.x,t.y,n).stroke({color:a.rimColour,alpha:a.rimAlpha,width:Math.max(1,n*.1)});for(let[r,i,o]of[[.8,.6,.35],[-.7,.5,.28],[.2,-.9,.24]])e.circle(t.x+n*r,t.y+n*i,n*o).fill({color:a.colour,alpha:a.alpha*.8})}function Uf(e,t,n,r,i){let a=q.hazards.rain,o=r*a.lengthRatio;e.moveTo(t.x,t.y+o).lineTo(t.x,t.y).stroke({color:a.colour,alpha:.75,width:Math.max(1,n*1.2)}),e.circle(t.x,t.y,n).fill({color:a.colour,alpha:.95})}function Wf(e,t,n,r,i){let a=q.hazards.fallcrate.rotationDegrees*Math.PI/180,o=Math.cos(a),s=Math.sin(a),c=(e,n)=>[t.x+e*o-n*s,t.y+e*s+n*o],l=[c(-n,-n),c(n,-n),c(n,n),c(-n,n)];e.poly(l.flat()).fill({color:q.obstacles.crateColor,alpha:1}),e.poly(l.flat()).stroke({color:q.obstacles.crateRimColor,alpha:.95,width:Math.max(1,n*.12)}),e.moveTo(...c(-n,-n)).lineTo(...c(n,n)).moveTo(...c(n,-n)).lineTo(...c(-n,n)).stroke({color:q.obstacles.crateRimColor,alpha:.55,width:Math.max(1,n*.08)})}function Gf(e,t,n,r,i){let a=q.hazards.ink;if(t.phase<a.throwSeconds){let r=t.inkFrom??{x:t.x,y:t.y},i=Math.max(0,Math.min(1,t.phase/Math.max(.001,a.throwSeconds))),o=r.x+(t.x-r.x)*i,s=r.y+(t.y-r.y)*i,c=Math.max(2,n*a.throwRadiusRatio);e.circle(o,s,c).fill({color:a.colour,alpha:a.alpha}),e.circle(o,s,c*1.15).stroke({color:a.rimColour,alpha:a.alpha*.55,width:Math.max(1,c*.16)});return}let o=a.lifeSeconds>0?Math.max(0,Math.min(1,t.foamLife/a.lifeSeconds)):0,s=t.deadSince===void 0?1:Math.max(0,1-t.deadSince/Math.max(.001,a.fadeSeconds)),c=a.alpha*Math.min(1,o*3)*s;e.circle(t.x,t.y,n).fill({color:a.colour,alpha:c}),e.circle(t.x-n*.45,t.y+n*.18,n*.62).fill({color:a.colour,alpha:c*.86}),e.circle(t.x+n*.5,t.y-n*.24,n*.52).fill({color:a.colour,alpha:c*.8}),e.circle(t.x+n*.12,t.y+n*.55,n*.4).fill({color:a.colour,alpha:c*.75}),e.circle(t.x,t.y,n*1.02).stroke({color:a.rimColour,alpha:c*.5,width:Math.max(1,n*.03)})}function Kf(e,t,n,r,i,a){let o=q.hazards.fallcrate,s=.5+.5*Math.sin(a*Math.PI*2*o.warnFlashHz),c=o.warnAlphaMin+(o.warnAlphaMax-o.warnAlphaMin)*s,l=t-r/2,u=n;e.rect(l,u,r,i).fill({color:o.warnColour,alpha:c});let d=i*.16,f=i*.46,p=u+i*.14;e.rect(t-d/2,p,d,f).fill({color:o.warnExclamationColour,alpha:c}),e.circle(t,p+f+i*.14,d*.6).fill({color:o.warnExclamationColour,alpha:c})}function qf(e,t,n,r,i){let a=q.hazards.zapper;e.ellipse(t.x,t.y,n,n*.85).fill({color:a.bellColour,alpha:.85}),e.ellipse(t.x,t.y,n,n*.85).stroke({color:16777215,alpha:.5,width:Math.max(1,n*.12)});for(let r of[-.5,0,.5])e.moveTo(t.x+n*r,t.y-n*.5).lineTo(t.x+n*r*1.6+Math.sin(i*1.5+r*4)*n*.3,t.y-n*2.4).stroke({color:a.bellColour,alpha:.7,width:Math.max(1,n*.14)});rp(e,t,n,r)}function Jf(e,t,n,r,i){e.circle(t.x,t.y-n*1.6,n*1.6).fill({color:q.hazards.vent.edgeColour,alpha:.25}),e.circle(t.x,t.y,n).fill({color:X.mineral.colour,alpha:1}),e.circle(t.x,t.y,n*1.9).stroke({color:q.hazards.vent.edgeColour,alpha:.5,width:Math.max(1,n*.35)})}function Yf(e,t,n,r,i){e.ellipse(t.x,t.y,n*1.5,n*.85).fill({color:X.shrimp.colour,alpha:.95}),e.moveTo(t.x-n*1.4,t.y+n*.2).lineTo(t.x-n*2.3,t.y-n*.3).lineTo(t.x-n*2.4,t.y+n*.5).closePath().fill({color:X.shrimp.colour,alpha:.8});for(let r of[-.35,.35])e.moveTo(t.x+n*1.2,t.y+n*r).lineTo(t.x+n*2.6,t.y+n*r*2.4).stroke({color:X.shrimp.colour,alpha:.7,width:Math.max(1,n*.16)})}function Xf(e,t,n,r,i){let a=q.hazards.angler,o=t.x<r*.5?1:-1;e.ellipse(t.x,t.y,n*1.4,n*.95).fill({color:X.angler.colour,alpha:1}),e.moveTo(t.x-o*n*1.2,t.y).lineTo(t.x-o*n*2.2,t.y-n*.6).lineTo(t.x-o*n*2.2,t.y+n*.6).closePath().fill({color:X.angler.colour,alpha:.9});for(let r of[-.4,0,.4])e.moveTo(t.x+o*n*1.3,t.y+n*r).lineTo(t.x+o*n*1.7,t.y+n*r+n*.16).stroke({color:16777215,alpha:.7,width:Math.max(1,n*.12)});let s=1+.18*Math.sin(i*a.lurePulsePerSecond*Math.PI*2),c=t.x+o*n*a.lureOffsetRatio*2.4,l=t.y-n*1.5;e.moveTo(t.x+o*n*.8,t.y-n*.7).lineTo(c,l).stroke({color:a.lureColour,alpha:.55,width:Math.max(1,n*.1)}),e.circle(c,l,r*a.lureRadiusRatio*3*s).fill({color:a.lureColour,alpha:.16}),e.circle(c,l,r*a.lureRadiusRatio*s).fill({color:a.lureColour,alpha:.95})}function Zf(e,t,n,r,i){e.roundRect(t.x-n*1.7,t.y-n*.55,n*3.4,n*1.1,n*.5).fill({color:X.torpedo.colour,alpha:1}),e.moveTo(t.x+n*1.7,t.y-n*.55).lineTo(t.x+n*2.4,t.y).lineTo(t.x+n*1.7,t.y+n*.55).closePath().fill({color:13227230,alpha:1}),ip(e,t,n)}function Qf(e,t,n,r,i){let a=Fu(t.kind),o=a.colour,s=Ud(i-(t.flashStarted??i),1)*a.hitFlashStrength;e.ellipse(t.x,t.y,n*1.35,n*1.05).fill({color:s>0?a.hitFlashColour:o,alpha:s>0?.85:1});for(let r of[-.45,0,.45])e.moveTo(t.x-n*1.2,t.y+n*r*.8).lineTo(t.x+n*1.2,t.y+n*r*.8).stroke({color:a.armourColour,alpha:.75,width:Math.max(1,n*.16)});e.moveTo(t.x+n*1.2,t.y-n*.5).lineTo(t.x+n*1.75,t.y).lineTo(t.x+n*1.2,t.y+n*.5).closePath().fill({color:a.armourColour,alpha:.9}),e.circle(t.x+n*.55,t.y+n*.1,n*.24).fill({color:a.eyeColour,alpha:1}),e.circle(t.x,t.y,n*1.06).stroke({color:a.eyeColour,alpha:.5,width:Math.max(1,r*a.weakPointWidthRatio)})}function $f(e,t,n,r,i){np(e,t,n,i),e.ellipse(t.x,t.y,n*1.25,n*1.1).fill({color:X.bombfish.colour,alpha:.9}),e.moveTo(t.x-n*1.1,t.y).lineTo(t.x-n*2.1,t.y-n*.55).lineTo(t.x-n*2.1,t.y+n*.55).closePath().fill({color:X.bombfish.colour,alpha:.65}),e.moveTo(t.x,t.y+n*1).lineTo(t.x+n*.25,t.y+n*1.75).stroke({color:9075292,alpha:.9,width:Math.max(1,n*.16)}),e.circle(t.x+n*.25,t.y+n*1.85,n*.16).fill({color:15260080,alpha:.9}),e.circle(t.x+n*.75,t.y+n*.1,n*.18).fill({color:529183,alpha:.9})}function ep(e,t,n,r,i){let a=.4+.6*Math.abs(Math.sin(t.phase*6)),o=n*1.6,s=e=>Math.sin(t.phase*2.2+t.seed+e*Math.PI*2.2)*n*.55,c=[];for(let e=0;e<=10;e++){let n=e/10;c.push(t.x-o+n*o*2,t.y+s(n))}e.poly(c),e.stroke({color:X.eel.colour,alpha:.9,width:Math.max(1,n*.32)});let l=t.x+o,u=t.y+s(1);e.circle(l,u,n*.42).fill({color:X.eel.colour,alpha:.95});for(let r=0;r<3;r++){let i=t.phase*3+r/3*Math.PI*2;e.moveTo(l,u).lineTo(l+Math.cos(i)*n*.85,u+Math.sin(i)*n*.85).stroke({color:X.eel.colour,alpha:.5*a,width:Math.max(1,n*.1)})}}function tp(e,t,n){if(t.fuse<=0)return;let r=1-t.fuse/Y.crabFuseSeconds,i=t.y+Y.crabLaunchMps*Y.crabApexSeconds*r;e.moveTo(t.x,t.y).quadraticCurveTo(t.x,(t.y+i)/2+n*3,t.x,i).stroke({color:16766073,alpha:.15+r*.5,width:Math.max(1,n*.18)});for(let r=0;r<3;r++){let i=(t.phase*1.8+r*.33)%1;e.circle(t.x+Math.sin(r*2.1)*n*1.4,t.y-n*.5-i*n*2.2,n*(.16+i*.2)).fill({color:14271386,alpha:.3*(1-i)})}}function np(e,t,n,r){if(t.blastFuse===null)return;let i=Math.max(.01,q.hazards.bombfish.fuseSeconds),a=Math.max(0,Math.min(1,t.blastFuse/i)),o=.75+.25*Math.sin(r*22);e.circle(t.x,t.y,n*(1.3+1.6*(1-a))).stroke({color:X.bombfish.colour,alpha:(.35+.5*(1-a))*o,width:Math.max(1,n*.22)})}function rp(e,t,n,r){if(t.discharge<=0)return;let i=q.hazards.zapper,a=r*i.ringRadiusRatio,o=Math.max(0,Math.min(1,t.discharge/Math.max(.01,i.ringSeconds)));e.circle(t.x,t.y,a*(.4+.6*(1-o))).stroke({color:i.ringColour,alpha:i.ringAlpha*o,width:Math.max(1,n*.35*(.4+o))}),e.circle(t.x,t.y,a*.55).fill({color:i.ringColour,alpha:.12*o})}function ip(e,t,n){let r=q.hazards.torpedo,i=t.fed>=r.runMeters,a=i?n*.5:0;if(e.circle(t.x+n*1.9,t.y,n*.34).fill({color:i?16734810:14676991,alpha:1}),e.moveTo(t.x-n*1.7,t.y).lineTo(t.x-n*(i?3.4:2.6),t.y+a).stroke({color:i?16747098:11065599,alpha:.6,width:Math.max(1,n*.4)}),i)for(let r of[-1,1])e.moveTo(t.x-n*1.2,t.y+r*n*.5).lineTo(t.x-n*2.2,t.y+r*n*1.4).lineTo(t.x-n*.6,t.y+r*n*.6).closePath().fill({color:X.torpedo.colour,alpha:.9})}function ap(e,t,n,r,i){switch(t.kind){case`crab`:tp(e,t,n);break;case`bombfish`:np(e,t,n,i);break;case`zapper`:rp(e,t,n,r);break;case`torpedo`:ip(e,t,n)}}var op={fish:Mf,tuna:Mf,whale:Mf,dolphin:Mf,shark:Mf,octopus:Mf,jelly:Nf,trash:Pf,crab:Ff,urchin:If,bombfish:$f,eel:ep,boss:Qf,"boss-crab":Qf,"boss-octopus":Qf,"boss-jelly":Qf,"boss-shark":Qf,"boss-netshark":Qf,"boss-eye":Qf,vent:Vf,mineral:Jf,shrimp:Yf,angler:Xf,torpedo:Zf,zapper:qf,foam:Hf,rain:Uf,fallcrate:Wf,ink:Gf,archer:Lf,pistol:Rf,puffer:zf,starfish:Bf},sp=.4;function cp(e){let t=q.hazardArt[e.kind],n=t?.dead?q.animations[t.dead]:void 0;e.deadSince=0,e.deadDeadline=n?Ol(n):sp,e.flee=`dead`,lp(e)}function lp(e){delete e.flashStarted,delete e.flashLastStarted,delete e.critStarted,delete e.critStrength}function up(e){return e.flee!==null&&e.flee!==`dead`}function dp(e){return e.deadSince!==void 0&&e.deadSince<(e.deadDeadline??0)}function fp(e,t,n){let r=q.hazards.vent;if(!t.vent)return!1;let i=ql(r.art.base),a=q.animations[r.art.flame],o=a?sf(r.art.flame):null,s=ef(),c=Xd.get(t.id);if(!i||!a||!o)return c&&(c.base.visible=!1,c.flame.visible=!1),!1;let l=c;if(!l){let n=new F;n.anchor.set(.5,1),n.eventMode=`none`;let r=s?new F(s):null;r&&(r.anchor.set(.5,1),r.eventMode=`none`,n.mask=r);let i=new F;i.anchor.set(.5,.5),i.eventMode=`none`;let a=e.parent;if(a){let t=Math.max(0,a.getChildIndex(e));a.addChildAt(n,t),r&&a.addChildAt(r,t),a.addChildAt(i,t)}l={base:i,flame:n,mask:r},Xd.set(t.id,l)}Zd.set(t.id,tf);let u=Al(l.base)?-1:1,d=Math.atan2(u*t.vent.aimX,t.vent.aimY),f=t.flee?q.hazards.fleeAlpha:1,p=2*n*lf(`vent`)/Math.max(1,i.width);l.base.texture=i,l.base.visible=!0,l.base.x=t.x,l.base.y=t.y,l.base.rotation=d,l.base.alpha=f,l.base.tint=16777215,l.base.scale.set(p,u*p);let m=id(t),h=ad(t);if(!m&&!h)return l.flame.visible=!1,!0;let g=t.vent.startDelaySeconds>0&&t.fed<t.vent.startDelaySeconds?t.fed:t.phase,_=o[kl(a,g)]??o[o.length-1],v=m?1:r.warnLengthFraction,y=2*n*r.jetHalfWidthRatio*Math.max(0,r.flameWidthScale),b=n*t.vent.lengthRatio*v*Math.max(0,r.flameLengthScale),x=r.flameAlpha;if(m){let e=Math.min(1,t.phase/Math.max(.01,r.artFadeSeconds),(r.activeSeconds-t.phase)/Math.max(.01,r.artFadeSeconds));x*=Math.max(0,Math.min(1,e))}else{let e=.5+.5*Math.sin(g*Math.PI*2*r.warnFlickerHz);x*=r.warnAlphaMin+(r.warnAlphaMax-r.warnAlphaMin)*e}return l.flame.texture=_,l.flame.visible=!0,l.flame.x=t.x,l.flame.y=t.y,l.flame.rotation=d,l.flame.alpha=x*f,l.flame.tint=16777215,l.flame.scale.set(y/Math.max(1,_.width),u*(b/Math.max(1,_.height))),l.mask&&s&&(l.mask.x=t.x,l.mask.y=t.y,l.mask.rotation=d,l.mask.scale.set(y/Math.max(1,s.width),u*(b/Math.max(1,s.height)))),!0}function pp(e,t,n,r,i,a=`in-play`,o=NaN){tf+=1,a===`in-play`&&(Tf(),Ef());for(let s of t.hazards){if(a===`leaving`?!up(s):up(s))continue;let t=n*s.radiusFraction*s.scale,c=s.x,l=s.y,u=s.phase;if(s.kind===`vent`&&fp(e,s,n))continue;if(s.kind===`fallcrate`&&s.phase<q.hazards.fallcrate.warnSeconds){let e=Jd.get(s.id);e&&(e.visible=!1);continue}if(s.charge){let n=q.charges,i=gf(s.kind),{fromX:a,fromY:o,toX:c,toY:l,bow:u,elapsed:d}=s.charge,f=(a+c)/2,p=(o+l)/2,m=Math.hypot(c-a,l-o)||1,h=f+-(l-o)/m*u,g=p+(c-a)/m*u,_=d<i.telegraphSeconds,v=_?1:Math.min(1,(d-i.telegraphSeconds)/Math.max(.05,i.travelSeconds));e.moveTo(a,o);for(let t=1;t<=12;t++){let n=t/12*v,r=1-n;e.lineTo(r*r*a+2*r*n*h+n*n*c,r*r*o+2*r*n*g+n*n*l)}let y=.7+.3*Math.sin(r*18);e.stroke({color:_?n.telegraphColour:n.trailColour,alpha:(_?n.telegraphAlpha:n.trailAlpha)*(_?y:1),width:Math.max(1,t*.18)}),_&&e.circle(c,l,t*.7*y).stroke({color:n.telegraphColour,alpha:n.telegraphAlpha*.8,width:Math.max(1,t*.14)})}if(s.kind===`ink`&&s.phase<q.hazards.ink.throwSeconds){let r=Jd.get(s.id);r&&(r.visible=!1),Gf(e,s,t,n,u);continue}let d=q.hazardArt[s.kind];if(d){let r=s.deadSince!==void 0,i=d.variants,a=i&&i.length>0?i[(s.variety%i.length+i.length)%i.length]:void 0,f=a?.move??d.move??``,p=a?.scale??d.scale??1,m=Sf(s,d,gf(s.kind).telegraphSeconds,f),h=m.state,g=m.elapsed,_=h?hf(h,g):null;if(_){let i=Jd.get(s.id);if(!i){i=new F(_),i.anchor.set(.5),i.eventMode=`none`;let t=e.parent;t&&t.addChildAt(i,Math.max(0,t.getChildIndex(e))),Jd.set(s.id,i)}Yd.set(s.id,tf);let a=t*2*p;i.texture=_,i.visible=!0,i.x=c,i.y=l;let f=s.kind===`ink`?s.deadSince===void 0?Math.min(1,s.foamLife/Math.max(.001,q.hazards.ink.lifeSeconds)*3):Math.max(0,1-s.deadSince/Math.max(.001,q.hazards.ink.fadeSeconds)):1;i.alpha=d.alpha*f*(s.flee&&!r?q.hazards.fleeAlpha:1),i.tint=s.boid?wf(s.boid.d):16777215;let m=a/_.width,h=d.front??q.hazardFront,g=s.flee===`left`?`left`:s.flee===`right`?`right`:null,v=o<s.x,y=g?g===`left`:d.facesPlayer??!0?v:s.heading<=0,b=d.fixedFacing??Pu(s.kind),x=h===`left`===y?1:-1;b||(s.facing===void 0?(pf(s,x),s.facingRest=0):x!==s.facing&&(s.facingRest??0)<=0&&(pf(s,x),s.facingRest=q.hazardFacing.cooldownSeconds));let S=d.volleyAligned||b?1:ff(s);i.scale.set(m*S,Al(i)?-Math.abs(m):Math.abs(m));let C=d.spin??0,w=s.kind===`fallcrate`?q.hazards.fallcrate.rotationDegrees*Math.PI/180:0;i.rotation=d.volleyAligned?(s.volleySpin-(d.volleyBaseRadians??0))*(Al(i)?1:-1):w*(Al(i)?1:-1)+C*(s.phase+(s.seed??0));let T=Ud(u-(s.flashStarted??u),q.hitFlash.peakIntensity*(d.spriteFlashScale??1));i.filters=T>0?[qd(i,T)]:[];let E=Gd(s,u);E>0&&e.circle(c,l,t*q.hitFeedback.critOutlineRadiusScale).stroke({color:q.hitFeedback.critOutlineColour,alpha:q.hitFeedback.critOutlineAlpha*E,width:Math.max(1,t*q.hitFeedback.critOutlineWidthRatio*(.6+E))}),d.lure&&Bd(e,c,l,t,d.lure,u),ap(e,s,t,n,u);continue}let v=Jd.get(s.id);v&&(v.visible=!1)}if(i(s.kind)?(e.circle(c,l,t*1.5).fill({color:q.consumption.marker.edibleColor,alpha:q.consumption.marker.edibleAlpha*.28}),e.circle(c,l,t*1.35).stroke({color:q.consumption.marker.edibleColor,alpha:q.consumption.marker.edibleAlpha,width:Math.max(1,t*q.consumption.marker.widthRatio)})):q.consumption.marker.showBlocked&&e.circle(c,l,t*1.35).stroke({color:16739179,alpha:q.consumption.marker.blockedAlpha,width:Math.max(1,t*q.consumption.marker.widthRatio)}),op[s.kind](e,s,t,n,u),!Pu(s.kind)&&q.hitFlash.peakIntensity>0){let t=Ud(u-(s.flashStarted??u),1);if(t>0){let r=n*s.radiusFraction*q.hitFlash.radiusScale;e.ellipse(c,l,r,r*.85).fill({color:q.hitFlash.colour,alpha:q.hitFlash.alpha*t})}}}}function mp(e){return al.includes(e)}function hp(e){return q.obstacles.health[e]??1}function gp(e){return q.obstacles.radius[e]??.05}var _p=[`net`,`crate`,`wall`];function vp(e){if(!_p.includes(e))return null;let t=q.obstacles.art[e]?.variants[0],n=t?ql(t.image):null;if(!n||n.width<=0||n.height<=0)return null;let r=gp(e)*(t?.scale??1),i=r*(n.height/n.width);return{halfW:r,halfH:i,offsetY:i}}function yp(e,t){let n=bp(t);return n===null||e<n?0:(e-n)*q.obstacles.ramDamagePerVolume}function bp(e){let t=q.obstacles.ramVolume[e];return t===void 0?q.obstacles.ramVolumeThreshold:t}function xp(e,t){return Sp(e)?t:0}function Sp(e){return e===`net`}function Cp(e){return!Sp(e)}function wp(e){if(!e.length)return!0;let t=q.obstacles.minGapFraction,n=[...e].sort((e,t)=>e.x-t.x);if(n[0].x-n[0].radius>t)return!0;let r=n[n.length-1];if(1-(r.x+r.radius)>t)return!0;for(let e=1;e<n.length;e++){let r=n[e-1],i=n[e];if(i.x-i.radius-(r.x+r.radius)>t)return!0}return!1}var Tp=class{constructor(){J(this,`obstacles`,[]),J(this,`broken`,0),J(this,`nextId`,1)}reset(){this.obstacles=[],this.broken=0}spawn(e,t,n,r){let i=hp(e),a={id:this.nextId++,kind:e,x:t,y:n,radiusFraction:gp(e),health:i,healthFraction:1,age:0,hitFlash:0,entry:r??null};return this.obstacles.push(a),a}damage(e,t){let n=this.obstacles.find(t=>t.id===e);return n?(n.health-=t,n.hitFlash=q.hitFlash.seconds,n.healthFraction=Math.max(0,n.health/Math.max(1e-4,hp(n.kind))),n.health>0?{id:e,kind:n.kind,broke:!1}:(this.obstacles=this.obstacles.filter(t=>t.id!==e),this.broken++,{id:e,kind:n.kind,broke:!0})):null}update(e,t,n){for(let t of this.obstacles)if(t.age+=e,t.hitFlash>0&&(t.hitFlash=Math.max(0,t.hitFlash-e)),t.entry){let n=t.entry.speed*e,r=t.entry.targetX-t.x;Math.abs(r)<=n?(t.x=t.entry.targetX,t.entry=null):t.x+=Math.sign(r)*n}this.obstacles=this.obstacles.filter(e=>e.y>t-120&&e.y<n+160)}blockerAt(e,t,n,r){for(let i of this.obstacles){if(i.kind===`net`)continue;let a=vp(i.kind);if(a){if(df(e,t,i.x,i.y+r*a.offsetY,r*a.halfW,r*a.halfH)<=n)return{id:i.id,kind:i.kind};continue}let o=n+(q.obstacles.radius[i.kind]??.05),s=i.x-e,c=i.y-t;if(s*s+c*c<=o*o)return{id:i.id,kind:i.kind}}return null}blocks(e,t,n,r){return this.blockerAt(e,t,n,r)!==null}resolvePlayer(e,t,n,r,i,a,o,s){for(let c of this.obstacles){let l=r+(q.obstacles.radius[c.kind]??.05),u=c.x-e,d=c.y-t,f=vp(c.kind);if(!(f?df(e,t,c.x,c.y+n*f.offsetY,n*f.halfW,n*f.halfH)<=r:u*u+d*d<=l*l))continue;if(s){if(bp(c.kind)===null&&!s.breaksUnrammable)continue;return{hit:this.damage(c.id,s.damage),blocked:!1,hurt:!1,dragging:!1}}let p=xp(c.kind,o);if(p>0){let e=this.damage(c.id,p);return{hit:e,blocked:!1,hurt:!1,dragging:e?.broke!==!0}}let m=yp(i,c.kind);return m>0?{hit:this.damage(c.id,m),blocked:!1,hurt:!1,dragging:!1}:{hit:null,blocked:!a,hurt:!a&&Cp(c.kind),dragging:!1}}return{hit:null,blocked:!1,hurt:!1,dragging:!1}}get count(){return this.obstacles.length}},Ep=new Map,Dp=new Map,Op=0,kp=2,Ap=2.399963;function jp(){if(Ep.size!==0)for(let[e,t]of Ep)Op-(Dp.get(e)??0)>kp&&(t.destroy(),Ep.delete(e),Dp.delete(e))}function Mp(e,t,n){Op+=1,jp();for(let r of t.obstacles){let t=n*r.radiusFraction,i=1-r.healthFraction,a=1-i*q.obstacles.damagedDarken,o=q.obstacles.art[r.kind],s=o?o.variants[(r.id%o.variants.length+o.variants.length)%o.variants.length]:void 0,c=s?ql(s.image):null;if(o&&s&&c){let n=Ep.get(r.id);if(!n){n=new F(c),n.eventMode=`none`,n.anchor.set(.5,1);let t=e.parent;t&&t.addChildAt(n,Math.max(0,t.getChildIndex(e))),Ep.set(r.id,n)}Dp.set(r.id,Op);let i=t*2*s.scale/c.width;n.texture=c,n.visible=!0,n.x=r.x,n.y=r.y,n.alpha=o.alpha,n.tint=Np(16777215,a);let l=r.kind===`net`?0:Ud(q.hitFlash.seconds-r.hitFlash,q.hitFlash.peakIntensity);n.filters=l>0?[qd(n,l)]:[],n.scale.set(i,-i),n.rotation=o.swayDegrees===0?0:o.swayDegrees*Math.PI/180*Math.sin(r.age/o.swaySeconds*Math.PI*2+r.id*Ap)}else if(r.kind===`crate`){let n=Np(q.obstacles.crateColor,a),i=Np(q.obstacles.crateRimColor,a);e.rect(r.x-t,r.y-t,t*2,t*2).fill({color:n,alpha:.9}),e.rect(r.x-t,r.y-t,t*2,t*2).stroke({color:i,alpha:.95,width:t*.16}),e.moveTo(r.x-t,r.y).lineTo(r.x+t,r.y),e.moveTo(r.x,r.y-t).lineTo(r.x,r.y+t),e.stroke({color:i,alpha:.6,width:t*.1})}else if(r.kind===`wall`){let n=Np(q.obstacles.wallColor,a),i=Np(q.obstacles.wallRimColor,a),o=t*2/3;for(let n=0;n<3;n++)e.rect(r.x-t,r.y-t+n*o,t*2,o);e.fill({color:n,alpha:.92});for(let n=1;n<3;n++)e.moveTo(r.x-t,r.y-t+n*o).lineTo(r.x+t,r.y-t+n*o);e.stroke({color:i,alpha:.8,width:t*.1}),e.rect(r.x-t,r.y-t,t*2,t*2).stroke({color:i,alpha:.95,width:t*.16})}else if(r.kind===`net`)Fp(e,r.x,r.y,t,i,a);else if(r.kind===`tube`){let n=Np(q.obstacles.tubeColor,a),i=Np(q.obstacles.tubeRimColor,a),o=.55+.45*Math.sin(r.age*1.6+r.id);e.roundRect(r.x-t*.9,r.y-t*.5,t*1.8,t*1,t*.3).fill({color:2760744,alpha:.9});for(let a=0;a<4;a++){let s=r.x-t*.6+a/3*t*1.2,c=Math.sin(r.age*1.2+a+r.id)*t*.12;e.moveTo(s,r.y+t*.4).lineTo(s+c,r.y+t*.5+t*1.1*o).stroke({color:n,alpha:.95,width:t*.22}),e.circle(s+c,r.y+t*.5+t*1.1*o,t*.2).fill({color:i,alpha:.95})}}else{let n=Np(q.obstacles.coralColor,a),i=Np(q.obstacles.coralRimColor,a);e.circle(r.x,r.y,t).fill({color:n,alpha:.85}),e.circle(r.x,r.y,t).stroke({color:i,alpha:.95,width:t*.16});for(let n=0;n<5;n++){let i=n/5*Math.PI*2+r.age*.2;e.moveTo(r.x+Math.cos(i)*t*.5,r.y+Math.sin(i)*t*.5),e.lineTo(r.x+Math.cos(i)*t*1.35,r.y+Math.sin(i)*t*1.35)}e.stroke({color:i,alpha:.7,width:t*.12})}if(i>.05&&r.kind!==`net`){let n=s&&c?t*s.scale:t,a=r.x,o=s&&c?r.y+n*(c.height/c.width):r.y;for(let t=0;t<4;t++){let s=t/4*Math.PI*2+r.id,c=n*(.55+.4*i);e.moveTo(a+Math.cos(s)*n*.25,o+Math.sin(s)*n*.25),e.lineTo(a+Math.cos(s)*c,o+Math.sin(s)*c)}e.stroke({color:1054752,alpha:.5*i,width:n*q.obstacles.crackWidthRatio})}}for(let r of t.obstacles){if(r.kind===`net`||r.hitFlash<=0||Ep.get(r.id)?.visible)continue;let t=q.hitFlash,i=Math.min(1,r.hitFlash/Math.max(.001,t.seconds)),a=n*r.radiusFraction*t.radiusScale;e.ellipse(r.x,r.y,a,a*.9).fill({color:t.colour,alpha:t.alpha*i})}}function Np(e,t){let n=Math.max(0,Math.min(255,Math.round((e>>16&255)*t))),r=Math.max(0,Math.min(255,Math.round((e>>8&255)*t))),i=Math.max(0,Math.min(255,Math.round((e&255)*t)));return n<<16|r<<8|i}function Pp(e,t){return e*.9*Math.min(1,t*1.6)}function Fp(e,t,n,r,i,a){let o=q.obstacles.netColor,s=Np(q.obstacles.netRimColor,a),c=q.obstacles.netMesh,l=Pp(r,i);e.rect(t-r,n-r,r*2,r*2).fill({color:s,alpha:.22});for(let i=0;i<c;i++){let a=i/(c-1)*2-1,o=Math.abs(a*r),s=l>0&&o<l?Math.sqrt(l*l-o*o):0;for(let i of[-1,1])e.moveTo(t+a*r,n+i*r),e.lineTo(t+a*r,n+i*s),e.moveTo(t+i*r,n+a*r),e.lineTo(t+i*s,n+a*r)}e.stroke({color:o,alpha:.85,width:r*.09}),e.rect(t-r,n-r,r*2,r*2).stroke({color:s,alpha:.75,width:r*.11})}var Ip=Object.assign({"../config/levels/01-black-smokers.json5":ru,"../config/levels/02-wreck-gorge.json5":iu,"../config/levels/03-jelly-forest.json5":au,"../config/levels/04-thermocline.json5":ou,"../config/levels/05-storm-surge.json5":su,"../config/levels/06-dawn-surface.json5":cu}),Lp=Object.assign({"../config/levels.json5":lu});function Rp(){let e=[];for(let[t,n]of Object.entries(Ip).sort(([e],[t])=>e<t?-1:+(e>t)))e.push([t.replace(`../config/`,``),zp(t,n)]);for(let[t,n]of Object.entries(Lp))e.push([t.replace(`../config/`,``),zp(t,n)]);return e}function zp(e,t){try{return Uc.default.parse(t)}catch(t){Z(e.replace(`../config/`,``),`is not valid JSON5 (${t.message}).`)}}var Bp={one:(e,t,n,r)=>r===void 0?{at:e,x:n,kind:t}:{at:e,x:n,kind:t,size:r},spread:(e,t,n,r,i,a)=>{let o=[];for(let s=0;s<n;s++){let c={at:e+(n<=1?0:s/(n-1))*t,x:i(s),kind:r};a&&(c.size=a(s)),o.push(c)}return o},line:(e,t,n,r=.12,i=.88)=>{let a=[];for(let o=0;o<n;o++){let s=n<=1?.5:o/(n-1);a.push({at:e,x:r+s*(i-r),kind:t})}return a},column:(e,t,n,r,i)=>{let a=[];for(let o=0;o<n;o++)a.push({at:e+(n<=1?0:o/(n-1)*t),x:i,kind:r});return a},barrier:(e,t,n,r=.5,i=.24)=>{let a=(q.obstacles.radius[t]??.05)*2+q.obstacles.minGapFraction,o=Math.max(i,a)/2,s=r-o,c=r+o,l=[];for(let r=0;r<n;r++){let i=.1+(n<=1?.5:r/(n-1))*.8;i>s-1e-6&&i<c+1e-6||l.push({at:e,x:i,kind:t})}return l}},Vp=(e,t=.5,n=6)=>r=>t+Math.sin(r/n*Math.PI*2)*e,Hp=e=>t=>e[t%e.length],Up=[`bubble`,...Object.keys(q.hazards.health).filter(e=>!Pu(e)),...al],Wp=[`single`,`line`,`column`,`spread`,`barrier`],Gp=e=>al.includes(e),Kp=[`top`,`left`,`right`,`bottom`,`random`],qp=[`left`,`right`,`random`],Jp=[`up`,`flat`,`down`],Yp=.5,Xp=[`path`,`pathSpacingSeconds`,`boids`,`layer`,`distance`,`at`,`kind`,`count`,`arrange`,`x`,`xFrom`,`xTo`,`span`,`amplitude`,`wavelength`,`gapAt`,`gapWidth`,`sizes`,`from`,`enterSpeed`,`depth`,`aboveMeters`,`side`,`aim`,`startDelaySeconds`],Zp=[`id`,`name`,`music`,`scrollLength`,`scrollSpeed`,`driftSpeed`,`playerLeadLimit`,`boss`,`palette`,`paths`,`backdrop`,`backdrops`,`spawns`];function Z(e,t){throw Error(`the level files are invalid: ${e} ${t}\nThe file is JSON5, so it allows // comments, trailing commas, unquoted keys and hex literals.`)}function Q(e,t,n,r,i,a){let o=e[t];return o===void 0?r:((typeof o!=`number`||!Number.isFinite(o)||o<i||o>a)&&Z(n,`"${t}" is ${JSON.stringify(o)}, but it should be a number between ${i} and ${a}.`),o)}function Qp(e,t,n,r,i){return e[t]===void 0&&Z(n,`"${t}" is required.`),Q(e,t,n,NaN,r,i)}function $p(e,t,n,r,i){let a=e[t];return a===void 0?(r===null&&Z(n,`"${t}" is required; it should be one of ${i.join(` / `)}.`),r):((typeof a!=`string`||!i.includes(a))&&Z(n,`"${t}" is ${JSON.stringify(a)}, but it should be one of ${i.join(` / `)}.`),a)}function em(e,t,n){let r=`levels["${t}"].spawns[${n}]`;(typeof e!=`object`||!e||Array.isArray(e))&&Z(r,`must be an object.`);let i=e,a=Object.keys(i).filter(e=>!Xp.includes(e));a.length&&Z(r,`has keys that do nothing here: ${a.join(`, `)}. Known keys: ${Xp.join(`, `)}.`);let o=Qp(i,`at`,r,0,2**53-1),s=$p(i,`kind`,r,null,Up),c=Math.round(Q(i,`count`,r,1,1,200)),l=$p(i,`arrange`,r,c<=1?`single`:`line`,Wp),u=$p(i,`from`,r,`top`,Kp),d=Q(i,`aboveMeters`,r,0,0,1e5),f=i.sizes,p=null;f!==void 0&&((!Array.isArray(f)||!f.length||!f.every(e=>typeof e==`number`&&e>0))&&Z(r,`"sizes" is ${JSON.stringify(f)}, but it should be a non-empty list of positive numbers.`),p=f),u!==`top`&&s===`bubble`&&Z(r,`is a "${s}" arriving from ${u===`random`?`a random side`:`the ${u}`}, but collectables come down with the current. Only creatures and obstacles can enter from a side.`),u===`bottom`&&Gp(s)&&Z(r,`is a "${s}" arriving from the bottom, but scenery cannot swim up -- the current only carries things down.`),l===`barrier`&&!Gp(s)&&Z(r,`arranges a "${s}" as a barrier, but only obstacles can be arranged into a row with a gap.`);let m=s===`vent`;if(m&&u!==`top`&&Z(r,`is a "vent" arriving from ${u===`random`?`a random side`:`the ${u}`}, but a vent is terrain: it is where it is, and nothing carries it in.`),!m){let e=[`side`,`aim`,`startDelaySeconds`].filter(e=>i[e]!==void 0);e.length&&Z(r,`gives a "${s}" the vent-only key(s) ${e.join(`, `)}, which would do nothing.`)}let h=m&&i.side!==void 0?$p(i,`side`,r,`left`,qp):void 0,g=i.aim===void 0?void 0:$p(i,`aim`,r,`up`,Jp),_=i.boids;_!==void 0&&typeof _!=`boolean`&&Z(r,`"boids" is ${JSON.stringify(_)}, but it should be true or false.`);let v=_===!0;v&&s!==`fish`&&Z(r,`makes a school of "${s}", but only fish swim in a Boids school.`),v&&typeof i.path!=`string`&&Z(r,`is a Boids school with no "path": the school follows its path through an invisible leader, so it needs one.`);let y=$p(i,`layer`,r,`front`,[`front`,`back`]);return y===`back`&&!v&&Z(r,`is on layer "back" but is not a Boids school: only a school can be in the background. Add boids: true (with a path).`),y===`back`&&i.distance===void 0&&Z(r,`is on layer "back" with no "distance": 0 is as near as the foreground and 1 is as far as it goes, and it decides the size and the dimming.`),y===`front`&&i.distance!==void 0&&Z(r,`has "distance", which is how far away a BACKGROUND school is. Add layer: "back", or it would do nothing.`),v&&u!==`top`&&Z(r,`is a Boids school arriving from the ${u}: a school is born where its path starts, so it has no edge to arrive from.`),d>0&&(u!==`top`&&Z(r,`has "aboveMeters" and arrives from the ${u}: only a top-borne entry has a view above it to wait in.`),(s===`bubble`||Gp(s))&&Z(r,`gives a "${s}" "aboveMeters", but only creatures can wait above the view: a collectable comes down with the current and scenery has nothing that reaches ahead of it.`)),{at:o,kind:s,count:c,arrange:l,x:Q(i,`x`,r,.5,0,1),xFrom:Q(i,`xFrom`,r,.12,0,1),xTo:Q(i,`xTo`,r,.88,0,1),span:Q(i,`span`,r,0,0,1e5),amplitude:Q(i,`amplitude`,r,0,0,.5),wavelength:Q(i,`wavelength`,r,6,.5,100),gapAt:Q(i,`gapAt`,r,.5,0,1),gapWidth:Q(i,`gapWidth`,r,.24,0,1),sizes:p,from:u,enterSpeed:Q(i,`enterSpeed`,r,q.spawning.enterSpeedMps,1,500),depth:Q(i,`depth`,r,q.spawning.entryDepth,0,1),...d>0?{aboveMeters:d}:{},...typeof i.path==`string`?{path:i.path}:{},pathSpacingSeconds:Q(i,`pathSpacingSeconds`,r,Yp,.02,10),...v?{boids:!0}:{},...y===`back`?{layer:`back`,distance:Qp(i,`distance`,r,0,1)}:{},...h===void 0?{}:{side:h},...g===void 0?{}:{aim:g},...m&&i.startDelaySeconds!==void 0?{startDelaySeconds:Q(i,`startDelaySeconds`,r,q.hazards.vent.startDelaySeconds,0,600)}:{}}}function tm(e){let t=new Map,n=0;return e.forEach((e,r)=>t.set(e,e.kind===`fish`?n++:r)),t}function nm(e,t=0,n=0){let r=e.from===`top`?{}:{from:e.from,enterSpeed:e.enterSpeed,depth:e.depth},i=e.kind===`vent`?{...e.side===void 0?{}:{side:e.side},...e.aim===void 0?{}:{aim:e.aim},...e.startDelaySeconds===void 0?{}:{startDelaySeconds:e.startDelaySeconds}}:{},a=e.aboveMeters===void 0?{}:{aboveMeters:e.aboveMeters},o=e=>e.map(e=>({...e,...r,...i,...a,variety:t}));if(e.boids){let t=Math.max(1,e.count);return o(Array.from({length:t},(r,i)=>({...Bp.one(e.at,e.kind,e.x,e.sizes?.[i%Math.max(1,e.sizes?.length??1)]),path:e.path,school:n,schoolSize:t,schoolIndex:i,...e.layer===`back`?{layer:`back`,distance:e.distance}:{}})))}if(e.path){let t=Math.max(1,e.count),n=e.pathSpacingSeconds??Yp;return o(Array.from({length:t},(t,r)=>({...Bp.one(e.at,e.kind,e.x,e.sizes?.[r%Math.max(1,e.sizes?.length??1)]),path:e.path,pathDelaySeconds:r*n})))}switch(e.arrange){case`single`:return o([Bp.one(e.at,e.kind,e.x,e.sizes?.[0])]);case`line`:return o(Bp.line(e.at,e.kind,e.count,e.xFrom,e.xTo));case`column`:return o(Bp.column(e.at,e.span,e.count,e.kind,e.x));case`spread`:return o(Bp.spread(e.at,e.span,e.count,e.kind,Vp(e.amplitude,e.x,e.wavelength),e.sizes?Hp(e.sizes):void 0));case`barrier`:return o(Bp.barrier(e.at,e.kind,e.count,e.gapAt,e.gapWidth))}}function rm(e,t,n,r){let i=e[t];if(i===void 0)return r;let a=typeof i==`string`?Number.parseInt(i.replace(`#`,``),16):i;return(typeof a!=`number`||!Number.isFinite(a)||a<0||a>16777215)&&Z(n+`.`+t,`should be a colour: 0xrrggbb or a "#rrggbb" string.`),a}function im(e,t){let n=$p(e,`id`,t,null,[String(e.id)]),r=typeof e.name==`string`?e.name:n,i=e.music;i!==void 0&&(typeof i!=`string`||i.trim()===``)&&Z(`${t} (level "${n}")`,`"music" is ${JSON.stringify(i)}, but it should be a non-empty track name.`);let a=i===void 0?void 0:i,o=Object.keys(e).filter(e=>!Zp.includes(e));o.length&&Z(`${t} (level "${n}")`,`has keys that do nothing here: ${o.join(`, `)}. Known keys: ${Zp.join(`, `)}.`);let s=e.spawns;(!Array.isArray(s)||!s.length)&&Z(`${t} (level "${n}")`,`"spawns" must be a non-empty list.`);let c=s.map((e,t)=>em(e,n,t)),l=tm(c),u=c.flatMap((e,t)=>nm(e,l.get(e),t).map(e=>({...e,group:t}))).sort((e,t)=>e.at-t.at),d=Qp(e,`scrollLength`,`${t} (level "${n}")`,1,1e6),f=e.palette,p=f&&typeof f==`object`&&!Array.isArray(f)?f:{},m={waterAlpha:Q(p,`waterAlpha`,`${t}.palette`,1,0,1),deep:rm(p,`deep`,`${t}.palette`,132880),shallow:rm(p,`shallow`,`${t}.palette`,3051460),bloom:rm(p,`bloom`,`${t}.palette`,12579071),tint:rm(p,`tint`,`${t}.palette`,16777215),tintStrength:Q(p,`tintStrength`,`${t}.palette`,0,0,1)},h=e.backdrop??e.backdrops,g=Array.isArray(h)?h:h===void 0?[]:[h],_=g.length===0?void 0:g.map((e,n)=>{let r=e&&typeof e==`object`&&!Array.isArray(e)?e:{},i=`${t}.backdrops[${n}]`;return typeof r.image!=`string`&&Z(i+`.image`,`must be the file name of a picture.`),{image:r.image,speedFactor:Q(r,`speedFactor`,i,.03,0,1),heightScreens:Q(r,`heightScreens`,i,1.15,.2,6),alpha:Q(r,`alpha`,i,.55,0,1),tint:rm(r,`tint`,i,16777215)}}),v;if(e.paths!==void 0){let n=e.paths;(typeof n!=`object`||!n||Array.isArray(n))&&Z(`${t}.paths`,`must be an object of path name to path.`),v={};for(let[e,r]of Object.entries(n)){let n=r&&typeof r==`object`&&!Array.isArray(r)?r:{},i=n.points;(!Array.isArray(i)||i.length<2)&&Z(`${t}.paths.${e}.points`,`must be a list of at least two points, or there is no spline to follow.`);let a=i.map((n,r)=>{let i=n&&typeof n==`object`&&!Array.isArray(n)?n:{};return{x:Qp(i,`x`,`${t}.paths.${e}.points[${r}]`,-20,20),y:Qp(i,`y`,`${t}.paths.${e}.points[${r}]`,-8,8)}});v[e]={points:a,seconds:Qp(n,`seconds`,`${t}.paths.${e}`,.1,600)}}}c.forEach((e,n)=>{if(e.path&&!v?.[e.path]&&Z(`${t}.spawns[${n}]`,`puts creatures on the path "${e.path}", but this level has no such path. It has: ${Object.keys(v??{}).join(`, `)||`(none)`}.`),e.boids&&e.path){let r=v?.[e.path]?.points[0],i=q.hazards.boids.spawnSpread;r&&!(r.x<-i||r.x>1+i||r.y>=.2)&&Z(`${t}.spawns[${n}]`,`is a Boids school on the path "${e.path}", whose first point (x ${r.x}, y ${r.y}) is inside the screen: the school is born in a cloud of ${i} lane widths round it, so it would appear out of nothing. Start the path beyond either side (x below ${-i} or above ${1+i}) or above the top (y of 0.2 or more).`)}});let y=e.boss;(typeof y!=`object`||!y||Array.isArray(y))&&Z(`${t}.boss`,`is missing. Every level ends when its boss is defeated, so a level must name one.`);let b=y,x=Qp(b,`at`,`${t}.boss`,0,1e6);x>=d&&Z(`${t}.boss.at`,`is ${x}, but the level is only ${d} long and the scroll stops there -- the boss would never arrive and the level could never end. Put it below ${d}.`);let S=b.kind;(typeof S!=`string`||!Pu(S))&&Z(`${t}.boss.kind`,`is ${JSON.stringify(b.kind)}, but it must be one of: ${Nu.filter(e=>e!==`boss`).join(`, `)}.`);let C={kind:S,at:x,health:Qp(b,`health`,`${t}.boss`,1,1e5),name:typeof b.name==`string`?b.name:`BOSS`},w=Qp(e,`scrollSpeed`,`${t} (level "${n}")`,.001,1e4);return{id:n,name:r,...a?{music:a}:{},scrollLength:d,scrollSpeed:w,driftSpeed:Qp(e,`driftSpeed`,`${t} (level "${n}")`,0,1e4),...e.playerLeadLimit===void 0?{}:{playerLeadLimit:Q(e,`playerLeadLimit`,`${t} (level "${n}")`,0,0,1e4)},boss:C,palette:m,...v?{paths:v}:{},..._?{backdrops:_}:{},entries:u,blocks:c}}function am(e){let t=[],n=[];for(let[r,i]of e){(typeof i!=`object`||!i||Array.isArray(i))&&Z(r,`must be an object. A level file holds one level, or a list of them under "levels".`);let e=i,a=typeof e.id==`string`||Array.isArray(e.spawns)||e.scrollLength!==void 0,o=e.levels,s;if(a)s=[e];else if(Array.isArray(o)&&o.length>0)s=o.map((e,t)=>((typeof e!=`object`||!e||Array.isArray(e))&&Z(`${r} levels[${t}]`,`must be an object.`),e));else if(Array.isArray(o))continue;else Z(r,`is not a level file: it has no "id" (one level), and no non-empty "levels" list.`);let c=[];for(let[e,n]of s.entries()){let i=im(n,s.length===1?r:`${r} levels[${e}]`);c.push(i.id),t.push(i)}n.push({file:r,start:e.start,ids:c})}t.length===0&&Z(`the level files`,`are all empty: there is nothing to play.`);let r=t.map(e=>e.id).filter((e,t,n)=>n.indexOf(e)!==t);r.length&&Z(`the level files`,`each define a level called "${r[0]}". Ids must be unique across the files.`);let i=n.map(e=>e.start).find(e=>typeof e==`string`)??t[0].id;return t.some(e=>e.id===i)||Z(`"start"`,`names "${i}", but there is no level with that id. Levels: ${t.map(e=>e.id).join(`, `)}.`),{start:i,levels:t}}var om=am(Rp()),sm=om.levels,cm=Object.assign({"../config/debug-level.json5":uu}),lm=um();function um(){let e=Object.entries(cm),t=sm[0];e.length!==1&&Z(`config/debug-level.json5`,`is missing: the debug level is a level in the ordinary format, and it has to be there.`);let[n,r]=e[0],i=n.replace(`../config/`,``),a=zp(n,r);(typeof a!=`object`||!a||Array.isArray(a))&&Z(i,`must be an object: one level.`);let o=a;for(let e of[`palette`,`backdrop`,`backdrops`])o[e]!==void 0&&Z(i,`has "${e}", but the debug level has no water of its own: it uses the first level's ("${t.id}"). Remove the key.`);let s=im(o,i);return sm.some(e=>e.id===s.id)&&Z(i,`is called "${s.id}", which is also a level on the ladder. The debug level needs an id of its own.`),{...s,palette:t.palette,...t.backdrops?{backdrops:t.backdrops}:{},looksLike:t.id}}function dm(e){return e===lm}var fm=om.start??sm[0].id,$=sm.find(e=>e.id===fm)??sm[0];function pm(e){return sm.findIndex(t=>t.id===e)}function mm(e){let t=sm.find(t=>t.id===e)??(e===lm.id?lm:void 0);return t?($=t,hm=t.entries,gm=null,!0):!1}var hm=$.entries,gm=null;function _m(){return gm??$.blocks}function vm(e){let t=e.map((e,t)=>em(e,$.id,t)),n=tm(t),r=t.flatMap((e,t)=>nm(e,n.get(e),t).map(e=>({...e,group:t}))).sort((e,t)=>e.at-t.at);return xm({...$,entries:r,blocks:t}),hm=r,gm=t,r.length}function ym(e){return e.scrollLength/e.scrollSpeed}function bm(e,t=24){let n=Math.min(t,Math.max(1,Math.ceil(e.scrollLength/190))),r=Array(n).fill(0);for(let t of e.blocks){let e=q.pacing.threat[t.kind]??0,n=Math.floor(t.at/190);n>=0&&n<r.length&&(r[n]+=e*(t.count??1))}return r}function xm(e){let t=[];e.scrollLength>0||t.push(`scrollLength must be positive`),e.scrollSpeed>0||t.push(`scrollSpeed must be positive`);let n=ym(e);n<10&&t.push(`only ${n.toFixed(1)}s of scroll; too short to be a level`),n>400&&t.push(`${n.toFixed(0)}s of scroll; too long for one level`),e.entries.length||t.push(`no entries; the level would be empty`);let r=e.entries.filter(t=>t.at<0||t.at>e.scrollLength);r.length&&t.push(`${r.length} entries outside the level's length`);let i=e.entries.filter(e=>e.x<0||e.x>1);i.length&&t.push(`${i.length} entries outside the play area`);let a=q.obstacles.minGapFraction,o=new Map;for(let t of e.entries){if(t.kind!==`crate`&&t.kind!==`coral`)continue;let e=q.obstacles.radius[t.kind]??.05,n=o.get(t.at)??[];n.push({x:t.x,radius:e}),o.set(t.at,n)}for(let[e,n]of o)wp(n)||t.push(`obstacle row at ${e}m leaves no gap of ${a} or more; it would seal the lane and make being small mandatory`);if(t.length)throw Error(`Level "${e.id}" is unusable: ${t.join(`; `)}`)}for(let e of sm)xm(e);xm(lm);function Sm(e,t,n=900){let r=Math.min(e,n),i=r/361;return{scale:i,left:(e-r)/2,cy:t/2,width:e,height:t,laneWidthPx:r,laneWidthMeters:361,visibleDepthMeters:t/i}}function Cm(e,t){let n=Math.min(e/hl.width,t/hl.height);return Math.min(1.5,Math.max(.55,n))}var wm=class{constructor(){J(this,`y`,0),J(this,`viewport`,Sm(hl.width,hl.height))}setScroll(e){this.y=e}toScreenX(e){return this.viewport.left+e*this.viewport.scale}toScreenY(e){return this.viewport.cy-(e-this.y)*this.viewport.scale}toWorldY(e){return this.y+(this.viewport.cy-e)/this.viewport.scale}visibleWorldRange(e=12){let t=this.viewport.height/2/this.viewport.scale;return{min:this.y-t-e,max:this.y+t+e}}applyTo(e){let t=this.viewport.scale;e.updateTransform({x:this.toScreenX(0),y:this.toScreenY(0),scaleX:t,scaleY:-t})}};function Tm(e,t,n,r=`bold`){let i=new Vi({text:e,style:{fontFamily:q.text.fontFamily,fontSize:n,fill:t,fontWeight:r,letterSpacing:.5}});return i.resolution=2,i}var Em=.008,Dm=class{get backdropLoaded(){return this.backdrops.length>0&&this.backdrops.every(e=>e.isLoaded)}get backdropError(){return this.backdrops.map(e=>e.error).filter(Boolean).join(` | `)}constructor(){J(this,`root`,new P),J(this,`world`,new P),J(this,`gradient`,new V),J(this,`margins`,new V),J(this,`snow`,new V),J(this,`parallax`,new nu),J(this,`backdrops`,[]),J(this,`backdropKey`,``),J(this,`lastCanvasWidth`,0),J(this,`lastCanvasHeight`,0),J(this,`lastLaneWidthMeters`,0),J(this,`maskShape`,new V),J(this,`snowPoints`,[]),J(this,`lastTopColour`,-1),J(this,`lastBottomColour`,-1),J(this,`lastGradientWidth`,-1),J(this,`lastGradientHeight`,-1),J(this,`lastWaterAlpha`,-1),this.snow.eventMode=`none`,this.gradient.eventMode=`none`,this.margins.eventMode=`none`,this.world.addChild(this.snow),this.world.addChild(this.parallax.root),this.world.mask=this.maskShape,this.root.addChild(this.gradient,this.margins,this.world)}seedSnow(e,t){let n=e*Em;this.snowPoints=[];for(let r=0;r<90;r++)this.snowPoints.push({x:n+Math.random()*(e-n),y:Math.random()*t.scrollLength,r:e*(6e-4+Math.random()*.0019),driftX:(Math.random()-.5)*e*7e-4,driftY:-(.05+Math.random()*.15)*(e/120)})}layout(e,t){this.parallax.layout(e.laneWidthMeters,e.visibleDepthMeters),this.lastCanvasWidth=e.width,this.lastCanvasHeight=e.height,this.lastLaneWidthMeters=e.laneWidthMeters;for(let t of this.backdrops)t.layout(e.width,e.height,e.laneWidthMeters);this.lastTopColour=-1,this.lastBottomColour=-1,this.lastGradientWidth=-1,this.lastGradientHeight=-1;let n=e.left,r=e.laneWidthPx;this.maskShape.clear(),this.maskShape.rect(n,-1e3,r,e.height+2e3).fill(16777215),this.seedSnow(e.laneWidthMeters,t)}drawBackdrop(e,t,n){let r=n.backdrops??[],i=r.map(e=>e.image).join(`|`);if(i!==this.backdropKey){for(let e of this.backdrops)e.root.destroy({children:!0});this.backdrops=[],this.backdropKey=i;for(let e of r){let t=new tu(e);t.layout(this.lastCanvasWidth,this.lastCanvasHeight,this.lastLaneWidthMeters),this.root.addChildAt(t.root,0),this.backdrops.push(t)}}for(let n of this.backdrops)n.draw(e,t)}update(e,t,n,r,i){let a=e.viewport,{min:o,max:s}=e.visibleWorldRange(20);e.applyTo(this.world);let c=a.height/2/a.scale,l=i.scrollLength-r,u=Mm(e.y+c,l,i),d=Mm(e.y-c,l,i),f=a.width!==this.lastGradientWidth||a.height!==this.lastGradientHeight;if(u!==this.lastTopColour||d!==this.lastBottomColour||f||i.palette.waterAlpha!==this.lastWaterAlpha){this.lastWaterAlpha=i.palette.waterAlpha,this.lastTopColour=u,this.lastBottomColour=d,this.lastGradientWidth=a.width,this.lastGradientHeight=a.height;let e=new Ne({start:{x:0,y:0},end:{x:0,y:1},colorStops:[{offset:0,color:Om(u)},{offset:1,color:Om(d)}],textureSpace:`local`});this.gradient.clear(),this.gradient.rect(0,0,a.width,a.height).fill({fill:e,alpha:i.palette.waterAlpha})}this.margins.clear();let p=a.left;if(p>1){let e=a.left+a.laneWidthPx;jm(this.margins,0,p,a.height,!1),jm(this.margins,e,a.width-e,a.height,!0)}this.drawBackdrop(r,e.viewport.scale,i),this.parallax.draw(r,o,s),this.snow.clear();for(let e of this.snowPoints)e.x+=e.driftX*n,e.y+=e.driftY*n,e.y<o&&(e.y=s,e.x=a.laneWidthMeters*Em+Math.random()*(a.laneWidthMeters*.992)),this.snow.circle(e.x,e.y,e.r);this.snow.fill({color:14677759,alpha:.26})}};function Om(e){return`#${e.toString(16).padStart(6,`0`)}`}function km(e,t){return`rgba(${e>>16&255},${e>>8&255},${e&255},${t})`}function Am(e,t,n){return Mm(e,t,n)}function jm(e,t,n,r,i){if(n<=.5)return;let a=new Ne({start:{x:+!!i,y:0},end:{x:+!i,y:0},colorStops:[{offset:0,color:`rgba(1,6,15,0.85)`},{offset:1,color:`rgba(1,6,15,0)`}],textureSpace:`local`});e.rect(t,0,n,r).fill({fill:a,alpha:1})}function Mm(e,t,n){let r=n.palette,i={r:r.deep>>16&255,g:r.deep>>8&255,b:r.deep&255},a={r:r.shallow>>16&255,g:r.shallow>>8&255,b:r.shallow&255},o=Math.min(Math.max(e/Math.max(1,n.scrollLength),0),1)**1.15,s=i.r+(a.r-i.r)*o,c=i.g+(a.g-i.g)*o,l=i.b+(a.b-i.b)*o,u=Math.max(0,Math.min(1,1-t/55)),d=r.bloom>>16&255,f=r.bloom>>8&255,p=r.bloom&255;if(s+=(d-s)*u*.3,c+=(f-c)*u*.3,l+=(p-l)*u*.3,r.tintStrength>0){let e=r.tint>>16&255,t=r.tint>>8&255,n=r.tint&255;s+=(e-s)*r.tintStrength,c+=(t-c)*r.tintStrength,l+=(n-l)*r.tintStrength}let m=e=>Math.max(0,Math.min(255,Math.round(e)));return m(s)<<16|m(c)<<8|m(l)}var Nm=class{constructor(){J(this,`root`,new P),J(this,`resourceLabel`,void 0),J(this,`resourceGauge`,new V),J(this,`mutationLabel`,void 0),J(this,`mutationGauge`,new V),J(this,`scoreLabel`,void 0),J(this,`bossName`,void 0),J(this,`bossBar`,new V),J(this,`healthGauge`,new V),J(this,`healthLabel`,void 0),J(this,`shownHealth`,-1),J(this,`shownHealthMax`,-1),J(this,`canvasHeight`,0),J(this,`shownBossFraction`,-1),J(this,`shownBossBarWidth`,-1),J(this,`shownScore`,-1),J(this,`hudScale`,1),J(this,`laneWidthPx`,0),J(this,`laneCentreX`,0),this.resourceLabel=Tm(``,8373480,11),this.resourceLabel.anchor.set(.5,0),this.resourceLabel.visible=!1,this.mutationLabel=Tm(``,q.mutation.gauge.labelColour,q.mutation.gauge.labelSize),this.mutationLabel.anchor.set(.5,0),this.mutationLabel.visible=!1,this.scoreLabel=Tm(``,q.hud.score.colour,q.hud.score.size),this.bossName=Tm(``,q.hud.bossBar.nameColour,q.hud.bossBar.nameSize),this.healthLabel=Tm(``,q.hud.healthBar.labelColour,q.hud.healthBar.labelSize),this.healthLabel.anchor.set(0,.5),this.bossName.anchor.set(.5,1),this.bossName.visible=!1,this.bossBar.visible=!1,this.scoreLabel.alpha=q.hud.score.alpha,this.root.addChild(this.resourceGauge,this.resourceLabel,this.mutationLabel,this.mutationGauge,this.scoreLabel,this.bossBar,this.bossName,this.healthGauge,this.healthLabel)}layout(e){let t=Cm(e.width,e.height);this.hudScale=t,this.laneWidthPx=e.laneWidthPx,this.laneCentreX=e.left+e.laneWidthPx/2;let n=this.laneCentreX;this.resourceLabel.scale.set(t),this.resourceLabel.x=n,this.resourceLabel.y=38*t,this.mutationLabel.scale.set(t),this.mutationLabel.x=n,this.scoreLabel.scale.set(t),this.scoreLabel.x=e.left+q.hud.score.x*t,this.scoreLabel.y=q.hud.score.y*t,this.bossName.scale.set(t),this.bossName.x=this.laneCentreX,this.bossName.y=q.hud.bossBar.y*t-q.hud.bossBar.nameOffset*t,this.canvasHeight=e.height;let r=q.hud.healthBar;this.healthLabel.scale.set(t),this.healthLabel.x=e.left+r.x*t+this.laneWidthPx*r.widthRatio+r.labelGap*t,this.healthLabel.y=e.height-r.y*t-r.height*t/2}updateRunReadouts(e){e.score!==this.shownScore&&(this.shownScore=e.score,this.scoreLabel.text=`分数 ${e.score}`);let t=e.boss;if(this.bossBar.visible=t!==null,this.bossName.visible=t!==null,!t)this.shownBossFraction=-1,this.shownBossBarWidth=-1,this.bossBar.clear();else{let e=q.hud.bossBar,n=this.hudScale;this.bossName.text!==t.name&&(this.bossName.text=t.name);let r=Math.max(0,Math.min(1,t.fraction)),i=this.laneWidthPx*e.widthRatio;if(r!==this.shownBossFraction||i!==this.shownBossBarWidth){this.shownBossFraction=r,this.shownBossBarWidth=i;let t=e.height*n,a=this.laneCentreX-i/2,o=e.y*n,s=this.bossBar;s.clear(),s.roundRect(a,o,i,t,t/2).fill({color:e.backColour,alpha:e.backAlpha});let c=i*r;c>1&&s.roundRect(a,o,c,t,t/2).fill({color:e.fillColour,alpha:1}),s.roundRect(a,o,i,t,t/2).stroke({color:e.borderColour,alpha:e.borderAlpha,width:1})}}let n=e.health;(n.current!==this.shownHealth||n.max!==this.shownHealthMax)&&(this.shownHealth=n.current,this.shownHealthMax=n.max,this.redrawHealth(n))}redrawHealth(e){let t=q.hud.healthBar,n=this.hudScale,r=this.healthGauge;r.clear();let i=this.laneWidthPx*t.widthRatio,a=t.height*n,o=this.laneCentreX-this.laneWidthPx/2+t.x*n,s=this.canvasHeight-t.y*n-a,c=a/2,l=e.max>0?Math.min(1,Math.max(0,e.current/e.max)):0,u=l<=t.lowThreshold;r.roundRect(o,s,i,a,c).fill({color:t.trackColour,alpha:t.trackAlpha});let d=i*l;d>.5&&r.roundRect(o,s,d,a,c).fill({color:u?t.lowColour:t.fillColour,alpha:t.fillAlpha}),r.roundRect(o,s,i,a,c).stroke({color:t.borderColour,alpha:t.borderAlpha,width:1}),this.healthLabel.text=`${Math.ceil(e.current)}/${Math.round(e.max)}`}get bossBarVisible(){return this.bossBar.visible}get bossBarName(){return this.bossName.text}get scoreText(){return this.scoreLabel.text}drawResourceGauge(e,t){let n=q.angry.gauge,r=this.hudScale,i=this.resourceGauge;i.clear();let a=this.laneWidthPx*n.widthRatio,o=n.height*r,s=this.laneCentreX-a/2,c=this.resourceLabel.y+this.resourceLabel.height+n.gap*r,l=n.radius*r;i.roundRect(s,c,a,o,l).fill({color:n.trackColour,alpha:n.trackAlpha}),i.roundRect(s,c,a,o,l).stroke({color:n.trackStroke,alpha:n.trackStrokeAlpha,width:1});let u=Math.min(1,Math.max(0,e))*a;u>.5&&i.roundRect(s,c,u,o,l).fill({color:t,alpha:n.fillAlpha});for(let e of q.angry.appearance){if(e.minRage<=0)continue;let t=s+Math.min(1,e.minRage/Math.max(1e-6,q.angry.rage.max))*a;i.moveTo(t,c).lineTo(t,c+o)}i.stroke({color:n.tickColour,alpha:n.tickAlpha,width:n.tickWidth*r})}get resourceGaugeVisible(){return this.resourceLabel.visible}drawMutationGauge(e){let t=q.mutation.gauge,n=this.hudScale,r=this.mutationGauge;r.clear(),this.mutationLabel.visible=!0,this.mutationLabel.text=`突变 ${e.level}`;let i=(q.hud.bossBar.y+q.hud.bossBar.height+t.bossGap)*n;this.mutationLabel.y=i;let a=this.laneWidthPx*t.widthRatio,o=t.height*n,s=this.laneCentreX-a/2,c=i+this.mutationLabel.height+t.gap*.5*n,l=t.radius*n;r.roundRect(s,c,a,o,l).fill({color:t.trackColour,alpha:t.trackAlpha}),r.roundRect(s,c,a,o,l).stroke({color:t.trackStroke,alpha:t.trackStrokeAlpha,width:1});let u=Math.min(1,Math.max(0,e.fraction))*a;u>.5&&r.roundRect(s,c,u,o,l).fill({color:t.fillColour,alpha:t.fillAlpha}),e.pending>0&&r.roundRect(s,c,a,o,l).stroke({color:t.readyStroke,alpha:t.readyStrokeAlpha,width:Math.max(1.5,1.5*n)}),e.ramp&&r.roundRect(s,c,a,o,l).stroke({color:t.rampStroke,alpha:t.rampStrokeAlpha,width:Math.max(1.5,o*t.rampStrokeScale)})}update(e){let{stage:t}=e;this.updateRunReadouts(e),t.resource?(this.resourceLabel.visible=!0,this.resourceLabel.text=`${t.resource.label} ${t.resource.text}`,this.resourceLabel.style.fill=t.resource.colour,this.drawResourceGauge(t.resource.fraction,t.resource.colour)):(this.resourceLabel.visible=!1,this.resourceLabel.text=``,this.resourceGauge.clear()),this.drawMutationGauge(t.mutation)}};async function Pm(){let e=new un;return await e.init({background:66828,antialias:!1,autoDensity:!0,resolution:Math.min(window.devicePixelRatio||1,2),preference:`webgl`,powerPreference:`high-performance`}),e}function Fm(e,t,n){let r=q.bullets,i=r.speedStartPerSecond*n,a=r.speedMaxPerSecond*n;return Math.min(a,i+r.accelerationPerSecond*n*e.age)*t}function Im(e,t,n){let r=q.bullets;return(r.radiusRatio+r.radiusGrowthPerSecond*e.age)*n*t}function Lm(e){let t=q.bullets;return t.radiusRatio>0?(t.radiusRatio+t.radiusGrowthPerSecond*e.age)/t.radiusRatio:1}var Rm=e=>e>0?e:0;function zm(e,t){let n=Rm(t.sizeDamageRate)*Rm(Lm(e)-1),r=Rm(t.speedDamageRate)*Rm(t.speedMultiplier-1);return t.damage*(1+n)*(1+r)}function Bm(e){return e.kind===`fallcrate`&&e.phase<q.hazards.fallcrate.warnSeconds?!1:e.maxHealth>0&&!e.flee}function Vm(e){let t=q.bullets.homing.rangeMarginMeters,n=e.min-t,r=e.max+t,i=[];for(let t of e.hazards.hazards)t.y<=e.playerY||t.y<n||t.y>r||Bm(t)&&i.push(t);return i.length===0?null:i[Math.floor(e.random()*i.length)].id}function Hm(e){return e.random()<.5?-1:1}function Um(e,t,n){let r=e.homing,i=q.bullets.homing,a=i.lateralMaxPerSecond*n.laneWidth,o=i.steerPerSecond*n.laneWidth,s=i.arcPerSecond*n.laneWidth,c;if(r.targetId!==null){let e=n.hazards.hazards.find(e=>e.id===r.targetId);e&&Bm(e)?c=e:(r.targetId=Vm(n),r.targetId===null?r.side=Hm(n):c=n.hazards.hazards.find(e=>e.id===r.targetId))}let l=c?Math.max(-a,Math.min(a,(c.x-e.x)*i.approachPerSecond)):r.side*a,u=c?(l-r.vx)/Math.max(t,1e-6):r.side*s,d=Math.max(-o,Math.min(o,u));r.vx=Math.max(-a,Math.min(a,r.vx+d*t)),e.x+=r.vx*t}var Wm=class{constructor(){J(this,`bullets`,[]),J(this,`fired`,0),J(this,`hits`,0),J(this,`cooldown`,0)}reset(){this.bullets=[],this.cooldown=0,this.fired=0,this.hits=0}update(e,t){let n=q.bullets,r=0,i=0,a=0,o=[],s=[],c=[];if(t.armed&&t.perSecond>0)for(this.cooldown-=e;this.cooldown<=0;)this.cooldown+=1/t.perSecond,this.spawn(t),a++;else this.cooldown=0;let l=n.lifeSeconds*t.lifeMultiplier;for(let a=this.bullets.length-1;a>=0;a--){let u=this.bullets[a];u.age+=e,u.y+=t.cameraRise+Fm(u,t.laneWidth,t.speedMultiplier)*e,u.angle!==void 0&&(u.x+=Math.tan(u.angle)*Fm(u,t.laneWidth,t.speedMultiplier)*e),u.homing&&Um(u,e,t);let d=Im(u,t.laneWidth,t.radiusMultiplier),f=t.obstacles.blockerAt(u.x,u.y,d,t.laneWidth),p=f!==null;if(f&&(this.hits++,f.kind===`crate`||f.kind===`wall`)){let e=t.obstacles.damage(f.id,n.damage);e&&c.push({x:u.x,y:u.y,kind:e.kind,broke:e.broke})}if(!p)for(let e of t.hazards.hazards){if(!Bm(e))continue;let n=d+t.laneWidth*lf(e.kind,e.scale),a=e.x-u.x,c=e.y-u.y,l=uf(e.kind,e.variety,e.scale);if(!(l?df(u.x,u.y,e.x,e.y,l.halfW*t.laneWidth,l.halfH*t.laneWidth)<=d:a*a+c*c<=n*n))continue;let f=t.closeDamageRate>0&&e.y-t.playerY<=t.closeRangeMeters?1+t.closeDamageRate:1,m=zm(u,t)*f,h=t.hazards.hit(e,m,{x:u.x,y:u.y,knockScale:t.knockbackScale});this.hits++,r++;let g={x:e.x,y:e.y,kind:e.kind,r:t.laneWidth*e.radiusFraction,halfW:l?l.halfW:null,halfH:l?l.halfH:null};s.push({...g,amount:m}),h===`fled`&&(i++,o.push(g)),p=!0;break}(p||u.age>=l||u.y<t.min-60||u.y>t.max+120)&&this.bullets.splice(a,1)}return{hits:r,drivenOff:i,fired:a,driven:o,struck:s,obstacleHits:c}}spawn(e){let t=Math.max(1,Math.round(e.pellets)),n=e.spreadDegrees*Math.PI/360;for(let r of e.muzzles)for(let i=0;i<t;i++){let a=t<=1?0:i/(t-1)*2-1,o={x:r.x,y:r.y,age:0};if(t>1&&(o.angle=n*a),e.homingChance>0&&e.random()<e.homingChance){let t=Vm(e);o.homing={targetId:t,vx:0,side:t===null?Hm(e):1}}this.bullets.push(o),this.fired++}}};function Gm(e,t,n,r=1,i=1){let a=q.bullets,o=a.lifeSeconds*i;for(let i of t.bullets){let t=Im(i,n,r),s=Math.max(.18,1-i.age/o),c=i.homing?a.homing:a;e.circle(i.x,i.y,t).fill({color:c.colour,alpha:a.alpha*s}),e.circle(i.x,i.y,t).stroke({color:c.rimColour,alpha:a.rimAlpha*s,width:Math.max(1,t*.45)})}}var Km=!1;function qm(e){return Km=e,Km}function Jm(){return Km}var Ym=[`vent`,`mineral`,`foam`,`rain`];function Xm(e,t,n,r){r>0&&e.circle(t,n,r)}function Zm(e,t,n,r,i){r>0&&i>0&&e.rect(t-r,n-i,r*2,i*2)}function Qm(e,t,n){let r=uf(t.kind,t.variety,t.scale);r?Zm(e,t.x,t.y,r.halfW*n,r.halfH*n):Xm(e,t.x,t.y,n*lf(t.kind,t.scale))}function $m(e,t,n,r,i,a){if(!(r>0)||!(i>0))return;let o=i+Math.max(.5,a),s=Math.min(180,Math.max(4,Math.floor(2*Math.PI*r/o))),c=2*Math.PI/s;for(let a=0;a<s;a++){let s=a*c,l=s+i/o*c;e.moveTo(t+Math.cos(s)*r,n+Math.sin(s)*r);for(let i=1;i<=4;i++){let a=s+(l-s)*i/4;e.lineTo(t+Math.cos(a)*r,n+Math.sin(a)*r)}}}function eh(e){return!!e.charge&&!e.charge.grazed&&!e.charge.hitPlayer&&e.charge.elapsed>=gf(e.kind).telegraphSeconds}function th(e,t){let n=q.debug,r=t=>void e.stroke({color:t,alpha:n.alpha,width:n.width});for(let n of t.hazards.hazards)Ym.includes(n.kind)||Qm(e,n,t.laneWidth);r(n.creatureColour);for(let n of t.hazards.hazards){if(!Ym.includes(n.kind))continue;if(!n.vent){Qm(e,n,t.laneWidth);continue}if(Xm(e,n.x,n.y,t.laneWidth*n.radiusFraction),!n.vent)continue;let r=t.laneWidth*q.hazards.vent.jetHalfWidthRatio,i=t.laneWidth*n.vent.lengthRatio,a=n.x+n.vent.aimX*i,o=n.y+n.vent.aimY*i,s=-n.vent.aimY*r,c=n.vent.aimX*r;e.moveTo(n.x+s,n.y+c).lineTo(a+s,o+c),e.moveTo(n.x-s,n.y-c).lineTo(a-s,o-c),Xm(e,a,o,r)}r(n.environmentColour);for(let n of t.obstacles.obstacles){let r=vp(n.kind);r?Zm(e,n.x,n.y+t.laneWidth*r.offsetY,t.laneWidth*r.halfW,t.laneWidth*r.halfH):Xm(e,n.x,n.y,t.laneWidth*n.radiusFraction)}r(n.obstacleColour);for(let n of t.bullets.bullets)Xm(e,n.x,n.y,Im(n,t.laneWidth,t.bulletRadiusMultiplier));r(n.playerBulletColour);for(let n of t.enemyBullets.bullets)Xm(e,n.x,n.y,t.laneWidth*n.radiusRatio);r(n.enemyBulletColour),Xm(e,t.playerX,t.playerY,t.playerRadius),r(n.playerColour);for(let r of t.hazards.hazards){if(!eh(r))continue;let i=t.playerRadius+t.laneWidth*lf(r.kind,r.scale),a=i*(q.graze.radiusMultiplier-1),o=uf(r.kind,r.variety,r.scale);o?Zm(e,r.x,r.y,o.halfW*t.laneWidth+a,o.halfH*t.laneWidth+a):$m(e,r.x,r.y,i*q.graze.radiusMultiplier,n.dashLength,n.dashGap)}for(let r of t.enemyBullets.bullets){if(r.grazed)continue;let i=t.playerRadius+t.laneWidth*r.radiusRatio;$m(e,r.x,r.y,i*q.graze.radiusMultiplier,n.dashLength,n.dashGap)}r(n.grazeColour)}function nh(e,t,n,r,i,a=1){let o=q.hazards.eel,s=.45+.55*Math.abs(Math.sin(i*34)),c=[];for(let e=0;e<22;e++){let i=e/22*Math.PI*2,a=e%2==0?1.34:1.2;c.push(t+Math.cos(i)*r*a,n+Math.sin(i)*r*a)}c.push(c[0],c[1]),e.poly(c),e.stroke({color:o.paralysisColour,alpha:s*a,width:r*o.paralysisWidthRatio});for(let c=0;c<3;c++){let l=i*5+c/3*Math.PI*2;e.moveTo(t+Math.cos(l)*r*1.3,n+Math.sin(l)*r*1.3).lineTo(t+Math.cos(l+.35)*r*1.75,n+Math.sin(l+.35)*r*1.75).stroke({color:o.paralysisColour,alpha:.7*s*a,width:r*o.paralysisWidthRatio*.6})}}var rh=class{constructor(){J(this,`bullets`,[]),J(this,`fired`,0),J(this,`hits`,0),J(this,`grazes`,0)}reset(){this.bullets.length=0,this.fired=0,this.hits=0,this.grazes=0}get count(){return this.bullets.length}fire(e,t,n,r,i,a){let o=q.enemyBullets.shooters[e];if(!o)return 0;let s=r-t,c=i-n;if(Math.hypot(s,c)<1e-6)return 0;let l=Math.atan2(c,s),u=o.speedPerSecond*a,d=Math.max(1,Math.round(o.spread));for(let r=0;r<d;r++){let i=l+(r-(d-1)/2)*o.spreadRadians;this.bullets.push({x:t,y:n,vx:Math.cos(i)*u,vy:Math.sin(i)*u,age:0,kind:e,shape:o.shape??`bolt`,radiusRatio:o.radiusRatio??q.enemyBullets.radiusRatio,...o.coreColour===void 0?{}:{coreColour:o.coreColour},...o.rimColour===void 0?{}:{rimColour:o.rimColour},...o.image===void 0?{}:{image:o.image},...o.imageScale===void 0?{}:{imageScale:o.imageScale},...o.imageAlpha===void 0?{}:{imageAlpha:o.imageAlpha},grazed:!1}),this.fired++}return d}update(e,t){let n=q.enemyBullets,r=[],i=[];for(let a=this.bullets.length-1;a>=0;a--){let o=this.bullets[a];o.age+=e,o.x+=o.vx*e,o.y+=t.cameraRise+o.vy*e;let s=t.laneWidth*o.radiusRatio,c=!1;if(t.blocks(o.x,o.y,s))c=!0;else{let e=s+t.playerRadius,n=t.playerX-o.x,a=t.playerY-o.y;if(n*n+a*a<=e*e)r.push(o.kind),this.hits++,c=!0;else{let r=e*q.graze.radiusMultiplier;!t.invulnerable&&!o.grazed&&n*n+a*a<=r*r&&o.vx*n+o.vy*a<=0&&(o.grazed=!0,this.grazes++,i.push({x:o.x,y:o.y}))}}(c||o.age>=n.lifeSeconds||o.y<t.min-60||o.y>t.max+120||o.x<-t.laneWidth*.2||o.x>t.laneWidth*1.2)&&this.bullets.splice(a,1)}return{landed:r,grazedAt:i}}};function ih(e,t,n,r){let i=q.enemyBullets;for(let a of t.bullets){if(a.kind===`eel`){let t=n*a.radiusRatio*q.hazards.eel.bulletRingRadiusRatio;nh(e,a.x,a.y,t,a.age)}if(r?.(a))continue;let t=a.coreColour??i.coreColour,o=a.rimColour??i.rimColour,s=n*a.radiusRatio,c=Math.hypot(a.vx,a.vy)||1,l=a.vx/c,u=a.vy/c;if(a.shape===`spike`){let n=s*3.4,r=s*.85,c=-u,d=l;e.moveTo(a.x+l*n,a.y+u*n).lineTo(a.x+c*r,a.y+d*r).lineTo(a.x-l*n*.6,a.y-u*n*.6).lineTo(a.x-c*r,a.y-d*r).closePath().fill({color:t,alpha:1}),e.moveTo(a.x+l*n,a.y+u*n).lineTo(a.x+c*r,a.y+d*r).lineTo(a.x-l*n*.6,a.y-u*n*.6).lineTo(a.x-c*r,a.y-d*r).closePath().stroke({color:o,alpha:i.rimAlpha,width:Math.max(1,s*.3)});continue}let d=Math.min(s*3.2,c*.02);e.moveTo(a.x-l*d,a.y-u*d).lineTo(a.x,a.y).stroke({color:o,alpha:i.rimAlpha*.45,width:Math.max(1,s*.7)}),e.circle(a.x,a.y,s*1.35).fill({color:o,alpha:i.rimAlpha*.35}),e.circle(a.x,a.y,s).fill({color:t,alpha:1})}}var ah=new Map(Object.entries(Object.assign({})).map(([e,t])=>[e.replace(/^.*\//,``).replace(/\.[^.]+$/,``),t])),oh=class{constructor(){J(this,`ctx`,null),J(this,`buses`,{}),J(this,`noise`,null),J(this,`last`,new Map),J(this,`buffers`,new Map),J(this,`ends`,[]),J(this,`plays`,0),J(this,`lastId`,null),J(this,`lastPan`,0)}attach(e,t){this.ctx=e;for(let n of Fc){let r=e.createGain();r.gain.value=q.audio.sfx.buses[n],r.connect(t),this.buses[n]=r}let n=e.sampleRate;this.noise=e.createBuffer(1,n,e.sampleRate);let r=this.noise.getChannelData(0);for(let e=0;e<n;e++)r[e]=Math.random()*2-1;for(let[t,n]of ah)fetch(n).then(e=>e.arrayBuffer()).then(t=>e.decodeAudioData(t)).then(e=>this.buffers.set(t,e)).catch(()=>void 0)}play(e,t,n,r=1){let i=this.ctx,a=q.audio.sfx.sounds[e];if(!i||!a)return;let o=i.currentTime;if(o-(this.last.get(e)??-1)<(a.gap??.09)||(this.ends=this.ends.filter(e=>e>o),a.bus!==`ui`&&this.ends.length>=q.audio.sfx.maxVoices))return;this.last.set(e,o),this.plays++,this.lastId=e,this.lastPan=Math.max(-1,Math.min(1,n*q.audio.sfx.panWidth));let s=this.buses[a.bus];if(!s)return;let c=Math.min(1,Math.max(0,t)),l=(a.gain??1)*(1+c*(a.gainPerIntensity??0)),u=1+(Math.random()*2-1)*(a.pitchJitter??0),d=a.bus===`ui`?1:Math.max(.05,Math.min(1,r)),f=u*(1+c*(a.pitchPerIntensity??0))*d,p=s;if(n!==0&&i.createStereoPanner){let e=i.createStereoPanner();e.pan.value=Math.max(-1,Math.min(1,n*q.audio.sfx.panWidth)),e.connect(s),p=e}let m=this.buffers.get(e);if(m){let e=i.createBufferSource();e.buffer=m;let t=i.createGain();t.gain.value=(a.fileGain??1)*(1+c*(a.gainPerIntensity??0)),e.connect(t),t.connect(p),e.start(o),this.ends.push(o+m.duration);return}for(let e of a.layers){let t=d===1?e:{...e,seconds:e.seconds/d,delay:(e.delay??0)/d,attack:(e.attack??0)/d},n=o+(t.delay??0);this.ends.push(n+t.seconds),t.type===`tone`?this.tone(t,n,l,f,p):this.burst(t,n,l,f,p)}}probe(){let e=this.ctx?.currentTime??0;return{attached:!!this.ctx,plays:this.plays,last:this.lastId,lastPan:this.lastPan,voices:this.ends.filter(t=>t>e).length}}tone(e,t,n,r,i){let a=this.ctx,o=a.createOscillator();o.type=e.wave??`sine`;let s=e.hz*r;if(o.frequency.setValueAtTime(s,t),e.endRatio!==void 0&&e.endRatio!==1&&o.frequency.exponentialRampToValueAtTime(Math.max(30,s*e.endRatio),t+e.seconds),e.vibratoHz&&e.vibratoDepth){let n=a.createOscillator();n.frequency.value=e.vibratoHz;let r=a.createGain();r.gain.value=s*e.vibratoDepth,n.connect(r),r.connect(o.frequency),n.start(t),n.stop(t+e.seconds+.02)}let c=a.createGain();c.gain.setValueAtTime(0,t),c.gain.linearRampToValueAtTime(e.gain*n,t+Math.min(e.attack??.008,e.seconds*.5)),c.gain.exponentialRampToValueAtTime(1e-4,t+e.seconds),o.connect(c),c.connect(i),o.start(t),o.stop(t+e.seconds+.02)}burst(e,t,n,r,i){let a=this.ctx;if(!this.noise)return;let o=a.createBufferSource();o.buffer=this.noise,o.loop=!0;let s=a.createBiquadFilter();s.type=e.filter??`bandpass`;let c=e.hz*r;s.frequency.setValueAtTime(c,t),e.endRatio!==void 0&&e.endRatio!==1&&s.frequency.exponentialRampToValueAtTime(Math.max(30,c*e.endRatio),t+e.seconds),s.Q.value=e.q??.8;let l=a.createGain();l.gain.setValueAtTime(0,t),l.gain.linearRampToValueAtTime(e.gain*n,t+Math.min(e.attack??.004,e.seconds*.5)),l.gain.exponentialRampToValueAtTime(1e-4,t+e.seconds),o.connect(s),s.connect(l),l.connect(i),o.start(t,Math.random()*.5),o.stop(t+e.seconds+.02)}},sh=new class{constructor(){J(this,`ctx`,null),J(this,`master`,null),J(this,`sfxBus`,null),J(this,`musicBus_`,null),J(this,`sfx`,new oh),J(this,`ambientGain`,null),J(this,`musicGain`,null),J(this,`filter`,null),J(this,`noise`,null),J(this,`noiseGain`,null),J(this,`lfo`,null),J(this,`lfoGain`,null),J(this,`enabled`,!0),J(this,`started`,!1),J(this,`volume`,.8),J(this,`musicSlider`,.8),J(this,`now`,0),J(this,`requested`,{cutoff:260,ambient:0,noise:.5,master:1}),J(this,`depthTrace`,[]),J(this,`silencedAtSurfaceCount`,0)}get requestedAmbientRef(){return this.requested.ambient}get requestedNoiseRef(){return this.requested.noise}get isRunning(){return this.started&&this.ctx?.state===`running`}get muted(){return!this.enabled}unlock(){if(!this.enabled)return!1;if(this.started&&this.ctx?.state===`running`)return!0;try{return this.ctx||this.build(),this.ctx?.resume(),this.started=!0,!0}catch{return this.enabled=!1,!1}}setMuted(e){this.enabled=!e,this.applyMaster(),e||this.unlock()}silenceAmbience(){if(!this.ctx||!this.ambientGain||!this.noiseGain)return;let e=this.ctx.currentTime;this.ambientGain.gain.setTargetAtTime(0,e,.25),this.noiseGain.gain.setTargetAtTime(0,e,.25),this.requested.ambient=0,this.requested.noise=0}setVolume(e){this.volume=Math.min(1,Math.max(0,e)),this.applyMaster(),this.volume>0&&this.unlock()}getVolume(){return this.volume}setMusicSlider(e){this.musicSlider=Math.min(1,Math.max(0,e)),this.applyMaster(),this.musicSlider>0&&this.unlock()}getMusicSlider(){return this.musicSlider}musicBus(){return!this.ctx||!this.musicBus_?null:{ctx:this.ctx,destination:this.musicBus_}}applyMaster(){if(this.master&&this.ctx){let e=this.ctx.currentTime;this.master.gain.setTargetAtTime(+!!this.enabled,e,.05),this.sfxBus?.gain.setTargetAtTime(this.volume,e,.05),this.musicBus_?.gain.setTargetAtTime(this.musicSlider,e,.05)}this.requested.master=this.enabled?this.volume:0}toggleMute(){return this.setMuted(!this.muted),this.muted}build(){let e=window.AudioContext??window.webkitAudioContext;if(!e)throw Error(`no AudioContext`);let t=new e;this.ctx=t,this.master=t.createGain(),this.master.gain.value=+!!this.enabled,this.requested.master=this.enabled?this.volume:0,this.master.connect(t.destination),this.sfxBus=t.createGain(),this.sfxBus.gain.value=this.volume,this.sfxBus.connect(this.master),this.musicBus_=t.createGain(),this.musicBus_.gain.value=this.musicSlider,this.musicBus_.connect(this.master),this.sfx.attach(t,this.sfxBus),this.filter=t.createBiquadFilter(),this.filter.type=`lowpass`,this.filter.frequency.value=260,this.filter.Q.value=.7,this.filter.connect(this.sfxBus),this.ambientGain=t.createGain(),this.ambientGain.gain.value=0,this.musicGain=t.createGain(),this.musicGain.gain.value=q.audio.musicVolume,this.musicGain.connect(this.filter),this.ambientGain.connect(this.musicGain);let n=Math.floor(t.sampleRate*2),r=t.createBuffer(1,n,t.sampleRate),i=r.getChannelData(0),a=0;for(let e=0;e<n;e++)a=a*.94+(Math.random()*2-1)*.06,i[e]=a*3.2;this.noise=t.createBufferSource(),this.noise.buffer=r,this.noise.loop=!0,this.noiseGain=t.createGain(),this.noiseGain.gain.value=.5,this.noise.connect(this.noiseGain),this.noiseGain.connect(this.ambientGain),this.noise.start(),this.lfo=t.createOscillator(),this.lfo.frequency.value=.08,this.lfoGain=t.createGain(),this.lfoGain.gain.value=.22,this.lfo.connect(this.lfoGain),this.lfoGain.connect(this.noiseGain.gain),this.lfo.start()}getMusicVolume(){return q.audio.musicVolume}setMusicVolume(e){let t=Math.max(0,Math.min(1,e));q.audio.musicVolume=t,this.musicGain&&this.ctx&&this.musicGain.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}setAmbient(e){if(!this.ctx||!this.filter||!this.ambientGain||!this.noiseGain)return;let t=Math.min(1,Math.max(0,e)),n=this.ctx.currentTime;this.filter.frequency.setTargetAtTime(300+t*1400,n,.4),this.ambientGain.gain.setTargetAtTime(t*.62,n,.5),this.noiseGain.gain.setTargetAtTime(t*.9,n,.5),this.requested.ambient=t*.62,this.requested.noise=t*.9}setDepth(e,t,n=!0){if(this.depthTrace.push({depth:+e.toFixed(1),audible:n}),this.depthTrace.length>24&&this.depthTrace.shift(),!n&&e<2&&this.silencedAtSurfaceCount++,!this.ctx||!this.filter||!this.ambientGain||!this.noiseGain)return;let r=Math.min(1,Math.max(0,1-e/Math.max(1,t))),i=this.ctx.currentTime,a=220+r*r*2400,o=n?.16+r*.5:0,s=n?.42+r*.5:0;this.filter.frequency.setTargetAtTime(a,i,.4),this.ambientGain.gain.setTargetAtTime(o,i,.5),this.noiseGain.gain.setTargetAtTime(s,i,.5),this.requested.cutoff=a,this.requested.ambient=o,this.requested.noise=s}play(e,t=.5,n=0,r=1){this.ctx&&this.sfxBus&&this.enabled&&this.sfx.play(e,t,n,r)}sfxProbe(){return this.sfx.probe()}tick(e){this.now+=e}debugLevels(){return{...this.requested,music:q.audio.musicVolume}}};function ch(){return{rage:0,safeSeconds:q.angry.rage.decayDelaySeconds}}function lh(){return q.angry.rage.perHit}function uh(e,t){e.rage=Math.min(q.angry.rage.max,e.rage+Math.max(0,t)),e.safeSeconds=0}function dh(e,t){let n=Math.min(e.rage,Math.max(0,t));return e.rage-=n,n}function fh(e,t,n,r=1){if(n){e.safeSeconds=0;return}e.safeSeconds+=t,!(e.safeSeconds<q.angry.rage.decayDelaySeconds)&&(e.rage=Math.max(0,e.rage-q.angry.rage.decayPerSecond*r*t))}function ph(e){let t=q.angry.appearance,n=0;for(let r=1;r<t.length;r++)e>=t[r].minRage&&(n=r);return n}function mh(e){return q.angry.appearance[ph(e)]}function hh(e){return mh(e).name}function gh(e){return mh(e).hudColor}function _h(){return q.angry.look}function vh(e){return Math.min(1,Math.max(0,e/Math.max(1e-6,q.angry.rage.max)))}function yh(e){let t=q.volume.healthBands,n=t[0]?.volume??q.volume.max;for(let r of t)e>=r.minRatio&&(n=r.volume);return n}function bh(e){return Sl.bubbleLaneRatio*(.82+.18*e)}function xh(e){return(e/Sl.bubbleLaneRatio)**2}function Sh(e){return Math.sqrt(Math.max(0,e))*Sl.bubbleLaneRatio}function Ch(e,t){let n=Sh(e),r=bh(t),i=Math.max(1e-4,n/Math.max(1e-4,r))**+Sl.riseSpeedExponent;return Math.min(Sl.bubbleRiseMax,Math.max(Sl.bubbleRiseMin,i))}function wh(e,t){return 1-Ch(e,t)}function Th(){return q.stages.speedMultiplier.length}function Eh(e){return e>=Th()?null:e===1?q.stages.absorbToStage2:e===2?q.stages.absorbToStage3:null}function Dh(e){let t=q.stages.speedMultiplier[Math.max(0,Math.min(Th()-1,e-1))]??1;return Math.max(q.stages.minSpeedMultiplier,t)}function Oh(){return{stage:1,absorbedInStage:0,neededForNext:Eh(1),speedMultiplier:Dh(1)}}function kh(e){let t=q.stages.appearance,n=t[Math.min(t.length-1,Math.max(0,e-1))];if(!n)throw Error(`stages.appearance has no entry for stage ${e}`);return n}function Ah(e){return kh(e).name}function jh(e){return kh(e).radius}function Mh(e,t){return bh(t)*jh(e)}function Nh(e){let t=Eh(e.stage);return t===null?(e.absorbedInStage=Math.min(e.absorbedInStage+1,9999),!1):(e.absorbedInStage+=1,e.absorbedInStage<t?!1:(e.stage+=1,e.absorbedInStage=0,e.neededForNext=Eh(e.stage),e.speedMultiplier=Dh(e.stage),!0))}function Ph(e){return e.stage<=1?!1:(--e.stage,e.absorbedInStage=0,e.neededForNext=Eh(e.stage),e.speedMultiplier=Dh(e.stage),!0)}function Fh(e,t,n){if(e.look===`rage`){let e=mh(n),t=_h();return{radius:t.radius,inner:t.inner,innerAlpha:t.innerAlpha,rim:e.rim,rimAlpha:t.rimAlpha,rimWidthRatio:t.rimWidthRatio,glow:e.glow,glowInnerAlpha:t.glowInnerAlpha,glowInnerRadiusRatio:t.glowInnerRadiusRatio,innerRing:t.innerRing,innerRingAlpha:t.innerRingAlpha,innerRingWidthRatio:t.innerRingWidthRatio,sheen:e.sheen,sheenAlpha:t.sheenAlpha,specular:e.specular,specularAlpha:t.specularAlpha,hudColor:e.hudColor,name:e.name,shake:e.shake,swell:e.swell}}return{...kh(t),shake:0,swell:0}}function Ih(e,t){return e.swell<=0?1:1+e.swell*(.5+.5*Math.sin(t*Math.PI*4))}function Lh(e,t){return e.shake<=0?0:e.shake*(Math.sin(t*37)+.6*Math.sin(t*61))}function Rh(e,t,n){return e.look===`rage`?gh(n):q.stages.appearance[Math.min(t-1,q.stages.appearance.length-1)]?.hudColor??16777215}var zh={id:`base`,name:`小气泡`,tagline:`什么都不加 —— 枪、成长、操作，全靠这一局自己挣`,controls:[],look:`growthStage`,swallowsHazards:!1,firesBullets:!0,resource:null,hitsToPop:null,growsByAbsorbing:!1},Bh=`原样开局`,Vh=[{id:`devour`,name:`吞噬`,title:`食物链反转`,blurb:`吃掉一切，越大越强 —— 代价是越来越难躲`,controls:[`suction`],look:`growthStage`,swallowsHazards:!0,growsByAbsorbing:!0,resource:null},{id:`boil`,name:`沸腾`,title:`以怒为刃`,blurb:`越挨打越烫 —— 满怒自动炸开，靠近你的人自己烧起来`,controls:[],look:`rage`,swallowsHazards:!1,growsByAbsorbing:!1,resource:{label:`怒气`}}];function Hh(e){return Vh.find(t=>t.id===e)}function Uh(e){return{...zh,id:e.id,name:e.name,tagline:e.blurb,controls:e.controls,look:e.look,swallowsHazards:e.swallowsHazards,growsByAbsorbing:e.growsByAbsorbing,resource:e.resource}}function Wh(){return zh}function Gh(e,t){return e.controls.includes(t)}function Kh(e,t){return e.controls.includes(t)}var qh=`1.5.58`,Jh=`8b68825`;function Yh(){return`v${qh} · ${Jh}`}function Xh(e){return{build:{version:qh,hash:Jh,dirty:!1,label:Yh()},frames:e.frameCount,elapsed:e.elapsed,intro:e.phaseTimer,lastDelta:e.lastDelta,nominalSeconds:e.nominalSeconds,level:{id:$.id,name:$.name,scrollLength:$.scrollLength,scrollSpeed:$.scrollSpeed,driftSpeed:$.driftSpeed,scrolled:+e.scrolled.toFixed(2),entriesEmitted:e.timelineEmitted,entriesTotal:hm.length,blocks:_m().length,arrivals:{...e.spawnedBySide},installed:hm!==$.entries,ladder:e.progress.entries(),cleared:[...e.progress.cleared],threatPerScreen:bm($)},playerVx:+e.player.vx.toFixed(4),playerVy:+e.player.vy.toFixed(2),lateral:e.lateral,laneWidthMeters:e.camera.viewport.laneWidthMeters,visibleDepthMeters:e.camera.viewport.visibleDepthMeters,gameSeconds:e.elapsed,hazards:{active:e.hazards.hazards.length,leaving:e.hazards.hazards.filter(e=>e.flee).length,charges:e.hazards.charges,byKind:e.hazards.hazards.reduce((e,t)=>(e[t.kind]=(e[t.kind]??0)+1,e),{}),comedyBeats:e.comedyBeats,lastBeat:e.lastComedyBeat,grabs:e.hazards.grabs,eaten:e.hazards.eaten,fled:e.hazards.fled,damaged:e.hazards.damaged},suction:{held:e.suctionUp,radiusFraction:Au(e.player.volume),moveFactor:e.player.suctionMoveFactor},bullets:{inFlight:e.bullets.bullets.length,fired:e.bullets.fired,hits:e.bullets.hits,armed:e.bubbleType.firesBullets,gunStreams:e.gunStreams},paralysis:{remaining:+e.player.paralysisSeconds.toFixed(3),inverted:e.player.paralysed},obstacles:{active:e.obstacles.count,byKind:e.obstacles.obstacles.reduce((e,t)=>(e[t.kind]=(e[t.kind]??0)+1,e),{}),broken:e.obstacles.broken,ramThreshold:q.obstacles.ramVolumeThreshold,minGap:q.obstacles.minGapFraction},trashDrain:+e.trashDrain.toFixed(3),maxGripSeconds:+e.hazards.hazards.reduce((e,t)=>Math.max(e,t.gripSeconds),0).toFixed(2),slow:{remaining:+e.player.slowRemaining.toFixed(3),factor:e.player.slowFactor,impulseVy:+e.player.impulseVy.toFixed(2)},emergence:{fishSplits:e.hazards.splits,bubblesEatenByFish:e.hazards.bubblesEaten,fishCount:e.hazards.hazards.filter(e=>e.kind===`fish`).length,perceptionRadiusMeters:+e.hazards.perceptionRadius(e.player.volume).toFixed(1)},audio:{muted:e.audioMuted,running:sh.isRunning},ending:{surfaced:e.surfaced,splash:+e.splash.toFixed(3),bestClimbed:Math.round(e.bestClimbed),bestVolume:+e.bestVolume.toFixed(2),bestScore:e.bestScore},score:{value:e.score.value,best:e.bestScore,byEvent:{...e.score.ledger},popups:e.popups.count},mutation:{value:+e.xp.value.toFixed(1),need:e.xp.need,level:e.xp.level,pending:e.xp.pending,grazes:e.hazards.grazes,ledger:{...e.xp.ledger}},damagePopups:e.damagePopups.count,enemyBullets:{inFlight:e.enemyBullets.count,fired:e.enemyBullets.fired,hits:e.enemyBullets.hits},stage:{stage:e.stage.stage,name:Ah(e.stage.stage),absorbedInStage:e.stage.absorbedInStage,grows:e.bubbleType.growsByAbsorbing,neededForNext:e.stage.neededForNext,speedMultiplier:e.stage.speedMultiplier,appearance:Fh(e.bubbleType,e.stage.stage,e.rage.rage),radiusFraction:Mh(e.stage.stage,e.player.volume)},bubbleType:{id:e.bubbleType.id,name:e.bubbleType.name,controls:[...e.bubbleType.controls],hasSuction:Gh(e.bubbleType,`suction`),hasBurst:Gh(e.bubbleType,`burst`),swallowsHazards:e.bubbleType.swallowsHazards,hitsToPop:e.bubbleType.hitsToPop},route:e.route,rage:{value:+e.rage.rage.toFixed(2),fraction:+vh(e.rage.rage).toFixed(3),safeSeconds:+e.rage.safeSeconds.toFixed(2),stageName:hh(e.rage.rage),onSlam:e.onSlam,slams:e.slams,bursts:e.bursts,burstRadiusMeters:+(e.camera.viewport.laneWidthMeters*e.burstRadiusRatio).toFixed(1),waveAlive:e.burst!==null,lastBurstKills:e.burst?.kills??0,lastBurstPushes:e.burst?.pushes??0,plates:e.armourPlates,plateSeconds:+e.armourSeconds.toFixed(2),auraSeconds:+e.auraSeconds.toFixed(2)},phase:e.phase,volume:e.player.volume,hitsSurvived:e.bubbleType.hitsToPop??Math.floor(e.healthView.current/Zh()),health:e.healthView,defense:e.defense,invulnerable:e.invulnerable,bubbles:e.field.bubbles.length,lastEaten:e.lastEaten,stats:{...e.stats},report:{fps:+e.fps.toFixed(1),lastDeltaMs:+(e.lastDelta*1e3).toFixed(2),frames:e.frameCount,bubbles:e.field.bubbles.length,specks:e.field.specks.length,hazards:e.hazards.hazards.length}}}function Zh(){return q.hazards.contactDamage.fish??20}var Qh=class e{constructor(){J(this,`screenY`,.5),J(this,`x`,xl),J(this,`y`,0),J(this,`vx`,0),J(this,`vy`,0),J(this,`volume`,1),J(this,`debugUpdates`,0),J(this,`debugLastDt`,0),J(this,`debugSteerMultiplier`,1),J(this,`tuning`,Sl),J(this,`slowRemaining`,0),J(this,`slowFactor`,1),J(this,`impulseVy`,0),J(this,`impulseVx`,0),J(this,`stageSpeedMultiplier`,1),J(this,`suctionMoveFactor`,1),J(this,`paralysisSeconds`,0)}reset(){this.screenY=.5,this.y=0,this.x=xl,this.vx=0,this.vy=0,this.volume=1,this.slowRemaining=0,this.slowFactor=1,this.impulseVy=0,this.impulseVx=0,this.paralysisSeconds=0}depth(e){return e-this.y}screenOffsetMetres(e){return(this.screenY-.5)*e}worldYFor(e,t){return e+this.screenOffsetMetres(t)}syncToCamera(e,t){this.y=this.worldYFor(e,t)}clampToScreen(t,n){if(n<=0)return;let r=(this.y-t)/n+.5;this.screenY=Math.min(Math.max(r,e.SCREEN_Y_MIN),e.SCREEN_Y_MAX),this.y=this.worldYFor(t,n)}get slowMultiplier(){return this.slowRemaining>0?this.slowFactor:1}get paralysed(){return this.paralysisSeconds>0}applyParalysis(e){e<=0||(this.paralysisSeconds=Math.max(this.paralysisSeconds,e))}applySlow(e,t){e<=0||(this.slowRemaining=Math.max(this.slowRemaining,e),this.slowFactor=this.slowRemaining>0?Math.min(this.slowFactor===1?t:this.slowFactor,t):t)}update(t,n,r){if(this.debugUpdates++,this.debugLastDt=n,this.slowRemaining>0&&(this.slowRemaining=Math.max(0,this.slowRemaining-n),this.slowRemaining===0&&(this.slowFactor=1)),this.impulseVy!==0||this.impulseVx!==0){let e=Math.exp(-n/Sl.hazardLaunchDecaySeconds);this.impulseVy*=e,this.impulseVx*=e,Math.abs(this.impulseVy)<1e-4&&(this.impulseVy=0),Math.abs(this.impulseVx)<.005&&(this.impulseVx=0)}this.paralysisSeconds>0&&(this.paralysisSeconds=Math.max(0,this.paralysisSeconds-n));let i=Math.max(0,this.stageSpeedMultiplier)*Math.max(0,this.suctionMoveFactor);this.debugSteerMultiplier=i;let a=this.paralysisSeconds>0,o=a?-t.axisX:t.axisX,s=a&&q.hazards.eel.invertVertical?-t.axisY:t.axisY;o===0?(this.vx-=this.vx*Math.min(r.damping*n,1),Math.abs(this.vx)<r.stopSpeed&&(this.vx=0)):this.vx=o*r.keyboardSpeed*i*this.slowMultiplier,this.x+=this.vx*n;let c=r.keyboardSpeed*Sl.verticalSpeedScale*i;this.vy=s*c*this.slowMultiplier,this.screenY+=this.vy*n;let l=t.consumeDrag(),u=q.movement.drag.sensitivity*(q.movement.drag.penaltiesApply?i:1)*this.slowMultiplier,d=a?-l.x:l.x,f=a&&q.hazards.eel.invertVertical?-l.y:l.y;this.x+=d*u,this.screenY+=f*u,this.screenY+=this.impulseVy*n,this.x+=this.impulseVx*n,this.x=Math.min(Math.max(this.x,.006),.994),this.screenY=Math.min(Math.max(this.screenY,e.SCREEN_Y_MIN),e.SCREEN_Y_MAX)}};J(Qh,`SCREEN_Y_MIN`,.12),J(Qh,`SCREEN_Y_MAX`,.94);var $h=`tgba.progress.v1`;function eg(){return{cleared:[]}}function tg(){let e=eg(),t=null;try{t=localStorage.getItem($h)}catch{return e}if(!t)return e;try{let n=JSON.parse(t);if(!n||typeof n!=`object`)return e;let r=new Set(sm.map(e=>e.id));return{cleared:Array.isArray(n.cleared)?n.cleared.filter(e=>typeof e==`string`&&r.has(e)):[]}}catch{return e}}function ng(e){try{localStorage.setItem($h,JSON.stringify(e))}catch{}}function rg(e,t){if(e<=0)return!0;let n=sm[e-1];return n?t.cleared.includes(n.id):!1}function ig(e){return sm.filter((t,n)=>rg(n,e)).map(e=>e.id)}function ag(e,t){return e.includes(t)}var og=class{constructor(){J(this,`state`,void 0),J(this,`onChange`,()=>{}),this.state=tg(),mm(fm)}get cleared(){return this.state.cleared}entries(){return sm.map((e,t)=>({id:e.id,name:e.name,locked:!rg(t,this.state),selected:e.id===$.id}))}select(e){return pm(e)<0?!1:(mm(e),this.onChange(),!0)}clear(e){if(this.state.cleared.includes(e)||pm(e)<0)return null;let t=ig(this.state);this.state={...this.state,cleared:[...this.state.cleared,e]},ng(this.state);let n=ig(this.state).find(e=>!t.includes(e));return this.onChange(),n??null}reset(){this.state=eg(),mm(fm),ng(this.state),this.onChange()}},sg=class e{constructor(){J(this,`bubbles`,[]),J(this,`specks`,[]),J(this,`targetBubbles`,32),J(this,`targetSpecks`,130),J(this,`timelineCursor`,0),J(this,`pending`,[]),J(this,`emittedCount`,0),J(this,`playerVolume`,1),J(this,`scrollSpeed`,25),J(this,`nextId`,1)}reset(){this.bubbles=[],this.specks=[],this.timelineCursor=0,this.pending=[],this.emittedCount=0}addTestBubble(e){let t={...e,id:this.nextId++};return this.bubbles.push(t),t}placeTimeline(e,t,n){for(;this.timelineCursor<e.length;){let r=e[this.timelineCursor];if(!r||r.at>t)break;this.timelineCursor++,this.pending.push({entry:r,worldY:n})}}takePending(){let e=this.pending;return this.pending=[],this.emittedCount+=e.length,e}get timelineExhausted(){return this.timelineCursor>0&&this.pending.length===0}get debugTimeline(){return{cursor:this.timelineCursor,pending:this.pending.length,emitted:this.emittedCount}}update(e,t,n,r,i,a,o=null,s=1){this.scrollSpeed=Math.max(.001,a),this.playerVolume=i,o&&this.applySuction(e,t,o.x,o.y,i,s),this.advance(e),this.advanceParallax(e,this.scrollSpeed),this.recycle(n,r),this.topUpSpecks(t,n,r)}applySuction(e,t,n,r,i,a){let o=t*Au(i)*Math.max(0,a);if(o<=0)return;let s=o*o;for(let a of this.bubbles){let o=n-a.x,c=r-a.y,l=o*o+c*c;if(l>s||l<1e-6)continue;let u=Math.sqrt(l),d=t*Mu(a.volume,i),f=Math.min(d*e,u);a.x+=o/u*f,a.y+=c/u*f}}solveBubbleVelocity(e,t){return wh(e,t)*this.scrollSpeed}get cruiseAscentSpeed(){return this.scrollSpeed}advance(e){for(let t of this.bubbles)t.held||(t.vy=this.solveBubbleVelocity(t.volume,this.playerVolume),t.y-=t.vy*e,t.phase+=e*(1.6-t.wobble)*2);for(let t of this.specks)t.phase+=e*.4}advanceParallax(e,t){for(let n of this.specks)n.drift!==0&&(n.y-=n.drift*t*e)}recycle(t,n){let r=n-t;this.bubbles=this.bubbles.filter(i=>i.y>t-r*e.CULL_BELOW_FRACTION&&i.y<n+r*e.CULL_ABOVE_FRACTION),this.specks=this.specks.filter(e=>e.y>t-r*.05&&e.y<n+r*.05)}topUpSpecks(e,t,n){for(;this.specks.length<this.targetSpecks;)this.specks.push(this.spawnSpeck(e,t,n,4))}bubbleFromEntry(e,t,n){let r=e.size??.5,i=n*r,a=xh(i);return{id:this.nextId++,x:i+e.x*Math.max(.01,t-i*2),y:e.at,vy:wh(a,this.playerVolume)*this.scrollSpeed,radius:i,volume:a,sizeRatio:r,phase:Math.random()*Math.PI*2,wobble:Math.max(Sl.bubbleWobbleMin,Math.min(Sl.bubbleWobbleMax,.3/Math.max(.2,r)))}}spawnSpeck(t,n,r,i){let a=Math.random()<e.NEAR_SPECK_FRACTION;return{x:Math.random()*t,y:n+Math.random()*(r-n+i),r:a?t*(.0022+Math.random()*.0036):t*(4e-4+Math.random()*.0011),phase:Math.random()*Math.PI*2,drift:a?1.5+Math.random()*2.5:-.15-Math.random()*.2}}};J(sg,`CULL_ABOVE_FRACTION`,.3),J(sg,`CULL_BELOW_FRACTION`,.35),J(sg,`NEAR_SPECK_FRACTION`,.4);var cg=class{constructor(){J(this,`counts`,{drivenOff:0,absorb:0,eaten:0,boss:0}),J(this,`total`,0)}get value(){return this.total}get ledger(){return this.counts}award(e,t=1){if(t<=0)return 0;let n=(q.score[e]??0)*t;return n<=0?0:(this.total+=n,this.counts[e]+=t,n)}reset(){this.total=0,this.counts={drivenOff:0,absorb:0,eaten:0,boss:0}}},lg=class{constructor(){J(this,`counts`,{absorb:0,drivenOff:0,eaten:0,graze:0,bulletGraze:0,pointBlank:0,defuse:0,boss:0}),J(this,`towards`,0),J(this,`taken`,0),J(this,`picked`,0),J(this,`banked`,0)}get value(){return this.towards}get level(){return this.picked}get pending(){return this.banked}get need(){let{first:e,growth:t}=q.mutation;return Math.round(e*t**this.taken)}get fraction(){return Math.min(1,this.towards/Math.max(1e-6,this.need))}get ledger(){return this.counts}tick(e){let t=q.mutation.autoPerSecond;t<=0||this.add(t*e)}gain(e,t=1){if(t<=0)return 0;let n=(q.mutation.gain[e]??0)*t;return n<=0?0:(this.counts[e]+=t,this.add(n),n)}consume(){this.banked>0&&(this.banked--,this.picked++)}reset(){this.counts={absorb:0,drivenOff:0,eaten:0,graze:0,bulletGraze:0,pointBlank:0,defuse:0,boss:0},this.towards=0,this.taken=0,this.picked=0,this.banked=0}add(e){for(this.towards+=e;this.towards>=this.need&&this.banked<4;)this.towards-=this.need,this.taken++,this.banked++}debugAddForTest(e){this.add(e)}};function ug(e,t,n,r){let i=0,a=0,o=0;for(;a<n&&o<600;)i+=e*t*bl,i-=i*Math.min(gl*bl,1),i>r&&(i=r),a+=i*bl,o+=bl;return o}function dg(e,t,n){let r=0,i=0;for(;i<n;)r+=e*t*bl,r-=r*Math.min(gl*bl,1),i+=bl;return r}function fg(e,t,n,r){for(let i=0;i<90;i++){let i=(n+r)/2;e(i)>t?n=i:r=i}return(n+r)/2}var pg=new Map;function mg(e){let t=pg.get(e);if(t)return t;let n=fg(t=>ug(t,1,e,1/0),vl,1,1e6),r=Math.ceil(dg(n,1,6)*1.08),i={accel:n,speedCap:r,damping:gl,boostSteerFactor:+fg(t=>ug(n,t,e,r),yl,.01,1).toFixed(4),stopSpeed:n/(1/bl)/4,crossingSeconds:vl,boostCrossingSeconds:yl,cruiseTopSpeed:dg(n,1,6),keyboardSpeed:1/_l,laneWidth:e};return pg.set(e,i),i}function hg(e,t,n){let r=e.filter(e=>e.kind===`zapper`&&!e.flee),i=r.map(e=>({h:e,d:Math.hypot(e.x-t.x,e.y-t.y)})).filter(e=>e.d<=n.rangeMeters).sort((e,t)=>e.d-t.d)[0],a=new Set;if(!i)return a;a.add(i.h.id);let o=[i.h];for(;o.length&&a.size<n.maxTargets;){let e=o.shift();for(let t of r)if(!a.has(t.id)&&!(Math.hypot(t.x-e.x,t.y-e.y)>n.jumpMeters)&&(a.add(t.id),o.push(t),a.size>=n.maxTargets))break}return a}function gg(e){return q.health.start+q.health.maxPerPick*Math.max(0,e)}function _g(e,t){let n=Math.max(0,e)*q.health.minDamageRatio;return Math.max(n,Math.max(0,e)-Math.max(0,t))}function vg(e,t,n){return Math.max(0,e-_g(t,n))}function yg(e,t){return Math.min(t,e+q.health.healPerPick)}function bg(e,t,n){return Math.min(t,e+Math.max(0,n))}function xg(e,t,n,r,i,a=!1){let o=e.from??`top`,s=o===`random`?a?`right`:`left`:o,c=e=>a?1-e:e,l=c(e.x)*r,u=t+(e.aboveMeters??0);if(s===`left`||s===`right`){let t=r*q.spawning.offscreenMarginRatio;l=s===`left`?-t:r+t,u=n.min+(e.depth??q.spawning.entryDepth)*(n.max-n.min)}else s===`bottom`&&(u=n.min-r*q.spawning.bottomMarginRatio);let d=e.kind===`vent`?e.side:void 0,f=e.kind===`vent`?d===`random`||d===void 0?a?`right`:`left`:d:null;f&&(l=Ru(f,r)),e.kind===`fallcrate`&&(l=r*(Math.floor(Math.random()*3)*2+1)/6,u=n.max);let p=s===`top`?null:{from:s,speed:e.enterSpeed??q.spawning.enterSpeedMps},m={kind:e.kind,from:s,x:+l.toFixed(1),worldY:+u.toFixed(1),visibleTop:+n.max.toFixed(1),visibleBottom:+n.min.toFixed(1)};if(e.kind===`bubble`)return i.field.bubbles.push(i.field.bubbleFromEntry({...e,x:c(e.x),at:u},r,i.playerRadiusFraction)),m;if(mp(e.kind))return i.obstacles.spawn(e.kind,l,u,s===`left`||s===`right`?{speed:e.enterSpeed??q.spawning.enterSpeedMps,targetX:c(e.x)*r}:void 0),m;let h=e.path?$.paths?.[e.path]:void 0,g=h?{seconds:h.seconds,points:a?h.points.map(e=>({x:1-e.x,y:e.y})):h.points}:void 0;if(e.school!==void 0&&g&&e.layer===`back`){let t=i.hazards.back.place(e.school,g,u,r,n.max-n.min,e.variety??0,e.distance??0,e.schoolSize??1,X.fish.radius);return{...m,x:+t.x.toFixed(1),worldY:+t.y.toFixed(1)}}if(e.school!==void 0&&g){let t=i.hazards.joinSchool(e.school,g,u,r,n.max-n.min),a=Cu(t,r,e.schoolSize??1),o=Math.abs(t.dirX)>.05?Math.sign(t.dirX):0,s=i.hazards.spawnAt(e.kind,a.x,a.y,{boid:{school:e.school,...a.boid},scale:q.hazards.boids.scale,...e.aboveMeters===void 0?{}:{aboveMeters:e.aboveMeters},...e.variety===void 0?{}:{variety:e.variety}});return s.heading=o,i.hazards.hazards.push(s),{...m,x:+a.x.toFixed(1),worldY:+a.y.toFixed(1)}}let _=g?{points:g.points,seconds:g.seconds,elapsed:-(e.pathDelaySeconds??0),startX:l,startY:u}:null,v={};p&&(v.entry=p),_&&(v.path=_),e.aboveMeters!==void 0&&(v.aboveMeters=e.aboveMeters),e.variety!==void 0&&(v.variety=e.variety),f&&(v.side=f,e.aim!==void 0&&(v.aim=e.aim),e.startDelaySeconds!==void 0&&(v.startDelaySeconds=e.startDelaySeconds));let y=p?l:Math.max(0,Math.min(r,l));return i.hazards.hazards.push(i.hazards.spawnAt(e.kind,y,u,v)),m}function Sg(e,t,n=.5,r=0){e.push({kind:`sound`,event:t,intensity:n,pan:r})}function Cg(e,t,n,r){e.push({kind:`scorePopup`,x:t,y:n,points:r})}function wg(e,t,n,r){e.push({kind:`damagePopup`,x:t,y:n,amount:r})}function Tg(e,t,n){e.push({kind:`graze`,x:t,y:n})}function Eg(e,t,n,r){e.push({kind:`callout`,x:t,y:n,text:r})}function Dg(e,t,n,r){e.push({kind:`blast`,x:t,y:n,radius:r})}function Og(e){e.push({kind:`splash`})}var kg=1.5,Ag=class{constructor(){J(this,`events`,[]),J(this,`phase`,`boot`),J(this,`phaseTimer`,0),J(this,`pickProtected`,!1),J(this,`laneWidth`,0),J(this,`player`,new Qh),J(this,`elapsedTotal`,0),J(this,`progress`,new og),J(this,`field`,new sg),J(this,`scrolled`,0),J(this,`cameraRise`,0),J(this,`paceMps`,0),J(this,`bossPointBlankRest`,0),J(this,`timelineEmitted`,0),J(this,`spawnLog`,[]),J(this,`spawnedBySide`,{top:0,left:0,right:0,bottom:0}),J(this,`elapsed`,0),J(this,`nominalSeconds`,0),J(this,`lateral`,mg(1)),J(this,`bubbleType`,Wh()),J(this,`route`,null),J(this,`rage`,ch()),J(this,`armourPlates`,0),J(this,`armourSeconds`,0),J(this,`armourSecondsPerPlate`,q.angry.armour.secondsPerPlate),J(this,`armourMax`,q.angry.armour.max),J(this,`armourVulnerableMultiplier`,q.angry.armour.vulnerableMultiplier),J(this,`auraDamagePerTick`,q.angry.aura.damagePerTick),J(this,`auraSeconds`,0),J(this,`slams`,0),J(this,`burst`,null),J(this,`bursts`,0),J(this,`stage`,Oh()),J(this,`invulnerable`,0),J(this,`stats`,{absorbed:0,hits:0,maxVolume:1,ended:0,newRecord:!1}),J(this,`lastEaten`,0),J(this,`obstacles`,new Tp),J(this,`bullets`,new Wm),J(this,`enemyBullets`,new rh),J(this,`gunStreams`,1),J(this,`rateTier`,1),J(this,`xp`,new lg),J(this,`mutations`,{}),J(this,`picks`,[]),J(this,`bulletDamageMultiplier`,1),J(this,`rageGainMultiplier`,1),J(this,`suctionBonus`,1),J(this,`eatInvulnBonusSeconds`,0),J(this,`eatTierBonus`,0),J(this,`bulletSpeedMultiplier`,1),J(this,`bulletRadiusMultiplier`,1),J(this,`bulletLifeMultiplier`,1),J(this,`gunPellets`,1),J(this,`gunSpreadDegrees`,0),J(this,`gunRateScale`,1),J(this,`bulletCloseRangeMeters`,0),J(this,`bulletCloseDamageRate`,0),J(this,`bulletKnockbackScale`,1),J(this,`bulletSizeDamageRate`,0),J(this,`bulletSpeedDamageRate`,0),J(this,`bulletHomingChance`,0),J(this,`bulletRandom`,Math.random),J(this,`levelRandom`,Math.random),J(this,`blockFlips`,new Map),J(this,`burstRadiusMultiplier`,1),J(this,`rageDecayMultiplier`,1),J(this,`bossSpawned`,!1),J(this,`infiniteHealth`,!1),J(this,`pendingLevel`,null),J(this,`ascendMetres`,0),J(this,`runComplete`,!1),J(this,`levelsClearedInRun`,0),J(this,`charge`,0),J(this,`chargeBurst`,0),J(this,`chargeBurstRadius`,0),J(this,`trashDrain`,0),J(this,`comedyBeats`,0),J(this,`lastComedyBeat`,null),J(this,`hazards`,new zd),J(this,`bestClimbed`,0),J(this,`bestVolume`,0),J(this,`bestScore`,0),J(this,`score`,new cg),J(this,`surfaced`,!1),J(this,`health`,0),J(this,`healthMax`,0),J(this,`defense`,0),J(this,`regenFraction`,0)}get hasArmour(){return this.bubbleType.look===`rage`&&this.armourPlates>0}suctionUp(e){return Kh(this.bubbleType,`suction`)?e.sucking:!1}burstRadiusRatio(){let e=q.angry.burst,t=vh(this.rage.rage);return(e.radiusBaseRatio+(e.radiusMaxRatio-e.radiusBaseRatio)*t)*this.burstRadiusMultiplier}canSwallow(e){return this.bubbleType.swallowsHazards&&mu(e,this.player.volume,this.eatTierBonus)}forgetForm(){this.route=null,this.bubbleType=Wh()}pickRoute(e){let t=Hh(e);return!t||this.route!==null?this.route:(this.route=t.id,this.bubbleType=Uh(t),this.applyHealthBand(),this.route)}get suctionRadiusFactor(){return this.suctionBonus}panAt(e){return this.laneWidth<=0?0:Math.max(-1,Math.min(1,e/this.laneWidth*2-1))}sound(e,t=.5,n=0){Sg(this.events,e,t,n)}scorePopup(e,t,n){Cg(this.events,e,t,n)}damagePopup(e,t,n){wg(this.events,e,t,n)}get healthView(){return{current:this.health,max:this.healthMax}}resetHealth(e=!1){this.healthMax=gg(this.mutations.maxHp??0),this.health=e?Math.min(this.health,this.healthMax):this.healthMax,this.regenFraction=0}regen(e){let t=Math.max(0,q.health.regenPerSecond);if(t<=0||this.health>=this.healthMax){this.regenFraction=0;return}this.regenFraction+=t*e;let n=Math.floor(this.regenFraction);n<=0||(this.regenFraction-=n,this.health=bg(this.health,this.healthMax,n))}applyHealthBand(){if(!this.bubbleType.growsByAbsorbing)return;let e=this.healthMax>0?this.health/this.healthMax:1;this.player.volume=yh(e)}takeHit(e,t=this.defense){if(!this.infiniteHealth&&!this.pickProtected){if(this.stats.hits++,this.sound(`player.hurt`,.5),this.invulnerable=Sl.invulnerableSeconds,this.health=this.bubbleType.hitsToPop===null?vg(this.health,e,t):0,this.health<=0){this.startBurst();return}this.bubbleType.look===`rage`&&uh(this.rage,lh()*this.rageGainMultiplier)}}updateBullets(e,t,n,r){this.bossPointBlankRest=Math.max(0,this.bossPointBlankRest-e);let i=t*Mh(this.stage.stage,this.player.volume),a=[],o=this.gunStreams;for(let e=0;e<o;e++){let n=(e-(o-1)/2)*q.bullets.upgradeSpreadRatio*t;a.push({x:this.player.x*t+n,y:this.player.y+i})}let s=this.bullets.update(e,{min:n,max:r,laneWidth:t,cameraRise:this.cameraRise,muzzles:a,armed:this.phase===`playing`&&this.bubbleType.firesBullets,perSecond:(q.bullets.rateTiers[Math.min(this.rateTier,q.bullets.rateTiers.length)-1]??0)*this.gunRateScale,pellets:this.gunPellets,spreadDegrees:this.gunSpreadDegrees,closeRangeMeters:this.bulletCloseRangeMeters,closeDamageRate:this.bulletCloseDamageRate,knockbackScale:this.bulletKnockbackScale,damage:q.bullets.damage*this.bulletDamageMultiplier,speedMultiplier:this.bulletSpeedMultiplier,radiusMultiplier:this.bulletRadiusMultiplier,lifeMultiplier:this.bulletLifeMultiplier,sizeDamageRate:this.bulletSizeDamageRate,speedDamageRate:this.bulletSpeedDamageRate,playerY:this.player.y,homingChance:this.bulletHomingChance,random:this.bulletRandom,hazards:this.hazards,obstacles:this.obstacles});if(s.fired>0&&this.sound(`gun.fire`,q.audio.bulletFireVolume),s.hits>0){let e=q.audio.bulletHitVolume;this.sound(`gun.hit`,s.drivenOff>0?Math.min(1,e*1.4):e)}for(let e of s.obstacleHits)e.broke&&this.sound(zc[e.kind]??`rage.slam`,1,this.panAt(e.x));let c=this.player.x*t,l=this.player.y,u=e=>{let n=q.mutation.pointBlankRadius;return e.halfW!==null&&e.halfH!==null?df(c,l,e.x,e.y,e.halfW*t,e.halfH*t)<=i*n:Math.hypot(e.x-c,e.y-l)<=(i+e.r)*n};if(s.drivenOff>0){let e=this.score.award(`drivenOff`,s.drivenOff);for(let t of s.driven)this.scorePopup(t.x,t.y,e/s.drivenOff);this.xp.gain(`drivenOff`,s.drivenOff);for(let e of s.driven){let n=Math.hypot(e.x-c,e.y-l);u(e)&&(this.xp.gain(`pointBlank`),Eg(this.events,e.x,e.y,`贴脸`)),e.kind===`bombfish`&&n>t*q.hazards.bombfish.blastRadiusRatio&&(this.xp.gain(`defuse`),Eg(this.events,e.x,e.y,`拆弹`))}}for(let e of s.struck)Pu(e.kind)&&(this.bossPointBlankRest>0||u(e)&&(this.bossPointBlankRest=q.mutation.bossPointBlankCooldownSeconds,this.xp.gain(`pointBlank`),Eg(this.events,e.x,e.y,`贴脸`)));for(let e of s.struck)this.damagePopup(e.x,e.y,e.amount)}updateEnemyBullets(e,t,n,r,i){let a=t*Mh(this.stage.stage,this.player.volume),o=this.phase===`playing`;if(o)for(let e of i)this.sound(`enemy.fire`,.25,this.panAt(e.x)),this.enemyBullets.fire(e.kind,e.x,e.y,this.player.x*t,this.player.y,t);let{landed:s,grazedAt:c}=this.enemyBullets.update(e,{min:n,max:r,laneWidth:t,cameraRise:this.cameraRise,playerX:this.player.x*t,playerY:this.player.y,playerRadius:a,invulnerable:this.invulnerable>0,blocks:(e,n,r)=>this.obstacles.blocks(e,n,r,t)});if(o&&s.length>0)for(let e of s){let t=Math.max(0,q.enemyBullets.shooters[e]?.damage??0);if(t>0&&(this.takeHit(t),this.phase!==`playing`))return;e===`eel`&&this.player.applyParalysis(q.hazards.eel.paralysisSeconds)}if(o)for(let e of c)this.xp.gain(`bulletGraze`),Eg(this.events,e.x,e.y,`擦`)}updateRage(e,t){if(this.bubbleType.look!==`rage`)return;this.burst&&(this.burst.seconds+=e,this.burst.seconds>=q.angry.burst.waveSeconds&&(this.burst=null));let n=this.hazards.hazards.some(e=>e.gripping);if(this.rage.rage>=q.angry.rage.max){this.useBurst(t);return}fh(this.rage,e,this.invulnerable>0||n,this.rageDecayMultiplier),this.armourPlates<this.armourMax&&(this.armourSeconds+=e,this.armourSeconds>=this.armourSecondsPerPlate&&(this.armourSeconds-=this.armourSecondsPerPlate,this.armourPlates++)),this.auraDamagePerTick>0&&q.angry.aura.tickSeconds>0&&(this.auraSeconds+=e,this.auraSeconds>=q.angry.aura.tickSeconds&&(this.auraSeconds-=q.angry.aura.tickSeconds,this.burnNearby(t))),this.rage.rage>=q.angry.rage.max&&this.useBurst(t)}burnNearby(e){let t=q.angry.aura,n=e*Mh(this.stage.stage,this.player.volume)*t.playerRadiusRadii,r=this.player.x*e,i=this.player.y;for(let t of this.hazards.hazards){let a=n+e*lf(t.kind,t.scale),o=t.x-r,s=t.y-i;o*o+s*s>a*a||this.hazards.hit(t,Ld(t,this.auraDamagePerTick),{x:t.x,y:t.y,knockScale:0})}}updateConductiveCharge(e,t){let n=q.hazards.charge;if(this.phase!==`playing`){this.chargeBurst=Math.max(0,this.chargeBurst-e);return}let r=!1;for(let e of this.hazards.hazards)if(!(e.kind!==`zapper`||e.flee)&&Math.hypot(e.x-this.player.x*t,e.y-this.player.y)<=n.nearMeters){r=!0;break}if(this.charge=r?Math.min(n.max,this.charge+n.perSecondNearZapper*e):Math.max(0,this.charge-n.decayPerSecond*e),this.chargeBurst=Math.max(0,this.chargeBurst-e),this.charge<n.chainAt)return;let i=this.player.x*t,a=this.player.y,o=hg(this.hazards.hazards,{x:i,y:a},{rangeMeters:n.chainRangeMeters,jumpMeters:n.chainJumpMeters,maxTargets:n.chainMaxTargets});if(o.size!==0){this.chargeBurstRadius=n.chainJumpMeters*.5,this.chargeBurst=n.burstSeconds,this.charge=0,this.sound(`chain.zap`);for(let e of this.hazards.hazards)o.has(e.id)&&(this.hazards.hit(e,n.chainDamage,{x:i,y:a}),this.scorePopup(e.x,e.y,this.score.award(`drivenOff`)),this.xp.gain(`drivenOff`));n.chainSelfDamage>0&&this.takeHit(n.chainSelfDamage,0)}}resolveHazards(e,t,n,r,i,a){let o=this.suctionUp(a)?{x:this.player.x*r,y:this.player.y,radiusFactor:this.suctionRadiusFactor}:null,s={min:t,max:n,laneWidth:r,playerX:this.player.x*r,playerY:this.player.y,playerRadiusFraction:Mh(this.stage.stage,this.player.volume),driftSpeed:$.driftSpeed,cameraRise:this.cameraRise,elapsed:this.elapsed,invulnerable:this.invulnerable>0,struggling:a.steering,playerVolume:this.player.volume,canSlam:this.hasArmour,canEat:e=>this.canSwallow(e),suction:o,bubbles:this.field.bubbles,eatenBubbleIds:[],splitCount:0},c=this.hazards.update(e,s);if(this.updateEnemyBullets(e,r,t,n,c.filter(e=>e.shot).map(e=>({kind:e.kind,x:e.shot.x,y:e.shot.y}))),this.phase===`playing`){for(let e of c)if(e.volley)for(let t of e.volley.dirs)this.enemyBullets.fire(e.kind,e.volley.x,e.volley.y,e.volley.x+t.x*100,e.volley.y+t.y*100,r)}for(let e of c){if(!e.spray)continue;let{fromX:t,fromY:n,targets:r,bow:a}=e.spray;for(let[e,o]of r.entries()){let r=this.makeHazard(i,`mineral`,t,n);r.charge={fromX:t,fromY:n,toX:o.x,toY:o.y,bow:(e%2==0?1:-1)*a*Math.hypot(o.x-t,o.y-n),elapsed:0,grazed:!1,hitPlayer:!1},this.hazards.hazards.push(r)}}if(s.eatenBubbleIds.length){let e=new Set(s.eatenBubbleIds);this.field.bubbles=this.field.bubbles.filter(t=>!e.has(t.id))}for(let t of c){if(t.cue){this.sound(t.cue.what===`fallcrateWarn`?`crate.warn`:`crate.drop`,.7,this.panAt(t.cue.x));continue}if(t.summonCrates){for(let e=0;e<3;e++){if(e===t.summonCrates.openColumn)continue;let n=t.summonCrates.laneWidth*(e*2+1)/6;this.hazards.hazards.push(this.hazards.spawnAt(`fallcrate`,n,t.summonCrates.topY))}continue}if(t.inkThrow){this.hazards.hazards.push(this.hazards.spawnAt(`ink`,t.inkThrow.toX,t.inkThrow.toY,{inkFrom:{x:t.inkThrow.fromX,y:t.inkThrow.fromY}}));continue}if(t.graze){this.xp.gain(`graze`),Tg(this.events,t.graze.x,t.graze.y),this.sound(`graze`,.5,this.panAt(t.graze.x));continue}if(t.pushDown&&(this.player.y=Math.max(0,this.player.y-t.pushDown)),t.charge&&(this.charge=Math.min(q.hazards.charge.max,this.charge+t.charge)),t.blast&&(Dg(this.events,t.blast.x,t.blast.y,t.blast.radius),this.sound(`bomb.blast`,.6,this.panAt(t.blast.x)),this.lastComedyBeat={what:t.kind,at:this.elapsed},(t.damage??0)>0&&(this.takeHit(t.damage??0),this.phase!==`playing`)))return;if(t.slammed){this.armourPlates=Math.max(0,this.armourPlates-1),this.slams++;let e=this.hazards.hazards.find(e=>e.id===t.slammed.id);e&&(this.hazards.hit(e,q.angry.armour.damage,{x:e.x,y:e.y,knockScale:1}),Id(e,q.angry.armour.vulnerableSeconds,this.armourVulnerableMultiplier)),this.sound(`rage.slam`,.7);continue}if(t.eaten){this.health=Math.min(this.healthMax,this.health+hu(t.kind)*q.volume.healthPerVolume),this.stats.absorbed++,this.scorePopup(this.player.x*r,this.player.y,this.score.award(`eaten`)),this.xp.gain(`eaten`),this.invulnerable=Math.max(this.invulnerable,q.consumption.eatInvulnerableSeconds+this.eatInvulnBonusSeconds),this.sound(`player.eat`);continue}if(t.damage&&this.takeHit(t.damage),t.slowSeconds&&t.slowFactor&&(this.player.applySlow(t.slowSeconds,t.slowFactor),t.kind!==`ink`&&this.sound(`player.slow`)),t.paralysisSeconds&&this.player.applyParalysis(t.paralysisSeconds),t.impulse){let e=t.impulse/Math.max(1,i.visibleDepthMeters)*q.hazards.crab.launchScreenBonus;this.player.impulseVy=Math.max(this.player.impulseVy,e),this.lastComedyBeat={what:`crab`,at:this.elapsed},this.sound(`crab.launch`)}if(t.kind===`rain`?this.sound(`rain.press`):t.kind===`foam`?this.sound(`foam.pop`):t.kind===`mineral`&&this.sound(`mineral.hit`),t.drainPerSecond){let t=Y.trashDrainPerHit;for(this.trashDrain+=Y.trashDrainPerSecond*e;this.trashDrain>=t;)this.trashDrain-=t,this.takeHit(t,0)}t.broke&&(this.comedyBeats++,this.lastComedyBeat={what:t.kind,at:this.elapsed})}}resolveContacts(e,t){let n=t.laneWidth,r=this.player.x*n,i=n*Mh(this.stage.stage,this.player.volume),a=0,o=this.obstacles.resolvePlayer(r,this.player.y,n,i,this.player.volume,this.invulnerable>0,e,this.hasArmour?{damage:q.angry.armour.obstacleDamage,breaksUnrammable:q.angry.armour.breaksUnrammable}:void 0);o.hit?.broke&&(this.lastComedyBeat={what:`crab`,at:this.elapsed},this.sound(zc[o.hit.kind]??`rage.slam`)),o.hit&&this.hasArmour&&(this.armourPlates--,this.slams++),o.blocked&&(o.hurt&&this.takeHit(q.obstacles.contactDamage),this.sound(Bc),this.player.impulseVy=-Math.max(this.player.impulseVy,.25)),o.dragging&&this.player.applySlow(q.obstacles.netDragSeconds,q.obstacles.netDrag),(o.hit||o.blocked)&&(this.invulnerable=Math.max(this.invulnerable,q.obstacles.collideInvulnerableSeconds));for(let e=this.field.bubbles.length-1;e>=0;e--){let t=this.field.bubbles[e];if(!t)continue;let o=n*t.radius,s=i+o,c=t.x-r,l=t.y-this.player.y;if(!(c*c+l*l>s*s)){if(i>=o*.92){if(this.bubbleType.growsByAbsorbing)this.health=Math.min(this.healthMax,this.health+t.volume*q.volume.healthPerVolume),Nh(this.stage)&&(this.player.stageSpeedMultiplier=this.stage.speedMultiplier,this.invulnerable=Math.max(this.invulnerable,q.stages.growInvulnerableSeconds),this.sound(`stage.grow`));else{let e=this.score.award(`absorb`);e>0&&this.scorePopup(t.x,t.y,e)}this.stats.absorbed++,this.xp.gain(`absorb`),a++,this.sound(`player.absorb`,Math.min(1,o/Math.max(1e-6,i))),this.field.bubbles.splice(e,1)}else this.invulnerable<=0&&(this.takeHit(q.consumption.bumpDamage),this.field.bubbles.splice(e,1))}}this.player.volume>this.stats.maxVolume&&(this.stats.maxVolume=this.player.volume),this.lastEaten=a}startBurst(){this.phase=`burst`,this.phaseTimer=kg,this.stats.ended++,this.recordBest(),this.sound(`player.pop`,.7),this.sound(`defeat.sting`)}useBurst(e){if(this.bubbleType.look!==`rage`)return;let t=q.angry.burst,n=e,r=n*this.burstRadiusRatio(),i=this.player.x*n,a=this.player.y,o=0,s=0,c=[];for(let e of this.hazards.hazards){let n=e.x-i,l=e.y-a;if(n*n+l*l>r*r){c.push(e);continue}if(t.hazardMode[e.kind]===`destroy`){o++;continue}Rd(e,n,l,t.knockbackMeters*t.pushImpact),s++,c.push(e)}this.hazards.hazards=c;for(let e of this.obstacles.obstacles){let n=e.x-i,o=e.y-a;n*n+o*o<=r*r&&this.obstacles.damage(e.id,t.obstacleDamage)}dh(this.rage,this.rage.rage),this.burst={radius:r,seconds:0,kills:o,pushes:s},this.bursts++,this.sound(`rage.burst`,.8)}recordBest(){let e=this.player.y;e>this.bestClimbed?(this.bestClimbed=e,this.bestVolume=Math.max(this.bestVolume,this.stats.maxVolume),this.stats.newRecord=!0):this.stats.newRecord=!1,this.bestVolume=Math.max(this.bestVolume,this.stats.maxVolume),this.bestScore=Math.max(this.bestScore,this.score.value)}makeHazard(e,t,n,r,i=null,a,o){let s=e.laneWidth,c=i?n:Math.max(0,Math.min(s,n)),l={};return a!==void 0&&(l.health=a),i!==null&&(l.entry=i),o!==void 0&&(l.path=o),this.hazards.spawnAt(t,c,r,l)}emitTimelineEntry(e,t,n,r){let i=xg(e,t,{min:r.min,max:r.max},n,{field:this.field,obstacles:this.obstacles,hazards:this.hazards,playerRadiusFraction:Mh(this.stage.stage,this.player.volume)},this.flipFor(e));this.spawnLog.push(i),this.spawnLog.length>12&&this.spawnLog.shift(),this.spawnedBySide[i.from]++}flipFor(e){if(e.group===void 0)return this.levelRandom()>=.5;let t=this.blockFlips.get(e.group);if(t!==void 0)return t;let n=this.levelRandom()>=.5;return this.blockFlips.set(e.group,n),n}clearBlockFlips(){this.blockFlips.clear()}},jg=class{constructor(e){J(this,`style`,void 0),J(this,`root`,new P),J(this,`live`,[]),J(this,`pool`,[]),J(this,`scale`,1),this.style=e,this.root.eventMode=`none`}layout(e){this.scale=Cm(e.width,e.height)}get count(){return this.live.length}get lastText(){return this.live[this.live.length-1]?.label.text??null}add(e,t,n,r){if(n<=0)return;let i=this.style;if(i.max<=0)return;this.live.length>=i.max&&this.retire(0);let a=this.pool.pop()??Tm(``,i.colour,i.size,i.weight);a.style.fontSize=i.size,a.style.fill=i.colour,a.style.fontWeight=i.weight,a.anchor.set(i.anchorX,i.anchorY),a.text=`${i.prefix}${Math.round(n)}`,a.visible=!0,a.alpha=i.alpha,this.root.addChild(a),this.live.push({label:a,x:r.toScreenX(e),y:r.toScreenY(t),age:0})}say(e,t,n,r){let i=this.style;if(i.max<=0)return;this.live.length>=i.max&&this.retire(0);let a=this.pool.pop()??Tm(``,i.colour,i.size,i.weight);a.style.fontSize=i.size,a.style.fill=i.colour,a.style.fontWeight=i.weight,a.anchor.set(i.anchorX,i.anchorY),a.text=n,a.visible=!0,a.alpha=i.alpha,this.root.addChild(a),this.live.push({label:a,x:r.toScreenX(e),y:r.toScreenY(t),age:0})}update(e){let t=this.style,n=t.risePx*this.scale;for(let r=this.live.length-1;r>=0;r--){let i=this.live[r];if(i.age+=e,i.age>=t.lifeSeconds){this.retire(r);continue}let a=i.age/t.lifeSeconds;i.label.scale.set(this.scale),i.label.x=i.x,i.label.y=i.y-n*a**t.riseEase;let o=a<=t.fadeFrom?0:(a-t.fadeFrom)/(1-t.fadeFrom);i.label.alpha=t.alpha*(1-o**t.fadeEase)}}clear(){for(;this.live.length;)this.retire(this.live.length-1)}retire(e){let t=this.live[e];t&&(this.live.splice(e,1),t.label.visible=!1,this.root.removeChild(t.label),this.pool.push(t.label))}};function Mg(e,t,n){let r=Math.max(.001,n)*t;return Math.max(0,Math.min(1,e/r,(t-e)/r))}var Ng=class{constructor(){J(this,`graphics`,new V),J(this,`motes`,[]),J(this,`width`,0),J(this,`height`,0)}seed(e,t){this.width=e,this.height=t,this.motes.length=0;let n=Math.max(0,Math.round(q.menu.water.motes.count));for(let e=0;e<n;e++)this.motes.push(this.born(Math.random()*t))}born(e){let t=q.menu.water.motes,n=e=>1-e/2+Math.random()*e;return{x:Math.random()*this.width,y:e,r:Math.max(.4,this.width*t.size*n(t.sizeVariance)),vy:this.height*t.speed*n(t.speedVariance),vx:(Math.random()-.5)*this.width*t.drift,lit:0}}update(e,t){for(let n of this.motes){if(n.y+=n.vy*e,n.x+=n.vx*e,n.y>this.height){Object.assign(n,this.born(0));continue}n.lit=t(n.x,n.y)}}draw(){let e=q.menu.water.motes,t=this.graphics;t.clear();for(let n of this.motes){let r=Mg(n.y,this.height,e.fadeEdge)*(e.baseAlpha+e.litAlpha*n.lit);r<=.002||t.circle(n.x,n.y,n.r).fill({color:e.colour,alpha:r})}}get lighting(){return this.motes.map(e=>e.lit)}get heights(){return this.motes.map(e=>e.y)}},Pg=[`气泡-1`,`气泡-2`,`气泡-3`,`气泡-4`,`气泡-5`,`气泡-6`,`气泡-7`,`气泡-8`,`气泡-9`,`气泡-10`,`气泡-11`,`气泡-12`],Fg=Math.max(1,...Pg.map(e=>Jl(e)?.width??0)),Ig=class{constructor(){J(this,`root`,new P),J(this,`textures`,[]),J(this,`bubbles`,[]),J(this,`vents`,[]),J(this,`height`,0),J(this,`width`,0),this.root.eventMode=`none`;for(let e of Pg)Gl(e).then(e=>{e&&this.textures.push(e)})}seed(e,t){let n=q.menu.water.bubbles;this.height=t,this.width=e;for(let e of this.bubbles)this.discard(e);this.bubbles.length=0,this.vents.length=0;let r=Math.max(1,Math.round(n.vents)),i=[];for(let e=0;e<r;e++)i.push(r===1?1:e/(r-1));for(let e=i.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[i[e],i[t]]=[i[t],i[e]]}for(let t=0;t<r;t++){let a=e/r;this.vents.push({x:(t+.5)*a+(Math.random()-.5)*a*.7,nextAt:Math.random()*Math.max(.001,n.everySeconds),depth:i[t]})}}spread(e){return 1-e/2+Math.random()*e}born(e,t,n){let r=q.menu.water.bubbles,i=new F;return i.anchor.set(.5,.5),i.tint=r.tint,i.visible=!1,this.root.addChild(i),{x0:t,x:t,y:n,sprite:i,picture:null,depth:e.depth,speed:this.height*r.speed*this.spread(r.speedJitter),sway:r.sway*this.spread(r.swayJitter),swaySeconds:r.swaySeconds*this.spread(r.swaySecondsJitter),age:0,phase:Math.random()*Math.PI*2}}discard(e){this.root.removeChild(e.sprite),e.sprite.destroy()}get texelScale(){return q.menu.water.bubbles.size*this.width/Fg}update(e,t){let n=q.menu.water.bubbles;this.width=t;for(let t of this.vents){if(t.nextAt-=e,t.nextAt>0)continue;t.nextAt+=n.everySeconds*this.spread(n.everyJitter);let r=Math.max(1,Math.round(Math.min(n.perStringMin,n.perStringMax))),i=Math.max(r,Math.round(Math.max(n.perStringMin,n.perStringMax))),a=r+Math.floor(Math.random()*(i-r+1));for(let e=0;e<a;e++)this.bubbles.push(this.born(t,t.x,-e*this.height*n.gap))}for(let r=this.bubbles.length-1;r>=0;r--){let i=this.bubbles[r];i.age+=e,i.y+=i.speed*(1+n.accel*i.age)*e,i.x=i.x0+Math.sin(i.age/Math.max(.001,i.swaySeconds)*Math.PI*2+i.phase)*i.sway*t,i.y>this.height&&(this.discard(i),this.bubbles.splice(r,1))}}draw(){let e=q.menu.water.bubbles,t=this.texelScale;for(let n of this.bubbles){if(!n.picture){if(!this.textures.length)continue;let e=this.textures[Math.floor(Math.random()*this.textures.length)];n.picture=e,n.sprite.texture=e}let r=Mg(n.y,this.height,e.fadeEdge)*(e.farAlpha+(e.nearAlpha-e.farAlpha)*n.depth);n.sprite.visible=r>.002,n.sprite.visible&&(n.sprite.position.set(n.x,n.y),n.sprite.scale.set(t,-t),n.sprite.alpha=r)}}get count(){return this.bubbles.length}get ventXs(){return this.vents.map(e=>e.x)}get ventDepths(){return this.vents.map(e=>e.depth)}},Lg=class{constructor(){J(this,`root`,new P),J(this,`textures`,[]),J(this,`spouts`,[]),J(this,`bubbles`,[]),J(this,`width`,0),J(this,`height`,0),J(this,`texelScale`,1),this.root.eventMode=`none`;for(let e of Pg)Gl(e).then(e=>{e&&this.textures.push(e)})}setSpouts(e){for(;this.spouts.length>e.length;)this.spouts.pop();e.forEach((e,t)=>{let n=this.spouts[t];if(n){n.x=e.x,n.y=e.y;return}let r=Math.max(.001,q.menu.uiBubbles.everySeconds);this.spouts.push({x:e.x,y:e.y,nextAt:Math.random()*r})})}setScreen(e,t){this.width=e,this.height=t,this.texelScale=q.menu.uiBubbles.size*e/Fg}spread(e){return 1-e/2+Math.random()*e}born(e){let t=q.menu.uiBubbles,n=new F;return n.anchor.set(.5,.5),n.tint=t.tint,n.visible=!1,this.root.addChild(n),{sprite:n,picture:null,x0:e.x,x:e.x,y:e.y,speed:this.height*t.speed*this.spread(t.speedJitter),age:0,sway:this.width*t.sway*this.spread(t.swayJitter),swaySeconds:t.swaySeconds*this.spread(t.swaySecondsJitter),phase:Math.random()*Math.PI*2}}update(e){let t=q.menu.uiBubbles;for(let n of this.spouts)n.nextAt-=e,!(n.nextAt>0)&&(n.nextAt+=t.everySeconds*this.spread(t.everyJitter),this.bubbles.push(this.born(n)));for(let n=this.bubbles.length-1;n>=0;n--){let r=this.bubbles[n];r.age+=e,r.y-=r.speed*(1+t.accel*r.age)*e,r.x=r.x0+Math.sin(r.age/Math.max(.001,r.swaySeconds)*Math.PI*2+r.phase)*r.sway,r.y<-this.height*.1&&(this.root.removeChild(r.sprite),r.sprite.destroy(),this.bubbles.splice(n,1))}}draw(){let e=q.menu.uiBubbles;for(let t of this.bubbles){if(!t.picture){if(!this.textures.length)continue;let e=this.textures[Math.floor(Math.random()*this.textures.length)];t.picture=e,t.sprite.texture=e}let n=e.alpha*Math.min(1,t.age/Math.max(.001,e.growSeconds));t.sprite.visible=n>.002,t.sprite.visible&&(t.sprite.position.set(t.x,t.y),t.sprite.scale.set(this.texelScale),t.sprite.alpha=n)}}sizeOf(e){let t=this.bubbles[e];return t?Math.min(1,t.age/Math.max(.001,q.menu.uiBubbles.growSeconds)):0}yOf(e){return this.bubbles[e]?.y??NaN}get count(){return this.bubbles.length}get spoutCount(){return this.spouts.length}},Rg=[`fish`,`tuna`,`crab`,`urchin`,`bombfish`,`eel`,`angler`,`torpedo`,`shrimp`,`dolphin`,`octopus`,`shark`,`whale`,`archer`,`pistol`,`puffer`,`starfish`];for(let e of q.menu.backdrop.loners)if(!Rg.includes(e))throw Error(`menu.backdrop.loners names "${e}", which is not one of the creatures that swim in the menu`);var zg=[`urchin`,`starfish`],Bg=e=>e===`fish`,Vg=e=>!zg.includes(e),Hg=()=>({burstLeft:0}),Ug=class{constructor(){J(this,`root`,new P),J(this,`backLayer`,new P),J(this,`swimLayer`,new P),J(this,`frontLayer`,new P),J(this,`backGfx`,new V),J(this,`swimGfx`,new V),J(this,`frontGfx`,new V),J(this,`maskShape`,new V),J(this,`darkGfx`,new V),J(this,`beamLayer`,new P),J(this,`glowGfx`,new V),J(this,`beams`,[]),J(this,`motes`,new Ng),J(this,`bubbles`,new Ig),J(this,`swimmers`,new zd),J(this,`backBed`,new Tp),J(this,`frontBed`,new Tp),J(this,`velocity`,new Map),J(this,`width`,0),J(this,`height`,0),J(this,`elapsed`,0),J(this,`sinceSpawn`,0),J(this,`exitLeft`,0),J(this,`fade`,1),this.backLayer.addChild(this.backGfx),this.swimLayer.addChild(this.swimGfx),this.frontLayer.addChild(this.frontGfx),this.root.addChild(this.backLayer,this.motes.graphics,this.beamLayer,this.darkGfx,this.bubbles.root,this.swimLayer,this.glowGfx,this.frontLayer),this.root.scale.set(1,-1),this.root.mask=this.maskShape,this.glowGfx.blendMode=`add`}layout(e,t,n){this.width=e,this.height=t,this.root.position.set(n,t),this.maskShape.clear(),this.maskShape.rect(n,0,e,t).fill(16777215);let r=q.menu.backdrop;this.bed(this.backBed,r.backCoralCount,r.backCoralHalfWidth,r.backCoralBottom),this.bed(this.frontBed,r.frontCoralCount,r.frontCoralHalfWidth,r.frontCoralBottom),this.buildLight(),this.motes.seed(e,t),this.bubbles.seed(e,t)}buildLight(){let e=q.menu.lighting,t=this.width,n=this.height;this.darkGfx.clear(),this.darkGfx.rect(0,0,t,n).fill({fill:new Ne({start:{x:0,y:0},end:{x:0,y:1},colorStops:[{offset:0,color:km(e.darknessColour,1)},{offset:e.darknessMidOffset,color:km(e.darknessColour,e.darknessMidAlpha)},{offset:1,color:km(e.darknessColour,e.darknessTopAlpha)}],textureSpace:`local`})});let r=n*Math.max(.05,e.glowDrift*2),i=n+r*2,a=(n*e.glowCentreY+r)/i;this.glowGfx.clear(),this.glowGfx.rect(0,-r,t,i).fill({fill:new Ne({type:`radial`,center:{x:.5,y:a},innerRadius:0,outerCenter:{x:.5,y:a},outerRadius:e.glowRadius,colorStops:[{offset:0,color:km(e.glowColour,e.glowAlpha)},{offset:e.glowMidOffset,color:km(e.glowColour,e.glowMidAlpha)},{offset:1,color:km(e.glowColour,0)}],textureSpace:`local`})});for(let e of this.beamLayer.removeChildren())e.destroy({children:!0});this.beams.length=0;let o=Math.max(1,Math.round(e.beamCount)),s=t*e.beamWidth,c=n*e.beamHeight,l=s*e.beamNarrow/2,u=s/2,d=new Ne({start:{x:0,y:0},end:{x:1,y:0},colorStops:[{offset:0,color:km(e.beamColour,0)},{offset:.5,color:km(e.beamColour,1)},{offset:1,color:km(e.beamColour,0)}],textureSpace:`local`});for(let r=0;r<o;r++){let i=new P,a=t*(e.beamFirstX+r*e.beamSpread);i.position.set(a,n*e.beamTop);let o=e.beamLean+r*e.beamPitch;i.rotation=o;let s=new V;s.blendMode=`add`,i.alpha=e.beamAlpha;for(let e=0;e<60;e++){let t=e/60,n=(e+1)/60,r=l+(u-l)*t,i=l+(u-l)*n,a=-t*c,o=-n*c;s.poly([-r,a,r,a,i,o,-i,o]).fill({fill:d,alpha:this.beamFade((t+n)/2)})}i.addChild(s),this.beamLayer.addChild(i),this.beams.push({holder:i,lean:o,baseX:a,phase:r,halfTop:l,halfBottom:u,length:c})}}beamFade(e){let t=q.menu.lighting,n=Math.max(.001,t.beamFadeMidOffset);return e>=1?0:e<=n?1+(t.beamFadeMidAlpha-1)*(e/n):t.beamFadeMidAlpha*(1-(e-n)/(1-n))}beamLightAt(e,t){let n=0;for(let r of this.beams){let i=e-r.holder.position.x,a=t-r.holder.position.y,o=Math.cos(r.holder.rotation),s=Math.sin(r.holder.rotation),c=-i*s+a*o;if(c>0)continue;let l=-c/Math.max(.001,r.length);if(l>1)continue;let u=i*o+a*s,d=(r.halfTop+(r.halfBottom-r.halfTop)*l)*r.holder.scale.x,f=Math.abs(u)/Math.max(.001,d);f>=1||(n+=(1-f)*this.beamFade(l)*r.holder.alpha)}return Math.min(1,n)}bed(e,t,n,r){e.obstacles.length=0;let i=Math.max(0,Math.round(t));for(let t=0;t<i;t++){let a=this.width/Math.max(1,i),o=(t+.5)*a+(Math.random()-.5)*a*.6,s=r*this.height+(Math.random()-.5)*this.height*.03,c=e.spawn(`coral`,o,s);c.radiusFraction=n,c.healthFraction=1}}get finished(){return this.exitLeft<0}get exiting(){return this.exitLeft!==0}beginExit(){if(!this.exiting){this.exitLeft=Math.max(.01,q.menu.backdrop.exitSeconds);for(let e of this.swimmers.hazards)e.flee=e.x<this.width/2?`right`:`left`,e.facingRest=0}}reset(){this.swimmers.hazards.length=0,this.velocity.clear(),this.exitLeft=0,this.fade=1,this.sinceSpawn=0,this.root.alpha=1,this.root.visible=!0}update(e){let t=q.menu.backdrop;if(this.elapsed+=e,!this.width||!this.height)return;this.exitLeft>0&&(this.exitLeft-=e,this.fade=Math.max(0,this.fade-e/Math.max(.01,t.fadeSeconds))),this.root.alpha=this.fade,this.swimLayer.alpha=t.creatureAlpha,this.sinceSpawn+=e;let n=this.swimmers.hazards.length<t.minAlive;!this.exiting&&this.swimmers.hazards.length<t.maxAlive&&(n||this.sinceSpawn>=t.spawnGapSeconds)&&(this.sinceSpawn=0,this.spawnWave());let r=new Map;for(let e of this.swimmers.hazards){let t=this.velocity.get(e.id);if(!t)continue;let n=r.get(t.school);n?(n.members.push(e),n.sum+=e.x):r.set(t.school,{members:[e],sum:e.x})}let i=this.width*(1-t.turnBand)/2,a=this.width-i;for(let[n,o]of r){if(o.members[0].flee){n.burstLeft=0;continue}let r=o.members[0].kind,s=Math.random(),c=Math.random();n.burstLeft=Math.max(0,n.burstLeft-e),Bg(r)&&n.burstLeft<=0&&s<e/Math.max(.01,t.burstEverySeconds)&&(n.burstLeft=t.burstSeconds+t.burstFallSeconds);let l=o.sum/o.members.length,u=r===`fish`?t.fishTurnEverySeconds:t.turnEverySeconds;if(Vg(r)&&l>i&&l<a&&c<e/Math.max(.01,u))for(let e of o.members){let t=this.velocity.get(e.id);t&&(t.vx=-t.vx,t.vy=-t.vy,this.faceTravel(e,t.vx>=0?1:-1))}}let o=this.width*.34;for(let t=this.swimmers.hazards.length-1;t>=0;t--){let n=this.swimmers.hazards[t],r=this.velocity.get(n.id);if(!r){this.swimmers.hazards.splice(t,1);continue}let i=this.burstBoost(r.school.burstLeft);if(n.flee){let t=this.height*q.hazards.fleeScreensPerSecond*e;n.x+=n.flee===`right`?t:-t}else n.x+=r.vx*i*e*this.width,n.y+=r.vy*i*e*this.height;n.phase+=e*i,mf(n,e),n.heading=n.flee?n.flee===`right`?1:-1:r.vx>=0?1:-1,(n.x<-o||n.x>this.width+o||n.y<-this.height*.25||n.y>this.height*1.25)&&(this.velocity.delete(n.id),this.swimmers.hazards.splice(t,1))}let s=q.menu.lighting,c=(e,t)=>Math.sin(this.elapsed/Math.max(.001,e)*Math.PI*2+t);for(let e of this.beams){let t=e.phase;e.holder.rotation=e.lean+c(s.beamSwaySeconds,t)*s.beamSway,e.holder.scale.x=1+c(s.beamWidthSeconds,t*1.7)*s.beamWidth,e.holder.position.x=e.baseX+c(s.beamDriftSeconds,t*2.3)*s.beamDrift*this.width,e.holder.alpha=s.beamAlpha*(1+c(s.beamPulseSeconds,t*1.7)*s.beamPulse)}this.glowGfx.position.y=c(s.glowSeconds,Math.PI/2)*s.glowDrift*this.height,this.glowGfx.alpha=1+c(s.glowSeconds,0)*s.glowPulse,this.motes.update(e,(e,t)=>this.beamLightAt(e,t)),this.bubbles.update(e,this.width),this.backGfx.clear(),this.swimGfx.clear(),this.frontGfx.clear(),this.motes.draw(),this.bubbles.draw(),Mp(this.backGfx,this.backBed,this.width),pp(this.swimGfx,this.swimmers,this.width,this.elapsed,()=>!1,`in-play`,NaN),pp(this.swimGfx,this.swimmers,this.width,this.elapsed,()=>!1,`leaving`,NaN),Mp(this.frontGfx,this.frontBed,this.width)}spawnWave(){let e=q.menu.backdrop,t=Math.random()<e.fishChance?`fish`:Rg[Math.floor(Math.random()*Rg.length)]??`fish`,n=t===`fish`,r=n?e.fishSchoolChance:e.schoolChance,i=n?e.fishSchoolMin:e.schoolMin,a=n?e.fishSchoolMax:e.schoolMax,o=Math.random()<r?Math.max(1,Math.round(i+Math.random()*(a-i))):1,s=e.loners.includes(t)?1:o,c=n&&s>1?Hg():null,l=zg.includes(t),u=Math.random()<.5,d=u?1:-1,f=(e.speedMin+Math.random()*(e.speedMax-e.speedMin))*(l?e.crawlerSpeedScale:1),p=this.height*(.14+Math.random()*.72);for(let n=0;n<s;n++){let r=u?-this.width*.06-n*this.width*.026:this.width*1.06+n*this.width*.026,i=l?Math.random()*this.height*e.crawlerBandTop:p+(Math.random()-.5)*this.height*.08,a=this.swimmers.spawnAt(t,r,i,{deterministic:!0,variety:Math.floor(Math.random()*8)});a.radiusFraction*=Math.max(.01,e.creatureScale),a.phase=Math.random()*8,this.velocity.set(a.id,{vx:f*(.86+Math.random()*.28)*d,vy:(Math.random()-.5)*(l?0:e.driftRatio)*f,school:c??Hg()}),a.heading=d,this.faceTravel(a,d),this.swimmers.hazards.push(a)}}burstBoost(e){let t=q.menu.backdrop,n=Math.max(.001,t.burstFallSeconds),r=e>=n?1:Math.max(0,e/n);return 1+(t.burstScale-1)*r*r}faceTravel(e,t){pf(e,(q.hazardArt[e.kind]?.front??q.hazardFront)===`left`==t>0?-1:1),e.facingRest=2**53-1}},Wg=`焦散`,Gg=`in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vLocal;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main(void)
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
    vLocal = aPosition * uOutputFrame.zw;
}
`,Kg=`in vec2 vTextureCoord;
in vec2 vLocal;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uCaustics;
uniform vec4 uFramePx;
uniform vec2 uPageInv;
uniform vec2 uTileSize;
uniform vec2 uOffsetA;
uniform vec2 uOffsetB;
uniform float uAlphaA;
uniform float uAlphaB;
uniform vec3 uLightColor;
uniform vec4 uShape;
uniform vec2 uPivot;
uniform vec2 uAxisA;
uniform vec2 uAxisB;
uniform vec4 uWarpA;
uniform vec4 uWarpB;
uniform vec2 uBreathe;

float texel(vec2 at)
{
    return texture(uCaustics, (uFramePx.xy + at + 0.5) * uPageInv).a;
}

float veinAt(vec2 tile)
{
    vec2 local = 1.0 - abs(mod(tile, 2.0) - 1.0);
    vec2 size = uFramePx.zw;
    vec2 px = local * size - 0.5;
    vec2 i0 = floor(px);
    vec2 f = px - i0;
    vec2 hi = size - 1.0;
    vec2 a = clamp(i0, vec2(0.0), hi);
    vec2 b = clamp(i0 + 1.0, vec2(0.0), hi);
    float top = mix(texel(vec2(a.x, a.y)), texel(vec2(b.x, a.y)), f.x);
    float bottom = mix(texel(vec2(a.x, b.y)), texel(vec2(b.x, b.y)), f.x);
    return mix(top, bottom, f.y);
}

vec2 deform(vec2 tile, vec2 axis, float breathe, vec4 ph)
{
    float aspect = uShape.w;
    vec2 s = (tile - uPivot) * vec2(1.0, aspect);

    float a = uShape.z * sin(breathe);
    vec2 n = vec2(-axis.y, axis.x);
    s = axis * (dot(s, axis) / (1.0 + a)) + n * (dot(s, n) * (1.0 + a));

    float k = uShape.y;
    vec2 w = vec2(
        sin(s.y * k + ph.x) + 0.6 * sin(s.x * k * 1.7 + s.y * k * 0.8 + ph.y),
        sin(s.x * k * 0.9 + ph.z) + 0.6 * sin(s.y * k * 1.6 - s.x * k * 0.7 + ph.w));
    s += w * uShape.x;

    return s / vec2(1.0, aspect) + uPivot;
}

void main(void)
{
    vec4 color = texture(uTexture, vTextureCoord);
    vec2 tile = vLocal / uTileSize;
    float veinA = veinAt(deform(tile, uAxisA, uBreathe.x, uWarpA) + uOffsetA);
    float veinB = veinAt(deform(tile, uAxisB, uBreathe.y, uWarpB) + uOffsetB);
    vec3 light = uLightColor * (veinA * uAlphaA + veinB * uAlphaB);
    finalColor = vec4(min(color.rgb + light * color.a, vec3(color.a)), color.a);
}
`,qg=class{constructor(){J(this,`filter`,null),J(this,`uniforms`,new C({uFramePx:{value:new Float32Array(4),type:`vec4<f32>`},uPageInv:{value:new Float32Array(2),type:`vec2<f32>`},uTileSize:{value:new Float32Array([1,1]),type:`vec2<f32>`},uOffsetA:{value:new Float32Array(2),type:`vec2<f32>`},uOffsetB:{value:new Float32Array(2),type:`vec2<f32>`},uAlphaA:{value:0,type:`f32`},uAlphaB:{value:0,type:`f32`},uLightColor:{value:new Float32Array(3),type:`vec3<f32>`},uShape:{value:new Float32Array(4),type:`vec4<f32>`},uPivot:{value:new Float32Array(2),type:`vec2<f32>`},uAxisA:{value:new Float32Array([1,0]),type:`vec2<f32>`},uAxisB:{value:new Float32Array([1,0]),type:`vec2<f32>`},uWarpA:{value:new Float32Array(4),type:`vec4<f32>`},uWarpB:{value:new Float32Array(4),type:`vec4<f32>`},uBreathe:{value:new Float32Array(2),type:`vec2<f32>`}})),J(this,`target`,null),J(this,`box`,{w:0,h:0}),J(this,`scale`,1),J(this,`tileAspect`,84/149),J(this,`tile`,{w:1,h:1}),J(this,`offsetA`,{x:Math.random()*2,y:Math.random()*2}),J(this,`offsetB`,{x:Math.random()*2,y:Math.random()*2}),J(this,`warpA`,[Math.random()*Jg,Math.random()*Jg,Math.random()*Jg,Math.random()*Jg]),J(this,`warpB`,[Math.random()*Jg,Math.random()*Jg,Math.random()*Jg,Math.random()*Jg]),J(this,`breatheA`,Math.random()*Jg),J(this,`breatheB`,Math.random()*Jg),Gl(Wg).then(e=>{e&&this.build(e)})}attach(e){this.target=e,this.filter&&(e.filters=[this.filter])}build(e){let t=e.source,n=e.frame,r=this.uniforms.uniforms,i=t.pixelWidth/t.width;r.uFramePx.set([n.x*i,n.y*i,n.width*i,n.height*i]),r.uPageInv.set([1/t.pixelWidth,1/t.pixelHeight]),this.tileAspect=n.height/n.width,this.filter=new I({glProgram:y.from({vertex:Gg,fragment:Kg,name:`title-caustics`}),resources:{causticsUniforms:this.uniforms,uCaustics:t},resolution:`inherit`}),this.resize(),this.target&&(this.target.filters=[this.filter])}layout(e,t){this.box={w:e.w,h:e.h},this.scale=t,this.resize()}resize(){let e=q.menu.caustics;this.tile={w:e.tileWidth*this.scale,h:e.tileWidth*this.scale*this.tileAspect};let t=this.uniforms.uniforms;t.uTileSize.set([this.tile.w,this.tile.h]),t.uPivot.set([this.box.w/2/Math.max(1,this.tile.w),this.box.h/2/Math.max(1,this.tile.h)])}update(e){let t=q.menu.caustics,n=Math.max(1,this.tile.w),r=Math.max(1,this.tile.h);this.offsetA.x=Xg(this.offsetA.x+t.driftX*this.box.w*e/n,2),this.offsetA.y=Xg(this.offsetA.y+t.driftY*this.box.h*e/r,2),this.offsetB.x=Xg(this.offsetB.x+t.crossDriftX*this.box.w*e/n,2),this.offsetB.y=Xg(this.offsetB.y+t.crossDriftY*this.box.h*e/r,2);let i=this.uniforms.uniforms;i.uOffsetA.set([this.offsetA.x,this.offsetA.y]),i.uOffsetB.set([this.offsetB.x,this.offsetB.y]),i.uAlphaA=t.alpha,i.uAlphaB=t.alpha*t.crossAlpha;let a=Jg/Math.max(.1,t.warpSeconds),o=Jg/Math.max(.1,t.breatheSeconds);for(let n=0;n<4;n++)this.warpA[n]=(this.warpA[n]+a*Yg[n]*e)%Jg,this.warpB[n]=(this.warpB[n]+a*Yg[(n+2)%4]*t.crossSpeedRatio*e)%Jg;this.breatheA=(this.breatheA+o*e)%Jg,this.breatheB=(this.breatheB+o*t.crossSpeedRatio*e)%Jg,i.uWarpA.set(this.warpA),i.uWarpB.set(this.warpB),i.uBreathe.set([this.breatheA,this.breatheB]),i.uShape.set([t.warpAmount,Jg/Math.max(.01,t.warpWavelength),t.breatheAmount,this.tileAspect]);let s=t.axisDegrees*Math.PI/180,c=t.crossAxisDegrees*Math.PI/180;i.uAxisA.set([Math.cos(s),Math.sin(s)]),i.uAxisB.set([Math.cos(c),Math.sin(c)]);let l=t.lightColor;i.uLightColor.set([(l>>16&255)/255,(l>>8&255)/255,(l&255)/255])}get attached(){return!!this.filter&&!!this.target?.filters?.includes(this.filter)}get tileSize(){return{...this.tile}}get layerOffsets(){return[{...this.offsetA},{...this.offsetB}]}get deformPhases(){return{breathe:[this.breatheA,this.breatheB],warp:[[...this.warpA],[...this.warpB]]}}},Jg=Math.PI*2,Yg=[1,.73,1.19,.61];function Xg(e,t){return(e%t+t)%t}var Zg=[{x:.1,y:.76},{x:.33,y:.52},{x:.9,y:.7}],Qg=[{id:`start`,picture:`按钮-开始游戏`,spout:{x:.09,y:.58}},{id:`settings`,picture:`按钮-设置`,spout:{x:.14,y:.55}}],$g=[`normal`,`Hover`],e_=class{constructor(){J(this,`root`,new P),J(this,`screen`,t_()),J(this,`buttons`,Qg.map(e=>({id:e.id,picture:e.picture,sprite:new F,textures:{},aspect:n_(e.picture),spout:{...e.spout},state:`normal`,rect:{x:0,y:0,w:0,h:0}}))),J(this,`title`,new F),J(this,`titleWidth`,0),J(this,`versionLine`,r_(``,5996444,11)),J(this,`onStart`,()=>{}),J(this,`onSettings`,()=>{}),J(this,`pointerHovers`,!0),J(this,`pressed`,null),J(this,`scale`,1),J(this,`backdrop`,new Ug),J(this,`uiBubbles`,new Lg),J(this,`caustics`,new qg),J(this,`exitReported`,!1),J(this,`introElapsed`,1/0),this.root.eventMode=`none`,this.screen.eventMode=`none`,this.title.eventMode=`none`,this.title.anchor.set(.5,1),Gl(`标题`).then(e=>{e&&(this.title.texture=e,this.applyTitleSize())}),this.caustics.attach(this.title);for(let e of this.buttons){e.sprite.anchor.set(.5,.5),e.sprite.eventMode=`none`;for(let t of $g)Gl(t===`normal`?e.picture:`${e.picture}-${t}`).then(n=>{n&&(e.textures[t]=n,this.showButtonState(e))})}this.root.addChild(this.screen,this.backdrop.root,this.title,...this.buttons.map(e=>e.sprite),this.uiBubbles.root,this.versionLine)}showButtonState(e){let t=e.textures[e.state===`Pressed`?`Hover`:e.state];t&&(e.sprite.texture=t,this.sizeButton(e));let n=e.state===`Pressed`?q.menu.buttonPressDrop*this.scale:0;e.sprite.y=e.rect.y+e.rect.h/2+n}sizeButton(e){let t=e.sprite.texture;t&&t.width&&e.sprite.scale.set(e.rect.w/t.width)}get titleHeight(){return this.titleWidth/Math.max(.01,q.menu.titleAspect)}applyTitleSize(){let e=this.title.texture;e&&e.width&&this.title.scale.set(this.titleWidth/e.width)}layout(e){let t=q.menu,n=Cm(e.width,e.height);this.scale=n,this.backdrop.layout(e.laneWidthPx,e.height,e.left);let r=e.left,i=e.laneWidthPx,a=r+i/2;this.screen.clear(),this.screen.rect(0,0,e.width,e.height).fill({color:199191,alpha:1}),this.scale=n;let o=t.buttonHeight*n;this.titleWidth=i*t.titleWidthRatio,this.applyTitleSize();let s=o+t.buttonGap*n,c=this.buttons.length*o+Math.max(0,this.buttons.length-1)*t.buttonGap*n,l=this.titleHeight+t.titleButtonGap*n+c,u=36*n,d=Math.max(e.height*t.groupCentreRatio-l/2,u),f=d+this.titleHeight+t.titleButtonGap*n;for(let e of this.buttons){let t=o*Math.max(.01,e.aspect);e.rect={x:a-t/2,y:f,w:t,h:o},e.sprite.x=a,this.showButtonState(e),f+=s}this.title.x=a,this.title.y=d+this.titleHeight;let p={x:a-this.titleWidth/2,y:d,w:this.titleWidth,h:this.titleHeight},m=[...Zg.map(e=>({x:p.x+e.x*p.w,y:p.y+e.y*p.h})),...this.buttons.map(e=>({x:e.rect.x+e.spout.x*e.rect.w,y:e.rect.y+e.spout.y*e.rect.h}))];this.uiBubbles.setSpouts(m),this.uiBubbles.setScreen(e.width,e.height),this.caustics.layout({w:this.titleWidth,h:this.titleHeight},n),this.versionLine.scale.set(n),this.versionLine.anchor.set(.5,1),this.versionLine.text=Yh(),this.versionLine.x=a,this.versionLine.y=e.height-14*n}get exiting(){return this.backdrop.exiting}refillBackdrop(){this.backdrop.reset(),this.exitReported=!1}beginIntro(){this.introElapsed=0,this.applyIntro()}get introEnd(){let e=q.menu.intro;return e.titleSeconds+Math.max(0,this.buttons.length-1)*e.buttonStaggerSeconds+e.buttonSeconds}get introFinished(){return this.introElapsed>=this.introEnd}applyIntro(){let e=q.menu.intro,t=(e,t)=>{let n=Math.max(0,Math.min(1,(this.introElapsed-e)/Math.max(.01,t)));return n*n*(3-2*n)};this.title.alpha=t(0,e.titleSeconds);for(let[n,r]of this.buttons.entries())r.sprite.alpha=t(e.titleSeconds+n*e.buttonStaggerSeconds,e.buttonSeconds)}updateBackdrop(e){this.backdrop.update(e)}beginExit(){this.backdrop.exiting||(this.exitReported=!1,this.backdrop.beginExit())}update(e){this.updateBackdrop(e),this.introElapsed<this.introEnd&&(this.introElapsed=Math.min(this.introEnd,this.introElapsed+e),this.applyIntro()),this.caustics.update(e),this.uiBubbles.update(e),this.uiBubbles.draw(),!this.exitReported&&this.backdrop.finished&&(this.exitReported=!0,this.onStart())}inRect(e,t,n){return t>=e.x&&t<=e.x+e.w&&n>=e.y&&n<=e.y+e.h}handlePointerDown(e,t){return this.pressed=this.buttonAt(e,t)?.id??null,this.showPointerState(e,t),!0}handlePointerMove(e,t){return this.showPointerState(e,t),!0}handlePointerUp(e,t){let n=this.pressed;this.pressed=null;let r=this.buttons.find(e=>e.id===n);return r&&this.inRect(r.rect,e,t)?(this.showPointerState(e,t),r.id===`start`?this.beginExit():this.onSettings(),!0):(this.showPointerState(e,t),!0)}buttonAt(e,t){if(this.introFinished)return this.buttons.find(n=>this.inRect(n.rect,e,t))}showPointerState(e,t){for(let n of this.buttons){let r=this.inRect(n.rect,e,t),i=r&&this.pressed===n.id?`Pressed`:r&&this.pointerHovers?`Hover`:`normal`;n.state!==i&&(n.state=i,this.showButtonState(n))}}get geometry(){let e=e=>this.buttons.find(t=>t.id===e),t=e(`start`),n=e(`settings`),r=e=>({...e?.rect??{x:0,y:0,w:0,h:0}});return{button:r(t),settings:r(n),states:Object.fromEntries(this.buttons.map(e=>[e.id,e.state]))}}get versionText(){return this.versionLine.text}};function t_(){let e=new V;return e.eventMode=`none`,e}function n_(e){let t=Jl(e);return t&&t.height>0?t.width/t.height:1}function r_(e,t,n){let r=new Vi({text:e,style:{fontFamily:q.text.fontFamily,fontSize:n,fill:t,fontWeight:`bold`,letterSpacing:.5}});return r.resolution=2,r}var i_=.24,a_=.45,o_=.68,s_=.88;function c_(e,t,n){return new Vi({text:e,style:{fill:t,fontSize:n,fontFamily:q.text.fontFamily,align:`center`}})}var l_=class{constructor(){J(this,`root`,new P),J(this,`backdrop`,new V),J(this,`cards`,new V),J(this,`heading`,void 0),J(this,`subheading`,void 0),J(this,`names`,[]),J(this,`titles`,[]),J(this,`blurbs`,[]),J(this,`locks`,[]),J(this,`options`,[]),J(this,`rects`,[]),J(this,`pressed`,null),J(this,`hovering`,null),J(this,`canvas`,{width:0,height:0}),J(this,`onPick`,()=>{});let e=q.routePick;this.heading=c_(`选择形态`,e.headingColour,e.headingSize),this.subheading=c_(`这一局，你是哪一种气泡`,e.subheadingColour,e.subheadingSize),this.root.addChild(this.backdrop,this.cards,this.heading,this.subheading),this.heading.anchor.set(.5),this.subheading.anchor.set(.5)}setOptions(e){this.options=[...e];let t=q.routePick;for(let u=0;u<e.length;u++){var n,r,i,a,o,s,c,l;let d=e[u],f=(n=this.names)[r=u]??(n[r]=this.addText(c_(``,t.nameColour,t.nameSize))),p=(i=this.titles)[a=u]??(i[a]=this.addText(c_(``,t.titleColour,t.titleSize))),m=(o=this.blurbs)[s=u]??(o[s]=this.addText(c_(``,t.mutedColour,t.blurbSize))),h=(c=this.locks)[l=u]??(c[l]=this.addText(c_(``,t.lockColour,t.lockSize)));f.text=d.name,p.text=d.title,m.text=d.blurb,h.text=d.locked?`通关一次解锁`:``;for(let e of[f,p,m,h])e.anchor.set(.5),e.alpha=d.locked?t.lockedAlpha:1;h.visible=d.locked}for(let t=e.length;t<this.names.length;t++)for(let e of[this.names[t],this.titles[t],this.blurbs[t],this.locks[t]])e.visible=!1}addText(e){return this.root.addChild(e),e}layout(e){let t=q.routePick,n=Cm(e.width,e.height);this.canvas={width:e.width,height:e.height};let r=e.width/2;this.backdrop.clear(),this.backdrop.rect(0,0,e.width,e.height).fill({color:t.backdropColour,alpha:t.backdropAlpha});let i=this.options.length,a=t.cardHeight*n,o=t.cardGap*n,s=i*a+Math.max(0,i-1)*o,c=Math.max(t.topMargin*n,(e.height-s)/2-t.headingGap*n);this.heading.position.set(r,c),this.heading.scale.set(n),this.subheading.position.set(r,c+t.subheadingGap*n),this.subheading.scale.set(n);let l=c+t.headingGap*n,u=Math.min(e.width*t.maxWidthRatio,t.maxWidth*n),d=r-u/2;this.rects=[],this.cards.clear();for(let e=0;e<i;e++){let i=this.options[e];this.rects.push({id:i.id,locked:i.locked,x:d,y:l,w:u,h:a});let s=this.hovering===i.id&&!i.locked;this.cards.roundRect(d,l,u,a,t.cardRadius*n).fill({color:t.cardFillColour,alpha:t.cardAlpha}).stroke({color:s?t.selectedStrokeColour:t.cardStrokeColour,width:(s?t.selectedStrokeWidth:t.cardStrokeWidth)*n,alpha:i.locked?t.lockedAlpha:1});let c=e=>l+a*e;for(let[t,i]of[[this.names[e],i_],[this.titles[e],a_],[this.blurbs[e],o_],[this.locks[e],s_]])t.position.set(r,c(i)),t.scale.set(n);l+=a+o}}handlePointerDown(e,t){return this.pressed=this.cardAt(e,t)?.id??null,this.hovering=this.pressed,!0}handlePointerMove(e,t){let n=this.cardAt(e,t)?.id??null;return n!==this.hovering&&(this.hovering=n,this.canvas.width>0&&this.layout(this.canvas),!0)}handlePointerUp(e,t){let n=this.pressed;this.pressed=null;let r=this.rects.find(e=>e.id===n);return r&&!r.locked&&this.inRect(r,e,t)&&this.onPick(r.id),!0}cardAt(e,t){return this.rects.find(n=>this.inRect(n,e,t))}inRect(e,t,n){return t>=e.x&&t<=e.x+e.w&&n>=e.y&&n<=e.y+e.h}},u_=class{constructor(){J(this,`root`,new P),J(this,`open`,!1),J(this,`onPick`,()=>{}),J(this,`scrim`,new V),J(this,`panelBg`,new V),J(this,`title`,void 0),J(this,`hint`,void 0),J(this,`choices`,[]),J(this,`cards`,[]),J(this,`panelRect`,{x:0,y:0,w:0,h:0}),J(this,`scale`,1),J(this,`canvasWidth`,0),J(this,`canvasHeight`,0),this.root.eventMode=`none`,this.root.visible=!1,this.title=d_(`突变 · 三选一`,10482431,22),this.title.anchor.set(.5,0),this.hint=d_(`点一张卡，或按 1 / 2 / 3`,8366280,12),this.hint.anchor.set(.5,1),this.root.addChild(this.scrim,this.panelBg,this.title,this.hint)}openWith(e,t=`突变 · 三选一`){this.choices=e,this.title.text=t,this.open=!0,this.root.visible=!0;for(let e of this.cards)this.root.removeChild(e.bg,e.name,e.blurb);this.cards=e.map(()=>{let e=new V;e.eventMode=`none`;let t=d_(``,15399423,17);t.anchor.set(.5,1);let n=d_(``,10475760,12);return n.anchor.set(.5,0),this.root.addChild(e,t,n),{bg:e,name:t,blurb:n,x:0,y:0,w:0,h:0,pressed:!1}}),this.layoutCards()}close(){this.open=!1,this.root.visible=!1,this.choices=[]}choiceAt(e){return this.choices[e]??null}layout(e){let t=Cm(e.width,e.height);this.scale=t,this.canvasWidth=e.width,this.canvasHeight=e.height;let n=Math.min(e.laneWidthPx*.9,460*t),r=Math.min(e.height*.62,420*t);this.panelRect.x=(e.width-n)/2,this.panelRect.y=(e.height-r)/2,this.panelRect.w=n,this.panelRect.h=r,this.title.scale.set(t),this.title.x=e.width/2,this.title.y=this.panelRect.y+22*t,this.hint.scale.set(t),this.hint.x=e.width/2,this.hint.y=this.panelRect.y+r-14*t,this.layoutCards()}layoutCards(){let e=this.scale,t=this.panelRect;this.scrim.clear(),this.scrim.rect(0,0,this.canvasWidth,this.canvasHeight).fill({color:132621,alpha:.86}),this.panelBg.clear(),this.panelBg.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:924719,alpha:.97}).stroke({color:7194600,alpha:.5,width:1.5*e});let n=24*e,r=t.w-n*2,i=Math.min(92*e,(t.h-130*e)/Math.max(1,this.cards.length)-8*e),a=t.y+66*e;for(let[o,s]of this.cards.entries()){let c={x:t.x+n,y:a+o*(i+10*e),w:r,h:i};s.x=c.x,s.y=c.y,s.w=c.w,s.h=c.h;let l=this.choices[o];s.name.text=`${o+1} · ${l.name}`,s.name.scale.set(e),s.name.x=c.x+c.w/2,s.name.y=c.y+c.h*.62,s.blurb.text=l.blurb,s.blurb.scale.set(e),s.blurb.x=c.x+c.w/2,s.blurb.y=c.y+c.h*.68,this.drawCard(s)}}drawCard(e){let t=this.scale;e.bg.clear(),e.bg.roundRect(e.x,e.y,e.w,e.h,12*t).fill({color:e.pressed?1919590:1452351,alpha:.96}).stroke({color:e.pressed?10482431:6269132,alpha:.8,width:1.4*t})}inRect(e,t,n){return e>=n.x&&e<=n.x+n.w&&t>=n.y&&t<=n.y+n.h}handlePointerDown(e,t,n){if(!this.open)return!1;for(let e of this.cards)this.inRect(t,n,e)&&(e.pressed=!0);return this.redraw(),!0}handlePointerMove(e,t,n){if(!this.open)return!1;for(let e of this.cards)e.pressed&&!this.inRect(t,n,e)&&(e.pressed=!1);return this.redraw(),!0}handlePointerUp(e,t,n){if(!this.open)return!1;for(let e of this.cards){let r=e.pressed;e.pressed=!1,r&&this.inRect(t,n,e)&&this.onPick(this.cards.indexOf(e))}return this.redraw(),!0}redraw(){for(let e of this.cards)this.drawCard(e)}};function d_(e,t,n){let r=new Vi({text:e,style:{fontFamily:q.text.fontFamily,fontSize:n,fill:t,fontWeight:`bold`,letterSpacing:.5}});return r.resolution=2,r}var f_=[{id:`gun`,name:`枪管 +1`,blurb:`小泡泡同时发射 ${q.bullets.maxStreams} 排（上限内可叠加）`,routes:`all`,available:e=>e.gunStreams<q.bullets.maxStreams,apply:e=>{e.gunStreams=Math.min(q.bullets.maxStreams,e.gunStreams+1)}},{id:`rate`,name:`射速 +1 档`,blurb:`最高第 ${q.bullets.rateTiers.length} 档`,routes:`all`,available:e=>e.rateTier<q.bullets.rateTiers.length,apply:e=>{e.rateTier=Math.min(q.bullets.rateTiers.length,e.rateTier+1)}},{id:`damage`,name:`子弹伤害 +15%`,blurb:`每发打掉的血更多，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.damage=(e.mutations.damage??0)+1}},{id:`armor`,name:`护甲 +${q.mutation.pool.defensePerPick}`,blurb:`每次受击少掉 ${q.mutation.pool.defensePerPick} 点，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.armor=(e.mutations.armor??0)+1}},{id:`thickArmor`,name:`厚甲 +${q.mutation.pool.defenseBigPerPick}`,blurb:`每次受击少掉 ${q.mutation.pool.defenseBigPerPick} 点，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.thickArmor=(e.mutations.thickArmor??0)+1}},{id:`heal`,name:`修复血条`,blurb:`血条立刻回 ${q.health.healPerPick} 点（一次性）`,routes:`all`,available:e=>{let t=e.healthView;return t.current<t.max-.01},apply:e=>{e.health=yg(e.health,e.healthMax)}},{id:`maxHp`,name:`血上限 +${q.health.maxPerPick}`,blurb:`血条的上限加 ${q.health.maxPerPick} 点，可叠加`,routes:`all`,available:()=>!0,apply:e=>{let t=(e.mutations.maxHp??0)+1;e.mutations.maxHp=t,e.healthMax=gg(t),e.health=Math.min(e.healthMax,e.health+q.health.maxPerPick)}},{id:`rage`,name:`怒气积攒 +15%`,blurb:`挨打和释放的怒气更多，可叠加`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.rage=(e.mutations.rage??0)+1}},{id:`suction`,name:`吸取范围 +15%`,blurb:`吸附场罩得更宽，可叠加`,routes:`devour`,available:()=>!0,apply:e=>{e.mutations.suction=(e.mutations.suction??0)+1}},{id:`eatInvuln`,name:`吞噬无敌 +0.3 秒`,blurb:`吞下生物后的无敌更长，可叠加`,routes:`devour`,available:()=>!0,apply:e=>{e.mutations.eatInvuln=(e.mutations.eatInvuln??0)+1}},{id:`appetite`,name:`大胃口 +1 档`,blurb:`比体积说的话多吃一档，可叠加——食欲也能爬食物链`,routes:`devour`,available:()=>!0,apply:e=>{e.mutations.appetite=(e.mutations.appetite??0)+1}},{id:`burstRadius`,name:`爆破半径 +15%`,blurb:`怒气爆破罩得更宽，可叠加`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.burstRadius=(e.mutations.burstRadius??0)+1}},{id:`simmer`,name:`余温 -25% 衰减`,blurb:`挨打攒的热散得更慢，可叠加——怒气留得更久`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.simmer=(e.mutations.simmer??0)+1}},{id:`plateRate`,name:`怒甲更快 −${Math.round(q.mutation.pool.rage.plateSecondsPerPick*100)}%`,blurb:`攒出一个怒甲的时间更短，可叠加——撞得更勤`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.plateRate=(e.mutations.plateRate??0)+1}},{id:`plateMax`,name:`多存一层 +${q.mutation.pool.rage.plateMaxPerPick}`,blurb:`怒甲上限 +1，可叠加——连着撞两三个不用等`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.plateMax=(e.mutations.plateMax??0)+1}},{id:`deeperBreak`,name:`破甲更深 +${q.mutation.pool.rage.breakPerPick} 倍`,blurb:`被撞的敌人受到的所有伤害更重，可叠加——贴脸那一枪就是靠它`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.deeperBreak=(e.mutations.deeperBreak??0)+1}},{id:`hotBurn`,name:`灼烧更烈 +${Math.round(q.mutation.pool.rage.burnRatePerPick*100)}%`,blurb:`贴身灼烧每跳更疼，可叠加——不用等怒气也有输出`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.hotBurn=(e.mutations.hotBurn??0)+1}},{id:`bulletSpeed`,name:`弹速 +25%`,blurb:`小泡泡飞得更快，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.bulletSpeed=(e.mutations.bulletSpeed??0)+1}},{id:`bulletRadius`,name:`大弹丸 +30%`,blurb:`小泡泡变大，判定跟着变大，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.bulletRadius=(e.mutations.bulletRadius??0)+1}},{id:`bulletRange`,name:`射程 +40%`,blurb:`小泡泡飞得更远，可叠加——寿命就是射程`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.bulletRange=(e.mutations.bulletRange??0)+1}},{id:`homing`,name:`追踪弹 ${Math.round(q.bullets.homing.chance*100)}%`,blurb:`三成的子弹自己找泡泡上方的敌人；找不到就划一道弧飞出屏幕`,routes:`all`,available:e=>!e.picks.includes(`homing`),apply:e=>{e.bulletHomingChance=q.bullets.homing.chance}},{id:`sizeDamage`,name:`越大伤害越高`,blurb:`子弹胀大多少就多打多少，可叠加——要飞得久才吃得到`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.sizeDamage=(e.mutations.sizeDamage??0)+1}},{id:`speedDamage`,name:`越快伤害越高`,blurb:`「弹速」的加成直接变成伤害，可叠加——和它配套拿`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.speedDamage=(e.mutations.speedDamage??0)+1}},{id:`shotgun`,name:`霰弹枪`,blurb:`射速减半，但每排一次打出 ${1+q.mutation.pool.shotgun.pellets} 颗：贴脸才全中`,routes:`all`,available:e=>!e.picks.includes(`shotgun`),apply:()=>{}},{id:`pellets`,name:`多一发`,blurb:`每一枪多一颗弹丸，可叠加`,routes:`all`,available:e=>e.picks.includes(`shotgun`),apply:e=>{e.mutations.pellets=(e.mutations.pellets??0)+1}},{id:`closeDamage`,name:`抵近射击`,blurb:`目标在 ${Math.round(q.mutation.pool.shotgun.closeRangeMeters)} 米内时弹丸更疼，可叠加`,routes:`all`,available:e=>e.picks.includes(`shotgun`),apply:e=>{e.mutations.closeDamage=(e.mutations.closeDamage??0)+1}},{id:`narrow`,name:`收束`,blurb:`张角收窄 ${Math.round(q.mutation.pool.shotgun.narrowPerPick*100)}%：打得更远，可叠加`,routes:`all`,available:e=>e.picks.includes(`shotgun`),apply:e=>{e.mutations.narrow=(e.mutations.narrow??0)+1}},{id:`knock`,name:`顶开`,blurb:`命中把敌人推开，可叠加`,routes:`all`,available:e=>e.picks.includes(`shotgun`),apply:e=>{e.mutations.knock=(e.mutations.knock??0)+1}}];function p_(e){return f_.find(t=>t.id===e)}function m_(e,t){t.apply(e),e.picks.push(t.id),g_(e)}function h_(e,t=3){let n=f_.filter(t=>(t.routes===`all`||t.routes===e.route)&&t.available(e)),r=[];for(;r.length<t&&r.length<n.length;){let e=n[Math.floor(Math.random()*n.length)];for(;r.includes(e);)e=n[Math.floor(Math.random()*n.length)];r.push(e)}return r}function g_(e){let t=q.mutation.pool,n=t=>e.mutations[t]??0;e.bulletDamageMultiplier=1+t.damagePerPick*n(`damage`),e.rageGainMultiplier=1+t.ragePerPick*n(`rage`),e.suctionBonus=1+t.suctionPerPick*n(`suction`),e.eatInvulnBonusSeconds=t.eatInvulnSecondsPerPick*n(`eatInvuln`),e.eatTierBonus=t.appetiteTiersPerPick*n(`appetite`),e.burstRadiusMultiplier=1+t.burstRadiusPerPick*n(`burstRadius`),e.rageDecayMultiplier=Math.max(.05,1-t.rageDecayReductionPerPick*n(`simmer`)),e.bulletSpeedMultiplier=1+t.bulletSpeedPerPick*n(`bulletSpeed`),e.bulletRadiusMultiplier=1+t.bulletRadiusPerPick*n(`bulletRadius`),e.bulletLifeMultiplier=1+t.bulletRangePerPick*n(`bulletRange`);let r=e.picks.includes(`shotgun`),i=t.shotgun;e.gunRateScale=r?i.rateScale:1,e.gunPellets=r?1+i.pellets+i.pelletsPerPick*n(`pellets`):1,e.gunSpreadDegrees=r?i.totalSpreadDegrees*Math.max(i.narrowFloor,(1-i.narrowPerPick)**n(`narrow`)):0,e.bulletCloseRangeMeters=i.closeRangeMeters,e.bulletCloseDamageRate=i.closeDamagePerPick*n(`closeDamage`),e.bulletKnockbackScale=1+i.knockbackPerPick*n(`knock`);let a=t.rage,o=q.angry.armour;e.armourSecondsPerPlate=o.secondsPerPlate*Math.max(a.plateSecondsFloor,(1-a.plateSecondsPerPick)**n(`plateRate`)),e.armourMax=Math.min(a.plateMaxCap,o.max+a.plateMaxPerPick*n(`plateMax`)),e.armourVulnerableMultiplier=o.vulnerableMultiplier+a.breakPerPick*n(`deeperBreak`),e.auraDamagePerTick=q.angry.aura.damagePerTick*(1+a.burnRatePerPick*n(`hotBurn`)),e.bulletSizeDamageRate=t.sizeDamagePerPick*n(`sizeDamage`),e.bulletSpeedDamageRate=t.speedDamagePerPick*n(`speedDamage`),e.defense=t.defensePerPick*n(`armor`)+t.defenseBigPerPick*n(`thickArmor`),e.healthMax=gg(n(`maxHp`))}function __(e){return String(Math.round(e*100)/100)}function v_(e){let t=q.bullets.rateTiers,n=Math.min(e.rateTier,t.length),r=[{label:`血上限`,value:__(e.healthMax)},{label:`枪管`,value:`${e.gunStreams} / ${q.bullets.maxStreams} 排`},{label:`射速`,value:`${__(t[n-1]??0)} 发/秒 · ${n}/${t.length} 档`},{label:`伤害`,value:`×${__(e.bulletDamageMultiplier)}`},{label:`护甲`,value:__(e.defense)}],i=[],a=new Map;for(let t of e.picks)a.has(t)||i.push(t),a.set(t,(a.get(t)??0)+1);let o=[],s=[];for(let e of i){let t=p_(e),n=t?.name??e,r=t?.blurb??`（这张卡已经不在游戏里了）`;e.startsWith(`route:`)?o.push({name:n,count:null,blurb:r,note:null}):s.push({name:n,count:a.get(e)??1,blurb:r,note:null})}let c=[];return o.length>0&&c.push({title:`路线`,lines:o}),s.length>0&&c.push({title:`突变`,lines:s}),{stats:r,groups:c}}var y_=class{constructor(){J(this,`root`,new P),J(this,`sprites`,new Map),this.root.eventMode=`none`,this.root.sortableChildren=!0}get count(){return this.sprites.size}paint(e,t){let n=q.hazardArt.fish,r=new Set;if(n){let i=n.front??q.hazardFront;for(let a of e.schools.values()){let e=n.variants,o=e&&e.length>0?e[(a.variety%e.length+e.length)%e.length]:void 0,s=o?.move??n.move??``,c=o?.scale??n.scale??1,l=t*X.fish.radius*2*c*Du(a.distance),u=Ou(a.distance);for(let e of a.members){r.add(e);let t=s?hf(s,e.clock):null,n=this.sprites.get(e);if(!t){n&&(n.visible=!1);continue}n||(n=new F(t),n.anchor.set(.5),n.eventMode=`none`,n.zIndex=(1-a.distance)*100+(1-e.boid.d),this.root.addChild(n),this.sprites.set(e,n)),n.tint=b_(wf(e.boid.d),u),n.texture=t,n.visible=!0,n.x=e.x,n.y=e.y;let o=l/t.width,c=(e.heading||a.school.dirX)<=0,d=i===`left`===c?1:-1;n.scale.set(o*d,Al(n)?-o:o)}}}for(let[e,t]of this.sprites)r.has(e)||(t.destroy(),this.sprites.delete(e))}};function b_(e,t){let n=n=>Math.round((e>>n&255)*(t>>n&255)/255);return n(16)<<16|n(8)<<8|n(0)}var x_=12,S_=2,C_=Math.max(1,Math.ceil(Ic.length/x_)),w_=class{constructor(){J(this,`root`,new P),J(this,`gear`,new V),J(this,`scrim`,new V),J(this,`panel`,new P),J(this,`panelBg`,new V),J(this,`title`,void 0),J(this,`volumeLabel`,void 0),J(this,`musicLabel`,void 0),J(this,`accessLabel`,void 0),J(this,`flashButton`,void 0),J(this,`cheatLabel`,void 0),J(this,`cheatButton`,void 0),J(this,`debugButton`,void 0),J(this,`hitboxButton`,void 0),J(this,`debugLevelButton`,void 0),J(this,`sliderTrack`,new V),J(this,`sliderFill`,new V),J(this,`sliderKnob`,new V),J(this,`musicTrack`,new V),J(this,`musicFill`,new V),J(this,`musicKnob`,new V),J(this,`closeButton`,void 0),J(this,`auditionButton`,void 0),J(this,`auditionLayer`,new P),J(this,`auditionBg`,new V),J(this,`auditionTitle`,void 0),J(this,`auditionButtons`,[]),J(this,`auditionPrev`,void 0),J(this,`auditionNext`,void 0),J(this,`auditionClose`,void 0),J(this,`restartButton`,void 0),J(this,`exitButton`,void 0),J(this,`saveButton`,void 0),J(this,`cancelButton`,void 0),J(this,`open`,!1),J(this,`inRun`,!0),J(this,`lastViewport`,null),J(this,`levels`,[]),J(this,`levelRects`,[]),J(this,`levelLabels`,[]),J(this,`selectedLevelId`,``),J(this,`pressedPill`,-1),J(this,`levelRow`,new V),J(this,`growth`,null),J(this,`growthLayer`,new P),J(this,`growthHeading`,void 0),J(this,`growthWindowBg`,new V),J(this,`growthContent`,new P),J(this,`growthMask`,new V),J(this,`growthBar`,new V),J(this,`growthWindow`,{x:0,y:0,w:0,h:0}),J(this,`growthContentHeight`,0),J(this,`growthScroll`,0),J(this,`growthPointer`,null),J(this,`growthLastY`,0),J(this,`onPickLevel`,()=>{}),J(this,`onVolume`,()=>{}),J(this,`onMusicVolume`,()=>{}),J(this,`onCue`,()=>{}),J(this,`onOpen`,()=>{}),J(this,`onClose`,()=>{}),J(this,`onRestart`,()=>{}),J(this,`onInfiniteHealth`,()=>{}),J(this,`onReducedFlash`,()=>{}),J(this,`onDebugMode`,()=>{}),J(this,`onShowHitboxes`,()=>{}),J(this,`onEnterDebugLevel`,()=>{}),J(this,`onExit`,()=>{}),J(this,`gearCircle`,{x:0,y:0,radius:0}),J(this,`panelRect`,{x:0,y:0,w:0,h:0}),J(this,`slider`,{x:0,y:0,w:0,h:0}),J(this,`musicSlider`,{x:0,y:0,w:0,h:0}),J(this,`volume`,.8),J(this,`musicVolume`,.8),J(this,`infiniteHealth`,!1),J(this,`debugMode`,!0),J(this,`showHitboxes`,!0),J(this,`reducedFlash`,!1),J(this,`lastSliderTick`,-1),J(this,`sliderPointer`,null),J(this,`musicSliderPointer`,null),J(this,`auditionOpen`,!1),J(this,`auditionPage`,0),J(this,`scale`,1),J(this,`canvasWidth`,0),J(this,`canvasHeight`,0),J(this,`auditionPress`,null),this.root.eventMode=`none`,this.gear.eventMode=`none`,this.panel.eventMode=`none`,this.panelBg.eventMode=`none`,this.sliderTrack.eventMode=`none`,this.sliderFill.eventMode=`none`,this.sliderKnob.eventMode=`none`,this.musicTrack.eventMode=`none`,this.musicFill.eventMode=`none`,this.musicKnob.eventMode=`none`,this.levelRow.eventMode=`none`,this.growthLayer.eventMode=`none`,this.growthWindowBg.eventMode=`none`,this.growthContent.eventMode=`none`,this.growthMask.eventMode=`none`,this.growthBar.eventMode=`none`,this.title=D_(`设置 / SETTINGS`,15399423,22),this.auditionTitle=D_(``,15399423,17),this.growthHeading=D_(`成长 / GROWTH`,q.settings.growth.headingColour,q.settings.growth.headingSize),this.volumeLabel=D_(``,12577279,15),this.musicLabel=D_(``,12577279,15),this.closeButton=this.mkButton(`×`,()=>this.setOpen(!1),`ui.back`),this.accessLabel=D_(`显示 / DISPLAY`,9426687,13),this.flashButton=this.mkButton(`降低闪烁：关`,()=>this.setReducedFlash(!this.reducedFlash),`ui.toggle`),this.cheatLabel=D_(`作弊 / CHEATS`,16757867,13),this.cheatButton=this.mkButton(`无限血量：关`,()=>this.setInfiniteHealth(!this.infiniteHealth),`ui.toggle`),this.debugButton=this.mkButton(`调试模式：开`,()=>this.setDebugMode(!this.debugMode),`ui.toggle`),this.hitboxButton=this.mkButton(`碰撞盒：开`,()=>this.setShowHitboxes(!this.showHitboxes),`ui.toggle`),this.debugLevelButton=this.mkButton(`进入调试关`,()=>this.onEnterDebugLevel()),this.debugLevelButton.bg.visible=!1,this.debugLevelButton.label.visible=!1,this.auditionButton=this.mkButton(`试听音效`,()=>this.openAudition()),this.restartButton=this.mkButton(`重开本关`,()=>this.onRestart()),this.exitButton=this.mkButton(`退出到主菜单`,()=>this.onExit()),this.saveButton=this.mkButton(`保存`,()=>this.setOpen(!1),`ui.back`),this.cancelButton=this.mkButton(`取消`,()=>this.setOpen(!1),`ui.back`),this.growthContent.mask=this.growthMask,this.panel.addChild(this.panelBg,this.levelRow,this.growthLayer,this.growthWindowBg,this.growthContent,this.growthMask,this.growthBar,this.growthHeading,this.title,this.musicLabel,this.musicTrack,this.musicFill,this.musicKnob,this.volumeLabel,this.sliderTrack,this.sliderFill,this.sliderKnob,this.accessLabel,this.cheatLabel),this.panel.addChild(this.closeButton.bg,this.closeButton.label,this.flashButton.bg,this.flashButton.label,this.cheatButton.bg,this.cheatButton.label,this.debugButton.bg,this.debugButton.label,this.hitboxButton.bg,this.hitboxButton.label,this.debugLevelButton.bg,this.debugLevelButton.label,this.auditionButton.bg,this.auditionButton.label,this.restartButton.bg,this.restartButton.label,this.exitButton.bg,this.exitButton.label,this.saveButton.bg,this.saveButton.label,this.cancelButton.bg,this.cancelButton.label);for(let e=0;e<x_;e++)this.auditionButtons.push(this.mkButton(``,()=>void 0,`ui.click`));this.auditionPrev=this.mkButton(`上一页`,()=>this.turnAuditionPage(-1)),this.auditionNext=this.mkButton(`下一页`,()=>this.turnAuditionPage(1)),this.auditionClose=this.mkButton(`返回设置`,()=>this.closeAudition(),`ui.back`),this.auditionLayer.addChild(this.auditionBg,this.auditionTitle,this.auditionPrev.bg,this.auditionPrev.label,this.auditionNext.bg,this.auditionNext.label,this.auditionClose.bg,this.auditionClose.label);for(let e of this.auditionButtons)this.auditionLayer.addChild(e.bg,e.label);this.auditionLayer.visible=!1,this.root.addChild(this.scrim,this.gear,this.panel,this.auditionLayer),this.setOpen(!1)}mkButton(e,t,n=`ui.click`){let r=new V;r.eventMode=`none`;let i=D_(e,15399423,16);i.anchor.set(.5),i.eventMode=`none`;let a={label:i,bg:r,x:0,y:0,w:0,h:0,pressed:!1},o=a;return o.onPress=t,o.cue=n,a}buttons(){return[this.closeButton,this.flashButton,this.cheatButton,this.debugButton,this.hitboxButton,this.debugLevelButton,this.auditionButton,this.restartButton,this.exitButton,this.saveButton,this.cancelButton].filter(e=>e.bg.visible)}get showsDebugEntry(){return!this.inRun&&this.debugMode}syncDebugEntry(){let e=this.showsDebugEntry,t=this.debugLevelButton.bg.visible!==e;return this.debugLevelButton.bg.visible=e,this.debugLevelButton.label.visible=e,this.debugLevelButton.pressed=!1,t}onPressOf(e){return e.onPress}cueOf(e){return e.cue??`ui.click`}get isOpen(){return this.open}setInRun(e){if(this.inRun!==e){this.inRun=e;for(let t of[this.restartButton,this.exitButton])t.bg.visible=e,t.label.visible=e,t.pressed=!1;this.syncDebugEntry(),this.lastViewport&&this.layout(this.lastViewport)}}setOpen(e){let t=this.open;e||this.closeAudition(),this.open=e,this.panel.visible=e,this.scrim.visible=e,this.gear.visible=!e,this.sliderPointer=null,this.growthPointer=null,e&&!t&&this.setGrowthScroll(0);for(let e of this.buttons())e.pressed=!1;this.redraw(),e&&!t&&this.onOpen(),!e&&t&&this.onClose()}setInfiniteHealth(e,t=!0){this.infiniteHealth=e,this.cheatButton.label.text=e?`无限血量：开`:`无限血量：关`,this.cheatButton.label.style.fill=e?16766073:15399423,this.redraw(),t&&this.onInfiniteHealth(e)}setDebugMode(e,t=!0){this.debugMode=e,this.debugButton.label.text=e?`调试模式：开`:`调试模式：关`,this.debugButton.label.style.fill=e?16766073:15399423,this.syncDebugEntry()&&this.lastViewport&&this.layout(this.lastViewport),this.redraw(),t&&this.onDebugMode(e)}get debugModeOn(){return this.debugMode}setShowHitboxes(e,t=!0){this.showHitboxes=e,this.hitboxButton.label.text=e?`碰撞盒：开`:`碰撞盒：关`,this.hitboxButton.label.style.fill=e?16766073:15399423,this.redraw(),t&&this.onShowHitboxes(e)}get showHitboxesOn(){return this.showHitboxes}get infiniteHealthOn(){return this.infiniteHealth}setReducedFlash(e,t=!0){this.reducedFlash=e,this.flashButton.label.text=e?`降低闪烁：开`:`降低闪烁：关`,this.flashButton.label.style.fill=e?16766073:15399423,this.redraw(),t&&this.onReducedFlash(e)}get reducedFlashOn(){return this.reducedFlash}setVolume(e){this.volume=Math.min(1,Math.max(0,e)),this.redraw()}setMusicVolume(e){this.musicVolume=Math.min(1,Math.max(0,e)),this.redraw()}layout(e){let t=Cm(e.width,e.height);this.scale=t,this.canvasWidth=e.width,this.canvasHeight=e.height,this.lastViewport=e;let n=e.left+e.laneWidthPx,r=27*t;this.gearCircle={x:n-r-14*t,y:r+14*t,radius:r};let i=Math.min(e.laneWidthPx*.86,420*t),a=q.settings.growth,o=this.inRun&&this.growth!==null,s={heading:64,statsTop:82,statRows:4,statRowH:20,windowGap:8,bottomGap:14},c=s.statsTop+s.statRows*s.statRowH+s.windowGap,l=e=>o?c+e+s.bottomGap-62:0,u={musicLabel:78,musicSlider:112,volumeLabel:148,slider:182,accessLabel:226,accessRow:247,cheatsLabel:297,cheatsRow:318,rowHeight:42,rowGap:10},d=u,f=[this.debugButton,this.hitboxButton],p=this.inRun?[[this.cheatButton],f,[this.auditionButton],[this.restartButton],[this.exitButton]]:this.showsDebugEntry?[[this.cheatButton],f,[this.auditionButton],[this.debugLevelButton]]:[[this.cheatButton],f,[this.auditionButton]],m=q.settings.levels,h=this.showsLevelRow?Math.ceil(this.levels.length/Math.max(1,m.perRow)):0,g=h>0?h*m.rowHeight+(h-1)*m.rowGap:0,_=e=>e.cheatsRow+(e.rowHeight+e.rowGap)*(p.length-1)+e.rowHeight+(g>0?g+e.rowGap:0),v=e=>_(u)+e+u.rowGap+u.rowHeight+24,y=e.height*(o?a.panelMaxHeightRatio:.66),b=o?this.buildGrowthContent(i-48*t,t):0,x=o?Math.max(a.windowMinHeight,Math.min(a.windowMaxHeight,y/t-v(l(0)),b/t)):0,S=l(x);d={...u,musicLabel:u.musicLabel+S,musicSlider:u.musicSlider+S,volumeLabel:u.volumeLabel+S,slider:u.slider+S,accessLabel:u.accessLabel+S,accessRow:u.accessRow+S,cheatsLabel:u.cheatsLabel+S,cheatsRow:u.cheatsRow+S};let C=_(d),w=Math.min(o?e.height:e.height*.66,(C+d.rowGap+d.rowHeight+24)*t);this.panelRect={x:(e.width-i)/2,y:(e.height-w)/2,w:i,h:w},this.title.scale.set(t),this.title.anchor.set(.5,0),this.title.x=this.panelRect.x+i/2,this.title.y=this.panelRect.y+20*t,this.layoutGrowth(o,x,s,t,b);let T=i-48*t,E=this.panelRect.x+24*t;this.volumeLabel.scale.set(t),this.volumeLabel.anchor.set(0,.5),this.volumeLabel.x=E,this.volumeLabel.y=this.panelRect.y+d.volumeLabel*t,this.slider={x:E,y:this.panelRect.y+d.slider*t,w:T,h:14*t},this.musicLabel.scale.set(t),this.musicLabel.anchor.set(0,.5),this.musicLabel.x=E,this.musicLabel.y=this.panelRect.y+d.musicLabel*t,this.musicSlider={x:E,y:this.panelRect.y+d.musicSlider*t,w:T,h:14*t},this.auditionOpen&&this.layoutAudition();let D=34*t;this.place(this.closeButton,this.panelRect.x+i-D-12*t,this.panelRect.y+12*t,D,D,t),this.accessLabel.scale.set(t),this.accessLabel.anchor.set(0,.5),this.accessLabel.x=this.panelRect.x+24*t,this.accessLabel.y=this.panelRect.y+d.accessLabel*t;let ee=d.rowHeight*t,te=i-48*t,ne=this.panelRect.x+24*t;this.place(this.flashButton,ne,this.panelRect.y+d.accessRow*t,te,ee,t),this.cheatLabel.scale.set(t),this.cheatLabel.anchor.set(0,.5),this.cheatLabel.x=this.panelRect.x+24*t,this.cheatLabel.y=this.panelRect.y+d.cheatsLabel*t;let re=ee+d.rowGap*t,ie=this.panelRect.y+d.cheatsRow*t,O=12*t;p.forEach(e=>{let n=(te-O*(e.length-1))/e.length;e.forEach((e,r)=>this.place(e,ne+r*(n+O),ie,n,ee,t)),ie+=re}),h>0?this.placeLevelRow(ne,ie,te,m,t):this.levelRects=[];let k=12*t,ae=(te-k)/2,A=this.panelRect.y+w-ee-24*t;this.place(this.saveButton,ne,A,ae,ee,t),this.place(this.cancelButton,ne+ae+k,A,ae,ee,t),this.buildStatic(),this.redraw()}setGrowth(e){this.growth=e,this.growthScroll=0,this.lastViewport&&this.layout(this.lastViewport)}layoutGrowth(e,t,n,r,i){for(let e of this.growthLayer.removeChildren())e.destroy();if(this.growthHeading.visible=e,this.growthWindowBg.visible=e,this.growthContent.visible=e,this.growthMask.visible=e,this.growthBar.visible=e,!e||!this.growth){this.growthContentHeight=0,this.growthWindow={x:0,y:0,w:0,h:0},this.growthWindowBg.clear(),this.growthMask.clear(),this.growthBar.clear();return}let a=q.settings.growth,o=this.panelRect,s=o.x+24*r,c=o.w-48*r;this.growthHeading.scale.set(r),this.growthHeading.anchor.set(0,.5),this.growthHeading.x=s,this.growthHeading.y=o.y+n.heading*r;let l=(c-16*r)/2;this.growth.stats.forEach((e,t)=>{let i=t%2,c=Math.floor(t/2),u=s+i*(l+16*r),d=o.y+(n.statsTop+c*n.statRowH)*r,f=D_(e.label,a.statLabelColour,a.statSize);f.scale.set(r),f.x=u,f.y=d;let p=D_(e.value,a.statValueColour,a.statSize);p.scale.set(r),p.anchor.set(1,0),p.x=u+l,p.y=d,this.growthLayer.addChild(f,p)});let u=o.y+(n.statsTop+n.statRows*n.statRowH+n.windowGap)*r;this.growthWindow={x:s,y:u,w:c,h:t*r},this.growthContentHeight=i;let d=this.growthWindow;this.growthWindowBg.clear(),this.growthWindowBg.roundRect(d.x,d.y,d.w,d.h,10*r).fill({color:a.windowFill,alpha:.95}).stroke({color:a.windowStroke,alpha:.7,width:Math.max(1,1.2*r)}),this.growthMask.clear(),this.growthMask.roundRect(d.x+1,d.y+1,d.w-2,d.h-2,9*r).fill({color:16777215}),this.setGrowthScroll(this.growthScroll)}buildGrowthContent(e,t){for(let e of this.growthContent.removeChildren())e.destroy();if(!this.growth)return 0;let n=q.settings.growth,r=8*t,i=(e-r*2)/t,a=r,o=(e,n=r)=>{e.scale.set(t),e.x=n,e.y=a,this.growthContent.addChild(e),a+=e.height};return this.growth.groups.length===0&&o(T_(n.emptyText,n.blurbColour,n.blurbSize,i)),this.growth.groups.forEach((e,s)=>{s>0&&(a+=n.groupGap*t),o(D_(e.title,n.groupColour,n.headingSize)),a+=n.blurbGap*t,e.lines.forEach((e,s)=>{s>0&&(a+=n.lineGap*t);let c=D_(e.name,n.nameColour,n.nameSize);c.scale.set(t),c.x=r,c.y=a,this.growthContent.addChild(c);let l=r+c.width+6*t;if(e.count!==null&&e.count>1){let r=D_(`×${e.count}`,n.countColour,n.nameSize);r.scale.set(t),r.x=l,r.y=a,this.growthContent.addChild(r),l+=r.width+6*t}if(e.note!==null){let r=D_(`[${e.note}]`,n.noteColour,n.blurbSize);r.scale.set(t),r.x=l,r.y=a+(c.height-r.height)/2,this.growthContent.addChild(r)}a+=c.height+n.blurbGap*t,o(T_(e.blurb,n.blurbColour,n.blurbSize,i))})}),a+r}get growthScrollMax(){return Math.max(0,this.growthContentHeight-this.growthWindow.h)}setGrowthScroll(e){this.growthScroll=Math.min(this.growthScrollMax,Math.max(0,e)),this.growthContent.x=this.growthWindow.x,this.growthContent.y=this.growthWindow.y-this.growthScroll,this.drawGrowthBar()}drawGrowthBar(){this.growthBar.clear();let e=this.growthScrollMax,t=this.growthWindow;if(e<=0||t.h<=0)return;let n=Math.max(2,3*this.scale),r=t.h-12*this.scale,i=Math.max(20*this.scale,r*(t.h/this.growthContentHeight)),a=t.y+6*this.scale+(r-i)*(this.growthScroll/e);this.growthBar.roundRect(t.x+t.w-n-4*this.scale,a,n,i,n/2).fill({color:q.settings.growth.windowStroke,alpha:.9})}handleWheel(e,t,n){return!this.open||this.growthWindow.h<=0||!this.inRect(e,t,this.growthWindow)?!1:(this.setGrowthScroll(this.growthScroll+n),!0)}placeLevelRow(e,t,n,r,i){let a=Math.max(1,Math.floor(r.perRow)),o=n/a,s=Math.min(n,n*r.maxRowWidthRatio),c=r.rowHeight*i,l=c+r.rowGap*i;this.levelRects=this.levels.map((r,i)=>{let u=Math.floor(i/a),d=Math.min(a,this.levels.length-u*a),f=Math.min(s,d*o),p=f/d,m=i-u*a;return{x:e+(n-f)/2+m*p,y:t+u*l,w:p,h:c}}),this.placeLevelLabels(r,i)}placeLevelLabels(e,t){for(let[n,r]of this.levelLabels.entries()){let i=this.levelRects[n];i&&(r.style.fontSize=e.textSize,r.scale.set(t),r.anchor.set(.5,.5),r.x=i.x+i.w/2,r.y=i.y+i.h/2)}}get showsLevelRow(){return!this.inRun&&this.levels.length>0}setLevels(e){this.levels=e;for(let e of this.levelLabels)this.panel.removeChild(e),e.destroy();this.levelLabels.length=0;for(let t of e){let e=D_(t.name,q.settings.levels.idleTextColour,q.settings.levels.textSize);e.eventMode=`none`,this.levelLabels.push(e),this.panel.addChild(e)}e.some(e=>e.id===this.selectedLevelId)||(this.selectedLevelId=e.find(e=>!e.locked)?.id??``),this.levelRects=[],this.placeLevelLabels(q.settings.levels,this.scale),this.lastViewport?this.layout(this.lastViewport):this.redraw()}get selectedLevelIdValue(){return this.selectedLevelId}place(e,t,n,r,i,a){e.x=t,e.y=n,e.w=r,e.h=i,e.label.scale.set(a),e.label.x=t+r/2,e.label.y=n+i/2}update(){}redraw(){let e=this.scale;if(this.open){this.drawSlider(this.slider,this.volume,this.sliderFill,this.sliderKnob,e),this.drawSlider(this.musicSlider,this.musicVolume,this.musicFill,this.musicKnob,e),this.volumeLabel.text=`音效 / EFFECTS   ${Math.round(this.volume*100)}`,this.musicLabel.text=`音乐 / MUSIC   ${Math.round(this.musicVolume*100)}`;for(let t of this.buttons()){let n=t===this.saveButton,r=t===this.exitButton;if(t===this.cheatButton){t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:this.infiniteHealth?4863e3:1452351,alpha:.95}).stroke({color:this.infiniteHealth?16757867:6269132,alpha:.8,width:1.2*e});continue}if(t===this.debugButton){t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:this.debugMode?4863e3:1452351,alpha:.95}).stroke({color:this.debugMode?16757867:6269132,alpha:.8,width:1.2*e});continue}if(t===this.hitboxButton){t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:this.showHitboxes?4863e3:1452351,alpha:.95}).stroke({color:this.showHitboxes?16757867:6269132,alpha:.8,width:1.2*e});continue}if(t===this.flashButton){t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:this.reducedFlash?1325135:1452351,alpha:.95}).stroke({color:this.reducedFlash?7332863:6269132,alpha:.8,width:1.2*e});continue}t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:t.pressed?2771563:r?3350572:n?1915992:1452351,alpha:.95}).stroke({color:t.pressed?10478847:r?14191258:t===this.debugLevelButton?16757867:6269132,alpha:.7,width:1.2*e})}this.drawLevelRow(e)}}drawLevelRow(e){let t=q.settings.levels;this.levelRow.clear();for(let[n,r]of this.levelRects.entries()){let i=this.levels[n];i&&this.levelRow.roundRect(r.x,r.y,r.w,r.h,t.radius*e).fill({color:i.selected?t.selectedFill:t.idleFill,alpha:.95}).stroke({color:i.selected?t.selectedStroke:t.idleStroke,alpha:i.selected?1:.7,width:Math.max(1,1.2*e)})}for(let[e,n]of this.levelLabels.entries()){let r=this.levels[e];if(!r)continue;n.visible=this.levelRects[e]!==void 0;let i=r.selected?t.selectedTextColour:t.idleTextColour;n.style.fill!==i&&(n.style.fill=i)}}drawSlider(e,t,n,r,i){n.clear(),t>.001&&n.roundRect(e.x,e.y-e.h/2,e.w*t,e.h,e.h/2).fill({color:7332863,alpha:.85}),r.clear();let a=e.x+e.w*t;r.circle(a,e.y,12*i).fill({color:16777215,alpha:.96}),r.circle(a,e.y,12*i).stroke({color:7332863,alpha:.9,width:2*i})}buildStatic(){let e=this.scale,t=this.panelRect;this.scrim.clear(),this.scrim.rect(0,0,this.canvasWidth,this.canvasHeight).fill({color:132621,alpha:.82}),this.panelBg.clear(),this.panelBg.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:924719,alpha:.97}).stroke({color:7194600,alpha:.5,width:1.5*e});for(let[e,t]of[[this.slider,this.sliderTrack],[this.musicSlider,this.musicTrack]])t.clear(),t.roundRect(e.x,e.y-e.h/2,e.w,e.h,e.h/2).fill({color:529183,alpha:.95}).stroke({color:4030376,alpha:.6,width:1});this.drawGear()}drawGear(){let e=this.scale,t=this.gear;t.clear();let{x:n,y:r,radius:i}=this.gearCircle;t.circle(n,r,i).fill({color:1188408,alpha:.72}),t.circle(n,r,i).stroke({color:7194600,alpha:.75,width:1.6*e});for(let e=0;e<8;e++){let a=e/8*Math.PI*2,o=i*.42,s=i*.72,c=Math.PI/8*.42;t.poly([n+Math.cos(a-c)*o,r+Math.sin(a-c)*o,n+Math.cos(a-c*.7)*s,r+Math.sin(a-c*.7)*s,n+Math.cos(a+c*.7)*s,r+Math.sin(a+c*.7)*s,n+Math.cos(a+c)*o,r+Math.sin(a+c)*o]).fill({color:12577279,alpha:.92})}t.circle(n,r,i*.34).fill({color:661030,alpha:.9}),t.circle(n,r,i*.34).stroke({color:12577279,alpha:.7,width:1.4*e})}draw(e){this.scale=e,this.redraw()}inRect(e,t,n,r=0){return e>=n.x-r&&e<=n.x+n.w+r&&t>=n.y-r&&t<=n.y+n.h+r}inCircle(e,t,n){let r=e-n.x,i=t-n.y;return r*r+i*i<=n.radius*n.radius*1.35*1.35}auditionControls(){return[this.auditionPrev,this.auditionNext,this.auditionClose]}handlePointerDown(e,t,n){if(!this.open)return this.inCircle(t,n,this.gearCircle)?(this.setOpen(!0),!0):!1;if(this.auditionOpen){for(let e of this.auditionButtons)this.inRect(t,n,e)&&(e.pressed=!0);return this.auditionPress=this.auditionControls().findIndex(e=>this.inRect(t,n,e)),this.auditionPress===-1&&(this.auditionPress=null),this.drawAuditionButtons(),!0}for(let e of this.buttons())this.inRect(t,n,e)&&(e.pressed=!0);if(this.pressedPill=-1,this.showsLevelRow){let e=this.levelRects.findIndex(e=>this.inRect(t,n,e));e>=0&&!this.levels[e]?.locked&&(this.pressedPill=e)}return this.inRect(t,n,{x:this.slider.x-14,y:this.slider.y-20,w:this.slider.w+28,h:40})&&(this.sliderPointer=e,this.moveSlider(t,!1)),this.inRect(t,n,{x:this.musicSlider.x-14,y:this.musicSlider.y-20,w:this.musicSlider.w+28,h:40})&&(this.musicSliderPointer=e,this.moveSlider(t,!0)),this.growthWindow.h>0&&this.inRect(t,n,this.growthWindow)&&(this.growthPointer=e,this.growthLastY=n),this.draw(1),!0}handlePointerMove(e,t,n){if(!this.open)return!1;if(this.auditionOpen){for(let e of this.auditionButtons)e.pressed&&!this.inRect(t,n,e)&&(e.pressed=!1);return this.auditionPress!==null&&!this.inRect(t,n,this.auditionControls()[this.auditionPress]??{x:0,y:0,w:0,h:0})&&(this.auditionPress=null),this.drawAuditionButtons(),!0}for(let e of this.buttons())e.pressed&&!this.inRect(t,n,e)&&(e.pressed=!1);return this.pressedPill>=0&&!this.inRect(t,n,this.levelRects[this.pressedPill]??{x:0,y:0,w:0,h:0})&&(this.pressedPill=-1),this.sliderPointer===e&&this.moveSlider(t,!1),this.musicSliderPointer===e&&this.moveSlider(t,!0),this.growthPointer===e&&(this.setGrowthScroll(this.growthScroll-(n-this.growthLastY)),this.growthLastY=n),this.draw(1),!0}handlePointerUp(e,t,n){if(!this.open)return!1;if(this.auditionOpen){let e=this.auditionIds();this.auditionButtons.forEach((r,i)=>{let a=r.pressed;r.pressed=!1;let o=e[i];a&&o&&this.inRect(t,n,r)&&this.onCue(o)});let r=this.auditionControls(),i=this.auditionPress;if(this.auditionPress=null,i!==null){let e=r[i];e&&this.inRect(t,n,e)&&(this.onCue(i===2?`ui.back`:`ui.click`),i===0?this.turnAuditionPage(-1):i===1?this.turnAuditionPage(1):this.closeAudition())}return this.drawAuditionButtons(),!0}this.sliderPointer===e&&(this.sliderPointer=null),this.musicSliderPointer===e&&(this.musicSliderPointer=null),this.growthPointer===e&&(this.growthPointer=null);for(let e of this.buttons()){let r=e.pressed;e.pressed=!1,r&&this.inRect(t,n,e)&&(this.onCue(this.cueOf(e)),this.onPressOf(e)())}let r=this.pressedPill;if(this.pressedPill=-1,r>=0&&this.showsLevelRow){let e=this.levelRects[r],i=this.levels[r];e&&i&&this.inRect(t,n,e)&&this.onPickLevel(i.id)}return this.draw(1),!0}openAudition(){this.auditionOpen=!0,this.auditionPage=0,this.auditionLayer.visible=!0,this.layoutAudition()}closeAudition(){this.auditionOpen=!1,this.auditionLayer.visible=!1}turnAuditionPage(e){this.auditionPage=(this.auditionPage+e+C_)%C_,this.layoutAudition()}auditionIds(){let e=this.auditionPage*x_;return Array.from({length:x_},(t,n)=>Ic[e+n]??null)}layoutAudition(){let e=this.scale,t=this.panelRect,n=40*e,r=6*e,i=24*e;this.auditionBg.clear(),this.auditionBg.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:661030,alpha:.98}).stroke({color:7194600,alpha:.5,width:1.5*e}),this.auditionTitle.scale.set(e),this.auditionTitle.anchor.set(0,.5),this.auditionTitle.x=t.x+i,this.auditionTitle.y=t.y+24*e,this.auditionTitle.text=`试听音效 / SOUND TEST   ${this.auditionPage+1} / ${C_}`;let a=56*e,o=t.y+48*e,s=Math.max(n,t.h-48*e-a-i)/Math.ceil(x_/S_)-r,c=(t.w-i*2-r*1)/S_,l=this.auditionIds();this.auditionButtons.forEach((n,a)=>{let u=l[a],d=a%S_,f=Math.floor(a/S_);n.pressed=!1,n.label.text=u?this.cueLabel(u):``;let p={x:t.x+i+d*(c+r),y:o+f*(s+r),w:c,h:s};this.place(n,p.x,p.y,p.w,p.h,e),n.bg.visible=u!==null,n.label.visible=u!==null});let u=t.y+t.h-a-i*.5-n*.5,d=(t.w-i*2-r*2)/3;this.place(this.auditionPrev,t.x+i,u,d,n,e),this.place(this.auditionNext,t.x+i+d+r,u,d,n,e),this.place(this.auditionClose,t.x+i+(d+r)*2,u,d,n,e),this.drawAuditionButtons()}cueLabel(e){return`${q.audio.sfx.sounds[e]?.label??e}\n${e}`}drawAuditionButtons(){let e=this.scale,t=t=>{t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,8*e).fill({color:t.pressed?1915992:1321021,alpha:.95}).stroke({color:t.pressed?9429247:4030376,alpha:.7,width:1*e})};for(let e of this.auditionButtons)t(e);t(this.auditionPrev),t(this.auditionNext),t(this.auditionClose)}moveSlider(e,t){let n=t?this.musicSlider:this.slider,r=Math.min(1,Math.max(0,(e-n.x)/Math.max(1,n.w)));t?(this.musicVolume=r,this.onMusicVolume(r)):(this.volume=r,this.onVolume(r)),Math.abs(r-this.lastSliderTick)>=.05&&(this.lastSliderTick=r,this.onCue(`ui.slider`)),this.draw(1)}get geometry(){return{growth:{shown:this.growthWindow.h>0,window:{...this.growthWindow},contentHeight:this.growthContentHeight,scroll:this.growthScroll,scrollMax:this.growthScrollMax},gear:{...this.gearCircle},panel:{...this.panelRect},slider:{...this.slider},musicSlider:{...this.musicSlider},audition:{open:this.auditionOpen,page:this.auditionPage,pages:C_,rows:this.auditionIds().flatMap((e,t)=>e?[{id:e,rect:E_(this.auditionButtons[t])}]:[])},inRun:this.inRun,debugEntry:this.showsDebugEntry,levels:this.levels.map((e,t)=>({id:e.id,label:e.name,locked:e.locked,selected:e.selected,rect:{...this.levelRects[t]??{x:0,y:0,w:0,h:0}}})),buttons:{close:E_(this.closeButton),flash:E_(this.flashButton),cheat:E_(this.cheatButton),debug:E_(this.debugButton),hitboxes:E_(this.hitboxButton),debugLevel:E_(this.debugLevelButton),restart:E_(this.restartButton),exit:E_(this.exitButton),save:E_(this.saveButton),cancel:E_(this.cancelButton),audition:E_(this.auditionButton)}}}get sliderValue(){return this.volume}get musicSliderValue(){return this.musicVolume}};function T_(e,t,n,r){let i=D_(e,t,n);return i.style.wordWrap=!0,i.style.breakWords=!0,i.style.wordWrapWidth=r,i.style.fontWeight=`normal`,i}function E_(e){return{x:e.x,y:e.y,w:e.w,h:e.h}}function D_(e,t,n){let r=new Vi({text:e,style:{fontFamily:q.text.fontFamily,fontSize:n,fill:t,fontWeight:`bold`,letterSpacing:.5}});return r.resolution=2,r}var O_=class{constructor(){J(this,`ctx`,null),J(this,`bus`,null),J(this,`filter`,null),J(this,`track`,null),J(this,`volume`,.5),J(this,`stepClock`,0),J(this,`stepIndex`,0),J(this,`playing`,!1)}attach(e,t){this.ctx!==e&&(this.stop(),this.ctx=e,this.bus=e.createGain(),this.bus.gain.value=0,this.filter=e.createBiquadFilter(),this.filter.type=`lowpass`,this.filter.frequency.value=900,this.filter.connect(this.bus),this.bus.connect(t))}setTrack(e){e!==this.track&&(this.track=e,this.stepClock=0,this.stepIndex=0,this.playing=e!==null&&this.ctx!==null,this.filter&&this.ctx&&this.filter.frequency.setTargetAtTime(e?.cutoffHz??900,this.ctx.currentTime,.4),this.fadeTo(this.playing?this.volume:0))}setVolume(e){this.volume=Math.max(0,Math.min(1,e)),this.playing&&this.fadeTo(this.volume)}playSting(e,t){let n=this.ctx;if(!n||!this.filter||e.length===0)return 0;let r=this.track?.rootHz??110;return e.forEach((e,i)=>{this.blipAt(r*2**(e/12),t*1.8,.2,`triangle`,0,n.currentTime+i*t)}),e.length*t}stop(){this.playing=!1,this.fadeTo(0)}get isPlaying(){return this.playing}get debugTrack(){return this.track?{rootHz:this.track.rootHz,stepPerMinute:this.track.stepPerMinute,chords:this.track.chords.length}:null}update(e,t=1){if(!this.playing||!this.track||!this.ctx||!this.filter)return;let n=60/Math.max(1,this.track.stepPerMinute);this.stepClock+=e;let r=0;for(;this.stepClock>=n&&r<4;)this.stepClock-=n,this.playStep(this.stepIndex,n,t),this.stepIndex++,r++}playStep(e,t,n){let r=this.track,i=this.ctx;if(!r||!i||!this.filter)return;let a=r.chords[Math.floor(e/Math.max(1,r.stepsPerChord))%r.chords.length];if(!a||!a.length)return;let o=a[r.pattern[e%r.pattern.length]%a.length]??a[0],s=1/Math.max(.05,Math.min(1,n));if(this.blip(this.frequency(r.rootHz*n,o),t*s,r.arpGain,r.wave,0),e%Math.max(1,r.stepsPerChord)===0){let e=t*r.stepsPerChord*s;this.blip(this.frequency(r.rootHz*n,a[0]),e,r.padGain,r.padWave,r.detuneCents);let i=a[Math.min(2,a.length-1)]??a[0];this.blip(this.frequency(r.rootHz*n,i),e,r.padGain*.7,r.padWave,-r.detuneCents)}}frequency(e,t){return e*2**(t/12)}blip(e,t,n,r,i){this.blipAt(e,t,n,r,i,this.ctx?.currentTime??0)}blipAt(e,t,n,r,i,a){let o=this.ctx;if(!o||!this.filter||n<=1e-4)return;let s=o.createOscillator();s.type=r,s.frequency.value=e,s.detune.value=i;let c=o.createGain(),l=Math.max(a,o.currentTime),u=Math.min(.08,t*.2);c.gain.setValueAtTime(0,l),c.gain.linearRampToValueAtTime(n,l+u),c.gain.exponentialRampToValueAtTime(1e-4,l+Math.max(u+.05,t)),s.connect(c),c.connect(this.filter),s.start(l),s.stop(l+Math.max(u+.1,t)+.02)}fadeTo(e){this.bus&&this.ctx&&this.bus.gain.setTargetAtTime(e,this.ctx.currentTime,.35)}},k_=new URL(`abyssal-menu-BAYZ6ThN.mp3`,import.meta.url).href,A_=new URL(`battle-1-DH_7S8kN.mp3`,import.meta.url).href,j_=new URL(`black-smokers-hdZRQnpd.mp3`,import.meta.url).href,M_=new URL(`slow-100-Dw_cTTTe.mp3`,import.meta.url).href,N_=class{constructor(e=null){J(this,`url`,void 0),J(this,`el`,null),J(this,`gain`,null),J(this,`presence`,0),J(this,`rewind`,!1),J(this,`retryAfter`,0),this.url=e}setUrl(e){e!==this.url&&(this.url=e,this.el?.pause(),this.el=null,this.gain=null,this.presence=0)}update(e,t,n,r,i={}){if(!n)return;let a=i.held??!1;if(!this.el){if(!t||!this.url)return;this.ensureElement()}let o=this.el;if(!o)return;this.gain||this.connect(n);let s=this.gain;if(!s||o.error)return;let c=t&&!a&&o.duration-o.currentTime<=r.loopFadeSeconds,l=t&&!a&&!c?1:0,u=l>this.presence?r.fadeInSeconds:a?r.holdFadeSeconds:t?r.loopFadeSeconds:r.leaveFadeSeconds,d=e/Math.max(.01,u);this.presence=l>this.presence?Math.min(l,this.presence+d):Math.max(l,this.presence-d),t&&!a?(c&&this.presence===0&&(o.currentTime=0),(o.paused||o.ended)&&performance.now()>=this.retryAfter&&this.start(o)):this.presence===0&&!o.paused&&(o.pause(),this.rewind=!a);let f=Math.max(.05,Math.min(1,i.rate??1));o.playbackRate!==f&&(o.playbackRate=f),s.gain.setTargetAtTime(this.presence*r.volume,n.ctx.currentTime,.05)}start(e){(this.rewind||e.ended)&&(e.currentTime=0,this.rewind=!1),e.play().catch(()=>{this.retryAfter=performance.now()+1e3})}whenPlayable(){if(!this.url)return Promise.resolve();let e=this.ensureElement();return!e||e.readyState>=HTMLMediaElement.HAVE_FUTURE_DATA?Promise.resolve():new Promise(t=>{let n=!1,r=()=>{n||(n=!0,e.removeEventListener(`canplay`,r),e.removeEventListener(`loadeddata`,r),e.removeEventListener(`error`,r),t())};e.addEventListener(`canplay`,r),e.addEventListener(`loadeddata`,r),e.addEventListener(`error`,r),e.readyState>=HTMLMediaElement.HAVE_FUTURE_DATA&&r()})}ensureElement(){if(this.el)return this.el;if(!this.url)return null;let e=new Audio(this.url);return e.preload=`auto`,this.el=e,document.addEventListener(`visibilitychange`,()=>{document.hidden&&!e.paused&&e.pause()}),e}connect(e){let t=this.el;if(!t||this.gain)return;let n=e.ctx.createGain();n.gain.value=0,e.ctx.createMediaElementSource(t).connect(n),n.connect(e.destination),this.gain=n}get stateRef(){let e=this.el;return{created:!!e,playing:!!e&&!e.paused,presence:this.presence,time:e?.currentTime??0,duration:e?.duration??0,url:this.url}}},P_=Object.assign({"./assets/audio/music/battle-1.mp3":A_,"./assets/audio/music/black-smokers.mp3":j_,"./assets/audio/music/slow-100.mp3":M_});function F_(e){for(let[t,n]of Object.entries(P_))if(t.replace(/^.*\//,``).replace(/\.[^.]+$/,``)===e)return n;return null}var I_=class{constructor(){J(this,`tracks`,{menu:new N_(k_),level:new N_(null),boss:new N_(F_(`boss`)),summary:new N_(F_(`summary`))}),J(this,`slot`,null),J(this,`held`,!1),J(this,`rate`,1)}setLevel(e){this.tracks.level.setUrl(F_(e))}has(e){return this.tracks[e].stateRef.url!==null}whenPlayable(e){return this.tracks[e].whenPlayable()}play(e){this.slot=e}hold(e){this.held=e}setRate(e){this.rate=e}get playing(){return this.slot}update(e,t){let n=q.audio.music.recorded;for(let r of[`menu`,`level`,`boss`,`summary`])this.tracks[r].update(e,this.slot===r,t,this.configFor(r,n),{held:this.held,rate:this.rate})}configFor(e,t){return{volume:e===`menu`?q.audio.music.menu.volume:e===`level`?t.levelVolume:e===`boss`?t.bossVolume:t.summaryVolume,fadeInSeconds:t.fadeInSeconds,leaveFadeSeconds:t.leaveFadeSeconds,loopFadeSeconds:t.loopFadeSeconds,holdFadeSeconds:t.holdFadeSeconds}}get stateRef(){return{playing:this.slot,held:this.held,rate:this.rate,menu:this.tracks.menu.stateRef,level:this.tracks.level.stateRef,boss:this.tracks.boss.stateRef,summary:this.tracks.summary.stateRef}}},L_=class{constructor(){J(this,`graphics`,new V),J(this,`particles`,[]),this.graphics.eventMode=`none`}emit(e){let t=q.particles;if(e.kind===`hit`){this.burst(e,t.hitCount,t.hitSpeed,t.hitLife,t.hitSize,e.colour);return}let n=t.defeatCount;for(let r=0;r<n;r++){let i=r/n*Math.PI*2+Math.random()*t.defeatJitter;this.push(e.x+Math.cos(i)*e.radius,e.y+Math.sin(i)*e.radius,Math.cos(i)*t.defeatSpeed,Math.sin(i)*t.defeatSpeed,t.defeatLife*(.7+Math.random()*.6),t.defeatSize*(.6+Math.random()*.9),t.defeatColour)}}burst(e,t,n,r,i,a){for(let o=0;o<t;o++){let t=Math.random()*Math.PI*2,o=n*(.35+Math.random()*.8);this.push(e.x,e.y,Math.cos(t)*o,Math.sin(t)*o,r*(.6+Math.random()*.8),i*(.5+Math.random()*1),a)}}push(e,t,n,r,i,a,o){this.particles.length>=q.particles.maxParticles&&this.particles.shift(),this.particles.push({x:e,y:t,vx:n,vy:r,age:0,life:i,size:a,colour:o})}update(e){let t=q.particles.drag**(e*60);for(let n=this.particles.length-1;n>=0;n--){let r=this.particles[n];if(r.age+=e,r.age>=r.life){this.particles.splice(n,1);continue}r.x+=r.vx*e,r.y+=r.vy*e,r.y-=q.particles.descentSpeed*e,r.vx*=t,r.vy*=t}}draw(){let e=this.graphics;e.clear();for(let t of this.particles){let n=1-t.age/t.life;e.circle(t.x,t.y,Math.max(.2,t.size*n)).fill({color:t.colour,alpha:n})}}get count(){return this.particles.length}},R_=class{constructor(){J(this,`root`,new P),J(this,`textures`,[]),J(this,`riders`,new Map),J(this,`loading`,!1),J(this,`ready`,!1),this.root.eventMode=`none`}ensureTextures(){if(this.ready||this.loading)return;let e=q.chargeTrail;e.image&&(this.loading=!0,Gl(e.image).then(t=>{if(this.loading=!1,!t)return;let n=t.frame,r=Math.floor(n.width/Math.max(1,e.columns)),i=Math.floor(n.height/Math.max(1,e.rows));if(!(r<=0||i<=0)){for(let a=0;a<e.columns*e.rows;a++){let o=a%e.columns,c=Math.floor(a/e.columns);this.textures.push(new O({source:t.source,frame:new s(n.x+o*r,n.y+c*i,r,i)}))}this.ready=this.textures.length>0}}))}ride(e,t,n,r,i,a=0,o=0){let s=q.chargeTrail;if(this.ensureTextures(),!this.ready)return;let c=this.riders.get(e);if(!c){let t=Math.max(1,Math.round(s.count)),n=[];for(let e=0;e<t;e++){let t=new F(this.textures[e%this.textures.length]);t.anchor.set(.5),t.eventMode=`none`,this.root.addChild(t),n.push(t)}c={sprites:n,clock:0,seen:!0,jitter:n.map(()=>(Math.random()-.5)*s.jitter),sizeMul:n.map((e,t)=>1+(Math.random()-.5)*s.scaleVariance-t*s.sizeFalloff)},this.riders.set(e,c)}c.seen=!0,c.clock+=r;let l=Math.max(.01,s.frameSeconds),u=i*s.sizeRatio,d=Math.atan2(-o,-a),f=Al(this.root);for(let[e,r]of c.sprites.entries()){let i=this.textures[Math.floor(c.clock/l)%this.textures.length];r.texture=i;let a=u*c.sizeMul[e],o=a*s.behindFactor*(1+e*s.spread),p=d+c.jitter[e];r.visible=!0,r.x=t+Math.cos(p)*o,r.y=n-Math.sin(p)*o,r.alpha=s.alpha;let m=a/Math.max(1,i.width);r.scale.set(m,f?-Math.abs(m):Math.abs(m))}}sweep(){for(let[e,t]of this.riders){if(t.seen){t.seen=!1;continue}for(let e of t.sprites)e.visible=!1,this.root.removeChild(e),e.destroy();this.riders.delete(e)}}riderForTest(e){let t=this.riders.get(e)?.sprites[0];return t?{x:t.x,y:t.y,width:t.width}:null}get state(){return{live:this.riders.size,frames:this.textures.length}}};function z_(e,t,n){return new Vi({text:e,style:{fill:t,fontSize:n,fontFamily:q.text.fontFamily,align:`center`}})}function B_(e){return(e/1048576).toFixed(2)}var V_=class{constructor(){J(this,`root`,new P),J(this,`backdrop`,new V),J(this,`bar`,new V),J(this,`title`,void 0),J(this,`percent`,void 0),J(this,`stats`,void 0),J(this,`canvasWidth`,0),J(this,`canvasHeight`,0),J(this,`scale`,1),J(this,`progress`,0),J(this,`musicWait`,!1),J(this,`lines`,[]),J(this,`speed`,0),J(this,`samples`,[]),this.root.eventMode=`none`,this.root.visible=!1;for(let e of[this.backdrop,this.bar])e.eventMode=`none`;this.title=z_(q.loading.label,q.loading.titleColour,q.loading.titleSize),this.title.anchor.set(.5,0),this.title.eventMode=`none`,this.percent=z_(``,q.loading.textColour,q.loading.textSize),this.percent.anchor.set(.5,0),this.percent.eventMode=`none`,this.stats=z_(``,q.loading.textColour,q.loading.textSize),this.stats.anchor.set(.5,0),this.stats.eventMode=`none`,this.root.addChild(this.backdrop,this.bar,this.title,this.percent,this.stats)}begin(){this.progress=0,this.speed=0,this.samples.length=0,this.musicWait=!1,this.lines=[],this.title.text=q.loading.label,this.redraw()}waitForMusic(){this.musicWait=!0,this.progress=1,this.lines=[q.loading.musicLabel],this.redraw()}layout(e,t){this.canvasWidth=e,this.canvasHeight=t,this.scale=Cm(e,t),this.title.style.fontSize=q.loading.titleSize,this.percent.style.fontSize=q.loading.textSize,this.stats.style.fontSize=q.loading.textSize,this.stats.style.lineHeight=q.loading.lineHeight,this.redraw()}update(e){if(this.musicWait)return;let t=q.loading;for(this.samples.push({seconds:e.seconds,bytes:e.bytesDone});this.samples.length>2&&e.seconds-this.samples[0].seconds>t.speedWindowSeconds;)this.samples.shift();let n=this.samples[0],r=this.samples[this.samples.length-1],i=r.seconds-n.seconds;this.speed=i>=.25?(r.bytes-n.bytes)/i:e.seconds>=.05?e.bytesDone/e.seconds:0,this.progress=e.bytesTotal>0?Math.min(1,e.bytesDone/e.bytesTotal):e.total>0?e.done/e.total:1,this.lines=e.bytesTotal>0?[`已下载  ${B_(e.bytesDone)} MB / ${B_(e.bytesTotal)} MB`,`速度  ${B_(this.speed)} MB/s`]:[`文件  ${e.done} / ${e.total}`],this.redraw()}redraw(){let e=this.scale,t=q.loading,n=this.canvasWidth,r=this.canvasHeight;if(n<=0||r<=0)return;this.backdrop.clear(),this.backdrop.rect(0,0,n,r).fill({color:t.scrimColour,alpha:t.scrimAlpha});let i=Math.min(n*.7,t.maxWidth*e),a=t.barHeight*e,o=t.titleSize*e,s=t.textSize*e,c=this.lines.length*t.lineHeight*e,l=o+t.gapTitle*e+a+t.gapBar*e+s+t.gapStats*e+c,u=r/2-l/2,d=(n-i)/2,f=u+o+t.gapTitle*e;this.bar.clear(),this.bar.roundRect(d,f,i,a,a/2).fill({color:t.trackColour,alpha:1}),this.progress>0&&this.bar.roundRect(d,f,Math.max(a,i*this.progress),a,a/2).fill({color:t.barColour,alpha:1}),this.title.scale.set(e),this.title.x=n/2,this.title.y=u,this.percent.text=`${Math.round(this.progress*100)}%`,this.percent.scale.set(e),this.percent.x=n/2,this.percent.y=f+a+t.gapBar*e,this.stats.text=this.lines.join(`
`),this.stats.scale.set(e),this.stats.x=n/2,this.stats.y=this.percent.y+s+t.gapStats*e}};function H_(e,t,n){return new Vi({text:e,style:{fill:t,fontSize:n,fontFamily:q.text.fontFamily,align:`center`,wordWrap:!0,breakWords:!0}})}var U_=class{constructor(){J(this,`root`,new P),J(this,`scrim`,new V),J(this,`panel`,new V),J(this,`title`,void 0),J(this,`score`,void 0),J(this,`lines`,void 0),J(this,`buttonBg`,new V),J(this,`buttonLabel`,void 0),J(this,`onMenu`,()=>{}),J(this,`open`,!1),J(this,`rect`,{x:0,y:0,w:0,h:0}),J(this,`button`,{x:0,y:0,w:0,h:0}),J(this,`pressed`,!1),J(this,`scale`,1),J(this,`canvasWidth`,0),J(this,`canvasHeight`,0),this.root.eventMode=`none`,this.root.visible=!1;for(let e of[this.scrim,this.panel,this.buttonBg])e.eventMode=`none`;this.title=H_(`下潜结束 · RUN COMPLETE`,15399423,22),this.title.style.wordWrap=!1,this.title.anchor.set(.5),this.title.eventMode=`none`,this.score=H_(``,q.summary.scoreColour,q.summary.scoreSize),this.score.anchor.set(.5),this.score.style.wordWrap=!1,this.score.eventMode=`none`,this.lines=H_(``,q.summary.lineColour,q.summary.lineSize),this.lines.anchor.set(.5,0),this.lines.eventMode=`none`,this.buttonLabel=H_(q.summary.buttonLabel,15399423,17),this.buttonLabel.anchor.set(.5),this.buttonLabel.eventMode=`none`,this.root.addChild(this.scrim,this.panel,this.title,this.score,this.lines,this.buttonBg,this.buttonLabel)}get isOpen(){return this.open}show(e){this.open=!0,this.root.visible=!0,this.score.text=`${e.score}`;let t=Math.floor(e.seconds/60),n=Math.floor(e.seconds%60);this.lines.text=[e.debug?`调试关 · 通关`:`通关 ${e.levels} / ${e.total} 关`,`用时 ${t}:${String(n).padStart(2,`0`)}`,e.score>=e.best&&e.score>0?`★ 新纪录（上次最佳 ${e.best}）`:`最佳得分 ${e.best}`,Yh()].join(`
`),this.redraw()}hide(){this.open=!1,this.root.visible=!1,this.pressed=!1}layout(e,t){this.canvasWidth=e,this.canvasHeight=t;let n=Cm(e,t);this.scale=n;let r=Math.min(e*.86,q.summary.maxWidth*n),i=Math.min(t*.62,q.summary.maxHeight*n);this.rect={x:(e-r)/2,y:(t-i)/2,w:r,h:i},this.title.scale.set(n),this.title.x=this.rect.x+r/2,this.title.y=this.rect.y+34*n,this.score.style.fontSize=q.summary.scoreSize,this.score.scale.set(n),this.score.x=this.rect.x+r/2,this.score.y=this.rect.y+112*n,this.lines.style.fontSize=q.summary.lineSize,this.lines.style.wordWrapWidth=(r-48*n)/n,this.lines.scale.set(n),this.lines.x=this.rect.x+r/2,this.lines.y=this.rect.y+162*n;let a=r-48*n,o=46*n;this.button={x:this.rect.x+24*n,y:this.rect.y+i-o-26*n,w:a,h:o},this.buttonLabel.scale.set(n),this.buttonLabel.x=this.button.x+a/2,this.buttonLabel.y=this.button.y+o/2,this.redraw()}handlePointerDown(e,t){if(!this.open)return!1;let n=this.button;return e<n.x||e>n.x+n.w||t<n.y||t>n.y+n.h||(this.pressed=!0,this.redraw(),!0)}handlePointerUp(e,t){if(!this.open)return!1;let n=this.button,r=e>=n.x&&e<=n.x+n.w&&t>=n.y&&t<=n.y+n.h,i=this.pressed;return this.pressed=!1,this.redraw(),i&&r&&this.onMenu(),!0}redraw(){if(!this.open)return;let e=this.scale,t=this.rect;this.scrim.clear(),this.scrim.rect(0,0,this.canvasWidth,this.canvasHeight).fill({color:q.summary.scrimColour,alpha:q.summary.scrimAlpha}),this.panel.clear(),this.panel.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:q.summary.panelColour,alpha:.97}).stroke({color:q.summary.panelRimColour,alpha:.6,width:1.5*e});let n=this.button;this.buttonBg.clear(),this.buttonBg.roundRect(n.x,n.y,n.w,n.h,10*e).fill({color:this.pressed?2771563:q.summary.buttonColour,alpha:.95}).stroke({color:6269132,alpha:.7,width:1.2*e})}},W_={left:[`KeyA`,`ArrowLeft`],right:[`KeyD`,`ArrowRight`],up:[`KeyW`,`ArrowUp`],down:[`KeyS`,`ArrowDown`],spit:[`KeyK`],compress:[`KeyL`],burst:[`KeyK`],mute:[`KeyM`]},G_=[`Digit1`,`Digit2`,`Digit3`],K_=class{constructor(){J(this,`down`,new Set),J(this,`disposers`,[]),J(this,`axisX`,0),J(this,`axisY`,0),J(this,`dragFracX`,0),J(this,`dragFracY`,0),J(this,`dragHeld`,!1),J(this,`dragAimX`,0),J(this,`dragAimY`,0),J(this,`suctionHeld`,!1),J(this,`spitPressed`,!1),J(this,`compressKeyHeld`,!1),J(this,`compressTouchHeld`,!1),J(this,`burstPressed`,!1),J(this,`muteKeyWasDown`,!1),J(this,`spitKeyWasDown`,!1),J(this,`burstKeyWasDown`,!1),J(this,`levelupKeyWasDown`,[!1,!1,!1]),J(this,`levelupChoice`,null),J(this,`mutePressed`,!1)}addDrag(e,t){this.dragFracX+=e,this.dragFracY+=t}setDragAim(e,t){this.dragAimX=e,this.dragAimY=t}consumeDrag(){let e={x:this.dragFracX,y:this.dragFracY};return this.dragFracX=0,this.dragFracY=0,e}releaseDrag(){this.dragFracX=0,this.dragFracY=0,this.dragHeld=!1,this.dragAimX=0,this.dragAimY=0}get debugPendingDrag(){return{x:this.dragFracX,y:this.dragFracY}}get compressing(){return this.compressKeyHeld||this.compressTouchHeld}pressBurst(){this.burstPressed=!0}consumeBurst(){return this.burstPressed?(this.burstPressed=!1,!0):!1}get steering(){return this.axisX!==0||this.axisY!==0||this.dragHeld}get sucking(){return this.suctionHeld}attach(e){let t=e=>{let t=e;t.repeat||(this.down.add(t.code),(t.code===`Space`||t.code.startsWith(`Arrow`))&&t.preventDefault())},n=e=>{this.down.delete(e.code)},r=()=>this.down.clear();e.addEventListener(`keydown`,t),e.addEventListener(`keyup`,n),window.addEventListener(`blur`,r),this.disposers=[()=>e.removeEventListener(`keydown`,t),()=>e.removeEventListener(`keyup`,n),()=>window.removeEventListener(`blur`,r)]}update(){let e=e=>e.some(e=>this.down.has(e)),t=+!!e(W_.right)-!!e(W_.left),n=+!!e(W_.up)-!!e(W_.down);this.axisX=t,this.axisY=n;let r=e(W_.mute);r&&!this.muteKeyWasDown&&(this.mutePressed=!0),this.muteKeyWasDown=r;let i=e(W_.spit);i&&!this.spitKeyWasDown&&(this.spitPressed=!0),this.spitKeyWasDown=i,this.compressKeyHeld=e(W_.compress);let a=e(W_.burst);a&&!this.burstKeyWasDown&&(this.burstPressed=!0),this.burstKeyWasDown=a;for(let[e,t]of G_.entries())this.down.has(t)&&!this.levelupKeyWasDown[e]&&(this.levelupChoice=e);this.levelupKeyWasDown=G_.map(e=>this.down.has(e))}consumeLevelUpChoice(){let e=this.levelupChoice;return this.levelupChoice=null,e}consumeMute(){return this.mutePressed?(this.mutePressed=!1,!0):!1}pressSpit(){this.spitPressed=!0}setCompressHeld(e){this.compressTouchHeld=e}consumeSpit(){return this.spitPressed?(this.spitPressed=!1,!0):!1}clearSteering(){this.releaseDrag(),this.axisX=0,this.axisY=0,this.suctionHeld=!1,this.compressTouchHeld=!1,this.compressKeyHeld=!1}detach(){for(let e of this.disposers)e();this.disposers=[],this.down.clear()}},q_=.8,J_=class{get compressPulse(){return performance.now()/1e3*2.4*Math.PI*2}has(e){return this.controls.includes(e)}setControls(e){this.controls=e,this.update()}constructor(e){J(this,`input`,void 0),J(this,`root`,new P),J(this,`surface`,new V),J(this,`buttonGfx`,new V),J(this,`dragPointer`,null),J(this,`dragX`,0),J(this,`dragY`,0),J(this,`dragAnchorX`,0),J(this,`dragAnchorY`,0),J(this,`laneWidthPx`,0),J(this,`canvasHeightPx`,0),J(this,`compressPointer`,null),J(this,`scale`,1),J(this,`spitFlash`,0),J(this,`spitButton`,{x:0,y:0,radius:0}),J(this,`compressButton`,{x:0,y:0,radius:0}),J(this,`burstButton`,{x:0,y:0,radius:0}),J(this,`burstFlash`,0),J(this,`controls`,Wh().controls),this.input=e,this.root.eventMode=`none`,this.root.addChild(this.surface,this.buttonGfx),this.surface.eventMode=`none`,this.buttonGfx.eventMode=`none`}onPointerDown(e,t,n){if(this.has(`spit`)&&this.isInSpitButton(t,n)){this.input.pressSpit(),this.spitFlash=1,this.update();return}if(this.has(`burst`)&&this.isInBurstButton(t,n)){this.input.pressBurst(),this.burstFlash=1,this.update();return}if(this.has(`compress`)&&this.isInCompressButton(t,n)){this.compressPointer===null&&(this.compressPointer=e,this.input.setCompressHeld(!0)),this.update();return}this.dragPointer===null&&(this.dragPointer=e,this.dragX=t,this.dragY=n,this.dragAnchorX=t,this.dragAnchorY=n,this.input.dragHeld=!0,this.input.setDragAim(0,0))}onPointerMove(e,t,n){if(this.dragPointer!==e)return;let r=t-this.dragX,i=-(n-this.dragY);this.dragX=t,this.dragY=n,this.laneWidthPx>0&&this.canvasHeightPx>0&&this.input.addDrag(r/this.laneWidthPx,i/this.canvasHeightPx),this.input.setDragAim(t-this.dragAnchorX,-(n-this.dragAnchorY))}onPointerUp(e){this.compressPointer===e&&(this.compressPointer=null,this.input.setCompressHeld(!1),this.update()),this.dragPointer===e&&(this.dragPointer=null,this.input.releaseDrag())}releaseAll(){this.dragPointer=null,this.compressPointer=null,this.input.releaseDrag(),this.input.suctionHeld=!1,this.input.setCompressHeld(!1),this.update()}isInSpitButton(e,t){let n=e-this.spitButton.x,r=t-this.spitButton.y,i=this.spitButton.radius*1.35;return n*n+r*r<=i*i}isInCompressButton(e,t){let n=e-this.compressButton.x,r=t-this.compressButton.y,i=this.compressButton.radius*1.2;return n*n+r*r<=i*i}isInBurstButton(e,t){let n=e-this.burstButton.x,r=t-this.burstButton.y,i=this.burstButton.radius*1.35;return n*n+r*r<=i*i}drawBurstButton(){let e=this.buttonGfx,t=this.burstButton;if(t.radius<=0)return;let n=q.angry.appearance[q.angry.appearance.length-1];if(this.burstFlash=Math.max(0,this.burstFlash-.05),this.burstFlash>0){let n=1.15+(1-this.burstFlash)*.7;e.circle(t.x,t.y,t.radius*n).stroke({color:q.angry.burst.waveColour,alpha:.5*this.burstFlash,width:Math.max(1,2.4*this.scale)})}e.circle(t.x,t.y,t.radius).fill({color:2757656,alpha:.72}),e.circle(t.x,t.y,t.radius).stroke({color:n.rim,alpha:.85,width:2});for(let n=0;n<3;n++)e.circle(t.x,t.y,t.radius*(.32+n*.24)).stroke({color:q.angry.burst.waveColour,alpha:.7-n*.18,width:Math.max(1,1.6*this.scale)});e.circle(t.x,t.y,t.radius*.18).fill({color:q.angry.burst.waveColour,alpha:.9})}layout(e,t,n,r){let i=Cm(n,r);this.scale=i,this.laneWidthPx=t,this.canvasHeightPx=r,this.surface.clear(),this.surface.rect(0,0,n,r).fill({color:16777215,alpha:.001});let a=q.touch,o=Math.min(a.buttonRadius*i,t*a.buttonMaxRadiusRatio),s=e+t-a.rightInset*i-o,c=a.buttonGap*i,l=r-a.bottomInset*i,u=e=>{let t={x:s,y:l-e,radius:e};return l=t.y-e-c,t};this.spitButton=u(o),this.burstButton={...this.spitButton},this.compressButton=u(o*q_),this.update()}update(){this.buttonGfx.clear(),this.has(`spit`)&&this.drawSpitButton(),this.has(`burst`)&&this.drawBurstButton(),this.has(`compress`)&&this.drawCompressButton()}drawCompressButton(){let e=this.buttonGfx,t=this.compressButton;if(t.radius<=0)return;let n=this.compressPointer!==null,r=10354648;if(n){let n=.5+.5*Math.sin(this.compressPulse);e.circle(t.x,t.y,t.radius*(1.3+.14*n)).fill({color:r,alpha:.12+.14*n}),e.circle(t.x,t.y,t.radius*(1.3+.14*n)).stroke({color:r,alpha:.8,width:Math.max(1,2*this.scale)})}e.circle(t.x,t.y,t.radius).fill({color:n?1586220:1780260,alpha:.66}),e.circle(t.x,t.y,t.radius).stroke({color:r,alpha:n?.95:.5,width:2});for(let r=0;r<4;r++){let i=r/4*Math.PI*2+Math.PI/4,a=t.radius*.8,o=t.radius*(n?.34:.52);e.moveTo(t.x+Math.cos(i)*a,t.y+Math.sin(i)*a),e.lineTo(t.x+Math.cos(i)*o,t.y+Math.sin(i)*o)}e.stroke({color:r,alpha:n?.95:.6,width:Math.max(1,1.8*this.scale)}),e.circle(t.x,t.y,t.radius*(n?.14:.22)).fill({color:14221296,alpha:.85})}drawSpitButton(){let e=this.buttonGfx,t=this.spitButton;if(!(t.radius<=0)){this.spitFlash=Math.max(0,this.spitFlash-.06),this.spitFlash>0&&e.circle(t.x,t.y,t.radius*(1.25+this.spitFlash*.35)).fill({color:16766073,alpha:.32*this.spitFlash}),e.circle(t.x,t.y,t.radius).fill({color:2761752,alpha:.72}),e.circle(t.x,t.y,t.radius).stroke({color:16766073,alpha:.85,width:2});for(let n=0;n<3;n++){let r=n/3*Math.PI*2-Math.PI/2,i=t.radius*.34,a=t.radius*.74;e.moveTo(t.x+Math.cos(r)*i,t.y+Math.sin(r)*i),e.lineTo(t.x+Math.cos(r)*a,t.y+Math.sin(r)*a)}e.stroke({color:16766073,alpha:.9,width:Math.max(1,2*this.scale)}),e.circle(t.x,t.y,t.radius*.2).fill({color:16773328,alpha:.9})}}get debugState(){return{steering:this.dragPointer!==null,dragPointers:this.dragPointer===null?0:1,pendingX:this.input.debugPendingDrag.x,pendingY:this.input.debugPendingDrag.y,aimX:this.input.dragAimX,aimY:this.input.dragAimY,pointerAt:this.dragPointer===null?null:{x:this.dragX,y:this.dragY},sucking:this.input.suctionHeld,compressing:this.input.compressing,compressPointer:this.compressPointer}}get spitGeometry(){return{...this.spitButton}}get compressGeometry(){return{...this.compressButton}}get burstGeometry(){return{...this.burstButton}}get controlIds(){return this.controls}get layers(){return{surface:this.surface,button:this.buttonGfx}}};function Y_(e){let t=1;for(let n=e.parent;n;n=n.parent)t*=n.scale.y;return t<0}var X_=1.6,Z_=-.18,Q_=.25,$_=class{get onSlam(){return this.run.hasArmour}constructor(e){J(this,`app`,void 0),J(this,`run`,new Ag),J(this,`input`,new K_),J(this,`camera`,new wm),J(this,`scene`,new Dm),J(this,`hud`,new Nm),J(this,`touch`,new J_(this.input)),J(this,`settings`,new w_),J(this,`music`,new O_),J(this,`recordedMusic`,new I_),J(this,`soundedCharging`,new Set),J(this,`soundedDischarging`,new Set),J(this,`soundedErupting`,new Set),J(this,`soundedAttacking`,new Set),J(this,`healthClock`,0),J(this,`wasSucking`,!1),J(this,`bossWarned`,!1),J(this,`summary`,new U_),J(this,`menu`,new e_),J(this,`routePick`,new l_),J(this,`selectedRoute`,null),J(this,`pickups`,new V),J(this,`hitboxOverlay`,new V),J(this,`crateWarnings`,new V),J(this,`leaving`,new V),J(this,`backSchools`,new y_),J(this,`bubble`,new V),J(this,`loading`,new V_),J(this,`hitParticles`,new L_),J(this,`chargeTrail`,new R_),J(this,`pendingStart`,!1),J(this,`burstWave`,new V),J(this,`particles`,new V),J(this,`flash`,new V),J(this,`brokenGlow`,new V),J(this,`brokenCrack`,new V),J(this,`brokenVignette`,new V),J(this,`shownVignetteStrength`,-1),J(this,`shownBrokenStrength`,-1),J(this,`shownBrokenColour`,-1),J(this,`brokenScreenSeed`,1),J(this,`endTrace`,[]),J(this,`fps`,60),J(this,`accumulator`,0),J(this,`frameCount`,0),J(this,`lastDelta`,0),J(this,`explosions`,[]),J(this,`shake`,{seconds:0,total:0,pixels:0}),J(this,`phaseBeforePause`,`playing`),J(this,`pointerLog`,[]),J(this,`pointerPositions`,new Map),J(this,`bossView`,null),J(this,`audioMuted`,!1),J(this,`popups`,new jg(q.score.popups)),J(this,`damagePopups`,new jg(q.damagePopups)),J(this,`grazePopups`,new jg(q.grazePopups)),J(this,`callouts`,new jg(q.mutation.callouts)),J(this,`levelup`,new u_),J(this,`grazeSlow`,0),J(this,`grazeFlash`,0),J(this,`pickSlow`,0),J(this,`pickRampArmed`,!1),J(this,`splash`,0),J(this,`bubbleSprite`,null),J(this,`bulletSprites`,[]),J(this,`enemyBulletSprites`,new Map),J(this,`bubbleSprites`,[]),J(this,`bubblePictureOrder`,null),J(this,`bubbleSpriteFor`,``),J(this,`trackedBubbleId`,null),this.app=e,this.run.nominalSeconds=ym($),this.scene.world.addChild(this.backSchools.root,this.pickups,this.leaving,this.burstWave,this.bubble,this.particles),this.scene.world.addChild(this.hitboxOverlay),this.scene.world.addChild(this.hitParticles.graphics),this.scene.world.addChild(this.chargeTrail.root),this.flash.visible=!1,this.brokenGlow.visible=!1,this.brokenCrack.visible=!1,this.brokenVignette.visible=!1,this.app.stage.addChild(this.scene.root,this.popups.root,this.damagePopups.root,this.grazePopups.root,this.callouts.root,this.brokenVignette,this.brokenGlow,this.brokenCrack,this.flash,this.hud.root,this.crateWarnings,this.touch.root),this.app.stage.addChild(this.loading.root,this.levelup.root,this.menu.root,this.routePick.root,this.settings.root,this.summary.root),this.levelup.onPick=e=>this.pickMutation(e),this.summary.onMenu=()=>this.exitToMenu(),this.settings.setVolume(sh.getVolume()),this.settings.setOpen(!1),this.settings.root.visible=!1,this.settings.onVolume=e=>sh.setVolume(e),this.settings.onMusicVolume=e=>sh.setMusicSlider(e),this.settings.onCue=e=>sh.play(e,.8),this.settings.onOpen=()=>this.openSettings(),this.settings.onClose=()=>this.closeSettings(),this.settings.onRestart=()=>this.restartLevel(),this.settings.onInfiniteHealth=e=>{this.run.infiniteHealth=e},this.settings.onReducedFlash=e=>{Hd(e)},this.settings.onDebugMode=()=>this.refreshLevelMenu(),this.settings.onShowHitboxes=e=>{qm(e)},this.settings.onExit=()=>this.exitToMenu(),this.settings.onEnterDebugLevel=()=>this.enterDebugLevel(),this.menu.onStart=()=>this.openFormPick(),this.routePick.onPick=e=>{this.selectedRoute=e===zh.id?null:e,this.beginWithLoading()},this.menu.onSettings=()=>this.openSettings(),this.settings.onPickLevel=e=>{this.run.progress.select(e),this.refreshLevelMenu()},qm(this.settings.showHitboxesOn),this.refreshLevelMenu(),this.input.attach(window);let t=this.app.stage;t.eventMode=`static`,t.hitArea={contains:()=>!0},t.on(`pointerdown`,e=>{this.menu.pointerHovers=e.pointerType!==`touch`,this.handlePointerDown(e.pointerId,e.global.x,e.global.y)}),t.on(`globalpointermove`,e=>{this.menu.pointerHovers=e.pointerType!==`touch`,this.handlePointerMove(e.pointerId,e.global.x,e.global.y)}),t.on(`pointerup`,e=>{this.menu.pointerHovers=e.pointerType!==`touch`,this.handlePointerUp(e.pointerId)}),t.on(`wheel`,e=>{this.settings.handleWheel(e.global.x,e.global.y,e.deltaY)}),t.on(`pointerupoutside`,e=>this.handlePointerUp(e.pointerId)),t.on(`pointercancel`,e=>this.handlePointerUp(e.pointerId)),this.run.player.reset(),this.run.scrolled=0,this.camera.setScroll(0),this.run.player.syncToCamera(this.camera.y,this.camera.viewport.visibleDepthMeters),sh.silenceAmbience(),this.layout(),this.bootMenu(),window.__GB={tuning:Sl,player:this.run.player,camera:this.camera,input:this.input,scene:this.scene,hud:this.hud,game:this,mechRef:q,layout:{computeViewport:Sm,designScale:Cm}},this.app.ticker.add(e=>this.frame(e.deltaMS/1e3))}get lateralSnapshot(){return this.run.lateral}handleResize(){this.layout()}get touchState(){return this.touch.debugState}logPointer(e,t,n,r){this.pointerLog.push({t:+this.run.elapsed.toFixed(2),kind:e,id:t,x:Math.round(n),y:Math.round(r)}),this.pointerLog.length>60&&this.pointerLog.shift()}handlePointerDown(e,t,n){if(this.run.phase!==`boot`){if(sh.unlock(),this.recordedMusic.play(this.run.phase===`menu`?`menu`:this.recordedMusic.playing===`menu`?null:this.recordedMusic.playing),this.recordedMusic.update(0,sh.musicBus()),this.logPointer(`down`,e,t,n),this.pointerPositions.set(e,{x:t,y:n}),this.run.phase===`menu`){if(this.settings.isOpen){this.settings.handlePointerDown(e,t,n);return}this.menu.handlePointerDown(t,n);return}if(this.run.phase===`formPick`){this.routePick.handlePointerDown(t,n);return}this.run.phase!==`loading`&&(this.summary.handlePointerDown(t,n)||this.settings.handlePointerDown(e,t,n)||this.levelup.handlePointerDown(e,t,n)||this.run.phase!==`paused`&&this.touch.onPointerDown(e,t,n))}}handlePointerMove(e,t,n){if(this.run.phase!==`boot`){if(this.logPointer(`move`,e,t,n),this.pointerPositions.set(e,{x:t,y:n}),this.run.phase===`menu`){if(this.settings.isOpen){this.settings.handlePointerMove(e,t,n);return}this.menu.handlePointerMove(t,n);return}if(this.run.phase===`formPick`){this.routePick.handlePointerMove(t,n);return}this.run.phase!==`loading`&&(this.settings.handlePointerMove(e,t,n)||this.levelup.handlePointerMove(e,t,n)||this.run.phase!==`paused`&&this.touch.onPointerMove(e,t,n))}}handlePointerUp(e){if(this.run.phase===`boot`)return;this.logPointer(`up`,e,-1,-1);let t=this.pointerPositions.get(e)??{x:-1,y:-1};if(this.pointerPositions.delete(e),this.run.phase===`menu`){if(this.settings.isOpen){this.settings.handlePointerUp(e,t.x,t.y);return}this.menu.handlePointerUp(t.x,t.y);return}if(this.run.phase===`formPick`){this.routePick.handlePointerUp(t.x,t.y);return}this.run.phase!==`loading`&&(this.summary.handlePointerUp(t.x,t.y)||this.settings.handlePointerUp(e,t.x,t.y)||this.levelup.handlePointerUp(e,t.x,t.y)||this.run.phase!==`paused`&&this.touch.onPointerUp(e))}get pointerTrace(){return this.pointerLog}get canvasSize(){return{width:this.app.renderer.screen.width,height:this.app.renderer.screen.height}}get touchRef(){return this.touch}get enemyBulletsRef(){return this.run.enemyBullets}get rateTierRef(){return this.run.rateTier}hazardArtSpriteRef(e){return Of(e)}handlePointerDownRef(e,t,n){this.handlePointerDown(e,t,n)}async probeAssetsLoad(e){let t=await Gl(e);return t?`loaded `+t.width+`x`+t.height:`no texture for `+e}chargeTrailRiderRef(e){return this.chargeTrail.riderForTest(e)}get chargeTrailRef(){return this.chargeTrail.state}get hitParticlesRef(){return this.hitParticles.count}get bulletSpritesRef(){return this.bulletSprites}get bubbleSpriteRef2(){return this.bubbleSprite}get bubbleRef(){return this.bubble}get bubbleSpriteRef(){return!!this.bubbleSprite?.visible}get backdropLoadedRef(){return this.scene.backdropLoaded}get backdropErrorRef(){return this.scene.backdropError}get parallaxRef(){return this.scene.parallax}get summaryRef(){return this.summary}get slowMotionRef(){return{scale:this.timeScale(),pickScale:this.pickTimeScale(),pickLeft:this.pickSlow,rampArmed:this.pickRampArmed,pickProtected:this.run.pickProtected}}get musicRef(){return this.music}get recordedMusicRef(){return this.recordedMusic}get chargeRef(){return this.run.charge}get gunStreamsRef(){return this.run.gunStreams}get scorePopupsRef(){return this.popups}get damagePopupsRef(){return this.damagePopups}get hudRef(){return this.hud}get levelRef(){return $}get settingsRef(){return this.settings}canEatHazardForTest(e){return this.run.canSwallow(e)}get suctionUp(){return Kh(this.run.bubbleType,`suction`)?this.input.sucking:!1}suctionReachForTest(){return this.camera.viewport.laneWidthMeters*Au(this.run.player.volume)*this.run.suctionRadiusFactor}debugSpawnObstacleOnPlayer(e,t=0){let n=this.camera.viewport.laneWidthMeters;this.run.obstacles.spawn(e,this.run.player.x*n,this.run.player.y+t)}demoteStageForTest(){return Ph(this.run.stage),this.run.player.stageSpeedMultiplier=this.run.stage.speedMultiplier,this.run.stage.stage}get menuRef(){return this.menu}debugStartRunWithRoute(e){return this.selectedRoute=e===zh.id?null:e,this.enterFromMenu(),this.run.route}debugRouteIds(){return[zh.id,...Vh.map(e=>e.id)]}debugGrantMutationPoints(e){return this.run.xp.debugAddForTest(e),this.run.xp.pending}get levelupRef(){return this.levelup}useBurstForTest(){this.run.useBurst(this.worldView().laneWidth)}debugProgress(){return{cleared:[...this.run.progress.cleared],ladder:this.run.progress.entries()}}debugClearLevel(e){let t=this.run.progress.clear(e);return this.refreshLevelMenu(),t}debugSelectLevel(e){return this.run.progress.select(e)?(this.refreshLevelMenu(),!0):!1}debugResetProgress(){this.run.progress.reset(),this.refreshLevelMenu()}debugInstallSpawnBlocks(e){let t=vm(e);return this.startRun(),t}debugGrantRageForTest(e){return uh(this.run.rage,e),this.run.rage.rage}get playerScreenPx(){let e=this.scene.world,t=this.camera.viewport,n=t.laneWidthMeters*Mh(this.run.stage.stage,this.run.player.volume);return{x:e.x+this.run.player.x*t.laneWidthMeters*e.scale.x,y:e.y+this.run.player.y*e.scale.y,radiusPx:n*e.scale.x}}get endTraceRef(){return this.endTrace}get spawnLogRef(){return this.run.spawnLog}waterColourAt(e,t){return Am(e,t,$)}debugSkipToLevelEnd(){this.run.scrolled=$.scrollLength,this.run.timelineEmitted=hm.length,this.run.field.placeTimeline(hm,this.run.scrolled,this.camera.visibleWorldRange(0).max),this.run.field.takePending(),this.run.hazards.hazards=[],this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,this.camera.viewport.visibleDepthMeters)}onPointerDownForTest(e,t){this.touch.onPointerDown(1,e,t)}onPointerUpForTest(){this.touch.onPointerUp(1)}debugSpawnHazardOnPlayer(e){let t=this.camera.viewport.laneWidthMeters,n=this.run.hazards.spawnForTest(e,this.run.player.x*t,this.run.player.y,t);n.fuse=0,n.armed=!0}get audioRef(){return sh}get hazardsRef(){return this.run.hazards}get backSchoolLayerRef(){return this.backSchools}bossAnimationRef(){return kf(this.run.hazards)}debugResetStats(){this.run.stats={absorbed:0,hits:0,maxVolume:this.run.stats.maxVolume,ended:this.run.stats.ended,newRecord:!1},this.run.player.volume=Sl.volumeMax,this.run.player.slowRemaining=0,this.run.player.slowFactor=1,this.run.player.impulseVy=0,this.run.invulnerable=0,this.run.trashDrain=0,this.run.comedyBeats=0,this.run.lastComedyBeat=null,this.run.hazards.reset()}debugSetSteadyCruise(){this.touch.releaseAll(),this.input.clearSteering()}layout(){let e=this.app.renderer.screen.width,t=this.app.renderer.screen.height;this.camera.viewport=Sm(e,t);let n=this.camera.viewport;this.run.lateral=mg(n.laneWidthMeters),this.scene.layout(n,$),this.hud.layout(n),this.popups.layout(n),this.damagePopups.layout(n),this.grazePopups.layout(n),this.callouts.layout(n),this.touch.layout(n.left,n.laneWidthPx,e,t),this.settings.layout(n),this.levelup.layout(n),this.menu.layout(n),this.routePick.layout(n),this.loading.layout(e,t),this.summary.layout(e,t),this.flash.clear(),this.flash.rect(0,0,e,t).fill({color:16777215,alpha:1})}updateBrokenScreen(e,t){let n=q.hud.brokenScreen,r=this.run.healthView,i=r.max>0?r.current/r.max:1,a=Math.max(1e-6,n.threshold-n.maxThreshold),o=e?0:Math.min(1,Math.max(0,(n.threshold-i)/a));if(this.updateBrokenVignette(o,t),o<=0){this.shownBrokenStrength!==0&&(this.shownBrokenStrength=0,this.shownBrokenColour=-1,this.brokenGlow.clear(),this.brokenCrack.clear(),this.brokenGlow.visible=!1,this.brokenCrack.visible=!1);return}let s=Rh(this.run.bubbleType,this.run.stage.stage,this.run.rage.rage);Math.abs(o-this.shownBrokenStrength)<.02&&s===this.shownBrokenColour||(this.shownBrokenStrength<=0&&(this.brokenScreenSeed=n.seed===0?(Math.random()*2147483647|0)+1:n.seed),this.shownBrokenStrength=o,this.shownBrokenColour=s,this.drawCracks(o,s))}updateBrokenVignette(e,t){let n=q.hud.brokenScreen.vignette;if(e<=0){this.shownVignetteStrength!==0&&(this.shownVignetteStrength=0,this.brokenVignette.clear(),this.brokenVignette.visible=!1);return}Math.abs(e-this.shownVignetteStrength)>.01&&(this.shownVignetteStrength=e,this.buildBrokenVignette()),this.brokenVignette.visible=!0;let r=.5+.5*Math.sin(t*Math.PI*2*n.pulseHz);this.brokenVignette.alpha=n.alpha*e*(1-n.pulseDepth*r)}buildBrokenVignette(){let e=q.hud.brokenScreen.vignette,t=this.brokenVignette,{height:n}=this.canvasSize;t.clear();let r=this.camera.viewport,i=r.left,a=r.laneWidthPx,o=a*e.reachRatio,s=n*e.reachRatio,c=km(e.colour,1),l=km(e.colour,0),u=(e,n,r,i,a)=>{let o=a===`top`||a===`bottom`,s=a===`bottom`||a===`right`;t.rect(e,n,r,i).fill({fill:new Ne({start:o?{x:0,y:+!!s}:{x:+!!s,y:0},end:o?{x:0,y:+!s}:{x:+!s,y:0},colorStops:[{offset:0,color:c},{offset:1,color:l}],textureSpace:`local`}),alpha:1})};u(i,0,a,s,`top`),u(i,n-s,a,s,`bottom`),u(i,0,o,n,`left`),u(i+a-o,0,o,n,`right`)}drawCracks(e,t){let n=q.hud.brokenScreen,r=this.camera.viewport.laneWidthPx*n.reachRatio*(.35+.65*e),i=Math.round(n.crackCountNear+(n.crackCountDeep-n.crackCountNear)*e),a=n.alphaNear+(n.alphaDeep-n.alphaNear)*e;this.brokenGlow.clear(),this.brokenCrack.clear(),this.brokenGlow.visible=!0,this.brokenCrack.visible=!0,this.crackPolylines(this.brokenGlow,r,i,tv(this.brokenScreenSeed)),this.brokenGlow.stroke({color:t,alpha:a*n.glowAlphaRatio,width:n.width*n.glowWidthRatio}),this.crackPolylines(this.brokenCrack,r,i,tv(this.brokenScreenSeed)),this.brokenCrack.stroke({color:t,alpha:a,width:n.width})}crackPolylines(e,t,n,r){let i=q.hud.brokenScreen,a=this.camera.viewport,o=a.left,s=a.left+a.laneWidthPx,c=this.canvasSize.height;for(let a=0;a<n;a++){let n=r()<.5,a=n?o:s,l=r()*c,u=n?0:Math.PI,d=this.oneCrack(e,a,l,u,t,i.segmentsPerCrack,r);if(r()<i.branchChance){let n=d[Math.max(1,Math.min(d.length-1,Math.round((d.length-1)*i.branchAtRatio)))],a=t*i.branchLengthRatio,o=(r()<.5?-1:1)*i.branchAngleRadians*(.75+.25*r());this.oneCrack(e,n.x,n.y,n.heading+o,a,Math.max(1,i.segmentsPerCrack-1),r)}}}oneCrack(e,t,n,r,i,a,o){let s=q.hud.brokenScreen,c=i/Math.max(1,a),l=[{x:t,y:n,heading:r}];e.moveTo(t,n);let u=t,d=n,f=r;for(let t=0;t<a;t++){f+=(o()-.5)*s.segmentTurn;let t=c*(1+(o()-.5)*2*s.segmentJitter);u+=Math.cos(f)*t,d+=Math.sin(f)*t,e.lineTo(u,d),l.push({x:u,y:d,heading:f})}return l}frame(e){let t=Math.min(e,.05);this.frameCount++,this.lastDelta=e,this.fps+=((e>0?1/e:60)-this.fps)*.1,(this.grazeSlow>0||this.pickSlow>0)&&this.run.phase!==`paused`&&this.run.phase!==`levelup`&&this.run.phase!==`menu`&&(this.grazeSlow=Math.max(0,this.grazeSlow-t),this.grazeFlash=Math.max(0,this.grazeFlash-t),this.pickSlow=Math.max(0,this.pickSlow-t)),this.run.pickProtected=this.run.phase===`playing`&&this.pickRampArmed,this.recordedMusic.play(this.run.phase===`menu`?`menu`:this.recordedMusic.playing===`menu`?null:this.recordedMusic.playing),this.updateMusicForSlowMotion(),this.recordedMusic.update(t,sh.musicBus());let n=t*this.timeScale();this.accumulator+=n;let r=1/120,i=0;for(;this.accumulator>=r&&i<8;)this.step(r),this.applyRunEvents(),this.accumulator-=r,i++;this.render(n)}timeScale(){return Math.min(this.slowScale(this.grazeSlow,q.slowMotion.graze),this.slowScale(this.pickSlow,q.slowMotion.pick))}slowScale(e,t){if(e<=0)return 1;let n=t.slowSeconds+t.recoverSeconds-e;if(n<t.slowSeconds)return t.factor;let r=Math.min(1,(n-t.slowSeconds)/Math.max(.01,t.recoverSeconds));return t.factor+(1-t.factor)*r}pickTimeScale(){return this.slowScale(this.pickSlow,q.slowMotion.pick)}worldView(){let e=this.camera.visibleWorldRange(0);return{laneWidth:this.camera.viewport.laneWidthMeters,visibleDepthMeters:this.camera.viewport.visibleDepthMeters,min:e.min,max:e.max}}step(e){let t=this.worldView();if(this.input.update(),this.run.phase!==`menu`&&this.input.consumeMute()&&(this.audioMuted=sh.toggleMute()),this.run.phase===`levelup`){let e=this.input.consumeLevelUpChoice();e!==null&&this.pickMutation(e);return}if(this.run.phase===`paused`||this.run.phase===`menu`||this.run.phase===`boot`)return;this.run.invulnerable>0&&(this.run.invulnerable=Math.max(0,this.run.invulnerable-e)),this.updateTransientOverlays(e),this.run.hazards.tickDeaths(e);let n=this.camera.viewport,{min:r,max:i}=this.camera.visibleWorldRange(20);if(this.run.cameraRise=0,this.run.phase===`playing`||this.run.phase===`burst`){let r=this.run.scrolled;if(this.run.paceMps=$.scrollSpeed,this.run.scrolled=Math.min($.scrollLength,this.run.scrolled+this.run.paceMps*e),this.run.cameraRise=this.run.scrolled-r,this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,n.visibleDepthMeters),this.run.phase===`playing`){this.run.field.placeTimeline(hm,this.run.scrolled,this.camera.visibleWorldRange(0).max);for(let e of this.run.field.takePending())this.run.emitTimelineEntry(e.entry,e.worldY,t.laneWidth,t),this.run.timelineEmitted++}}else this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,n.visibleDepthMeters);let a=this.suctionUp?{x:this.run.player.x*n.laneWidthMeters,y:this.run.player.y}:null;switch(this.run.player.suctionMoveFactor=a?q.suction.moveSpeedFactor:1,this.run.field.update(e,n.laneWidthMeters,r,i,this.run.player.volume,this.run.paceMps,a,this.run.suctionRadiusFactor),this.run.phase){case`intro`:{this.run.phaseTimer-=e,this.run.elapsed+=e;let t=Math.min(1,Math.max(0,1-this.run.phaseTimer/X_)),n=1-(1-t)*(1-t);this.run.player.screenY=Z_+.43*n,this.run.phaseTimer<=0&&(this.run.player.screenY=Q_,this.run.phase=`playing`);return}case`cleared`:if(this.run.phaseTimer-=e,this.run.phaseTimer>0||this.run.hazards.dying)return;this.run.phase=`ascend`,this.run.ascendMetres=0;return;case`ascend`:{let t=this.camera.viewport.visibleDepthMeters;if(this.run.player.screenY=Math.min(1.4,this.run.player.screenY+q.audio.ascendScreensPerSecond*e),this.run.ascendMetres+=t*q.audio.ascendScreensPerSecond*e,this.run.player.screenY<1.15)return;this.finishLevelAndContinue();return}case`summary`:case`burst`:if(this.run.phaseTimer-=e,this.run.phaseTimer>0||this.run.phase===`summary`)return;if(this.run.pendingLevel){let e=this.run.pendingLevel;this.run.pendingLevel=null,this.enterLevel(e,!0);return}this.startRun();return;case`playing`:this.run.elapsedTotal+=e,this.run.regen(e),this.run.xp.tick(e);for(let e of this.run.hazards.takeHitEvents()){let t=e.hazard===`fallcrate`&&e.kind===`defeat`?`obstacle.break.crate`:e.kind===`hit`?Vc(e.hazard):Hc(e.hazard);this.sound(t,.5,this.panAt(e.x)),e.kind!==`escaped`&&this.hitParticles.emit({x:e.x,y:e.y,radius:e.radiusFraction*this.camera.viewport.laneWidthMeters,kind:e.kind,colour:e.colour})}for(let e of this.run.hazards.takeCritHits()){let t=q.hitFeedback;if(this.sound(`hit.crit`),t.critShakePixels<=0||t.critShakeSeconds<=0)continue;let n=t.critShakePixels*e.strength*Cm(this.app.screen.width,this.app.screen.height);this.shake.seconds>t.critShakeSeconds&&this.shake.pixels>n||(this.shake={seconds:t.critShakeSeconds,total:t.critShakeSeconds,pixels:n})}this.hitParticles.update(e);for(let t of this.run.hazards.hazards){if(!t.charge)continue;let n=gf(t.kind).telegraphSeconds;if(t.charge.elapsed<n)continue;let r=t.charge.toX-t.charge.fromX,i=t.charge.toY-t.charge.fromY,a=Math.hypot(r,i)||1;this.chargeTrail.ride(t.id,t.x,t.y,e,this.camera.viewport.laneWidthMeters,r/a,i/a)}this.chargeTrail.sweep()}this.run.laneWidth=t.laneWidth,this.run.updateBullets(e,n.laneWidthMeters,r,i),this.run.obstacles.update(e,r,i),this.run.elapsed+=e,sh.tick(e),sh.setAmbient(q.audio.ambientVolume),this.run.updateRage(e,this.worldView().laneWidth),this.run.player.update(this.input,e,this.run.lateral),this.run.player.syncToCamera(this.camera.y,n.visibleDepthMeters),this.run.player.clampToScreen(this.camera.y,n.visibleDepthMeters),this.run.resolveHazards(e,r,i,t.laneWidth,t,this.input),this.run.resolveContacts(e,t),this.music.update(e,this.pickTimeScale()),this.updateBoss(),this.run.updateConductiveCharge(e,n.laneWidthMeters),this.watchHazardsForSound(e),this.run.phase===`playing`&&this.run.xp.pending>0&&this.stepMutationPick(),this.endTrace.push({scrolled:+this.run.scrolled.toFixed(1),hazards:this.run.hazards.hazards.length,bubbles:this.run.field.bubbles.length,emitted:this.run.timelineEmitted,total:hm.length,phase:this.run.phase}),this.endTrace.length>8&&this.endTrace.shift()}stepMutationPick(){let e=q.slowMotion.pick;if(this.pickSlow<=0){this.pickSlow=e.slowSeconds+e.recoverSeconds,this.pickRampArmed=!0,this.sound(`levelup.ramp`,.8);return}this.pickRampArmed&&e.slowSeconds+e.recoverSeconds-this.pickSlow>=e.slowSeconds&&(this.pickRampArmed=!1,this.openLevelUp())}openLevelUp(){this.sound(`levelup.open`,.6),this.run.phase=`levelup`,this.touch.releaseAll(),this.input.consumeLevelUpChoice(),this.levelup.openWith(h_(this.run),`突变 · 三选一`)}pickMutation(e){if(this.run.phase!==`levelup`||!this.levelup.open)return;let t=this.levelup.choiceAt(e);if(t){if(m_(this.run,t),this.sound(t.id.startsWith(`route:`)?`mutation.gain`:`levelup.pick`,.7),t.id.startsWith(`route:`)&&this.applyFormToTouch(),this.run.xp.consume(),this.levelup.close(),this.run.xp.pending>0){this.levelup.openWith(h_(this.run),`突变 · 三选一`);return}this.run.phase=`playing`,this.run.invulnerable=Math.max(this.run.invulnerable,q.mutation.resumeInvulnerableSeconds)}}openFormPick(){this.routePick.setOptions(this.formOptions()),this.run.phase=`formPick`,this.touch.releaseAll(),this.routePick.layout(this.camera.viewport)}formOptions(){let e=sm[sm.length-1]?.id??``,t=ag(this.run.progress.cleared,e);return[{id:zh.id,name:zh.name,title:Bh,blurb:zh.tagline,locked:!1},...Vh.map(e=>({id:e.id,name:e.name,title:e.title,blurb:e.blurb,locked:!t}))]}async bootMenu(){let e=q.loading,t=performance.now();this.loading.begin();let n=this.recordedMusic.whenPlayable(`menu`);await Zl(Wl(),e=>this.loading.update(e)),this.loading.waitForMusic();let r=new Promise(t=>window.setTimeout(t,e.bootTimeoutSeconds*1e3));await Promise.race([n,r]);let i=e.minSeconds*1e3-(performance.now()-t);i>0&&await new Promise(e=>window.setTimeout(e,i)),this.run.phase===`boot`&&(this.run.phase=`menu`,this.menu.beginIntro())}async beginWithLoading(){this.sound(`menu.start`,.7),this.pendingStart=!0,this.run.phase=`loading`,this.menu.root.visible=!1,this.touch.releaseAll(),this.loading.begin(),await Zl(Ul(),e=>this.loading.update(e)),await cf(),this.pendingStart&&(this.pendingStart=!1,this.enterFromMenu())}startRun(e=!1){this.run.clearBlockFlips(),this.run.player.reset(),this.run.player.screenY=Z_,this.run.stage=Oh(),this.run.player.stageSpeedMultiplier=this.run.stage.speedMultiplier,this.run.bullets.reset(),this.run.enemyBullets.reset(),e||(this.run.gunStreams=1,this.run.rateTier=1),this.summary.hide(),this.bossView=null,this.startLevelMusic(),e||(this.run.levelsClearedInRun=Math.max(0,pm($.id))),this.run.bossSpawned=!1,this.run.bossPointBlankRest=0,e||(this.run.pendingLevel=null),e||(this.run.score.reset(),this.run.runComplete=!1),this.popups.clear(),this.damagePopups.clear(),this.run.rage=ch(),this.run.armourPlates=0,this.run.armourSeconds=0,this.run.auraSeconds=0,this.run.slams=0,this.run.obstacles.reset(),this.run.field.reset(),this.run.hazards.reset(),this.run.scrolled=0,this.run.timelineEmitted=0,this.endTrace.length=0,this.run.spawnLog.length=0,this.run.spawnedBySide={top:0,left:0,right:0,bottom:0},this.run.trashDrain=0,this.run.comedyBeats=0,this.run.lastComedyBeat=null,e||(this.run.xp.reset(),this.pickSlow=0,this.pickRampArmed=!1,this.run.mutations={},this.run.picks=[],this.run.bulletHomingChance=0,this.run.forgetForm(),this.selectedRoute&&this.run.pickRoute(this.selectedRoute),this.applyFormToTouch()),this.splash=0,this.run.surfaced=!1,this.run.elapsed=0,this.sound(`level.start`,.6),this.run.phase=`intro`,this.run.phaseTimer=X_,this.run.invulnerable=0,this.run.stats={absorbed:0,hits:0,maxVolume:1,ended:this.run.stats.ended,newRecord:!1},g_(this.run),this.run.resetHealth(e),this.run.applyHealthBand()}updateMusicForSlowMotion(){let e=this.pickTimeScale(),t=this.pickSlow>0&&(this.pickRampArmed||this.run.phase!==`playing`);this.recordedMusic.hold(t),this.recordedMusic.setRate(e)}openSettings(){if(this.run.phase===`paused`)return;let e=this.run.phase===`menu`;this.sound(e?`ui.click`:`ui.pause`),e||(this.phaseBeforePause=this.run.phase,this.run.phase=`paused`,this.touch.releaseAll()),this.settings.setInRun(!e),this.settings.setGrowth(e?null:v_(this.run)),this.settings.setVolume(sh.getVolume()),this.settings.setMusicVolume(sh.getMusicSlider()),this.settings.setOpen(!0)}closeSettings(){if(this.sound(this.run.phase===`paused`?`ui.resume`:`ui.click`),this.run.phase===`paused`)this.run.phase=this.phaseBeforePause;else if(this.run.phase!==`menu`)return;this.settings.setInRun(!0),this.settings.setOpen(!1)}restartLevel(){this.closeSettings(),this.startRun()}enterLevel(e,t){if(!mm(e))return;let n=pm(e);this.run.levelsClearedInRun=Math.max(this.run.levelsClearedInRun,n),this.startRun(t)}enterDebugLevel(){this.run.phase===`menu`&&(mm(lm.id),this.closeSettings(),this.beginWithLoading())}restoreLevelMusic(){let e=q.audio.music.tracks[$.looksLike??$.id],t=!this.recordedMusic.has(`level`);this.music.setTrack(t?e??null:null),this.recordedMusic.play(t?null:`level`)}exitToMenu(){this.music.stop(),mm(fm),this.refreshLevelMenu(),this.summary.hide(),this.settings.setOpen(!1),this.run.phase=`menu`,this.menu.refillBackdrop(),this.menu.beginIntro(),this.touch.releaseAll(),sh.silenceAmbience(),this.shake={seconds:0,total:0,pixels:0},this.splash=0,this.flash.alpha=0,this.flash.visible=!1,this.explosions=[],this.app.stage.position.set(0,0),this.menu.root.visible=!0}refreshLevelMenu(){if(!this.settings.debugModeOn){this.settings.setLevels([]);return}this.settings.setLevels(this.run.progress.entries().map(e=>({...e,locked:!1})))}startLevelMusic(){let e=sh.musicBus();e&&this.music.attach(e.ctx,e.destination),this.music.setVolume(q.audio.music.volume),this.recordedMusic.setLevel($.music??$.looksLike??$.id),this.restoreLevelMusic()}enterFromMenu(){this.menu.root.visible=!1,this.startRun()}applyFormToTouch(){this.touch.setControls(this.run.bubbleType.controls),this.touch.layout(this.camera.viewport.left,this.camera.viewport.laneWidthPx,this.app.renderer.screen.width,this.app.renderer.screen.height)}watchHazardsForSound(e){let t=new Set,n=new Set,r=new Set,i=new Set;for(let e of this.run.hazards.hazards){let a=this.panAt(e.x);e.charge&&(t.add(e.id),this.soundedCharging.has(e.id)||this.sound(`enemy.charge`,.5,a)),e.discharge>0&&(n.add(e.id),this.soundedDischarging.has(e.id)||this.sound(`enemy.discharge`,.6,a)),id(e)&&(r.add(e.id),this.soundedErupting.has(e.id)||this.sound(`vent.erupt`,.6,a)),e.attackSince!==null&&e.attackSince!==void 0&&Pu(e.kind)&&(i.add(e.id),this.soundedAttacking.has(e.id)||this.sound(`boss.attack`,.7,a))}this.soundedCharging=t,this.soundedDischarging=n,this.soundedErupting=r,this.soundedAttacking=i,this.run.health/Math.max(1,this.run.healthMax)<q.audio.lowHealthFraction?(this.healthClock+=e,this.healthClock>=q.audio.lowHealthIntervalSeconds&&(this.healthClock-=q.audio.lowHealthIntervalSeconds,this.sound(`health.low`,.6))):this.healthClock=0;let a=this.run.suctionUp(this.input);a&&!this.wasSucking&&this.sound(`suction.on`,.6),this.wasSucking=a}updateBoss(){let e=$.boss;if(!this.run.bossSpawned&&!this.bossWarned&&this.run.scrolled>=e.at-q.audio.bossWarnSeconds*$.scrollSpeed&&(this.bossWarned=!0,this.sound(`boss.warn`,.8)),!this.run.bossSpawned&&this.run.scrolled>=e.at){this.run.bossSpawned=!0;let t=this.camera.viewport.laneWidthMeters,n=this.camera.viewport.visibleDepthMeters,r=this.run.makeHazard(this.worldView(),e.kind,this.run.player.x*t,this.camera.y+n*.42,null,e.health);this.run.hazards.hazards.push(r),this.sound(`boss.enter`,.9),this.recordedMusic.has(`boss`)&&(this.music.setTrack(null),this.recordedMusic.play(`boss`))}let t=this.run.hazards.hazards.find(e=>Pu(e.kind));this.bossView=t&&!t.flee?{name:e.name,fraction:t.health/Math.max(1,t.maxHealth)}:null,this.run.phase===`playing`&&this.run.hazards.killed>0&&this.defeatBoss()}defeatBoss(){this.run.phase=`cleared`;let e=this.music.playSting(q.audio.clearSting.notes,q.audio.clearSting.gapSeconds);if(this.run.phaseTimer=e+q.audio.clearHoldSeconds,this.run.stats.ended++,this.scorePopup(this.run.player.x*this.camera.viewport.laneWidthMeters,this.run.player.y,this.run.score.award(`boss`)),this.run.xp.gain(`boss`),this.run.recordBest(),this.sound(`level.surface`),this.recordedMusic.has(`summary`)?this.recordedMusic.play(`summary`):this.restoreLevelMusic(),Og(this.run.events),dm($)){this.run.levelsClearedInRun=0,this.run.runComplete=!0;return}this.run.progress.clear($.id),this.refreshLevelMenu();let t=pm($.id),n=sm[t+1];this.run.levelsClearedInRun=t+1,n?this.run.pendingLevel=n.id:this.run.runComplete=!0}finishLevelAndContinue(){if(this.run.pendingLevel){let e=this.run.pendingLevel;this.run.pendingLevel=null,this.enterLevel(e,!0);return}this.run.runComplete=!0,this.run.phase=`summary`,this.music.stop(),this.sound(`summary.show`,.7),this.summary.show({score:this.run.score.value,levels:this.run.levelsClearedInRun,total:sm.length,seconds:this.run.elapsedTotal,best:this.run.bestScore,debug:dm($)})}updateTransientOverlays(e){this.shake.seconds>0&&(this.shake.seconds=Math.max(0,this.shake.seconds-e)),this.splash>0&&(this.splash=Math.max(0,this.splash-e*1.5));for(let t=this.explosions.length-1;t>=0;t--){let n=this.explosions[t];n.age+=e,n.age>=q.explosions.seconds&&this.explosions.splice(t,1)}}sound(e,t=.5,n=0){Sg(this.run.events,e,t,n)}panAt(e){let t=this.camera.viewport.laneWidthMeters;return t<=0?0:Math.max(-1,Math.min(1,e/t*2-1))}scorePopup(e,t,n){Cg(this.run.events,e,t,n)}applyRunEvents(){for(let e of this.run.events)switch(e.kind){case`sound`:sh.play(e.event,e.intensity,e.pan,this.timeScale());break;case`scorePopup`:this.popups.add(e.x,e.y,e.points,this.camera);break;case`damagePopup`:this.damagePopups.add(e.x,e.y,e.amount,this.camera);break;case`graze`:this.grazePopups.say(e.x,e.y,q.grazePopups.prefix,this.camera),this.grazeSlow=q.slowMotion.graze.slowSeconds+q.slowMotion.graze.recoverSeconds,this.grazeFlash=q.graze.playerFlash.seconds;break;case`callout`:this.callouts.say(e.x,e.y,e.text,this.camera);break;case`blast`:{this.explosions.push({x:e.x,y:e.y,radius:e.radius,age:0});let t=q.hazards.bombfish;if(t.blastShakePixels>0&&t.blastShakeSeconds>0){let e=this.app.renderer.screen;this.shake={seconds:t.blastShakeSeconds,total:t.blastShakeSeconds,pixels:t.blastShakePixels*Cm(e.width,e.height)}}break}case`splash`:this.splash=1}this.run.events.length=0}render(e){if(this.shake.seconds>0){let e=this.shake.seconds/Math.max(.001,this.shake.total),t=this.shake.pixels*e;this.app.stage.position.set(Math.sin(this.run.elapsed*61)*t,Math.cos(this.run.elapsed*47)*t)}else(this.app.stage.x!==0||this.app.stage.y!==0)&&this.app.stage.position.set(0,0);this.scene.update(this.camera,this.run.player,e,this.run.scrolled,$);let t=this.run.phase===`boot`||this.run.phase===`menu`||this.run.phase===`formPick`||this.run.phase===`loading`,n=this.run.phase===`menu`;this.hud.root.visible=!t,this.scene.root.visible=!t,this.touch.root.visible=!t&&!this.settings.isOpen&&this.run.phase!==`levelup`,this.flash.visible=this.flash.visible&&!t,this.updateBrokenScreen(t,this.run.elapsed),t||(this.popups.update(e),this.damagePopups.update(e),this.grazePopups.update(e),this.callouts.update(e),this.hud.update({score:this.run.score.value,boss:this.bossView,health:this.run.healthView,stage:{mutation:{fraction:this.run.xp.fraction,level:this.run.xp.level,pending:this.run.xp.pending,ramp:this.pickRampArmed},resource:this.run.bubbleType.resource?{label:this.run.bubbleType.resource.label,text:`${Math.round(this.run.rage.rage)}  ${hh(this.run.rage.rage)}`,colour:gh(this.run.rage.rage),fraction:vh(this.run.rage.rage)}:null}}),this.touch.update(),this.drawPickups(),this.drawCrateWarnings(),this.drawBubble()),this.settings.root.visible=!t||this.settings.isOpen,this.settings.update(),this.popups.root.visible=!t,this.damagePopups.root.visible=!t,this.grazePopups.root.visible=!t,this.callouts.root.visible=!t,t&&(this.popups.clear(),this.damagePopups.clear(),this.grazePopups.clear(),this.callouts.clear()),this.levelup.root.visible=this.run.phase===`levelup`,this.routePick.root.visible=this.run.phase===`formPick`,this.menu.root.visible=n,n&&this.menu.update(e),this.loading.root.visible=this.run.phase===`boot`||this.run.phase===`loading`,this.splash>0?(this.flash.alpha=Math.min(1,this.splash*1.6),this.flash.visible=this.flash.alpha>.01):this.flash.visible&&(this.flash.visible=!1)}picturesBySize(){return this.bubblePictureOrder||(this.bubblePictureOrder=q.collectableArt.pictures.map(e=>({name:e,width:Jl(e)?.width??0})).filter(e=>e.width>0).sort((e,t)=>e.width-t.width).map(e=>e.name)),this.bubblePictureOrder}drawCrateWarnings(){let e=this.crateWarnings;e.clear();let t=q.hazards.fallcrate,n=this.camera.viewport,r=n.laneWidthMeters,i=r/3*n.scale,a=r*t.warnStripHeightRatio*n.scale;for(let n of this.run.hazards.hazards)n.kind!==`fallcrate`||n.phase>=t.warnSeconds||Kf(e,this.camera.toScreenX(n.x),this.camera.toScreenY(n.y),i,a,n.phase)}drawPickups(){let e=this.camera.viewport.laneWidthMeters,t=this.pickups;t.clear();let n=this.picturesBySize(),r=q.collectableArt,i=Math.max(1e-6,r.largeRatio-r.smallRatio),a=e*Mh(this.run.stage.stage,this.run.player.volume);for(let[o,s]of this.run.field.bubbles.entries()){let c=e*s.radius,l=Math.sin(s.phase)*c*s.wobble,u=s.x+l,d=Math.min(1,Math.max(0,(s.sizeRatio-r.smallRatio)/i)),f=n[Math.round(d*(n.length-1))]??``,p=f?ql(f):null;if(p){let e=this.bubbleSprites[o];e||(e=new F(p),e.anchor.set(.5),e.eventMode=`none`,t.parent?.addChildAt(e,t.parent.getChildIndex(t)),this.bubbleSprites[o]=e),e.texture=p,e.visible=!0,e.x=u,e.y=s.y;let n=2*c*r.imageScale/Math.max(1,Math.max(p.width,p.height));e.scale.set(n,-n);continue}let m=a>=c*.92,h=m?11465471:16766073;t.circle(u,s.y,c).fill({color:h,alpha:m?.3:.34}),t.circle(u-c*.3,s.y+c*.3,c*.68).fill({color:15400191,alpha:.16}),t.circle(u,s.y,c).stroke({color:h,alpha:m?.6:.95,width:c*(m?.09:.16)})}for(let e=this.run.field.bubbles.length;e<this.bubbleSprites.length;e++)this.bubbleSprites[e].visible=!1;for(let e of this.run.field.specks)e.drift>0&&t.circle(e.x,e.y,e.r);t.fill({color:15400191,alpha:.34});for(let e of this.run.field.specks)e.drift<=0&&t.circle(e.x,e.y,e.r);t.fill({color:14677759,alpha:.18}),pp(t,this.run.hazards,e,this.run.elapsed,e=>this.run.canSwallow(e),`in-play`,this.run.player.x*e),this.backSchools.paint(this.run.hazards.back,e),this.leaving.alpha=q.hazards.fleeAlpha;let o=this.leaving;if(o.clear(),pp(o,this.run.hazards,e,this.run.elapsed,e=>this.run.canSwallow(e),`leaving`,this.run.player.x*e),Mp(t,this.run.obstacles,e),this.suctionUp){let n=this.run.player.x*e,r=this.run.player.y,i=e*Au(this.run.player.volume);t.circle(n,r,i).fill({color:q.suction.fieldColor,alpha:q.suction.fieldAlpha*.35}),t.circle(n,r,i).stroke({color:q.suction.fieldColor,alpha:q.suction.fieldAlpha,width:Math.max(1,e*q.suction.fieldWidthRatio)});for(let a=0;a<2;a++){let o=((this.run.elapsed*.9+a*.5)%1+1)%1,s=i*(1-o*.75);t.circle(n,r,s).stroke({color:q.suction.fieldColor,alpha:q.suction.fieldAlpha*.8*o,width:Math.max(1,e*q.suction.fieldWidthRatio*.6)})}}let s=this.syncBulletSprites(t,e,this.run.bulletRadiusMultiplier);this.hitParticles.draw(),s||Gm(t,this.run.bullets,e,this.run.bulletRadiusMultiplier,this.run.bulletLifeMultiplier);let c=this.syncEnemyBulletSprites(t,e);ih(t,this.run.enemyBullets,e,c?e=>c.has(e):void 0),this.hitboxOverlay.clear(),this.hitboxOverlay.visible=Jm(),this.hitboxOverlay.visible&&this.run.phase!==`menu`&&th(this.hitboxOverlay,{hazards:this.run.hazards,obstacles:this.run.obstacles,bullets:this.run.bullets,enemyBullets:this.run.enemyBullets,playerX:this.run.player.x*e,playerY:this.run.player.y,playerRadius:e*Mh(this.run.stage.stage,this.run.player.volume),laneWidth:e,bulletRadiusMultiplier:this.run.bulletRadiusMultiplier});let l=q.explosions;for(let e of this.explosions){let n=Math.min(1,e.age/l.seconds),r=1-n,i=(e,t)=>e+(t-e)*n;t.circle(e.x,e.y,e.radius*i(l.strokeStartRatio,l.strokeEndRatio)).stroke({color:l.strokeColour,alpha:l.strokeAlpha*r,width:Math.max(1,e.radius*l.strokeWidthRatio*r)}),t.circle(e.x,e.y,e.radius*i(l.coreStartRatio,l.coreEndRatio)).fill({color:l.coreColour,alpha:l.coreAlpha*r})}let u=q.hazards.charge;if(this.run.charge>0&&this.run.phase===`playing`){let n=e*Mh(this.run.stage.stage,this.run.player.volume),r=Math.min(1,this.run.charge/Math.max(1,u.max)),i=this.run.charge>=u.chainAt,a=i?.7+.3*Math.sin(this.run.elapsed*26):1;t.circle(this.run.player.x*e,this.run.player.y,n*1.16).stroke({color:u.bubbleRingColour,alpha:(i?.85:.4)*r*a,width:Math.max(1,e*u.bubbleRingWidthRatio*(i?1.6:1))})}if(this.run.chargeBurst>0){let n=Math.max(0,this.run.chargeBurst/Math.max(.01,u.burstSeconds));t.circle(this.run.player.x*e,this.run.player.y,this.run.chargeBurstRadius*(1.6-.6*n)).stroke({color:u.burstColour,alpha:u.burstAlpha*n,width:Math.max(1,e*.03*n)})}}drawBubble(){let e=this.camera.viewport,t=this.run.phase===`burst`?1-Math.max(0,this.run.phaseTimer)/kg:0,n=1+t*1.8,r=this.run.phase===`burst`?Math.max(0,1-t*1.15):1,i=e.laneWidthMeters*Mh(this.run.stage.stage,this.run.player.volume)*1*n*1,a=Fh(this.run.bubbleType,this.run.stage.stage,this.run.rage.rage),o=this.run.player.x*e.laneWidthMeters+Lh(a,this.run.elapsed)*e.laneWidthMeters,s=i*Ih(a,this.run.elapsed);this.drawBurstWave(o,this.run.player.y,a.rim);let c=this.run.invulnerable>0?.45+.55*Math.abs(Math.sin(this.run.invulnerable*22)):1;this.paintBubble(o,this.run.player.y,s,r*c)}bulgedEllipse(e,t,n,r,i){let a=this.bubble,o=[];for(let a=0;a<48;a++){let s=a/48*Math.PI*2,c=i(s);o.push(e+Math.cos(s)*n*c,t+Math.sin(s)*r*c)}return o.push(o[0],o[1]),a.poly(o),a}drawBurstWave(e,t,n){let r=this.burstWave;if(r.clear(),!this.run.burst)return;let i=q.angry.burst,a=Math.min(1,this.run.burst.seconds/i.waveSeconds),o=this.run.burst.radius*(.35+.65*a),s=1-a;r.circle(e,t,o).stroke({color:i.waveColour,alpha:.85*s,width:Math.max(1,o*i.waveWidthRatio)}),r.circle(e,t,o*.82).stroke({color:n,alpha:.5*s,width:Math.max(1,o*i.waveWidthRatio*.5)})}syncBulletSprites(e,t,n){let r=q.bullets;if(!r.image){for(let e of this.bulletSprites)e.visible=!1;return!1}let i=ql(r.image);if(!i)return!1;let a=2*r.imageScale/i.width;if(!Number.isFinite(a)||a<=0)return!0;let o=this.run.bullets.bullets;for(let[s,c]of o.entries()){let o=this.bulletSprites[s];o||(o=new F(i),o.anchor.set(.5),o.eventMode=`none`,e.parent?.addChildAt(o,e.parent.getChildIndex(e)),this.bulletSprites[s]=o),o.visible=!0,o.x=c.x,o.y=c.y,o.alpha=r.imageAlpha,o.tint=c.homing?r.homing.imageTint:r.imageTint;let l=Im(c,t,n)*a;o.scale.set(l,-Math.abs(l))}for(let e=o.length;e<this.bulletSprites.length;e++)this.bulletSprites[e].visible=!1;return!0}syncEnemyBulletSprites(e,t){let n=null,r=new Set;for(let i of this.run.enemyBullets.bullets){if(!i.image)continue;let a=ql(i.image);if(!a)continue;let o=this.enemyBulletSprites.get(i);o||(o=new F(a),o.anchor.set(.5),o.eventMode=`none`,e.parent?.addChildAt(o,e.parent.getChildIndex(e)),this.enemyBulletSprites.set(i,o)),o.texture=a,o.visible=!0,o.x=i.x,o.y=i.y,o.alpha=Math.max(0,Math.min(1,i.imageAlpha??1));let s=2*t*i.radiusRatio*Math.max(0,i.imageScale??1)/Math.max(1,a.width);o.scale.set(s,-Math.abs(s)),r.add(i),(n??(n=new Set)).add(i)}for(let[e,t]of this.enemyBulletSprites)r.has(e)||(t.visible=!1,this.enemyBulletSprites.delete(e));return n}syncBubbleSprite(e,t,n,r){let i=q.playerBubble;if(!i.image)return this.bubbleSprite&&(this.bubbleSprite.visible=!1),!1;if(this.bubbleSpriteFor!==i.image){this.bubbleSpriteFor=i.image,this.bubbleSprite?.destroy(),this.bubbleSprite=null;let e=ql(i.image);if(e){let t=new F(e);t.anchor.set(.5),t.eventMode=`none`,this.bubble.parent?.addChildAt(t,this.bubble.parent.getChildIndex(this.bubble)),this.bubbleSprite=t}}let a=this.bubbleSprite;if(!a)return!1;a.visible=r>.01,a.x=e,a.y=t,a.alpha=i.imageAlpha*r,a.tint=i.imageTint;let o=n*2*i.imageScale;if(a.texture.width<=0)return!1;let s=o/a.texture.width;if(!Number.isFinite(s)||s<=0)return!1;let c=Y_(a)?-1:1;return a.scale.set(s,s*c),a.rotation=i.imageRotation*Math.PI/180,!0}paintBubble(e,t,n,r){let i=this.bubble,a=this.particles;if(this.syncBubbleSprite(e,t,n,r)&&!q.playerBubble.keepDetails||(i.clear(),a.clear(),r<=.01))return;let o=Math.hypot(this.run.player.vx*100,this.run.player.vy),s=1+Math.min(o/600,.16),c=Fh(this.run.bubbleType,this.run.stage.stage,this.run.rage.rage);if(i.circle(e,t,n*c.glowInnerRadiusRatio).fill({color:c.glow,alpha:c.glowInnerAlpha*r}),this.grazeFlash>0){let a=q.graze.playerFlash,o=Math.min(1,this.grazeFlash/Math.max(1e-6,a.seconds));i.circle(e,t,n).stroke({color:a.colour,alpha:a.alpha*o*r,width:n*a.widthRatio})}if(this.run.player.slowRemaining>0){let a=Math.min(1,this.run.player.slowRemaining/.4);i.circle(e,t,n*1.75).stroke({color:13081599,alpha:.75*r*a,width:n*.16}),i.circle(e,t,n*1.75).fill({color:13081599,alpha:.07*r*a})}this.run.player.paralysed&&nh(i,e,t,n,this.run.elapsed,r);let l=c.rim,u=c.rimAlpha*r,d=this.bulgedEllipse(e,t,n/s,n*s,()=>1);d.fill({color:c.inner,alpha:c.innerAlpha*r}),d.stroke({color:l,alpha:u,width:n*c.rimWidthRatio}),c.innerRing&&i.ellipse(e,t,n/s,n*s).stroke({color:l,alpha:c.innerRingAlpha*r,width:n*c.innerRingWidthRatio}),i.circle(e-n*.16,t+n*.14,n*.72).fill({color:c.sheen,alpha:c.sheenAlpha*r}),i.circle(e-n*.36,t+n*.38,n*.21).fill({color:c.specular,alpha:c.specularAlpha*r}),i.circle(e+n*.24,t-n*.3,n*.1).fill({color:c.specular,alpha:c.specularAlpha*.5*r});for(let r=0;r<3;r++){let i=this.run.elapsed*(.9+r*.23)+r*2.1,o=Math.sin(i)*n*.9,s=i*14%(n*3.4)+n*.9;a.circle(e+o,t-n-s,Math.max(.06,n*(.06+r*.02)))}a.fill({color:15269631,alpha:.24*r})}get diagnostics(){return Xh({player:this.run.player,field:this.run.field,hazards:this.run.hazards,obstacles:this.run.obstacles,bullets:this.run.bullets,enemyBullets:this.run.enemyBullets,score:this.run.score,xp:this.run.xp,progress:this.run.progress,stats:this.run.stats,stage:this.run.stage,bubbleType:this.run.bubbleType,healthView:this.run.healthView,defense:this.run.defense,route:this.run.route,gunStreams:this.run.gunStreams,lateral:this.run.lateral,rage:this.run.rage,phase:this.run.phase,phaseTimer:this.run.phaseTimer,scrolled:this.run.scrolled,elapsed:this.run.elapsed,timelineEmitted:this.run.timelineEmitted,spawnedBySide:this.run.spawnedBySide,invulnerable:this.run.invulnerable,burst:this.run.burst,bursts:this.run.bursts,armourPlates:this.run.armourPlates,armourSeconds:this.run.armourSeconds,auraSeconds:this.run.auraSeconds,comedyBeats:this.run.comedyBeats,lastComedyBeat:this.run.lastComedyBeat,lastEaten:this.run.lastEaten,slams:this.run.slams,trashDrain:this.run.trashDrain,surfaced:this.run.surfaced,bestClimbed:this.run.bestClimbed,bestScore:this.run.bestScore,bestVolume:this.run.bestVolume,nominalSeconds:this.run.nominalSeconds,onSlam:this.onSlam,suctionUp:this.suctionUp,burstRadiusRatio:this.run.burstRadiusRatio(),camera:this.camera,popups:this.popups,damagePopups:this.damagePopups,splash:this.splash,audioMuted:this.audioMuted,fps:this.fps,frameCount:this.frameCount,lastDelta:this.lastDelta})}teleportToSurface(){this.teleportToDistance($.scrollLength-.2)}teleportToDistance(e){this.run.scrolled=Math.max(0,Math.min($.scrollLength,e)),this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,this.camera.viewport.visibleDepthMeters),this.run.player.vy=0}spawnBubbleOnPlayer(e){let t=this.camera.viewport.laneWidthMeters,n=t*Mh(this.run.stage.stage,this.run.player.volume)*e/t;this.run.field.addTestBubble({x:this.run.player.x*t,y:this.run.player.y,vy:0,radius:n,sizeRatio:e,volume:xh(n),phase:0,wobble:Sl.bubbleWobbleMin,held:!0})}spawnFallingBubbleOnPlayer(e){let t=this.camera.viewport.laneWidthMeters,n=t*Mh(this.run.stage.stage,this.run.player.volume)*e/t,r=xh(n),i=this.run.player.vy>0?this.run.player.vy:1.7,a=wh(r,this.run.player.volume)*i;this.run.field.addTestBubble({x:this.run.player.x*t,y:this.run.player.y,vy:a,radius:n,sizeRatio:e,volume:r,phase:0,wobble:Sl.bubbleWobbleMin,held:!0})}debugForceHit(e=q.hazards.contactDamage.fish??0){this.run.invulnerable=0,this.run.takeHit(e)}get obstaclesRef(){return this.run.obstacles}get fieldRef(){return this.run.field}debugSwallowForTest(e){let t=this.run.health;this.run.health=Math.min(this.run.healthMax,this.run.health+hu(e)*q.volume.healthPerVolume);let n=this.run.health-t;return this.run.stats.absorbed++,this.scorePopup(this.run.player.x*this.camera.viewport.laneWidthMeters,this.run.player.y,this.run.score.award(`eaten`)),this.run.xp.gain(`eaten`),n}debugSolveCollectableVelocity(e,t){return this.run.field.solveBubbleVelocity(e,t)}debugSolveCollectableVelocityAtRef(e,t,n){return wh(e,t)*n}debugTrackBubble(){let e=this.run.field.bubbles.find(e=>this.camera.toScreenY(e.y)>0&&this.camera.toScreenY(e.y)<this.camera.viewport.height);return this.trackedBubbleId=e?e.id:null,this.trackedBubbleId}debugMotion(){let e=this.camera,t=this.run.field.bubbles.reduce((e,t)=>!e||Math.abs(t.y-this.run.player.y)<Math.abs(e.y-this.run.player.y)?t:e,null),n=this.run.field.specks.find(e=>e.drift<=0)??null,r=this.run.field.specks.find(e=>e.drift>0)??null,i=this.trackedBubbleId===null?null:this.run.field.bubbles.find(e=>e.id===this.trackedBubbleId)??null;return{playerScreenY:+e.toScreenY(this.run.player.y).toFixed(2),playerScreenYRatio:+(e.toScreenY(this.run.player.y)/e.viewport.height).toFixed(4),cameraY:+e.y.toFixed(2),depth:+this.run.player.depth($.scrollLength).toFixed(2),nearestBubbleScreenY:t?+e.toScreenY(t.y).toFixed(2):null,nearestBubbleWorldY:t?+t.y.toFixed(2):null,nearestBubbleScreenSpeedPxPerS:t?+(t.vy*e.viewport.scale).toFixed(2):null,nearestBubbleFallMps:t?+t.vy.toFixed(3):null,trackedBubbleSizeRatio:i?+(i.radius/Math.max(1e-6,Mh(this.run.stage.stage,this.run.player.volume))).toFixed(3):null,trackedBubbleRiseRatio:i?+Ch(i.volume,this.run.player.volume).toFixed(3):null,trackedBubbleRelativeFallMps:i?+i.vy.toFixed(3):null,trackedBubbleScreenSpeedPxPerS:i?+(i.vy*e.viewport.scale).toFixed(3):null,scrollSpeedMps:+$.scrollSpeed.toFixed(3),fieldScrollSpeedMps:+this.run.field.cruiseAscentSpeed.toFixed(3),collectables:this.run.field.bubbles.map(t=>({sizeRatio:+(t.radius/Math.max(1e-6,Mh(this.run.stage.stage,this.run.player.volume))).toFixed(3),wobble:+t.wobble.toFixed(3),relativeFallMps:+t.vy.toFixed(3),screenSpeedPxPerS:+(t.vy*e.viewport.scale).toFixed(1)})).sort((e,t)=>e.sizeRatio-t.sizeRatio),trackedBubbleId:i?i.id:null,trackedBubbleScreenY:i?+e.toScreenY(i.y).toFixed(2):null,speckScreenY:n?+e.toScreenY(n.y).toFixed(2):null,speckWorldY:n?+n.y.toFixed(2):null,nearSpeckScreenY:r?+e.toScreenY(r.y).toFixed(2):null,nearSpeckDrift:r?+r.drift.toFixed(2):null,farSpeckDrift:n?+n.drift.toFixed(2):null,ascentSpeed:+this.run.player.vy.toFixed(3)}}};async function ev(){let e=document.getElementById(`app`)??document.body,t=e.getBoundingClientRect(),n=Math.max(1,Math.round(t.width||window.innerWidth)),r=Math.max(1,Math.round(t.height||window.innerHeight)),i=await Pm();i.renderer.resize(n,r),i.canvas.style.position=`absolute`,i.canvas.style.inset=`0`,i.canvas.style.width=`100%`,i.canvas.style.height=`100%`,e.appendChild(i.canvas);let a=new $_(i),o=0,s=0,c=()=>{let t=e.getBoundingClientRect(),n=Math.max(1,Math.round(t.width||window.innerWidth)),r=Math.max(1,Math.round(t.height||window.innerHeight));(n!==o||r!==s)&&(o=n,s=r,i.renderer.resize(n,r),a.handleResize())};new ResizeObserver(c).observe(e),window.addEventListener(`orientationchange`,()=>window.setTimeout(c,120)),window.visualViewport?.addEventListener(`resize`,c),c();let l=()=>({window:`${window.innerWidth}x${window.innerHeight}`,dpr:window.devicePixelRatio,visualViewport:window.visualViewport?`${Math.round(window.visualViewport.width)}x${Math.round(window.visualViewport.height)}`:`n/a`,mount:(()=>{let t=e.getBoundingClientRect();return`${Math.round(t.width)}x${Math.round(t.height)}`})(),canvasCss:`${i.canvas.clientWidth}x${i.canvas.clientHeight}`,canvasBuffer:`${i.canvas.width}x${i.canvas.height}`,screen:`${i.renderer.screen.width}x${i.renderer.screen.height}`,rendererRaw:`${i.renderer.width}x${i.renderer.height}`,resolution:i.renderer.resolution}),u=window.__GB;u.frame=l,console.info(`[bubble] boot`,l())}ev();function tv(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}export{Er as n,Dr as t};