const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./browserAll-DZ1SlLY2.js","./CanvasPool-BPP-9-fH.js","./Filter-YX2vTQ9N.js","./init-BHXuSsbb.js","./canvasUtils-OK1mIOJS.js","./webworkerAll-CDr9-fRs.js"])))=>i.map(i=>d[i]);
import{C as e,D as t,E as n,G as r,I as i,J as a,K as o,L as s,M as c,N as l,O as u,R as d,S as f,U as p,W as m,_ as h,a as g,c as _,d as v,f as y,h as b,i as x,j as S,l as C,m as ee,n as te,o as w,q as ne,r as re,s as ie,t as ae,u as oe,v as se,w as T,x as E,y as ce,z as D}from"./CanvasPool-BPP-9-fH.js";import{_ as le,a as ue,b as O,c as de,d as fe,f as k,g as pe,h as me,i as A,l as j,n as he,o as ge,p as _e,r as ve,s as M,t as N,x as ye}from"./Filter-YX2vTQ9N.js";import{n as be,r as P,t as xe}from"./canvasUtils-OK1mIOJS.js";import{n as F,t as I}from"./Cache-DdDYvMtE.js";import{a as Se,c as L,d as Ce,f as we,i as Te,l as Ee,m as De,n as Oe,o as ke,p as R,r as Ae,s as je,t as Me,u as Ne}from"./RenderTargetSystem-DOMZnN5E.js";import{a as Pe,c as Fe,i as Ie,l as Le,n as Re,o as ze,r as Be,s as Ve,t as He,u as Ue}from"./GraphicsContext-CyedCWP_.js";import{t as We}from"./getTextureBatchBindGroup-CdUOMQK9.js";import{a as Ge,c as Ke,d as qe,f as Je,i as Ye,l as Xe,m as Ze,o as Qe,p as $e,r as et,s as tt,t as nt,u as rt}from"./GCManagedHash-J8Tro_b9.js";import{a as it,c as at,d as ot,f as st,i as ct,l as lt,n as ut,o as dt,p as ft,r as pt,s as mt,t as ht,u as gt}from"./BufferResource-BZf5U7QS.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var _t=`modulepreload`,vt=function(e,t){return new URL(e,t).href},yt={},bt=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=vt(t,n),t=s(t),t in yt)return;yt[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:_t,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},xt={extension:{type:m.Environment,name:`browser`,priority:-1},test:()=>!0,load:async()=>{await bt(()=>import(`./browserAll-DZ1SlLY2.js`),__vite__mapDeps([0,1,2,3,4]),import.meta.url)}},St={extension:{type:m.Environment,name:`webworker`,priority:0},test:()=>typeof self<`u`&&self.WorkerGlobalScope!==void 0,load:async()=>{await bt(()=>import(`./webworkerAll-CDr9-fRs.js`),__vite__mapDeps([5,3,1,2,4]),import.meta.url)}},Ct=new e;function wt(e,t,n){let r=Ct;e.measurable=!0,me(e,n,r),t.addBoundsMask(r),e.measurable=!1}function Tt(e,t,n){let r=pe.get();e.measurable=!0;let i=le.get().identity(),a=Et(e,n,i);k(e,r,a),e.measurable=!1,t.addBoundsMask(r),le.return(i),pe.return(r)}function Et(e,t,n){return e?(e!==t&&(Et(e.parent,t,n),e.updateLocalTransform(),n.append(e.localTransform)),n):(E(`Mask bounds, renderable is not inside the root container`),n)}var Dt=class{constructor(e){this.priority=0,this.inverse=!1,this.channel=`red`,this.pipe=`alphaMask`,e?.mask&&this.init(e.mask)}init(e){this.mask=e,this.renderMaskToTexture=!(e instanceof M),this.mask.renderable=this.renderMaskToTexture,this.mask.includeInBuild=!this.renderMaskToTexture,this.mask.measurable=!1}reset(){this.mask!==null&&(this.mask.measurable=!0,this.mask=null)}addBounds(e,t){this.inverse||wt(this.mask,e,t)}addLocalBounds(e,t){Tt(this.mask,e,t)}containsPoint(e,t){let n=this.mask;return t(n,e)}destroy(){this.reset()}static test(e){return e instanceof M}};Dt.extension=m.MaskEffect;var Ot=class{constructor(e){this.priority=0,this.pipe=`colorMask`,e?.mask&&this.init(e.mask)}init(e){this.mask=e}destroy(){}static test(e){return typeof e==`number`}};Ot.extension=m.MaskEffect;var kt=class{constructor(e){this.priority=0,this.pipe=`stencilMask`,e?.mask&&this.init(e.mask)}init(e){this.mask=e,this.mask.includeInBuild=!1,this.mask.measurable=!1}reset(){this.mask!==null&&(this.mask.measurable=!0,this.mask.includeInBuild=!0,this.mask=null)}addBounds(e,t){wt(this.mask,e,t)}addLocalBounds(e,t){Tt(this.mask,e,t)}containsPoint(e,t){let n=this.mask;return t(n,e)}destroy(){this.reset()}static test(e){return e instanceof j}};kt.extension=m.MaskEffect;var At;async function jt(){return At??(At=(async()=>{let e=b.get().createCanvas(1,1).getContext(`webgl`);if(!e)return`premultiply-alpha-on-upload`;let t=await new Promise(e=>{let t=document.createElement(`video`);t.onloadeddata=()=>e(t),t.onerror=()=>e(null),t.autoplay=!1,t.crossOrigin=`anonymous`,t.preload=`auto`,t.src=`data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=`,t.load()});if(!t)return`premultiply-alpha-on-upload`;let n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n);let r=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.NONE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t);let i=new Uint8Array(4);return e.readPixels(0,0,1,1,e.RGBA,e.UNSIGNED_BYTE,i),e.deleteFramebuffer(r),e.deleteTexture(n),e.getExtension(`WEBGL_lose_context`)?.loseContext(),i[0]<=i[3]?`premultiplied-alpha`:`premultiply-alpha-on-upload`})()),At}var Mt=class e extends t{constructor(t){super(t),this.isReady=!1,this.uploadMethodId=`video`,t={...e.defaultOptions,...t},this._autoUpdate=!0,this._isConnectedToTicker=!1,this._updateFPS=t.updateFPS||0,this._msToNextUpdate=0,this.autoPlay=t.autoPlay!==!1,this.alphaMode=t.alphaMode??`premultiply-alpha-on-upload`,this._videoFrameRequestCallback=this._videoFrameRequestCallback.bind(this),this._videoFrameRequestCallbackHandle=null,this._load=null,this._resolve=null,this._reject=null,this._onCanPlay=this._onCanPlay.bind(this),this._onCanPlayThrough=this._onCanPlayThrough.bind(this),this._onError=this._onError.bind(this),this._onPlayStart=this._onPlayStart.bind(this),this._onPlayStop=this._onPlayStop.bind(this),this._onSeeked=this._onSeeked.bind(this),this._onLoadedMetadata=this._onLoadedMetadata.bind(this),t.autoLoad!==!1&&this.load()}updateFrame(){if(!this.destroyed){if(this._updateFPS){let e=A.shared.elapsedMS*this.resource.playbackRate;this._msToNextUpdate=Math.floor(this._msToNextUpdate-e)}(!this._updateFPS||this._msToNextUpdate<=0)&&(this._msToNextUpdate=this._updateFPS?Math.floor(1e3/this._updateFPS):0),this.isValid&&this.update()}}_videoFrameRequestCallback(){this.updateFrame(),this._videoFrameRequestCallbackHandle=this.destroyed?null:this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback)}get isValid(){return!!this.resource.videoWidth&&!!this.resource.videoHeight}async load(){if(this._load)return this._load;let e=this.resource,t=this.options;return(e.readyState===e.HAVE_ENOUGH_DATA||e.readyState===e.HAVE_FUTURE_DATA)&&e.width&&e.height&&(e.complete=!0),e.addEventListener(`play`,this._onPlayStart),e.addEventListener(`pause`,this._onPlayStop),e.addEventListener(`seeked`,this._onSeeked),this._isSourceReady()?this._mediaReady():(t.preload||e.addEventListener(`canplay`,this._onCanPlay),e.addEventListener(`canplaythrough`,this._onCanPlayThrough),e.addEventListener(`error`,this._onError,!0)),this.isValid||e.addEventListener(`loadedmetadata`,this._onLoadedMetadata),this.alphaMode=await jt(),this._load=new Promise((n,r)=>{this.isValid?n(this):(this._resolve=n,this._reject=r,t.preloadTimeoutMs!==void 0&&(this._preloadTimeout=setTimeout(()=>{this._onError(new ErrorEvent(`Preload exceeded timeout of ${t.preloadTimeoutMs}ms`))})),e.load())}),this._load}_onError(e){this.resource.removeEventListener(`error`,this._onError,!0),this.emit(`error`,e),this._reject&&(this._reject(e),this._reject=null,this._resolve=null)}_isSourcePlaying(){let e=this.resource;return!e.paused&&!e.ended}_isSourceReady(){return this.resource.readyState>2}_onPlayStart(){this._configureAutoUpdate()}_onPlayStop(){this._configureAutoUpdate()}_onSeeked(){this._autoUpdate&&!this._isSourcePlaying()&&(this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0)}_onLoadedMetadata(){this.isValid&&this._mediaReady()}_onCanPlay(){this.resource.removeEventListener(`canplay`,this._onCanPlay),this._mediaReady()}_onCanPlayThrough(){this.resource.removeEventListener(`canplaythrough`,this._onCanPlayThrough),this._preloadTimeout&&(clearTimeout(this._preloadTimeout),this._preloadTimeout=void 0),this._mediaReady()}_mediaReady(){let e=this.resource;this.isValid&&(this.isReady=!0,this.resize(e.videoWidth,e.videoHeight)),this._msToNextUpdate=0,this.updateFrame(),this._msToNextUpdate=0,this._resolve&&this.isValid&&(this._resolve(this),this._resolve=null,this._reject=null),this._isSourcePlaying()?this._onPlayStart():this.autoPlay&&this.resource.play()}destroy(){this._configureAutoUpdate();let e=this.resource;e&&(e.removeEventListener(`play`,this._onPlayStart),e.removeEventListener(`pause`,this._onPlayStop),e.removeEventListener(`seeked`,this._onSeeked),e.removeEventListener(`canplay`,this._onCanPlay),e.removeEventListener(`canplaythrough`,this._onCanPlayThrough),e.removeEventListener(`loadedmetadata`,this._onLoadedMetadata),e.removeEventListener(`error`,this._onError,!0),e.pause(),e.src=``,e.load()),super.destroy()}get autoUpdate(){return this._autoUpdate}set autoUpdate(e){e!==this._autoUpdate&&(this._autoUpdate=e,this._configureAutoUpdate())}get updateFPS(){return this._updateFPS}set updateFPS(e){e!==this._updateFPS&&(this._updateFPS=e,this._configureAutoUpdate())}_configureAutoUpdate(){this._autoUpdate&&this._isSourcePlaying()?!this._updateFPS&&this.resource.requestVideoFrameCallback?(this._isConnectedToTicker&&(A.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0),this._videoFrameRequestCallbackHandle===null&&(this._videoFrameRequestCallbackHandle=this.resource.requestVideoFrameCallback(this._videoFrameRequestCallback))):(this._videoFrameRequestCallbackHandle!==null&&(this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null),this._isConnectedToTicker||(A.shared.add(this.updateFrame,this),this._isConnectedToTicker=!0,this._msToNextUpdate=0)):(this._videoFrameRequestCallbackHandle!==null&&(this.resource.cancelVideoFrameCallback(this._videoFrameRequestCallbackHandle),this._videoFrameRequestCallbackHandle=null),this._isConnectedToTicker&&(A.shared.remove(this.updateFrame,this),this._isConnectedToTicker=!1,this._msToNextUpdate=0))}static test(e){return globalThis.HTMLVideoElement&&e instanceof HTMLVideoElement}};Mt.extension=m.TextureSource,Mt.defaultOptions={...t.defaultOptions,autoLoad:!0,autoPlay:!0,updateFPS:0,crossorigin:!0,loop:!1,muted:!0,playsinline:!0,preload:!1},Mt.MIME_TYPES={ogv:`video/ogg`,mov:`video/quicktime`,m4v:`video/mp4`};var Nt=Mt,Pt=[];r.handleByList(m.TextureSource,Pt);function Ft(e={}){let t=e&&e.resource,n=t?e.resource:e,r=t?e:{resource:e};for(let e=0;e<Pt.length;e++){let t=Pt[e];if(t.test(n))return new t(r)}throw Error(`Could not find a source type for resource: ${r.resource}`)}function It(e={},t=!1){let n=e&&e.resource,r=n?e.resource:e,i=n?e:{resource:e};if(!t&&I.has(r))return I.get(r);let a=new T({source:Ft(i)});return a.on(`destroy`,()=>{I.has(r)&&I.remove(r)}),t||I.set(r,a),a}function Lt(e,n=!1){return typeof e==`string`?I.get(e):e instanceof t?new T({source:e}):It(e,n)}T.from=Lt,t.from=Ft,r.add(Dt,Ot,kt,Nt,P,ge,n);var Rt=(e=>(e[e.Low=0]=`Low`,e[e.Normal=1]=`Normal`,e[e.High=2]=`High`,e))(Rt||{});function zt(e){if(typeof e!=`string`)throw TypeError(`Path must be a string. Received ${JSON.stringify(e)}`)}function Bt(e){return e.split(`?`)[0].split(`#`)[0]}function Vt(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function Ht(e,t,n){return e.replace(new RegExp(Vt(t),`g`),n)}function Ut(e,t){let n=``,r=0,i=-1,a=0,o=-1;for(let s=0;s<=e.length;++s){if(s<e.length)o=e.charCodeAt(s);else if(o===47)break;else o=47;if(o===47){if(i!==s-1&&a!==1){if(i!==s-1&&a===2){if(n.length<2||r!==2||n.charCodeAt(n.length-1)!==46||n.charCodeAt(n.length-2)!==46){if(n.length>2){let e=n.lastIndexOf(`/`);if(e!==n.length-1){e===-1?(n=``,r=0):(n=n.slice(0,e),r=n.length-1-n.lastIndexOf(`/`)),i=s,a=0;continue}}else if(n.length===2||n.length===1){n=``,r=0,i=s,a=0;continue}}t&&(n.length>0?n+=`/..`:n=`..`,r=2)}else n.length>0?n+=`/${e.slice(i+1,s)}`:n=e.slice(i+1,s),r=s-i-1}i=s,a=0}else o===46&&a!==-1?++a:a=-1}return n}var Wt={toPosix(e){return Ht(e,`\\`,`/`)},isUrl(e){return/^https?:/.test(this.toPosix(e))},isDataUrl(e){return/^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(e)},isBlobUrl(e){return e.startsWith(`blob:`)},hasProtocol(e){return/^[^/:]+:/.test(this.toPosix(e))},getProtocol(e){zt(e),e=this.toPosix(e);let t=/^file:\/\/\//.exec(e);if(t)return t[0];let n=/^[^/:]+:\/{0,2}/.exec(e);return n?n[0]:``},toAbsolute(e,t,n){if(zt(e),this.isDataUrl(e)||this.isBlobUrl(e))return e;let r=Bt(this.toPosix(t??b.get().getBaseUrl())),i=Bt(this.toPosix(n??this.rootname(r)));return e=this.toPosix(e),e.startsWith(`/`)?Wt.join(i,e.slice(1)):this.isAbsolute(e)?e:this.join(r,e)},normalize(e){if(zt(e),e.length===0)return`.`;if(this.isDataUrl(e)||this.isBlobUrl(e))return e;e=this.toPosix(e);let t=``,n=e.startsWith(`/`);this.hasProtocol(e)&&(t=this.rootname(e),e=e.slice(t.length));let r=e.endsWith(`/`);return e=Ut(e,!1),e.length>0&&r&&(e+=`/`),n?`/${e}`:t+e},isAbsolute(e){return zt(e),e=this.toPosix(e),this.hasProtocol(e)?!0:e.startsWith(`/`)},join(...e){if(e.length===0)return`.`;let t;for(let n=0;n<e.length;++n){let r=e[n];if(zt(r),r.length>0){if(t===void 0)t=r;else{let i=e[n-1]??``;this.joinExtensions.includes(this.extname(i).toLowerCase())?t+=`/../${r}`:t+=`/${r}`}}}return t===void 0?`.`:this.normalize(t)},dirname(e){if(zt(e),e.length===0)return`.`;e=this.toPosix(e);let t=e.charCodeAt(0),n=t===47,r=-1,i=!0,a=this.getProtocol(e),o=e;e=e.slice(a.length);for(let n=e.length-1;n>=1;--n)if(t=e.charCodeAt(n),t===47){if(!i){r=n;break}}else i=!1;return r===-1?n?`/`:this.isUrl(o)?a+e:a:n&&r===1?`//`:a+e.slice(0,r)},rootname(e){zt(e),e=this.toPosix(e);let t=``;if(t=e.startsWith(`/`)?`/`:this.getProtocol(e),this.isUrl(e)){let n=e.indexOf(`/`,t.length);t=n===-1?e:e.slice(0,n),t.endsWith(`/`)||(t+=`/`)}return t},basename(e,t){zt(e),t&&zt(t),e=Bt(this.toPosix(e));let n=0,r=-1,i=!0,a;if(t!==void 0&&t.length>0&&t.length<=e.length){if(t.length===e.length&&t===e)return``;let o=t.length-1,s=-1;for(a=e.length-1;a>=0;--a){let c=e.charCodeAt(a);if(c===47){if(!i){n=a+1;break}}else s===-1&&(i=!1,s=a+1),o>=0&&(c===t.charCodeAt(o)?--o===-1&&(r=a):(o=-1,r=s))}return n===r?r=s:r===-1&&(r=e.length),e.slice(n,r)}for(a=e.length-1;a>=0;--a)if(e.charCodeAt(a)===47){if(!i){n=a+1;break}}else r===-1&&(i=!1,r=a+1);return r===-1?``:e.slice(n,r)},extname(e){zt(e),e=Bt(this.toPosix(e));let t=-1,n=0,r=-1,i=!0,a=0;for(let o=e.length-1;o>=0;--o){let s=e.charCodeAt(o);if(s===47){if(!i){n=o+1;break}continue}r===-1&&(i=!1,r=o+1),s===46?t===-1?t=o:a!==1&&(a=1):t!==-1&&(a=-1)}return t===-1||r===-1||a===0||a===1&&t===r-1&&t===n+1?``:e.slice(t,r)},parse(e){zt(e);let t={root:``,dir:``,base:``,ext:``,name:``};if(e.length===0)return t;e=Bt(this.toPosix(e));let n=e.charCodeAt(0),r=this.isAbsolute(e),i;t.root=this.rootname(e),i=r||this.hasProtocol(e)?1:0;let a=-1,o=0,s=-1,c=!0,l=e.length-1,u=0;for(;l>=i;--l){if(n=e.charCodeAt(l),n===47){if(!c){o=l+1;break}continue}s===-1&&(c=!1,s=l+1),n===46?a===-1?a=l:u!==1&&(u=1):a!==-1&&(u=-1)}return a===-1||s===-1||u===0||u===1&&a===s-1&&a===o+1?s!==-1&&(t.base=t.name=o===0&&r?e.slice(1,s):e.slice(o,s)):(o===0&&r?(t.name=e.slice(1,a),t.base=e.slice(1,s)):(t.name=e.slice(o,a),t.base=e.slice(o,s)),t.ext=e.slice(a,s)),t.dir=this.dirname(e),t},sep:`/`,delimiter:`:`,joinExtensions:[`.html`]};function Gt(e,t,n,r,i){let a=t[n];for(let o=0;o<a.length;o++){let s=a[o];n<t.length-1?Gt(e.replace(r[n],s),t,n+1,r,i):i.push(e.replace(r[n],s))}}function Kt(e){let t=e.match(/\{(.*?)\}/g),n=[];if(t){let r=[];t.forEach(e=>{let t=e.substring(1,e.length-1).split(`,`);r.push(t)}),Gt(e,r,0,t,n)}else n.push(e);return n}var qt=e=>!Array.isArray(e),Jt=class{constructor(){this._defaultBundleIdentifierOptions={connector:`-`,createBundleAssetId:(e,t)=>`${e}${this._bundleIdConnector}${t}`,extractAssetIdFromBundle:(e,t)=>t.replace(`${e}${this._bundleIdConnector}`,``)},this._bundleIdConnector=this._defaultBundleIdentifierOptions.connector,this._createBundleAssetId=this._defaultBundleIdentifierOptions.createBundleAssetId,this._extractAssetIdFromBundle=this._defaultBundleIdentifierOptions.extractAssetIdFromBundle,this._assetMap={},this._preferredOrder=[],this._parsers=[],this._resolverHash={},this._bundles={}}setBundleIdentifier(e){if(this._bundleIdConnector=e.connector??this._bundleIdConnector,this._createBundleAssetId=e.createBundleAssetId??this._createBundleAssetId,this._extractAssetIdFromBundle=e.extractAssetIdFromBundle??this._extractAssetIdFromBundle,this._extractAssetIdFromBundle(`foo`,this._createBundleAssetId(`foo`,`bar`))!==`bar`)throw Error(`[Resolver] GenerateBundleAssetId are not working correctly`)}prefer(...e){e.forEach(e=>{this._preferredOrder.push(e),e.priority||(e.priority=Object.keys(e.params))}),this._resolverHash={}}set basePath(e){this._basePath=e}get basePath(){return this._basePath}set rootPath(e){this._rootPath=e}get rootPath(){return this._rootPath}get parsers(){return this._parsers}reset(){this.setBundleIdentifier(this._defaultBundleIdentifierOptions),this._assetMap={},this._preferredOrder=[],this._resolverHash={},this._rootPath=null,this._basePath=null,this._manifest=null,this._bundles={},this._defaultSearchParams=null}setDefaultSearchParams(e){if(typeof e==`string`)this._defaultSearchParams=e;else{let t=e;this._defaultSearchParams=Object.keys(t).map(e=>`${encodeURIComponent(e)}=${encodeURIComponent(t[e])}`).join(`&`)}}getAlias(e){let{alias:t,src:n}=e;return F(t||n,e=>typeof e==`string`?e:Array.isArray(e)?e.map(e=>e?.src??e):e?.src?e.src:e,!0)}removeAlias(e,t){this._assetMap[e]&&(t&&t!==this._resolverHash[e]||(delete this._resolverHash[e],delete this._assetMap[e]))}addManifest(e){this._manifest&&E(`[Resolver] Manifest already exists, this will be overwritten`),this._manifest=e,e.bundles.forEach(e=>{this.addBundle(e.name,e.assets)})}addBundle(e,t){let n=[],r=t;Array.isArray(t)||(r=Object.entries(t).map(([e,t])=>typeof t==`string`||Array.isArray(t)?{alias:e,src:t}:{alias:e,...t})),r.forEach(t=>{let r=t.src,i=t.alias,a;if(typeof i==`string`){let t=this._createBundleAssetId(e,i);n.push(t),a=[i,t]}else{let t=i.map(t=>this._createBundleAssetId(e,t));n.push(...t),a=[...i,...t]}this.add({...t,alias:a,src:r})}),this._bundles[e]=n}add(e){let t=[];Array.isArray(e)?t.push(...e):t.push(e);let n=e=>{this.hasKey(e)&&E(`[Resolver] already has key: ${e} overwriting`)};F(t).forEach(e=>{let{src:t}=e,{data:r,format:i,loadParser:a,parser:o}=e,s=F(t).map(e=>typeof e==`string`?Kt(e):Array.isArray(e)?e:[e]),c=this.getAlias(e);Array.isArray(c)?c.forEach(n):n(c);let l=[],u=e=>({src:e,...this._parsers.find(t=>t.test(e))?.parse(e)});s.forEach(t=>{t.forEach(t=>{let n={};if(typeof t==`object`?(r=t.data??r,i=t.format??i,(t.loadParser||t.parser)&&(a=t.loadParser??a,o=t.parser??o),n={...u(t.src),...t}):n=u(t),!c)throw Error(`[Resolver] alias is undefined for this asset: ${n.src}`);n=this._buildResolvedAsset(n,{aliases:c,data:r,format:i,loadParser:a,parser:o,progressSize:e.progressSize}),l.push(n)})}),c.forEach(e=>{this._assetMap[e]=l})})}resolveBundle(e){let t=qt(e);e=F(e);let n={};return e.forEach(e=>{let t=this._bundles[e];if(t){let r=this.resolve(t),i={};for(let t in r){let n=r[t];i[this._extractAssetIdFromBundle(e,t)]=n}n[e]=i}}),t?n[e[0]]:n}resolveUrl(e){let t=this.resolve(e);if(typeof e!=`string`){let e={};for(let n in t)e[n]=t[n].src;return e}return t.src}resolve(e){let t=qt(e);e=F(e);let n={};return e.forEach(e=>{if(!this._resolverHash[e]){if(this._assetMap[e]){let t=this._assetMap[e],n=this._getPreferredOrder(t);n?.priority.forEach(e=>{n.params[e].forEach(n=>{let r=t.filter(t=>t[e]?t[e]===n:!1);r.length&&(t=r)})}),this._resolverHash[e]=t[0]}else this._resolverHash[e]=this._buildResolvedAsset({alias:[e],src:e},{})}n[e]=this._resolverHash[e]}),t?n[e[0]]:n}hasKey(e){return!!this._assetMap[e]}hasBundle(e){return!!this._bundles[e]}_getPreferredOrder(e){for(let t=0;t<e.length;t++){let n=e[t],r=this._preferredOrder.find(e=>e.params.format.includes(n.format));if(r)return r}return this._preferredOrder[0]}_appendDefaultSearchParams(e){return this._defaultSearchParams?`${e}${/\?/.test(e)?`&`:`?`}${this._defaultSearchParams}`:e}_buildResolvedAsset(e,t){let{aliases:n,data:r,loadParser:i,parser:a,format:o,progressSize:s}=t;return(this._basePath||this._rootPath)&&(e.src=Wt.toAbsolute(e.src,this._basePath,this._rootPath)),e.alias=n??e.alias??[e.src],e.src=this._appendDefaultSearchParams(e.src),e.data={...r||{},...e.data},e.loadParser=i??e.loadParser,e.parser=a??e.parser,e.format=o??e.format??Yt(e.src),s!==void 0&&(e.progressSize=s),e}};Jt.RETINA_PREFIX=/@([0-9\.]+)x/;function Yt(e){return e.split(`.`).pop().split(`?`).shift().split(`#`).shift()}var Xt=(e,t)=>{let n=t.split(`?`)[1];return n&&(e+=`?${n}`),e},Zt=class e{constructor(e,n){this.linkedSheets=[];let r=e;e?.source instanceof t&&(r={texture:e,data:n});let{texture:i,data:a,cachePrefix:o=``}=r;this.cachePrefix=o,this._texture=i instanceof T?i:null,this.textureSource=i.source,this.textures={},this.animations={},this.data=a;let s=parseFloat(a.meta.scale);s?(this.resolution=s,i.source.resolution=this.resolution):this.resolution=i.source._resolution,this._frames=this.data.frames,this._frameKeys=Object.keys(this._frames),this._batchIndex=0,this._callback=null}parse(){return new Promise(t=>{this._callback=t,this._batchIndex=0,this._frameKeys.length<=e.BATCH_SIZE?(this._processFrames(0),this._processAnimations(),this._parseComplete()):this._nextBatch()})}parseSync(){return this._processFrames(0,!0),this._processAnimations(),this.textures}_processFrames(t,n=!1){let r=t,i=n?1/0:e.BATCH_SIZE;for(;r-t<i&&r<this._frameKeys.length;){let e=this._frameKeys[r],t=this._frames[e],n=t.frame;if(n){let r=null,i=null,a=t.trimmed!==!1&&t.sourceSize?t.sourceSize:t.frame,o=new s(0,0,Math.floor(a.w)/this.resolution,Math.floor(a.h)/this.resolution);r=t.rotated?new s(Math.floor(n.x)/this.resolution,Math.floor(n.y)/this.resolution,Math.floor(n.h)/this.resolution,Math.floor(n.w)/this.resolution):new s(Math.floor(n.x)/this.resolution,Math.floor(n.y)/this.resolution,Math.floor(n.w)/this.resolution,Math.floor(n.h)/this.resolution),t.trimmed!==!1&&t.spriteSourceSize&&(i=new s(Math.floor(t.spriteSourceSize.x)/this.resolution,Math.floor(t.spriteSourceSize.y)/this.resolution,Math.floor(n.w)/this.resolution,Math.floor(n.h)/this.resolution)),this.textures[e]=new T({source:this.textureSource,frame:r,orig:o,trim:i,rotate:t.rotated?2:0,defaultAnchor:t.anchor,defaultBorders:t.borders,label:e.toString()})}r++}}_processAnimations(){let e=this.data.animations||{};for(let t in e){this.animations[t]=[];for(let n=0;n<e[t].length;n++){let r=e[t][n];this.animations[t].push(this.textures[r])}}}_parseComplete(){let e=this._callback;this._callback=null,this._batchIndex=0,e.call(this,this.textures)}_nextBatch(){this._processFrames(this._batchIndex*e.BATCH_SIZE),this._batchIndex++,setTimeout(()=>{this._batchIndex*e.BATCH_SIZE<this._frameKeys.length?this._nextBatch():(this._processAnimations(),this._parseComplete())},0)}destroy(e=!1){for(let e in this.textures)this.textures[e].destroy();this._frames=null,this._frameKeys=null,this.data=null,this.textures=null,e&&(this._texture?.destroy(),this.textureSource.destroy()),this._texture=null,this.textureSource=null,this.linkedSheets=[]}};Zt.BATCH_SIZE=1e3;var Qt=Zt,$t=[`jpg`,`png`,`jpeg`,`avif`,`webp`,`basis`,`etc2`,`bc7`,`bc6h`,`bc5`,`bc4`,`bc3`,`bc2`,`bc1`,`eac`,`astc`];function en(e,t,n){let r={};if(e.forEach(e=>{r[e]=t}),Object.keys(t.textures).forEach(e=>{r[`${t.cachePrefix}${e}`]=t.textures[e]}),!n){let n=Wt.dirname(e[0]);t.linkedSheets.forEach((e,i)=>{let a=en([`${n}/${t.data.meta.related_multi_packs[i]}`],e,!0);Object.assign(r,a)})}return r}var tn={extension:m.Asset,cache:{test:e=>e instanceof Qt,getCacheableAssets:(e,t)=>en(e,t,!1)},resolver:{extension:{type:m.ResolveParser,name:`resolveSpritesheet`},test:e=>{let t=e.split(`?`)[0].split(`.`),n=t.pop(),r=t.pop();return n===`json`&&$t.includes(r)},parse:e=>{let t=e.split(`.`);return{resolution:parseFloat(Jt.RETINA_PREFIX.exec(e)?.[1]??`1`),format:t[t.length-2],src:e}}},loader:{name:`spritesheetLoader`,id:`spritesheet`,extension:{type:m.LoadParser,priority:Rt.Normal,name:`spritesheetLoader`},async testParse(e,t){return Wt.extname(t.src).toLowerCase()===`.json`&&!!e.frames},async parse(e,t,n){let{texture:r,imageFilename:i,textureOptions:a,cachePrefix:o}=t?.data??{},s=Wt.dirname(t.src);s&&s.lastIndexOf(`/`)!==s.length-1&&(s+=`/`);let c;if(r instanceof T)c=r;else{let r=Xt(s+(i??e.meta.image),t.src);c=(await n.load([{src:r,data:a}]))[r]}let l=new Qt({texture:c.source,data:e,cachePrefix:o});await l.parse();let u=e?.meta?.related_multi_packs;if(Array.isArray(u)){let e=[];for(let r of u){if(typeof r!=`string`)continue;let i=s+r;t.data?.ignoreMultiPack||(i=Xt(i,t.src),e.push(n.load({src:i,data:{textureOptions:a,ignoreMultiPack:!0}})))}let r=await Promise.all(e);l.linkedSheets=r,r.forEach(e=>{e.linkedSheets=[l].concat(l.linkedSheets.filter(t=>t!==e))})}return l},async unload(e,t,n){await n.unload(e.textureSource._sourceOrigin),e.destroy(!1)}}};r.add(tn);var nn;function rn(e){return nn===void 0&&(nn=(()=>{let t={stencil:!0,failIfMajorPerformanceCaveat:e??R.defaultOptions.failIfMajorPerformanceCaveat};try{if(!b.get().getWebGLRenderingContext())return!1;let e=b.get().createCanvas().getContext(`webgl`,t),n=!!e?.getContextAttributes()?.stencil;if(e){let t=e.getExtension(`WEBGL_lose_context`);t&&t.loseContext()}return e=null,n}catch{return!1}})()),nn}var an;async function on(e={}){return an===void 0&&(an=await(async()=>{let t=b.get().getNavigator().gpu;if(!t)return!1;try{return await(await t.requestAdapter(e)).requestDevice(),!0}catch{return!1}})()),an}var sn=[`webgl`,`webgpu`,`canvas`];async function cn(e){let t=[];e.preference?Array.isArray(e.preference)?t=e.preference.slice():(t.push(e.preference),sn.forEach(n=>{n!==e.preference&&t.push(n)})):t=sn.slice();let n,r={};for(let i=0;i<t.length;i++){let a=t[i];if(a===`webgpu`&&await on()){let{WebGPURenderer:t}=await bt(async()=>{let{WebGPURenderer:e}=await Promise.resolve().then(()=>Ec);return{WebGPURenderer:e}},void 0,import.meta.url);n=t,r={...e,...e.webgpu};break}if(a===`webgl`&&rn(e.failIfMajorPerformanceCaveat??R.defaultOptions.failIfMajorPerformanceCaveat)){let{WebGLRenderer:t}=await bt(async()=>{let{WebGLRenderer:e}=await Promise.resolve().then(()=>vs);return{WebGLRenderer:e}},void 0,import.meta.url);n=t,r={...e,...e.webgl};break}if(a===`canvas`){let{CanvasRenderer:t}=await bt(async()=>{let{CanvasRenderer:e}=await Promise.resolve().then(()=>Ma);return{CanvasRenderer:e}},void 0,import.meta.url);n=t,r={...e,...e.canvasOptions};break}}if(delete r.webgpu,delete r.webgl,delete r.canvasOptions,!n)throw Error(`No available renderer for the current environment`);let i=new n;return await i.init(r),i}var ln=class{static init(e){Object.defineProperty(this,"resizeTo",{configurable:!0,set(e){globalThis.removeEventListener(`resize`,this.queueResize),this._resizeTo=e,e&&(globalThis.addEventListener(`resize`,this.queueResize),this.resize())},get(){return this._resizeTo}}),this.queueResize=()=>{this._resizeTo&&(this._cancelResize(),this._resizeId=requestAnimationFrame(()=>this.resize()))},this._cancelResize=()=>{this._resizeId&&(cancelAnimationFrame(this._resizeId),this._resizeId=null)},this.resize=()=>{if(!this._resizeTo)return;this._cancelResize();let e,t;if(this._resizeTo===globalThis.window)e=globalThis.innerWidth,t=globalThis.innerHeight;else{let{clientWidth:n,clientHeight:r}=this._resizeTo;e=n,t=r}this.renderer.resize(e,t),this.render()},this._resizeId=null,this._resizeTo=null,this.resizeTo=e.resizeTo||null}static destroy(){globalThis.removeEventListener(`resize`,this.queueResize),this._cancelResize(),this._cancelResize=null,this.queueResize=null,this.resizeTo=null,this.resize=null}};ln.extension=m.Application;var un=class{static init(e){e=Object.assign({autoStart:!0,sharedTicker:!1},e),Object.defineProperty(this,"ticker",{configurable:!0,set(e){this._ticker&&this._ticker.remove(this.render,this),this._ticker=e,e&&e.add(this.render,this,ue.LOW)},get(){return this._ticker}}),this.stop=()=>{this._ticker.stop()},this.start=()=>{this._ticker.start()},this._ticker=null,this.ticker=e.sharedTicker?A.shared:new A,e.autoStart&&this.start()}static destroy(){if(this._ticker){let e=this._ticker;this.ticker=null,e.destroy()}}};un.extension=m.Application,r.add(ln),r.add(un);var dn=class e{constructor(...e){this.stage=new j,e[0]!==void 0&&c(l,`Application constructor options are deprecated, please use Application.init() instead.`)}async init(t){t={...t},this.stage||(this.stage=new j),this.renderer=await cn(t),e._plugins.forEach(e=>{e.init.call(this,t)})}render(){this.renderer.render({container:this.stage})}get canvas(){return this.renderer.canvas}get view(){return c(l,`Application.view is deprecated, please use Application.canvas instead.`),this.renderer.canvas}get screen(){return this.renderer.screen}get domContainerRoot(){return this.renderer.renderPipes.dom?._domElement}destroy(t=!1,n=!1){let r=e._plugins.slice(0);r.reverse(),r.forEach(e=>{e.destroy.call(this)}),this.stage.destroy(n),this.stage=null,this.renderer.destroy(t),this.renderer=null}};dn._plugins=[];var fn=dn;r.handleByList(m.Application,fn._plugins),r.add(we);var pn={test(e){return typeof e==`string`&&e.startsWith(`info face=`)},parse(e){let t=e.match(/^[a-z]+\s+.+$/gm),n={info:[],common:[],page:[],char:[],chars:[],kerning:[],kernings:[],distanceField:[]};for(let e in t){let r=t[e].match(/^[a-z]+/gm)[0],i=t[e].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm),a={};for(let e in i){let t=i[e].split(`=`),n=t[0],r=t[1].replace(/"/gm,``),o=parseFloat(r);a[n]=isNaN(o)?r:o}n[r].push(a)}let r={chars:{},pages:[],lineHeight:0,fontSize:0,fontFamily:``,distanceField:null,baseLineOffset:0},[i]=n.info,[a]=n.common,[o]=n.distanceField??[];o&&(r.distanceField={range:parseInt(o.distanceRange,10),type:o.fieldType}),r.fontSize=parseInt(i.size,10),r.fontFamily=i.face,r.lineHeight=parseInt(a.lineHeight,10);let s=n.page;for(let e=0;e<s.length;e++)r.pages.push({id:parseInt(s[e].id,10)||0,file:s[e].file});let c={};r.baseLineOffset=a.base===void 0?0:r.lineHeight-parseInt(a.base,10);let l=n.char;for(let e=0;e<l.length;e++){let t=l[e],n=parseInt(t.id,10),i=t.letter??t.char??String.fromCharCode(n);i===`space`&&(i=` `),c[n]=i,r.chars[i]={id:n,page:parseInt(t.page,10)||0,x:parseInt(t.x,10),y:parseInt(t.y,10),width:parseInt(t.width,10),height:parseInt(t.height,10),xOffset:parseInt(t.xoffset,10),yOffset:parseInt(t.yoffset,10),xAdvance:parseInt(t.xadvance,10),kerning:{}}}let u=n.kerning||[];for(let e=0;e<u.length;e++){let t=parseInt(u[e].first,10),n=parseInt(u[e].second,10),i=parseInt(u[e].amount,10);r.chars[c[n]]&&(r.chars[c[n]].kerning[c[t]]=i)}return r}},mn={test(e){let t=e;return typeof t!=`string`&&`getElementsByTagName`in t&&t.getElementsByTagName(`page`).length&&t.getElementsByTagName(`info`)[0].getAttribute(`face`)!==null},parse(e){let t={chars:{},pages:[],lineHeight:0,fontSize:0,fontFamily:``,distanceField:null,baseLineOffset:0},n=e.getElementsByTagName(`info`)[0],r=e.getElementsByTagName(`common`)[0],i=e.getElementsByTagName(`distanceField`)[0];i&&(t.distanceField={type:i.getAttribute(`fieldType`),range:parseInt(i.getAttribute(`distanceRange`),10)});let a=e.getElementsByTagName(`page`),o=e.getElementsByTagName(`char`),s=e.getElementsByTagName(`kerning`);t.fontSize=parseInt(n.getAttribute(`size`),10),t.fontFamily=n.getAttribute(`face`),t.lineHeight=parseInt(r.getAttribute(`lineHeight`),10);for(let e=0;e<a.length;e++)t.pages.push({id:parseInt(a[e].getAttribute(`id`),10)||0,file:a[e].getAttribute(`file`)});let c={},l=r.getAttribute(`base`);t.baseLineOffset=l===null?0:t.lineHeight-parseInt(l,10);for(let e=0;e<o.length;e++){let n=o[e],r=parseInt(n.getAttribute(`id`),10),i=n.getAttribute(`letter`)??n.getAttribute(`char`)??String.fromCharCode(r);i===`space`&&(i=` `),c[r]=i,t.chars[i]={id:r,page:parseInt(n.getAttribute(`page`),10)||0,x:parseInt(n.getAttribute(`x`),10),y:parseInt(n.getAttribute(`y`),10),width:parseInt(n.getAttribute(`width`),10),height:parseInt(n.getAttribute(`height`),10),xOffset:parseInt(n.getAttribute(`xoffset`),10),yOffset:parseInt(n.getAttribute(`yoffset`),10),xAdvance:parseInt(n.getAttribute(`xadvance`),10),kerning:{}}}for(let e=0;e<s.length;e++){let n=parseInt(s[e].getAttribute(`first`),10),r=parseInt(s[e].getAttribute(`second`),10),i=parseInt(s[e].getAttribute(`amount`),10);t.chars[c[r]]&&(t.chars[c[r]].kerning[c[n]]=i)}return t}},hn={test(e){return typeof e==`string`&&e.match(/<font(\s|>)/)?mn.test(b.get().parseXML(e)):!1},parse(e){return mn.parse(b.get().parseXML(e))}},gn=[`.xml`,`.fnt`],_n={extension:{type:m.CacheParser,name:`cacheBitmapFont`},test:e=>!!e?.pages&&!!e?.chars&&typeof e?.fontFamily==`string`&&e.fontFamily!==``,getCacheableAssets(e,t){let n={};return e.forEach(e=>{n[e]=t,n[`${e}-bitmap`]=t}),n[`${t.fontFamily}-bitmap`]=t,n}},vn={extension:{type:m.LoadParser,priority:Rt.Normal},name:`loadBitmapFont`,id:`bitmap-font`,test(e){return gn.includes(Wt.extname(e).toLowerCase())},async testParse(e){return pn.test(e)||hn.test(e)},async parse(e,t,n){let r=pn.test(e)?pn.parse(e):hn.parse(e),{src:i}=t,{pages:a}=r,o=[],s=r.distanceField?{scaleMode:`linear`,alphaMode:`premultiply-alpha-on-upload`,autoGenerateMipmaps:!1,resolution:1}:{};for(let e=0;e<a.length;++e){let t=a[e].file,n=Wt.join(Wt.dirname(i),t);n=Xt(n,i),o.push({src:n,data:s})}let[c,{BitmapFont:l}]=await Promise.all([n.load(o),bt(()=>Promise.resolve().then(()=>Fc),void 0,import.meta.url)]);return new l({data:r,textures:o.map(e=>c[e.src])},i)},async load(e,t){return await(await b.get().fetch(e)).text()},async unload(e,t,n){await Promise.all(e.pages.map(e=>n.unload(e.texture.source._sourceOrigin))),e.destroy()}},yn=class{constructor(e,t=!1){this._loader=e,this._assetList=[],this._isLoading=!1,this._maxConcurrent=1,this.verbose=t}add(e){e.forEach(e=>{this._assetList.push(e)}),this.verbose&&console.log(`[BackgroundLoader] assets: `,this._assetList),this._isActive&&!this._isLoading&&this._next()}async _next(){if(this._assetList.length&&this._isActive){this._isLoading=!0;let e=[],t=Math.min(this._assetList.length,this._maxConcurrent);for(let n=0;n<t;n++)e.push(this._assetList.pop());await this._loader.load(e),this._isLoading=!1,this._next()}}get active(){return this._isActive}set active(e){this._isActive!==e&&(this._isActive=e,e&&!this._isLoading&&this._next())}},bn={extension:{type:m.CacheParser,name:`cacheTextureArray`},test:e=>Array.isArray(e)&&e.every(e=>e instanceof T),getCacheableAssets:(e,t)=>{let n={};return e.forEach(e=>{t.forEach((t,r)=>{n[e+(r===0?``:r+1)]=t})}),n}};async function xn(e){if(`Image`in globalThis)return new Promise(t=>{let n=new Image;n.onload=()=>{t(!0)},n.onerror=()=>{t(!1)},n.src=e});if(`createImageBitmap`in globalThis&&`fetch`in globalThis){try{let t=await(await fetch(e)).blob();await createImageBitmap(t)}catch{return!1}return!0}return!1}var Sn={extension:{type:m.DetectionParser,priority:1},test:async()=>xn(`data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=`),add:async e=>[...e,`avif`],remove:async e=>e.filter(e=>e!==`avif`)},Cn=[`png`,`jpg`,`jpeg`],wn={extension:{type:m.DetectionParser,priority:-1},test:()=>Promise.resolve(!0),add:async e=>[...e,...Cn],remove:async e=>e.filter(e=>!Cn.includes(e))},Tn=`WorkerGlobalScope`in globalThis&&globalThis instanceof globalThis.WorkerGlobalScope;function En(e){return!Tn&&document.createElement(`video`).canPlayType(e)!==``}var Dn={extension:{type:m.DetectionParser,priority:0},test:async()=>En(`video/mp4`),add:async e=>[...e,`mp4`,`m4v`],remove:async e=>e.filter(e=>e!==`mp4`&&e!==`m4v`)},On={extension:{type:m.DetectionParser,priority:0},test:async()=>En(`video/ogg`),add:async e=>[...e,`ogv`],remove:async e=>e.filter(e=>e!==`ogv`)},kn={extension:{type:m.DetectionParser,priority:0},test:async()=>En(`video/webm`),add:async e=>[...e,`webm`],remove:async e=>e.filter(e=>e!==`webm`)},An={extension:{type:m.DetectionParser,priority:0},test:async()=>xn(`data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=`),add:async e=>[...e,`webp`],remove:async e=>e.filter(e=>e!==`webp`)},jn=class e{constructor(){this.loadOptions={...e.defaultOptions},this._parsers=[],this._parsersValidated=!1,this.parsers=new Proxy(this._parsers,{set:(e,t,n)=>(this._parsersValidated=!1,e[t]=n,!0)}),this.promiseCache={}}reset(){this._parsersValidated=!1,this.promiseCache={}}_getLoadPromiseAndParser(e,t){let n={promise:null,parser:null};return n.promise=(async()=>{let r=null,i=null;if((t.parser||t.loadParser)&&(i=this._parserHash[t.parser||t.loadParser],t.loadParser&&E(`[Assets] "loadParser" is deprecated, use "parser" instead for ${e}`),i||E(`[Assets] specified load parser "${t.parser||t.loadParser}" not found while loading ${e}`)),!i){for(let n=0;n<this.parsers.length;n++){let r=this.parsers[n];if(r.load&&r.test?.(e,t,this)){i=r;break}}if(!i)return E(`[Assets] ${e} could not be loaded as we don't know how to parse it, ensure the correct parser has been added`),null}r=await i.load(e,t,this),n.parser=i;for(let e=0;e<this.parsers.length;e++){let i=this.parsers[e];i.parse&&i.parse&&await i.testParse?.(r,t,this)&&(r=await i.parse(r,t,this)||r,n.parser=i)}return r})(),n}async load(t,n){this._parsersValidated||this._validateParsers();let{onProgress:r,onError:i,strategy:a,retryCount:o,retryDelay:s}=typeof n==`function`?{...e.defaultOptions,...this.loadOptions,onProgress:n}:{...e.defaultOptions,...this.loadOptions,...n||{}},c=0,l={},u=qt(t),d=F(t,e=>({alias:[e],src:e,data:{}})),f=d.reduce((e,t)=>e+(t.progressSize||1),0),p=d.map(async e=>{let t=Wt.toAbsolute(e.src);l[e.src]||(await this._loadAssetWithRetry(t,e,{onProgress:r,onError:i,strategy:a,retryCount:o,retryDelay:s},l),c+=e.progressSize||1,r&&r(c/f))});return await Promise.all(p),u?l[d[0].src]:l}async unload(e){let t=F(e,e=>({alias:[e],src:e})).map(async e=>{let t=Wt.toAbsolute(e.src),n=this.promiseCache[t];if(n){let r=await n.promise;delete this.promiseCache[t],await n.parser?.unload?.(r,e,this)}});await Promise.all(t)}_validateParsers(){this._parsersValidated=!0,this._parserHash=this._parsers.filter(e=>e.name||e.id).reduce((e,t)=>(!t.name&&!t.id?E(`[Assets] parser should have an id`):(e[t.name]||e[t.id])&&E(`[Assets] parser id conflict "${t.id}"`),e[t.name]=t,t.id&&(e[t.id]=t),e),{})}async _loadAssetWithRetry(e,t,n,r){let i=0,{onError:a,strategy:o,retryCount:s,retryDelay:c}=n,l=e=>new Promise(t=>setTimeout(t,e));for(;;)try{this.promiseCache[e]||(this.promiseCache[e]=this._getLoadPromiseAndParser(e,t)),r[t.src]=await this.promiseCache[e].promise;return}catch(n){if(delete this.promiseCache[e],delete r[t.src],i++,o===`retry`&&!(o!==`retry`||i>s)){a&&a(n,t),await l(c);continue}if(o===`skip`){a&&a(n,t);return}a&&a(n,t);let u=Error(`[Loader.load] Failed to load ${e}.
${n}`);throw n instanceof Error&&n.stack&&(u.stack=n.stack),u}}};jn.defaultOptions={onProgress:void 0,onError:void 0,strategy:`throw`,retryCount:3,retryDelay:250};var Mn=jn;function Nn(e,t){if(Array.isArray(t)){for(let n of t)if(e.startsWith(`data:${n}`))return!0;return!1}return e.startsWith(`data:${t}`)}function Pn(e,t){let n=e.split(`?`)[0],r=Wt.extname(n).toLowerCase();return Array.isArray(t)?t.includes(r):r===t}var Fn=`.json`,In=`application/json`,Ln={extension:{type:m.LoadParser,priority:Rt.Low},name:`loadJson`,id:`json`,test(e){return Nn(e,In)||Pn(e,Fn)},async load(e){return await(await b.get().fetch(e)).json()}},Rn=`.txt`,zn=`text/plain`,Bn={name:`loadTxt`,id:`text`,extension:{type:m.LoadParser,priority:Rt.Low,name:`loadTxt`},test(e){return Nn(e,zn)||Pn(e,Rn)},async load(e){return await(await b.get().fetch(e)).text()}},Vn=[`normal`,`bold`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`],Hn=[`.ttf`,`.otf`,`.woff`,`.woff2`],Un=[`font/ttf`,`font/otf`,`font/woff`,`font/woff2`],Wn=/^(--|-?[A-Z_])[0-9A-Z_-]*$/i;function Gn(e){let t=Wt.extname(e),n=Wt.basename(e,t).replace(/(-|_)/g,` `).toLowerCase().split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)),r=n.length>0;for(let e of n)if(!e.match(Wn)){r=!1;break}let i=n.join(` `);return r||(i=`"${i.replace(/[\\"]/g,`\\$&`)}"`),i}var Kn=/^[0-9A-Za-z%:/?#\[\]@!\$&'()\*\+,;=\-._~]*$/;function qn(e){return Kn.test(e)?e:encodeURI(e)}var Jn={extension:{type:m.LoadParser,priority:Rt.Low},name:`loadWebFont`,id:`web-font`,test(e){return Nn(e,Un)||Pn(e,Hn)},async load(e,t){let n=b.get().getFontFaceSet();if(n){let r=[],i=t.data?.family??Gn(e),a=t.data?.weights?.filter(e=>Vn.includes(e))??[`normal`],o=t.data??{};for(let t=0;t<a.length;t++){let s=a[t],c=new FontFace(i,`url('${qn(e)}')`,{...o,weight:s});await c.load(),n.add(c),r.push(c)}return I.has(`${i}-and-url`)?I.get(`${i}-and-url`).entries.push({url:e,faces:r}):I.set(`${i}-and-url`,{entries:[{url:e,faces:r}]}),r.length===1?r[0]:r}return E(`[loadWebFont] FontFace API is not supported. Skipping loading font`),null},unload(e){let t=Array.isArray(e)?e:[e],n=t[0].family,r=I.get(`${n}-and-url`),i=r.entries.find(e=>e.faces.some(e=>t.indexOf(e)!==-1));i.faces=i.faces.filter(e=>t.indexOf(e)===-1),i.faces.length===0&&(r.entries=r.entries.filter(e=>e!==i)),t.forEach(e=>{b.get().getFontFaceSet().delete(e)}),r.entries.length===0&&I.remove(`${n}-and-url`)}};function Yn(e,t=1){let n=Jt.RETINA_PREFIX?.exec(e);return n?parseFloat(n[1]):t}function Xn(e,t,n){e.label=n,e._sourceOrigin=n;let r=new T({source:e,label:n}),i=()=>{delete t.promiseCache[n],I.has(n)&&I.remove(n)};return r.source.once(`destroy`,()=>{t.promiseCache[n]&&(E(`[Assets] A TextureSource managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the TextureSource.`),i())}),r.once(`destroy`,()=>{e.destroyed||(E(`[Assets] A Texture managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the Texture.`),i())}),r}var Zn=`.svg`,Qn=`image/svg+xml`,$n={extension:{type:m.LoadParser,priority:Rt.Low,name:`loadSVG`},name:`loadSVG`,id:`svg`,config:{crossOrigin:`anonymous`,parseAsGraphicsContext:!1},test(e){return Nn(e,Qn)||Pn(e,Zn)},async load(e,t,n){return t.data?.parseAsGraphicsContext??this.config.parseAsGraphicsContext?tr(e):er(e,t,n,this.config.crossOrigin)},unload(e){e.destroy(!0)}};async function er(e,t,n,r){let i=await b.get().fetch(e),a=b.get().createImage();a.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(await i.text())}`,a.crossOrigin=r,await a.decode();let o=t.data?.width??a.width,s=t.data?.height??a.height,c=t.data?.resolution||Yn(e),l=Math.ceil(o*c),u=Math.ceil(s*c),d=b.get().createCanvas(l,u),f=d.getContext(`2d`);f.imageSmoothingEnabled=!0,f.imageSmoothingQuality=`high`,f.drawImage(a,0,0,o*c,s*c);let{parseAsGraphicsContext:p,...m}=t.data??{};return Xn(new P({resource:d,alphaMode:`premultiply-alpha-on-upload`,resolution:c,...m}),n,e)}async function tr(e){let t=await(await b.get().fetch(e)).text(),n=new He;return n.svg(t),n}var nr=`(function () {
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
`,rr=null,ir=class{constructor(){rr||(rr=URL.createObjectURL(new Blob([nr],{type:`application/javascript`}))),this.worker=new Worker(rr)}};ir.revokeObjectURL=function(){rr&&(URL.revokeObjectURL(rr),rr=null)};var ar=`(function () {
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
`,or=null,sr=class{constructor(){or||(or=URL.createObjectURL(new Blob([ar],{type:`application/javascript`}))),this.worker=new Worker(or)}};sr.revokeObjectURL=function(){or&&(URL.revokeObjectURL(or),or=null)};var cr=0,lr,ur=new class{constructor(){this._initialized=!1,this._createdWorkers=0,this._workerPool=[],this._queue=[],this._resolveHash={}}isImageBitmapSupported(){return this._isImageBitmapSupported===void 0&&(this._isImageBitmapSupported=new Promise(e=>{let{worker:t}=new ir;t.addEventListener(`message`,n=>{t.terminate(),ir.revokeObjectURL(),e(n.data)})})),this._isImageBitmapSupported}loadImageBitmap(e,t){return this._run(`loadImageBitmap`,[e,t?.data?.alphaMode])}async _initWorkers(){this._initialized||(this._initialized=!0)}_getWorker(){lr===void 0&&(lr=navigator.hardwareConcurrency||4);let e=this._workerPool.pop();return!e&&this._createdWorkers<lr&&(this._createdWorkers++,e=new sr().worker,e.addEventListener(`message`,e=>{this._complete(e.data),this._returnWorker(e.target),this._next()})),e}_returnWorker(e){this._workerPool.push(e)}_complete(e){this._resolveHash[e.uuid]&&(e.error===void 0?this._resolveHash[e.uuid].resolve(e.data):this._resolveHash[e.uuid].reject(e.error),delete this._resolveHash[e.uuid])}async _run(e,t){await this._initWorkers();let n=new Promise((n,r)=>{this._queue.push({id:e,arguments:t,resolve:n,reject:r})});return this._next(),n}_next(){if(!this._queue.length)return;let e=this._getWorker();if(!e)return;let t=this._queue.pop(),n=t.id;this._resolveHash[cr]={resolve:t.resolve,reject:t.reject},e.postMessage({data:t.arguments,uuid:cr++,id:n})}reset(){this._workerPool.forEach(e=>e.terminate()),this._workerPool.length=0,Object.values(this._resolveHash).forEach(({reject:e})=>{e?.(Error(`WorkerManager has been reset before completion`))}),this._resolveHash={},this._queue.length=0,this._initialized=!1,this._createdWorkers=0}},dr=[`.jpeg`,`.jpg`,`.png`,`.webp`,`.avif`],fr=[`image/jpeg`,`image/png`,`image/webp`,`image/avif`];async function pr(e,t){let n=await b.get().fetch(e);if(!n.ok)throw Error(`[loadImageBitmap] Failed to fetch ${e}: ${n.status} ${n.statusText}`);let r=await n.blob();return t?.data?.alphaMode===`premultiplied-alpha`?createImageBitmap(r,{premultiplyAlpha:`none`}):createImageBitmap(r)}var mr={name:`loadTextures`,id:`texture`,extension:{type:m.LoadParser,priority:Rt.High,name:`loadTextures`},config:{preferWorkers:!0,preferCreateImageBitmap:!0,crossOrigin:`anonymous`},test(e){return Nn(e,fr)||Pn(e,dr)},async load(e,t,n){let r=null;return r=globalThis.createImageBitmap&&this.config.preferCreateImageBitmap?this.config.preferWorkers&&await ur.isImageBitmapSupported()?await ur.loadImageBitmap(e,t):await pr(e,t):await new Promise((t,n)=>{r=b.get().createImage(),r.crossOrigin=this.config.crossOrigin,r.src=e,r.complete?t(r):(r.onload=()=>{t(r)},r.onerror=n)}),Xn(new P({resource:r,alphaMode:`premultiply-alpha-on-upload`,resolution:t.data?.resolution||Yn(e),...t.data}),n,e)},unload(e){e.destroy(!0)}},hr=[`.mp4`,`.m4v`,`.webm`,`.ogg`,`.ogv`,`.h264`,`.avi`,`.mov`],gr,_r;function vr(e,t,n){n===void 0&&!t.startsWith(`data:`)?e.crossOrigin=br(t):n!==!1&&(e.crossOrigin=typeof n==`string`?n:`anonymous`)}function yr(e){return new Promise((t,n)=>{e.addEventListener(`canplaythrough`,r),e.addEventListener(`error`,i),e.load();function r(){a(),t()}function i(e){a(),n(e)}function a(){e.removeEventListener(`canplaythrough`,r),e.removeEventListener(`error`,i)}})}function br(e,t=globalThis.location){if(e.startsWith(`data:`))return``;t||(t=globalThis.location);let n=new URL(e,document.baseURI);return n.hostname!==t.hostname||n.port!==t.port||n.protocol!==t.protocol?`anonymous`:``}function xr(){let e=[],t=[];for(let n of hr){let r=Nt.MIME_TYPES[n.substring(1)]||`video/${n.substring(1)}`;En(r)&&(e.push(n),t.includes(r)||t.push(r))}return{validVideoExtensions:e,validVideoMime:t}}var Sr={name:`loadVideo`,id:`video`,extension:{type:m.LoadParser,name:`loadVideo`},test(e){if(!gr||!_r){let{validVideoExtensions:e,validVideoMime:t}=xr();gr=e,_r=t}let t=Nn(e,_r),n=Pn(e,gr);return t||n},async load(e,t,n){let r={...Nt.defaultOptions,resolution:t.data?.resolution||Yn(e),alphaMode:t.data?.alphaMode||await jt(),...t.data},i=document.createElement(`video`),a={preload:r.autoLoad===!1?void 0:`auto`,"webkit-playsinline":r.playsinline===!1?void 0:``,playsinline:r.playsinline===!1?void 0:``,muted:r.muted===!0?``:void 0,loop:r.loop===!0?``:void 0,autoplay:r.autoPlay===!1?void 0:``};Object.keys(a).forEach(e=>{let t=a[e];t!==void 0&&i.setAttribute(e,t)}),r.muted===!0&&(i.muted=!0),vr(i,e,r.crossorigin);let o=document.createElement(`source`),s;if(r.mime)s=r.mime;else if(e.startsWith(`data:`))s=e.slice(5,e.indexOf(`;`));else if(!e.startsWith(`blob:`)){let t=e.split(`?`)[0].slice(e.lastIndexOf(`.`)+1).toLowerCase();s=Nt.MIME_TYPES[t]||`video/${t}`}return o.src=e,s&&(o.type=s),new Promise((a,s)=>{r.preload&&!r.autoPlay&&i.load(),i.addEventListener(`canplay`,c),i.addEventListener(`error`,l),o.addEventListener(`error`,l),i.appendChild(o);async function c(){let o=new Nt({...r,resource:i});u(),t.data.preload&&await yr(i),a(Xn(o,n,e))}function l(e){u(),s(e)}function u(){i.removeEventListener(`canplay`,c),i.removeEventListener(`error`,l),o.removeEventListener(`error`,l)}})},unload(e){e.destroy(!0)}},Cr={extension:{type:m.ResolveParser,name:`resolveTexture`},test:mr.test,parse:e=>({resolution:parseFloat(Jt.RETINA_PREFIX.exec(e)?.[1]??`1`),format:e.split(`.`).pop(),src:e})},wr={extension:{type:m.ResolveParser,priority:-2,name:`resolveJson`},test:e=>Jt.RETINA_PREFIX.test(e)&&e.endsWith(`.json`),parse:Cr.parse},Tr=new class{constructor(){this._detections=[],this._initialized=!1,this.resolver=new Jt,this.loader=new Mn,this.cache=I,this._backgroundLoader=new yn(this.loader),this._backgroundLoader.active=!0,this.reset()}async init(e={}){if(this._initialized){E(`[Assets]AssetManager already initialized, did you load before calling this Assets.init()?`);return}if(this._initialized=!0,e.defaultSearchParams&&this.resolver.setDefaultSearchParams(e.defaultSearchParams),e.basePath&&(this.resolver.basePath=e.basePath),e.bundleIdentifier&&this.resolver.setBundleIdentifier(e.bundleIdentifier),e.manifest){let t=e.manifest;typeof t==`string`&&(t=await this.load(t)),this.resolver.addManifest(t)}let t=e.texturePreference?.resolution??1,n=typeof t==`number`?[t]:t,r=await this._detectFormats({preferredFormats:e.texturePreference?.format,skipDetections:e.skipDetections,detections:this._detections});this.resolver.prefer({params:{format:r,resolution:n}}),e.preferences&&this.setPreferences(e.preferences),e.loadOptions&&(this.loader.loadOptions={...this.loader.loadOptions,...e.loadOptions})}add(e){this.resolver.add(e)}async load(e,t){this._initialized||await this.init();let n=qt(e),r=F(e).map(e=>{if(typeof e!=`string`){let t=this.resolver.getAlias(e);return t.some(e=>!this.resolver.hasKey(e))&&this.add(e),Array.isArray(t)?t[0]:t}return this.resolver.hasKey(e)||this.add({alias:e,src:e}),e}),i=this.resolver.resolve(r),a=await this._mapLoadToResolve(i,t);return n?a[r[0]]:a}addBundle(e,t){this.resolver.addBundle(e,t)}async loadBundle(e,t){this._initialized||await this.init();let n=!1;typeof e==`string`&&(n=!0,e=[e]);let r=this.resolver.resolveBundle(e),i={},a=Object.keys(r),o=0,s=[],c=()=>{t?.(s.reduce((e,t)=>e+t,0)/o)},l=a.map((e,t)=>{let n=r[e],a=Object.values(n),l=[...new Set(a.flat())].reduce((e,t)=>e+(t.progressSize||1),0);return s.push(0),o+=l,this._mapLoadToResolve(n,e=>{s[t]=e*l,c()}).then(t=>{i[e]=t})});return await Promise.all(l),n?i[e[0]]:i}async backgroundLoad(e){this._initialized||await this.init(),typeof e==`string`&&(e=[e]);let t=this.resolver.resolve(e);this._backgroundLoader.add(Object.values(t))}async backgroundLoadBundle(e){this._initialized||await this.init(),typeof e==`string`&&(e=[e]);let t=this.resolver.resolveBundle(e);Object.values(t).forEach(e=>{this._backgroundLoader.add(Object.values(e))})}reset(){this.resolver.reset(),this.loader.reset(),this.cache.reset(),this._initialized=!1}get(e){if(typeof e==`string`)return I.get(e);let t={};for(let n=0;n<e.length;n++)t[n]=I.get(e[n]);return t}async _mapLoadToResolve(e,t){let n=[...new Set(Object.values(e))];this._backgroundLoader.active=!1;let r=await this.loader.load(n,t);this._backgroundLoader.active=!0;let i={};return n.forEach(e=>{let t=r[e.src],n=[e.src];e.alias&&n.push(...e.alias),n.forEach(e=>{i[e]=t}),I.set(n,t)}),i}async unload(e){this._initialized||await this.init();let t=F(e).map(e=>typeof e==`string`?e:e.src),n=this.resolver.resolve(t);await this._unloadFromResolved(n)}async unloadBundle(e){this._initialized||await this.init(),e=F(e);let t=this.resolver.resolveBundle(e),n=Object.keys(t).map(e=>this._unloadFromResolved(t[e]));await Promise.all(n)}async _unloadFromResolved(e){let t=Object.values(e);t.forEach(e=>{I.remove(e.src)}),await this.loader.unload(t)}async _detectFormats(e){let t=[];e.preferredFormats&&(t=Array.isArray(e.preferredFormats)?e.preferredFormats:[e.preferredFormats]);for(let n of e.detections)e.skipDetections||await n.test()?t=await n.add(t):e.skipDetections||(t=await n.remove(t));return t=t.filter((e,n)=>t.indexOf(e)===n),t}get detections(){return this._detections}setPreferences(e){this.loader.parsers.forEach(t=>{t.config&&Object.keys(t.config).filter(t=>t in e).forEach(n=>{t.config[n]=e[n]})})}};r.handleByList(m.LoadParser,Tr.loader.parsers).handleByList(m.ResolveParser,Tr.resolver.parsers).handleByList(m.CacheParser,Tr.cache.parsers).handleByList(m.DetectionParser,Tr.detections),r.add(bn,wn,Sn,An,Dn,On,kn,Ln,Bn,Jn,$n,mr,Sr,vn,_n,Cr,wr);var Er={loader:m.LoadParser,resolver:m.ResolveParser,cache:m.CacheParser,detection:m.DetectionParser};r.handle(m.Asset,e=>{let t=e.ref;Object.entries(Er).filter(([e])=>!!t[e]).forEach(([e,n])=>r.add(Object.assign(t[e],{extension:t[e].extension??n})))},e=>{let t=e.ref;Object.keys(Er).filter(e=>!!t[e]).forEach(e=>r.remove(t[e]))});var Dr=new e;function Or(e,t,n,r,i=!1,a){let o=Dr;o.minX=0,o.minY=0,o.maxX=e.width/r|0,o.maxY=e.height/r|0;let s=fe.getOptimalTexture({width:o.width,height:o.height,resolution:r,autoGenerateMipmaps:i,scaleMode:a});return s.source.uploadMethodId=`image`,s.source.resource=e,s.source.alphaMode=`premultiply-alpha-on-upload`,s.frame.width=t/r,s.frame.height=n/r,s.source.emit(`update`,s.source),s.updateUvs(),s}var kr=`in vec2 aPosition;
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
`,Ar=`
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
`,jr=`struct GlobalFilterUniforms {
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
}`,Mr=class extends N{constructor(e={}){let t=new C({uColorMatrix:{value:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],type:`f32`,size:20},uAlpha:{value:1,type:`f32`}}),n=oe.from({vertex:{source:jr,entryPoint:`mainVertex`},fragment:{source:jr,entryPoint:`mainFragment`}}),r=y.from({vertex:kr,fragment:Ar,name:`color-matrix-filter`});super({...e,gpuProgram:n,glProgram:r,resources:{colorMatrixUniforms:t}}),this.alpha=1}_loadMatrix(e,t=!1){if(t){let t=[...e];this._multiply(t,this.matrix,e),this.resources.colorMatrixUniforms.uniforms.uColorMatrix=t}else this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e;this.resources.colorMatrixUniforms.update()}_multiply(e,t,n){return e[0]=t[0]*n[0]+t[1]*n[5]+t[2]*n[10]+t[3]*n[15],e[1]=t[0]*n[1]+t[1]*n[6]+t[2]*n[11]+t[3]*n[16],e[2]=t[0]*n[2]+t[1]*n[7]+t[2]*n[12]+t[3]*n[17],e[3]=t[0]*n[3]+t[1]*n[8]+t[2]*n[13]+t[3]*n[18],e[4]=t[0]*n[4]+t[1]*n[9]+t[2]*n[14]+t[3]*n[19]+t[4],e[5]=t[5]*n[0]+t[6]*n[5]+t[7]*n[10]+t[8]*n[15],e[6]=t[5]*n[1]+t[6]*n[6]+t[7]*n[11]+t[8]*n[16],e[7]=t[5]*n[2]+t[6]*n[7]+t[7]*n[12]+t[8]*n[17],e[8]=t[5]*n[3]+t[6]*n[8]+t[7]*n[13]+t[8]*n[18],e[9]=t[5]*n[4]+t[6]*n[9]+t[7]*n[14]+t[8]*n[19]+t[9],e[10]=t[10]*n[0]+t[11]*n[5]+t[12]*n[10]+t[13]*n[15],e[11]=t[10]*n[1]+t[11]*n[6]+t[12]*n[11]+t[13]*n[16],e[12]=t[10]*n[2]+t[11]*n[7]+t[12]*n[12]+t[13]*n[17],e[13]=t[10]*n[3]+t[11]*n[8]+t[12]*n[13]+t[13]*n[18],e[14]=t[10]*n[4]+t[11]*n[9]+t[12]*n[14]+t[13]*n[19]+t[14],e[15]=t[15]*n[0]+t[16]*n[5]+t[17]*n[10]+t[18]*n[15],e[16]=t[15]*n[1]+t[16]*n[6]+t[17]*n[11]+t[18]*n[16],e[17]=t[15]*n[2]+t[16]*n[7]+t[17]*n[12]+t[18]*n[17],e[18]=t[15]*n[3]+t[16]*n[8]+t[17]*n[13]+t[18]*n[18],e[19]=t[15]*n[4]+t[16]*n[9]+t[17]*n[14]+t[18]*n[19]+t[19],e}brightness(e,t){let n=[e,0,0,0,0,0,e,0,0,0,0,0,e,0,0,0,0,0,1,0];this._loadMatrix(n,t)}tint(e,t){let[n,r,i]=f.shared.setValue(e).toArray(),a=[n,0,0,0,0,0,r,0,0,0,0,0,i,0,0,0,0,0,1,0];this._loadMatrix(a,t)}greyscale(e,t){let n=[e,e,e,0,0,e,e,e,0,0,e,e,e,0,0,0,0,0,1,0];this._loadMatrix(n,t)}grayscale(e,t){this.greyscale(e,t)}blackAndWhite(e){this._loadMatrix([.3,.6,.1,0,0,.3,.6,.1,0,0,.3,.6,.1,0,0,0,0,0,1,0],e)}hue(e,t){e=(e||0)/180*Math.PI;let n=Math.cos(e),r=Math.sin(e),i=Math.sqrt,a=1/3,o=i(a),s=[n+(1-n)*a,a*(1-n)-o*r,a*(1-n)+o*r,0,0,a*(1-n)+o*r,n+a*(1-n),a*(1-n)-o*r,0,0,a*(1-n)-o*r,a*(1-n)+o*r,n+a*(1-n),0,0,0,0,0,1,0];this._loadMatrix(s,t)}contrast(e,t){let n=(e||0)+1,r=-.5*(n-1),i=[n,0,0,0,r,0,n,0,0,r,0,0,n,0,r,0,0,0,1,0];this._loadMatrix(i,t)}saturate(e=0,t){let n=e*2/3+1,r=(n-1)*-.5,i=[n,r,r,0,0,r,n,r,0,0,r,r,n,0,0,0,0,0,1,0];this._loadMatrix(i,t)}desaturate(){this.saturate(-1)}negative(e){this._loadMatrix([-1,0,0,1,0,0,-1,0,1,0,0,0,-1,1,0,0,0,0,1,0],e)}sepia(e){this._loadMatrix([.393,.7689999,.18899999,0,0,.349,.6859999,.16799999,0,0,.272,.5339999,.13099999,0,0,0,0,0,1,0],e)}technicolor(e){this._loadMatrix([1.9125277891456083,-.8545344976951645,-.09155508482755585,0,.046249425232852304,-.3087833385928097,1.7658908555458428,-.10601743074722245,0,-.2758903984886823,-.231103377548616,-.7501899197440212,1.847597816108189,0,.12137623870388682,0,0,0,1,0],e)}polaroid(e){this._loadMatrix([1.438,-.062,-.062,0,0,-.122,1.378,-.122,0,0,-.016,-.016,1.483,0,0,0,0,0,1,0],e)}toBGR(e){this._loadMatrix([0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0],e)}kodachrome(e){this._loadMatrix([1.1285582396593525,-.3967382283601348,-.03992559172921793,0,.24991995145868634,-.16404339962244616,1.0835251566291304,-.05498805115633132,0,.09698983488904393,-.16786010706155763,-.5603416277695248,1.6014850761964943,0,.13972481597886063,0,0,0,1,0],e)}browni(e){this._loadMatrix([.5997023498159715,.34553243048391263,-.2708298674538042,0,.1860075629647401,-.037703249837783157,.8609577587992641,.15059552388459913,0,-.14497417640467167,.24113635128153335,-.07441037908422492,.44972182064877153,0,-.029655197167024642,0,0,0,1,0],e)}vintage(e){this._loadMatrix([.6279345635605994,.3202183420819367,-.03965408211312453,0,.037848179746251466,.02578397704808868,.6441188644374771,.03259127616149294,0,.029265996770472907,.0466055556782719,-.0851232987247891,.5241648018700465,0,.020232119953863904,0,0,0,1,0],e)}colorTone(e,t,n,r,i){e||(e=.2),t||(t=.15),n||(n=16770432),r||(r=3375104);let a=f.shared,[o,s,c]=a.setValue(n).toArray(),[l,u,d]=a.setValue(r).toArray(),p=[.3,.59,.11,0,0,o,s,c,e,0,l,u,d,t,0,o-l,s-u,c-d,0,0];this._loadMatrix(p,i)}night(e,t){e||(e=.1);let n=[e*-2,-e,0,0,0,-e,0,e,0,0,0,e,e*2,0,0,0,0,0,1,0];this._loadMatrix(n,t)}predator(e,t){let n=[11.224130630493164*e,-4.794486999511719*e,-2.8746118545532227*e,0*e,.40342438220977783*e,-3.6330697536468506*e,9.193157196044922*e,-2.951810836791992*e,0*e,-1.316135048866272*e,-3.2184197902679443*e,-4.2375030517578125*e,7.476448059082031*e,0*e,.8044459223747253*e,0,0,0,1,0];this._loadMatrix(n,t)}lsd(e){this._loadMatrix([2,-.4,.5,0,0,-.5,2,-.4,0,0,-.4,-.5,3,0,0,0,0,0,1,0],e)}reset(){this._loadMatrix([1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],!1)}get matrix(){return this.resources.colorMatrixUniforms.uniforms.uColorMatrix}set matrix(e){this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e}get alpha(){return this.resources.colorMatrixUniforms.uniforms.uAlpha}set alpha(e){this.resources.colorMatrixUniforms.uniforms.uAlpha=e}},Nr=class{constructor(){this.isBatchable=!1}reset(){this.isBatchable=!1,this.context=null,this.graphicsData&&(this.graphicsData.destroy(),this.graphicsData=null)}destroy(){this.reset()}},Pr=class{constructor(){this.instructions=new h}init(){this.instructions.reset()}destroy(){this.instructions.destroy(),this.instructions=null}},Fr=class e{constructor(e){this._renderer=e,this._managedContexts=new nt({renderer:e,type:`resource`,name:`graphicsContext`})}init(t){e.defaultOptions.bezierSmoothness=t?.bezierSmoothness??e.defaultOptions.bezierSmoothness}getContextRenderData(e){return this.getGpuContext(e).graphicsData||this._initContextRenderData(e)}updateGpuContext(e){let t=e._gpuData,n=!!t[this._renderer.uid],r=t[this._renderer.uid]||this._initContext(e);return(e.dirty||!n)&&(n&&r.reset(),r.isBatchable=!1,e.dirty=!1),r}getGpuContext(e){return e._gpuData[this._renderer.uid]||this._initContext(e)}_initContextRenderData(e){let t=new Pr,n=this.getGpuContext(e);return n.graphicsData=t,t.init(),t}_initContext(e){let t=new Nr;return t.context=e,e._gpuData[this._renderer.uid]=t,this._managedContexts.add(e),t}destroy(){this._managedContexts.destroy(),this._renderer=null}};Fr.extension={type:[m.CanvasSystem],name:`graphicsContext`},Fr.defaultOptions={bezierSmoothness:.5};var Ir=Fr,Lr=class{constructor(e,t){this.state=ve.for2d(),this.renderer=e,this._adaptor=t,this.renderer.runners.contextChange.add(this),this._managedGraphics=new nt({renderer:e,type:`renderable`,priority:-1,name:`graphics`})}contextChange(){this._adaptor.contextChange(this.renderer)}validateRenderable(e){return!1}addRenderable(e,t){this._managedGraphics.add(e),this.renderer.renderPipes.batch.break(t),t.add(e)}updateRenderable(e){}execute(e){e.isRenderable&&this._adaptor.execute(this,e)}destroy(){this._managedGraphics.destroy(),this.renderer=null,this._adaptor.destroy(),this._adaptor=null}};Lr.extension={type:[m.CanvasPipes],name:`graphics`};var Rr=class{constructor(){this.batches=[],this.batched=!1}destroy(){this.batches.forEach(e=>{ce.return(e)}),this.batches.length=0}},zr=class{constructor(e,t){this.state=ve.for2d(),this.renderer=e,this._adaptor=t,this.renderer.runners.contextChange.add(this),this._managedGraphics=new nt({renderer:e,type:`renderable`,priority:-1,name:`graphics`})}contextChange(){this._adaptor.contextChange(this.renderer)}validateRenderable(e){let t=e.context,n=!!e._gpuData,r=this.renderer.graphicsContext.updateGpuContext(t);return!!(r.isBatchable||n!==r.isBatchable)}addRenderable(e,t){let n=this.renderer.graphicsContext.updateGpuContext(e.context);(e.didViewUpdate||!e._gpuData[this.renderer.uid])&&this._rebuild(e),n.isBatchable?this._addToBatcher(e,t):(this.renderer.renderPipes.batch.break(t),t.add(e))}updateRenderable(e){let t=this._getGpuDataForRenderable(e).batches;for(let e=0;e<t.length;e++){let n=t[e];n._batcher.updateElement(n)}}execute(e){if(!e.isRenderable)return;let t=this.renderer,n=e.context;if(!t.graphicsContext.getGpuContext(n).batches.length)return;let r=n.customShader||this._adaptor.shader;this.state.blendMode=e.groupBlendMode;let i=r.resources.localUniforms.uniforms;i.uTransformMatrix=e.groupTransform,i.uRound=t._roundPixels|e._roundPixels,Ce(e.groupColorAlpha,i.uColor,0),this._adaptor.execute(this,e)}_rebuild(e){let t=this._getGpuDataForRenderable(e),n=this.renderer.graphicsContext.updateGpuContext(e.context);t.destroy(),n.isBatchable&&this._updateBatchesForRenderable(e,t)}_addToBatcher(e,t){let n=this.renderer.renderPipes.batch,r=this._getGpuDataForRenderable(e).batches;for(let e=0;e<r.length;e++){let i=r[e];n.addToBatch(i,t)}}_getGpuDataForRenderable(e){return e._gpuData[this.renderer.uid]||this._initGpuDataForRenderable(e)}_initGpuDataForRenderable(e){let t=new Rr;return e._gpuData[this.renderer.uid]=t,this._managedGraphics.add(e),t}_updateBatchesForRenderable(e,t){let n=e.context,r=this.renderer.graphicsContext.getGpuContext(n),i=this.renderer._roundPixels|e._roundPixels;t.batches=r.batches.map(t=>{let n=ce.get(Ue);return t.copyTo(n),n.renderable=e,n.roundPixels=i,n})}destroy(){this._managedGraphics.destroy(),this.renderer=null,this._adaptor.destroy(),this._adaptor=null,this.state=null}};zr.extension={type:[m.WebGLPipes,m.WebGPUPipes],name:`graphics`},r.add(Lr),r.add(zr),r.add(Ir),r.add(Pe);var z=class e extends de{constructor(e){e instanceof He&&(e={context:e});let{context:t,roundPixels:n,...r}=e||{};super({label:`Graphics`,...r}),this.renderPipeId=`graphics`,t?this.context=t:(this.context=this._ownedContext=new He,this.context.autoGarbageCollect=this.autoGarbageCollect),this.didViewUpdate=!0,this.allowChildren=!1,this.roundPixels=n??!1}set context(e){e!==this._context&&(this._context&&(this._context.off(`update`,this.onViewUpdate,this),this._context.off(`unload`,this.unload,this)),this._context=e,this._context.on(`update`,this.onViewUpdate,this),this._context.on(`unload`,this.unload,this),this.onViewUpdate())}get context(){return this._context}get bounds(){return this._context.bounds}updateBounds(){}containsPoint(e){return this._context.containsPoint(e)}destroy(e){this._ownedContext&&!e?this._ownedContext.destroy(e):(e===!0||e?.context===!0)&&this._context.destroy(e),this._context?.off(`update`,this.onViewUpdate,this),this._context?.off(`unload`,this.unload,this),this._ownedContext=null,this._context=null,super.destroy(e)}_onTouch(e){this._gcLastUsed=e,this._context._gcLastUsed=e}_callContextMethod(e,t){return this.context[e](...t),this}setFillStyle(...e){return this._callContextMethod(`setFillStyle`,e)}setStrokeStyle(...e){return this._callContextMethod(`setStrokeStyle`,e)}fill(...e){return this._callContextMethod(`fill`,e)}stroke(...e){return this._callContextMethod(`stroke`,e)}texture(...e){return this._callContextMethod(`texture`,e)}beginPath(){return this._callContextMethod(`beginPath`,[])}cut(){return this._callContextMethod(`cut`,[])}arc(...e){return this._callContextMethod(`arc`,e)}arcTo(...e){return this._callContextMethod(`arcTo`,e)}arcToSvg(...e){return this._callContextMethod(`arcToSvg`,e)}bezierCurveTo(...e){return this._callContextMethod(`bezierCurveTo`,e)}closePath(){return this._callContextMethod(`closePath`,[])}ellipse(...e){return this._callContextMethod(`ellipse`,e)}circle(...e){return this._callContextMethod(`circle`,e)}path(...e){return this._callContextMethod(`path`,e)}lineTo(...e){return this._callContextMethod(`lineTo`,e)}moveTo(...e){return this._callContextMethod(`moveTo`,e)}quadraticCurveTo(...e){return this._callContextMethod(`quadraticCurveTo`,e)}rect(...e){return this._callContextMethod(`rect`,e)}roundRect(...e){return this._callContextMethod(`roundRect`,e)}poly(...e){return this._callContextMethod(`poly`,e)}regularPoly(...e){return this._callContextMethod(`regularPoly`,e)}roundPoly(...e){return this._callContextMethod(`roundPoly`,e)}roundShape(...e){return this._callContextMethod(`roundShape`,e)}filletRect(...e){return this._callContextMethod(`filletRect`,e)}chamferRect(...e){return this._callContextMethod(`chamferRect`,e)}star(...e){return this._callContextMethod(`star`,e)}svg(...e){return this._callContextMethod(`svg`,e)}restore(...e){return this._callContextMethod(`restore`,e)}save(){return this._callContextMethod(`save`,[])}getTransform(){return this.context.getTransform()}resetTransform(){return this._callContextMethod(`resetTransform`,[])}rotateTransform(...e){return this._callContextMethod(`rotate`,e)}scaleTransform(...e){return this._callContextMethod(`scale`,e)}setTransform(...e){return this._callContextMethod(`setTransform`,e)}transform(...e){return this._callContextMethod(`transform`,e)}translateTransform(...e){return this._callContextMethod(`translate`,e)}clear(){return this._callContextMethod(`clear`,[])}get fillStyle(){return this._context.fillStyle}set fillStyle(e){this._context.fillStyle=e}get strokeStyle(){return this._context.strokeStyle}set strokeStyle(e){this._context.strokeStyle=e}clone(t=!1){return t?new e(this._context.clone()):(this._ownedContext=null,new e(this._context))}lineStyle(e,t,n){c(l,`Graphics#lineStyle is no longer needed. Use Graphics#setStrokeStyle to set the stroke style.`);let r={};return e&&(r.width=e),t&&(r.color=t),n&&(r.alpha=n),this.context.strokeStyle=r,this}beginFill(e,t){c(l,`Graphics#beginFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.`);let n={};return e!==void 0&&(n.color=e),t!==void 0&&(n.alpha=t),this.context.fillStyle=n,this}endFill(){c(l,`Graphics#endFill is no longer needed. Use Graphics#fill to fill the shape with the desired style.`),this.context.fill();let e=this.context.strokeStyle;return(e.width!==He.defaultStrokeStyle.width||e.color!==He.defaultStrokeStyle.color||e.alpha!==He.defaultStrokeStyle.alpha)&&this.context.stroke(),this}drawCircle(...e){return c(l,`Graphics#drawCircle has been renamed to Graphics#circle`),this._callContextMethod(`circle`,e)}drawEllipse(...e){return c(l,`Graphics#drawEllipse has been renamed to Graphics#ellipse`),this._callContextMethod(`ellipse`,e)}drawPolygon(...e){return c(l,`Graphics#drawPolygon has been renamed to Graphics#poly`),this._callContextMethod(`poly`,e)}drawRect(...e){return c(l,`Graphics#drawRect has been renamed to Graphics#rect`),this._callContextMethod(`rect`,e)}drawRoundedRect(...e){return c(l,`Graphics#drawRoundedRect has been renamed to Graphics#roundRect`),this._callContextMethod(`roundRect`,e)}drawStar(...e){return c(l,`Graphics#drawStar has been renamed to Graphics#star`),this._callContextMethod(`star`,e)}},Br=class extends de{constructor(e,t){let{text:n,resolution:r,style:i,anchor:a,width:o,height:s,roundPixels:c,...l}=e;super({...l}),this.batched=!0,this._resolution=null,this._autoResolution=!0,this._didTextUpdate=!0,this._styleClass=t,this.text=n??``,this.style=i,this.resolution=r??null,this.allowChildren=!1,this._anchor=new ye({_onUpdate:()=>{this.onViewUpdate()}}),a&&(this.anchor=a),this.roundPixels=c??!1,o!==void 0&&(this.width=o),s!==void 0&&(this.height=s)}get anchor(){return this._anchor}set anchor(e){typeof e==`number`?this._anchor.set(e):this._anchor.copyFrom(e)}set text(e){e=e.toString(),this._text!==e&&(this._text=e,this.onViewUpdate())}get text(){return this._text}set resolution(e){this._autoResolution=e===null,this._resolution=e,this.onViewUpdate()}get resolution(){return this._resolution}get style(){return this._style}set style(e){e||(e={}),this._style?.off(`update`,this.onViewUpdate,this),this._style=e instanceof this._styleClass?e:new this._styleClass(e),this._style.on(`update`,this.onViewUpdate,this),this.onViewUpdate()}get width(){return Math.abs(this.scale.x)*this.bounds.width}set width(e){this._setWidth(e,this.bounds.width)}get height(){return Math.abs(this.scale.y)*this.bounds.height}set height(e){this._setHeight(e,this.bounds.height)}getSize(e){return e||(e={}),e.width=Math.abs(this.scale.x)*this.bounds.width,e.height=Math.abs(this.scale.y)*this.bounds.height,e}setSize(e,t){typeof e==`object`?(t=e.height??e.width,e=e.width):t??(t=e),e!==void 0&&this._setWidth(e,this.bounds.width),t!==void 0&&this._setHeight(t,this.bounds.height)}containsPoint(e){let t=this.bounds.width,n=this.bounds.height,r=-t*this.anchor.x,i=0;return e.x>=r&&e.x<=r+t&&(i=-n*this.anchor.y,e.y>=i&&e.y<=i+n)}onViewUpdate(){this.didViewUpdate||(this._didTextUpdate=!0),super.onViewUpdate()}destroy(e=!1){this._style?.off(`update`,this.onViewUpdate,this),super.destroy(e),this.owner=null,this._bounds=null,this._anchor=null,(typeof e==`boolean`?e:e?.style)&&this._style.destroy(e),this._style=null,this._text=null}get styleKey(){return`${this._text}:${this._style.styleKey}:${this._resolution}`}};function Vr(e,t){let n=e[0]??{};return(typeof n==`string`||e[1])&&(c(l,`use new ${t}({ text: "hi!", style }) instead`),n={text:n,style:e[1]}),n}var Hr=null,Ur=null;function Wr(e,t){Hr||(Hr=b.get().createCanvas(256,128),Ur=Hr.getContext(`2d`,{willReadFrequently:!0}),Ur.globalCompositeOperation=`copy`,Ur.globalAlpha=1),(Hr.width<e||Hr.height<t)&&(Hr.width=S(e),Hr.height=S(t))}function Gr(e,t,n){for(let r=0,i=4*n*t;r<t;++r,i+=4)if(e[i+3]!==0)return!1;return!0}function Kr(e,t,n,r,i){let a=4*t;for(let t=r,o=r*a+4*n;t<=i;++t,o+=a)if(e[o+3]!==0)return!1;return!0}function qr(...e){let t=e[0];t.canvas||(t={canvas:e[0],resolution:e[1]});let{canvas:n}=t,r=Math.min(t.resolution??1,1),i=t.width??n.width,a=t.height??n.height,o=t.output;if(Wr(i,a),!Ur)throw TypeError(`Failed to get canvas 2D context`);Ur.drawImage(n,0,0,i,a,0,0,i*r,a*r);let c=Ur.getImageData(0,0,i,a).data,l=0,u=0,d=i-1,f=a-1;for(;u<a&&Gr(c,i,u);)++u;if(u===a)return s.EMPTY;for(;Gr(c,i,f);)--f;for(;Kr(c,i,l,u,f);)++l;for(;Kr(c,i,d,u,f);)--d;return++d,++f,Ur.globalCompositeOperation=`source-over`,Ur.strokeRect(l,u,d-l,f-u),Ur.globalCompositeOperation=`copy`,o??(o=new s),o.set(l/r,u/r,(d-l)/r,(f-u)/r),o}var Jr=class{constructor(e=0,t=0,n=!1){this.first=null,this.items=Object.create(null),this.last=null,this.max=e,this.resetTtl=n,this.size=0,this.ttl=t}clear(){return this.first=null,this.items=Object.create(null),this.last=null,this.size=0,this}delete(e){if(this.has(e)){let t=this.items[e];delete this.items[e],this.size--,t.prev!==null&&(t.prev.next=t.next),t.next!==null&&(t.next.prev=t.prev),this.first===t&&(this.first=t.next),this.last===t&&(this.last=t.prev)}return this}entries(e=this.keys()){let t=Array(e.length);for(let n=0;n<e.length;n++){let r=e[n];t[n]=[r,this.get(r)]}return t}evict(e=!1){if(e||this.size>0){let e=this.first;delete this.items[e.key],--this.size===0?(this.first=null,this.last=null):(this.first=e.next,this.first.prev=null)}return this}expiresAt(e){let t;return this.has(e)&&(t=this.items[e].expiry),t}get(e){let t=this.items[e];if(t!==void 0){if(this.ttl>0&&t.expiry<=Date.now()){this.delete(e);return}return this.moveToEnd(t),t.value}}has(e){return e in this.items}moveToEnd(e){this.last!==e&&(e.prev!==null&&(e.prev.next=e.next),e.next!==null&&(e.next.prev=e.prev),this.first===e&&(this.first=e.next),e.prev=this.last,e.next=null,this.last!==null&&(this.last.next=e),this.last=e,this.first===null&&(this.first=e))}keys(){let e=Array(this.size),t=this.first,n=0;for(;t!==null;)e[n++]=t.key,t=t.next;return e}setWithEvicted(e,t,n=this.resetTtl){let r=null;if(this.has(e))this.set(e,t,!0,n);else{this.max>0&&this.size===this.max&&(r={...this.first},this.evict(!0));let n=this.items[e]={expiry:this.ttl>0?Date.now()+this.ttl:this.ttl,key:e,prev:this.last,next:null,value:t};++this.size===1?this.first=n:this.last.next=n,this.last=n}return r}set(e,t,n=!1,r=this.resetTtl){let i=this.items[e];return n||i!==void 0?(i.value=t,n===!1&&r&&(i.expiry=this.ttl>0?Date.now()+this.ttl:this.ttl),this.moveToEnd(i)):(this.max>0&&this.size===this.max&&this.evict(!0),i=this.items[e]={expiry:this.ttl>0?Date.now()+this.ttl:this.ttl,key:e,prev:this.last,next:null,value:t},++this.size===1?this.first=i:this.last.next=i,this.last=i),this}values(e=this.keys()){let t=Array(e.length);for(let n=0;n<e.length;n++)t[n]=this.get(e[n]);return t}};function Yr(e=1e3,t=0,n=!1){if(isNaN(e)||e<0)throw TypeError(`Invalid max value`);if(isNaN(t)||t<0)throw TypeError(`Invalid ttl value`);if(typeof n!=`boolean`)throw TypeError(`Invalid resetTtl value`);return new Jr(e,t,n)}function Xr(e){return!!e.tagStyles&&Object.keys(e.tagStyles).length>0}function Zr(e){return e.includes(`<`)}function Qr(e,t){return e.clone().assign(t)}function $r(e,t){let n=[],r=t.tagStyles;if(!Xr(t)||!Zr(e))return n.push({text:e,style:t}),n;let i=[t],a=[],o=``,s=0;for(;s<e.length;){let t=e[s];if(t===`<`){let c=e.indexOf(`>`,s);if(c===-1){o+=t,s++;continue}let l=e.indexOf(`<`,s+1);if(l!==-1&&l<c){o+=t,s++;continue}let u=e.slice(s+1,c);if(u.startsWith(`/`)){let t=u.slice(1).trim();if(a.length>0&&a[a.length-1]===t){o.length>0&&(n.push({text:o,style:i[i.length-1]}),o=``),i.pop(),a.pop(),s=c+1;continue}o+=e.slice(s,c+1),s=c+1;continue}{let t=u.trim();if(r[t]){o.length>0&&(n.push({text:o,style:i[i.length-1]}),o=``);let e=i[i.length-1],l=Qr(e,r[t]);i.push(l),a.push(t),s=c+1;continue}o+=e.slice(s,c+1),s=c+1;continue}}o+=t,s++}return o.length>0&&n.push({text:o,style:i[i.length-1]}),n}var ei=new Set([10,13]),ti=new Set([9,32,8192,8193,8194,8195,8196,8197,8198,8200,8201,8202,8287,12288]),ni=new Set([9,32]),ri=new Set([45,8208,8211,8212,173]),ii=/(\r\n|\r|\n)/,ai=/(?:\r\n|\r|\n)/;function oi(e){return typeof e==`string`&&ei.has(e.charCodeAt(0))}function si(e,t){return typeof e==`string`&&ti.has(e.charCodeAt(0))}function ci(e){return typeof e==`string`&&ni.has(e.charCodeAt(0))}function li(e){return typeof e==`string`&&ri.has(e.charCodeAt(0))}function ui(e){return e===`normal`||e===`pre-line`}function di(e){return e===`normal`}function fi(e){if(typeof e!=`string`)return``;let t=e.length-1;for(;t>=0&&si(e[t]);)t--;return t<e.length-1?e.slice(0,t+1):e}function pi(e){let t=[],n=[];if(typeof e!=`string`)return t;for(let r=0;r<e.length;r++){let i=e[r],a=e[r+1];if(si(i,a)||oi(i)){n.length>0&&(t.push(n.join(``)),n.length=0),i===`\r`&&a===`
`?(t.push(`\r
`),r++):t.push(i);continue}n.push(i),li(i)&&a&&!si(a)&&!oi(a)&&(t.push(n.join(``)),n.length=0)}return n.length>0&&t.push(n.join(``)),t}function mi(e,t,n,r){let i=n(e),a=[];for(let n=0;n<i.length;n++){let o=i[n],s=o,c=1;for(;i[n+c];){let a=i[n+c];if(!r(s,a,e,n,t))o+=a,s=a,c++;else break}n+=c-1,a.push(o)}return a}var hi=/\r\n|\r|\n/g;function gi(e,t,n,r,i,a,o,s,c){let l=$r(e,t);if(di(t.whiteSpace))for(let e=0;e<l.length;e++){let t=l[e];l[e]={text:t.text.replace(hi,` `),style:t.style}}let u=[],d=[];for(let e of l){let t=e.text.split(ii);for(let n=0;n<t.length;n++){let r=t[n];r===`\r
`||r===`\r`||r===`
`?(u.push(d),d=[]):r.length>0&&d.push({text:r,style:e.style})}}(d.length>0||u.length===0)&&u.push(d);let f=n?_i(u,t,r,a,s,c):u,p=[],m=[],h=[],g=[],_=[],v=0,y=t._fontString,b=o(y);b.fontSize===0&&(b.fontSize=t.fontSize,b.ascent=t.fontSize);let x=``,S=!!t.dropShadow,C=t._stroke?.width||0;for(let e of f){let n=0,a=b.ascent,s=b.descent,c=``;for(let t of e){let e=t.style._fontString,l=o(e);e!==x&&(r.font=e,x=e);let u=i(t.text,t.style.letterSpacing,r);n+=u,a=Math.max(a,l.ascent),s=Math.max(s,l.descent),c+=t.text;let d=t.style._stroke?.width||0;d>C&&(C=d),!S&&t.style.dropShadow&&(S=!0)}e.length===0&&(a=b.ascent,s=b.descent),p.push(n),m.push(a),h.push(s),_.push(c);let l=t.lineHeight||a+s;g.push(l+t.leading),v=Math.max(v,n)}let ee=C,te=v+ee+(t.dropShadow?t.dropShadow.distance:0),w=0;for(let e=0;e<g.length;e++)w+=g[e];return w=Math.max(w,g[0]+ee),{width:te,height:w+(t.dropShadow?t.dropShadow.distance:0),lines:_,lineWidths:p,lineHeight:(t.lineHeight||b.fontSize)+t.leading,maxLineWidth:v,fontProperties:b,runsByLine:f,lineAscents:m,lineDescents:h,lineHeights:g,hasDropShadow:S}}function _i(e,t,n,r,i,a){let{letterSpacing:o,whiteSpace:s,wordWrapWidth:c,breakWords:l}=t,u=ui(s),d=c+o,f={},p=``,m=(e,t)=>{let i=`${e}|${t.styleKey}`,a=f[i];if(a===void 0){let o=t._fontString;o!==p&&(n.font=o,p=o),a=r(e,t.letterSpacing,n)+t.letterSpacing,f[i]=a}return a},h=[];for(let t of e){let e=vi(t),n=h.length,r=t=>{let n=0,r=t;do{let{token:t,style:i}=e[r];n+=m(t,i),r++}while(r<e.length&&e[r].continuesFromPrevious);return n},o=t=>{let n=[],r=t;do n.push({token:e[r].token,style:e[r].style}),r++;while(r<e.length&&e[r].continuesFromPrevious);return n},s=[],c=0,f=!u,p=null,g=()=>{p&&p.text.length>0&&s.push(p),p=null},_=()=>{if(g(),s.length>0){let e=s[s.length-1];e.text=fi(e.text),e.text.length===0&&s.pop()}h.push(s),s=[],c=0,f=!1};for(let t=0;t<e.length;t++){let{token:n,style:v,continuesFromPrevious:y}=e[t],b=m(n,v);if(u){let e=si(n),t=p?.text[p.text.length-1]??s[s.length-1]?.text.slice(-1)??``,r=t?si(t):!1;if(e&&r)continue}let x=!y,S=x?r(t):b;if(S>d&&x){if(c>0&&_(),l){let e=o(t);for(let t=0;t<e.length;t++){let n=e[t].token,r=e[t].style,o=mi(n,l,a,i);for(let e of o){let t=m(e,r);t+c>d&&_(),!p||p.style!==r?(g(),p={text:e,style:r}):p.text+=e,c+=t}}t+=e.length-1}else{let e=o(t);g(),h.push(e.map(e=>({text:e.token,style:e.style}))),f=!1,t+=e.length-1}}else if(S+c>d&&x){if(si(n)){f=!1;continue}_(),p={text:n,style:v},c=b}else if(y&&!l)!p||p.style!==v?(g(),p={text:n,style:v}):p.text+=n,c+=b;else{let e=si(n);if(c===0&&e&&!f)continue;!p||p.style!==v?(g(),p={text:n,style:v}):p.text+=n,c+=b}}if(g(),s.length>0){let e=s[s.length-1];e.text=fi(e.text),e.text.length===0&&s.pop()}(s.length>0||h.length===n)&&h.push(s)}return h}function vi(e){let t=[],n=!1;for(let r of e){let e=pi(r.text),i=!0;for(let a of e){let e=si(a)||oi(a),o=i&&n&&!e;t.push({token:a,style:r.style,continuesFromPrevious:o}),n=!e,i=!1}}return t}var yi={willReadFrequently:!0};function bi(e,t,n,r,i){let a=n[e];return typeof a!=`number`&&(a=i(e,t,r)+t,n[e]=a),a}function xi(e,t,n,r,i,a,o){let s=n.getContext(`2d`,yi);s.font=t._fontString;let c=0,l=``,u=[],d=Object.create(null),{letterSpacing:f,whiteSpace:p}=t,m=ui(p),h=di(p),g=!m,_=t.wordWrapWidth+f,v=pi(e);for(let e=0;e<v.length;e++){let n=v[e];if(oi(n)){if(!h){u.push(fi(l)),g=!m,l=``,c=0;continue}n=` `}if(m){let e=si(n),t=si(l[l.length-1]);if(e&&t)continue}let p=bi(n,f,d,s,r);if(p>_){if(l!==``&&(u.push(fi(l)),l=``,c=0),i(n,t.breakWords)){let e=mi(n,t.breakWords,o,a);for(let t of e){let e=bi(t,f,d,s,r);e+c>_&&(u.push(fi(l)),g=!1,l=``,c=0),l+=t,c+=e}}else l.length>0&&(u.push(fi(l)),l=``,c=0),u.push(fi(n)),g=!1,l=``,c=0}else p+c>_&&(g=!1,u.push(fi(l)),l=``,c=0),(l.length>0||!si(n)||g)&&(l+=n,c+=p)}let y=fi(l);return y.length>0&&u.push(y),u.join(`
`)}var Si={willReadFrequently:!0},Ci=class e{static get experimentalLetterSpacingSupported(){let t=e._experimentalLetterSpacingSupported;if(t===void 0){let n=b.get().getCanvasRenderingContext2D().prototype;t=e._experimentalLetterSpacingSupported=`letterSpacing`in n||`textLetterSpacing`in n}return t}constructor(e,t,n,r,i,a,o,s,c,l){this.text=e,this.style=t,this.width=n,this.height=r,this.lines=i,this.lineWidths=a,this.lineHeight=o,this.maxLineWidth=s,this.fontProperties=c,l&&(this.runsByLine=l.runsByLine,this.lineAscents=l.lineAscents,this.lineDescents=l.lineDescents,this.lineHeights=l.lineHeights,this.hasDropShadow=l.hasDropShadow)}static measureText(t=` `,n,r=e._canvas,i=n.wordWrap){let a=`${t}-${n.styleKey}-wordWrap-${i}`;if(e._measurementCache.has(a))return e._measurementCache.get(a);if(Xr(n)&&Zr(t)){let r=gi(t,n,i,e._context,e._measureText,e._measureTextAdvance,e.measureFont,e.canBreakChars,e.wordWrapSplit),o=new e(t,n,r.width,r.height,r.lines,r.lineWidths,r.lineHeight,r.maxLineWidth,r.fontProperties,{runsByLine:r.runsByLine,lineAscents:r.lineAscents,lineDescents:r.lineDescents,lineHeights:r.lineHeights,hasDropShadow:r.hasDropShadow});return e._measurementCache.set(a,o),o}let o=n._fontString,s=e.measureFont(o);s.fontSize===0&&(s.fontSize=n.fontSize,s.ascent=n.fontSize,s.descent=0);let c=e._context;c.font=o;let l=(i?e._wordWrap(t,n,r):t).split(ai),u=Array(l.length),d=0;for(let t=0;t<l.length;t++){let r=e._measureText(l[t],n.letterSpacing,c);u[t]=r,d=Math.max(d,r)}let f=n._stroke?.width??0,p=n.lineHeight||s.fontSize,m=e._adjustWidthForStyle(d,n),h=Math.max(p,s.fontSize+f)+(l.length-1)*(p+n.leading),g=e._adjustHeightForStyle(h,n),_=new e(t,n,m,g,l,u,p+n.leading,d,s);return e._measurementCache.set(a,_),_}static _adjustWidthForStyle(e,t){let n=e+(t._stroke?.width||0);return t.dropShadow&&(n+=t.dropShadow.distance),n}static _adjustHeightForStyle(e,t){let n=e;return t.dropShadow&&(n+=t.dropShadow.distance),n}static _measureText(t,n,r){let{metricWidth:i,metrics:a,letterSpacingVal:o}=e._measureTextCore(t,n,r),s=-(a.actualBoundingBoxLeft??0),c=(a.actualBoundingBoxRight??0)-s;return a.width>0&&(c+=o),Math.max(i,c)}static _measureTextAdvance(t,n,r){return e._measureTextCore(t,n,r).metricWidth}static _measureTextCore(t,n,r){let i=!1;e.experimentalLetterSpacingSupported&&(e.experimentalLetterSpacing?(r.letterSpacing=`${n}px`,r.textLetterSpacing=`${n}px`,i=!0):(r.letterSpacing=`0px`,r.textLetterSpacing=`0px`));let a=r.measureText(t),o=a.width,s=0;return o>0&&(s=i?-n:(e.graphemeSegmenter(t).length-1)*n,o+=s),{metricWidth:o,metrics:a,letterSpacingVal:s}}static _wordWrap(t,n,r=e._canvas){return xi(t,n,r,e._measureTextAdvance,e.canBreakWords,e.canBreakChars,e.wordWrapSplit)}static isBreakingSpace(e,t){return si(e,t)}static canBreakWords(e,t){return t}static canBreakChars(e,t,n,r,i){return!0}static wordWrapSplit(t){return e.graphemeSegmenter(t)}static measureFont(t){if(e._fonts[t])return e._fonts[t];let n=e._context;n.font=t;let r=n.measureText(e.METRICS_STRING+e.BASELINE_SYMBOL),i=r.actualBoundingBoxAscent??0,a=r.actualBoundingBoxDescent??0,o={ascent:i,descent:a,fontSize:i+a};return e._fonts[t]=o,o}static clearMetrics(t=``){t?delete e._fonts[t]:e._fonts={}}static get _canvas(){if(!e.__canvas){let t;try{let n=new OffscreenCanvas(0,0);if(n.getContext(`2d`,Si)?.measureText)return e.__canvas=n,n;t=b.get().createCanvas()}catch{t=b.get().createCanvas()}t.width=t.height=10,e.__canvas=t}return e.__canvas}static get _context(){return e.__context||(e.__context=e._canvas.getContext(`2d`,Si)),e.__context}};Ci.METRICS_STRING=`|ÉqÅ`,Ci.BASELINE_SYMBOL=`M`,Ci.BASELINE_MULTIPLIER=1.4,Ci.HEIGHT_MULTIPLIER=2,Ci.graphemeSegmenter=(()=>{if(typeof Intl?.Segmenter==`function`){let e=new Intl.Segmenter;return t=>{let n=e.segment(t),r=[],i=0;for(let e of n)r[i++]=e.segment;return r}}return e=>[...e]})(),Ci.experimentalLetterSpacing=!1,Ci._fonts={},Ci._measurementCache=Yr(1e3);var wi=Ci,Ti=[`serif`,`sans-serif`,`monospace`,`cursive`,`fantasy`,`system-ui`];function Ei(e){let t=typeof e.fontSize==`number`?`${e.fontSize}px`:e.fontSize,n=e.fontFamily;Array.isArray(e.fontFamily)||(n=e.fontFamily.split(`,`));for(let e=n.length-1;e>=0;e--){let t=n[e].trim();!/([\"\'])[^\'\"]+\1/.test(t)&&!Ti.includes(t)&&(t=`"${t}"`),n[e]=t}return`${e.fontStyle} ${e.fontVariant} ${e.fontWeight} ${t} ${n.join(`,`)}`}var Di=1e5;function Oi(e,t,n,r=0,i=0,a=0){if(e.texture===T.WHITE&&!e.fill)return f.shared.setValue(e.color).setAlpha(e.alpha??1).toHexa();if(!e.fill){let n=t.createPattern(e.texture.source.resource,`repeat`),r=e.matrix.copyTo(D.shared);return r.scale(e.texture.source.pixelWidth,e.texture.source.pixelHeight),n.setTransform(r),n}if(e.fill instanceof Ie){let n=e.fill,r=t.createPattern(n.texture.source.resource,`repeat`);return xe.applyPatternTransform(r,n.transform,!1),r}if(e.fill instanceof Fe){let o=e.fill,s=o.type===`linear`,c=o.textureSpace===`local`,l=1,u=1;c&&n&&(l=n.width+r,u=n.height+r);let d,p=!1;if(s){let{start:e,end:n}=o;d=t.createLinearGradient(e.x*l+i,e.y*u+a,n.x*l+i,n.y*u+a),p=Math.abs(n.x-e.x)<Math.abs((n.y-e.y)*.1)}else{let{center:e,innerRadius:n,outerCenter:r,outerRadius:s}=o;d=t.createRadialGradient(e.x*l+i,e.y*u+a,n*l,r.x*l+i,r.y*u+a,s*l)}if(p&&c&&n){let e=n.lineHeight/u;for(let t=0;t<n.lines.length;t++){let i=(t*n.lineHeight+r/2)/u;o.colorStops.forEach(t=>{let n=i+t.offset*e;n=Math.max(0,Math.min(1,n)),d.addColorStop(Math.floor(n*Di)/Di,f.shared.setValue(t.color).toHex())})}}else o.colorStops.forEach(e=>{d.addColorStop(e.offset,f.shared.setValue(e.color).toHex())});return d}return E(`FillStyle not recognised`,e),`red`}var ki=new s;function Ai(e){let t=0;for(let n=0;n<e.length;n++)e.charCodeAt(n)===32&&t++;return t}var ji=new class{getCanvasAndContext(e){let{text:t,style:n,resolution:r=1}=e,i=n._getFinalPadding(),a=wi.measureText(t||` `,n),o=Math.ceil(Math.ceil(Math.max(1,a.width)+i*2)*r),s=Math.ceil(Math.ceil(Math.max(1,a.height)+i*2)*r),c=ae.getOptimalCanvasAndContext(o,s);return this._renderTextToCanvas(n,i,r,c,a),{canvasAndContext:c,frame:n.trim?qr({canvas:c.canvas,width:o,height:s,resolution:1,output:ki}):ki.set(0,0,o,s)}}returnCanvasAndContext(e){ae.returnCanvasAndContext(e)}_renderTextToCanvas(e,t,n,r,i){if(i.runsByLine&&i.runsByLine.length>0){this._renderTaggedTextToCanvas(i,e,t,n,r);return}let{canvas:a,context:o}=r,s=Ei(e),c=i.lines,l=i.lineHeight,u=i.lineWidths,d=i.maxLineWidth,f=i.fontProperties,p=a.height;if(o.resetTransform(),o.scale(n,n),o.textBaseline=e.textBaseline,e._stroke?.width){let t=e._stroke;o.lineWidth=t.width,o.miterLimit=t.miterLimit,o.lineJoin=t.join,o.lineCap=t.cap}o.font=s;let m,h,g=e.dropShadow?2:1,_=(e._stroke?.width??0)/2,v=(l-f.fontSize)/2;l-f.fontSize<0&&(v=0);for(let a=0;a<g;++a){let s=e.dropShadow&&a===0,g=s?Math.ceil(Math.max(1,p)+t*2):0,y=g*n;if(s)this._setupDropShadow(o,e,n,y);else{let n=e._gradientBounds,r=e._gradientOffset;if(n){let a={width:n.width,height:n.height,lineHeight:n.height,lines:i.lines};this._setFillAndStrokeStyles(o,e,a,t,_,r?.x??0,r?.y??0)}else r?this._setFillAndStrokeStyles(o,e,i,t,_,r.x,r.y):this._setFillAndStrokeStyles(o,e,i,t,_);o.shadowColor=`rgba(0,0,0,0)`}for(let n=0;n<c.length;n++){m=_,h=_+n*l+f.ascent+v,m+=this._getAlignmentOffset(u[n],d,e.align);let i=0;if(e.align===`justify`&&e.wordWrap&&n<c.length-1){let e=Ai(c[n]);e>0&&(i=(d-u[n])/e)}e._stroke?.width&&this._drawLetterSpacing(c[n],e,r,m+t,h+t-g,!0,i),e._fill!==void 0&&this._drawLetterSpacing(c[n],e,r,m+t,h+t-g,!1,i)}}}_renderTaggedTextToCanvas(e,t,n,r,i){let{canvas:a,context:o}=i,{runsByLine:s,lineWidths:c,maxLineWidth:l,lineAscents:u,lineHeights:d,hasDropShadow:f}=e,p=a.height;o.resetTransform(),o.scale(r,r),o.textBaseline=t.textBaseline;let m=f?2:1,h=t._stroke?.width??0;for(let e of s)for(let t of e){let e=t.style._stroke?.width??0;e>h&&(h=e)}let g=h/2,_=[];for(let e=0;e<s.length;e++){let t=s[e],n=[];for(let e of t){let t=Ei(e.style);o.font=t,n.push({width:wi._measureText(e.text,e.style.letterSpacing,o),font:t})}_.push(n)}for(let e=0;e<m;++e){let a=f&&e===0,m=a?Math.ceil(Math.max(1,p)+n*2):0,h=m*r;a||(o.shadowColor=`rgba(0,0,0,0)`);let v=g;for(let e=0;e<s.length;e++){let f=s[e],p=c[e],y=u[e],b=d[e],x=_[e],S=g;S+=this._getAlignmentOffset(p,l,t.align);let C=0;if(t.align===`justify`&&t.wordWrap&&e<s.length-1){let e=0;for(let t of f)e+=Ai(t.text);e>0&&(C=(l-p)/e)}let ee=v+y,te=S+n;for(let e=0;e<f.length;e++){let t=f[e],{width:s,font:c}=x[e];if(o.font=c,o.textBaseline=t.style.textBaseline,t.style._stroke?.width){let e=t.style._stroke;if(o.lineWidth=e.width,o.miterLimit=e.miterLimit,o.lineJoin=e.join,o.lineCap=e.cap,a){if(t.style.dropShadow)this._setupDropShadow(o,t.style,r,h);else{let e=Ai(t.text);te+=s+e*C;continue}}else{let r=wi.measureFont(c),i=t.style.lineHeight||r.fontSize;o.strokeStyle=Oi(e,o,{width:s,height:i,lineHeight:i,lines:[t.text]},n*2,te-n,v)}this._drawLetterSpacing(t.text,t.style,i,te,ee+n-m,!0,C)}let l=Ai(t.text);te+=s+l*C}te=S+n;for(let e=0;e<f.length;e++){let t=f[e],{width:s,font:c}=x[e];if(o.font=c,o.textBaseline=t.style.textBaseline,t.style._fill!==void 0){if(a){if(t.style.dropShadow)this._setupDropShadow(o,t.style,r,h);else{let e=Ai(t.text);te+=s+e*C;continue}}else{let e=wi.measureFont(c),r=t.style.lineHeight||e.fontSize,i={width:s,height:r,lineHeight:r,lines:[t.text]};o.fillStyle=Oi(t.style._fill,o,i,n*2,te-n,v)}this._drawLetterSpacing(t.text,t.style,i,te,ee+n-m,!1,C)}let l=Ai(t.text);te+=s+l*C}v+=b}}}_setFillAndStrokeStyles(e,t,n,r,i,a=0,o=0){if(e.fillStyle=t._fill?Oi(t._fill,e,n,r*2,a,o):null,t._stroke?.width){let s=i+r*2;e.strokeStyle=Oi(t._stroke,e,n,s,a,o)}}_setupDropShadow(e,t,n,r){e.fillStyle=`black`,e.strokeStyle=`black`;let i=t.dropShadow,a=i.color,o=i.alpha;e.shadowColor=f.shared.setValue(a).setAlpha(o).toRgbaString();let s=i.blur*n,c=i.distance*n;e.shadowBlur=s,e.shadowOffsetX=Math.cos(i.angle)*c,e.shadowOffsetY=Math.sin(i.angle)*c+r}_getAlignmentOffset(e,t,n){return n===`right`?t-e:n===`center`?(t-e)/2:0}_drawLetterSpacing(e,t,n,r,i,a=!1,o=0){let{context:s}=n,c=t.letterSpacing,l=!1;if(wi.experimentalLetterSpacingSupported&&(wi.experimentalLetterSpacing?(s.letterSpacing=`${c}px`,s.textLetterSpacing=`${c}px`,l=!0):(s.letterSpacing=`0px`,s.textLetterSpacing=`0px`)),(c===0||l)&&o===0){a?s.strokeText(e,r,i):s.fillText(e,r,i);return}if(o!==0&&(c===0||l)){let t=e.split(` `),n=r,c=s.measureText(` `).width;for(let e=0;e<t.length;e++)a?s.strokeText(t[e],n,i):s.fillText(t[e],n,i),n+=s.measureText(t[e]).width+c+o;return}let u=r,d=wi.graphemeSegmenter(e),f=s.measureText(e).width,p=0;for(let e=0;e<d.length;++e){let t=d[e];a?s.strokeText(t,u,i):s.fillText(t,u,i);let n=``;for(let t=e+1;t<d.length;++t)n+=d[t];p=s.measureText(n).width,u+=f-p+c,t===` `&&(u+=o),f=p}}},Mi=class e extends p{constructor(t={}){super(),this.uid=i(`textStyle`),this._tick=0,this._cachedFontString=null,Pi(t),t instanceof e&&(t=t._toObject());let n={...e.defaultTextStyle,...t};for(let e in n){let t=e;this[t]=n[e]}this._tagStyles=t.tagStyles??void 0,this.update(),this._tick=0}get align(){return this._align}set align(e){this._align!==e&&(this._align=e,this.update())}get breakWords(){return this._breakWords}set breakWords(e){this._breakWords!==e&&(this._breakWords=e,this.update())}get dropShadow(){return this._dropShadow}set dropShadow(t){this._dropShadow!==t&&(this._dropShadow=typeof t==`object`&&t?this._createProxy({...e.defaultDropShadow,...t}):t?this._createProxy({...e.defaultDropShadow}):null,this.update())}get fontFamily(){return this._fontFamily}set fontFamily(e){this._fontFamily!==e&&(this._fontFamily=e,this.update())}get fontSize(){return this._fontSize}set fontSize(e){this._fontSize!==e&&(this._fontSize=typeof e==`string`?parseInt(e,10):e,this.update())}get fontStyle(){return this._fontStyle}set fontStyle(e){this._fontStyle!==e&&(this._fontStyle=e.toLowerCase(),this.update())}get fontVariant(){return this._fontVariant}set fontVariant(e){this._fontVariant!==e&&(this._fontVariant=e,this.update())}get fontWeight(){return this._fontWeight}set fontWeight(e){this._fontWeight!==e&&(this._fontWeight=e,this.update())}get leading(){return this._leading}set leading(e){this._leading!==e&&(this._leading=e,this.update())}get letterSpacing(){return this._letterSpacing}set letterSpacing(e){this._letterSpacing!==e&&(this._letterSpacing=e,this.update())}get lineHeight(){return this._lineHeight}set lineHeight(e){this._lineHeight!==e&&(this._lineHeight=e,this.update())}get padding(){return this._padding}set padding(e){this._padding!==e&&(this._padding=e,this.update())}get filters(){return this._filters}set filters(e){this._filters!==e&&(this._filters=Object.freeze(e),this.update())}get trim(){return this._trim}set trim(e){this._trim!==e&&(this._trim=e,this.update())}get textBaseline(){return this._textBaseline}set textBaseline(e){this._textBaseline!==e&&(this._textBaseline=e,this.update())}get whiteSpace(){return this._whiteSpace}set whiteSpace(e){this._whiteSpace!==e&&(this._whiteSpace=e,this.update())}get wordWrap(){return this._wordWrap}set wordWrap(e){this._wordWrap!==e&&(this._wordWrap=e,this.update())}get wordWrapWidth(){return this._wordWrapWidth}set wordWrapWidth(e){this._wordWrapWidth!==e&&(this._wordWrapWidth=e,this.update())}get fill(){return this._originalFill}set fill(e){e!==this._originalFill&&(this._originalFill=e,this._isFillStyle(e)&&(this._originalFill=this._createProxy({...He.defaultFillStyle,...e},()=>{this._fill=Re({...this._originalFill},He.defaultFillStyle)})),this._fill=Re(e===0?`black`:e,He.defaultFillStyle),this.update())}get stroke(){return this._originalStroke}set stroke(e){e!==this._originalStroke&&(this._originalStroke=e,this._isFillStyle(e)&&(this._originalStroke=this._createProxy({...He.defaultStrokeStyle,...e},()=>{this._stroke=Be({...this._originalStroke},He.defaultStrokeStyle)})),this._stroke=Be(e,He.defaultStrokeStyle),this.update())}get tagStyles(){return this._tagStyles}set tagStyles(e){this._tagStyles!==e&&(this._tagStyles=e??void 0,this.update())}update(){this._tick++,this._cachedFontString=null,this.emit(`update`,this)}reset(){let t=e.defaultTextStyle;for(let e in t)this[e]=t[e]}assign(e){for(let t in e){let n=t;this[n]=e[t]}return this}get styleKey(){return`${this.uid}-${this._tick}`}get _fontString(){return this._cachedFontString===null&&(this._cachedFontString=Ei(this)),this._cachedFontString}_toObject(){return{align:this.align,breakWords:this.breakWords,dropShadow:this._dropShadow?{...this._dropShadow}:null,fill:this._fill?{...this._fill}:void 0,fontFamily:this.fontFamily,fontSize:this.fontSize,fontStyle:this.fontStyle,fontVariant:this.fontVariant,fontWeight:this.fontWeight,leading:this.leading,letterSpacing:this.letterSpacing,lineHeight:this.lineHeight,padding:this.padding,stroke:this._stroke?{...this._stroke}:void 0,textBaseline:this.textBaseline,trim:this.trim,whiteSpace:this.whiteSpace,wordWrap:this.wordWrap,wordWrapWidth:this.wordWrapWidth,filters:this._filters?[...this._filters]:void 0,tagStyles:this._tagStyles?{...this._tagStyles}:void 0}}clone(){return new e(this._toObject())}_getFinalPadding(){let e=0;if(this._filters)for(let t=0;t<this._filters.length;t++)e+=this._filters[t].padding;return Math.max(this._padding,e)}destroy(e=!1){if(this.removeAllListeners(),typeof e==`boolean`?e:e?.texture){let t=typeof e==`boolean`?e:e?.textureSource;this._fill?.texture&&this._fill.texture.destroy(t),this._originalFill?.texture&&this._originalFill.texture.destroy(t),this._stroke?.texture&&this._stroke.texture.destroy(t),this._originalStroke?.texture&&this._originalStroke.texture.destroy(t)}this._fill=null,this._stroke=null,this.dropShadow=null,this._originalStroke=null,this._originalFill=null}_createProxy(e,t){return new Proxy(e,{set:(e,n,r)=>e[n]===r||(e[n]=r,t?.(n,r),this.update(),!0)})}_isFillStyle(e){return(e??null)!==null&&!(f.isColorLike(e)||e instanceof Fe||e instanceof Ie)}};Mi.defaultDropShadow={alpha:1,angle:Math.PI/6,blur:0,color:`black`,distance:5},Mi.defaultTextStyle={align:`left`,breakWords:!1,dropShadow:null,fill:`black`,fontFamily:`Arial`,fontSize:26,fontStyle:`normal`,fontVariant:`normal`,fontWeight:`normal`,leading:0,letterSpacing:0,lineHeight:0,padding:0,stroke:null,textBaseline:`alphabetic`,trim:!1,whiteSpace:`pre`,wordWrap:!1,wordWrapWidth:100};var Ni=Mi;function Pi(e){let t=e;if(typeof t.dropShadow==`boolean`&&t.dropShadow){let n=Ni.defaultDropShadow;e.dropShadow={alpha:t.dropShadowAlpha??n.alpha,angle:t.dropShadowAngle??n.angle,blur:t.dropShadowBlur??n.blur,color:t.dropShadowColor??n.color,distance:t.dropShadowDistance??n.distance}}if(t.strokeThickness!==void 0){c(l,`strokeThickness is now a part of stroke`);let n=t.stroke,r={};if(f.isColorLike(n))r.color=n;else if(n instanceof Fe||n instanceof Ie)r.fill=n;else if(Object.hasOwnProperty.call(n,`color`)||Object.hasOwnProperty.call(n,`fill`))r=n;else throw Error(`Invalid stroke value.`);e.stroke={...r,width:t.strokeThickness}}if(Array.isArray(t.fillGradientStops)){if(c(l,"gradient fill is now a fill pattern: `new FillGradient(...)`"),!Array.isArray(t.fill)||t.fill.length===0)throw Error(`Invalid fill value. Expected an array of colors for gradient fill.`);t.fill.length!==t.fillGradientStops.length&&E(`The number of fill colors must match the number of fill gradient stops.`);let n=new Fe({start:{x:0,y:0},end:{x:0,y:1},textureSpace:`local`}),r=t.fillGradientStops.slice(),i=t.fill.map(e=>f.shared.setValue(e).toNumber());r.forEach((e,t)=>{n.addColorStop(e,i[t])}),e.fill={fill:n}}}var Fi=!1;function Ii(e){if(Fi)return;let t=new u({scaleMode:e.scaleMode});e._resourceId!==t._resourceId&&(Fi=!0,E(`Text textureStyle: only scaleMode is applied to a text texture, the other fields are ignored`))}function Li(e,t){let{texture:n,bounds:r}=e,i=t._style._getFinalPadding();O(r,t._anchor,n);let a=t._anchor._x*i*2,o=t._anchor._y*i*2;r.minX-=i-a,r.minY-=i-o,r.maxX-=i-a,r.maxY-=i-o}var Ri=class extends Ne{},zi=class{constructor(e){this._renderer=e,e.runners.resolutionChange.add(this),e.runners.contextChange.add(this),this._managedTexts=new nt({renderer:e,type:`renderable`,onUnload:this.onTextUnload.bind(this),name:`canvasText`})}resolutionChange(){for(let e in this._managedTexts.items){let t=this._managedTexts.items[e];t?._autoResolution&&t.onViewUpdate()}}contextChange(){for(let e in this._managedTexts.items)this._managedTexts.items[e]?.unload()}validateRenderable(e){let t=this._getGpuText(e),n=e.styleKey;return t.currentKey!==n||e._didTextUpdate}addRenderable(e,t){let n=this._getGpuText(e);if(e._didTextUpdate||n.currentKey!==e.styleKey){let t=e._autoResolution?this._renderer.resolution:e.resolution;(n.currentKey!==e.styleKey||e._resolution!==t)&&this._updateGpuText(e),e._didTextUpdate=!1,Li(n,e)}this._renderer.renderPipes.batch.addToBatch(n,t)}updateRenderable(e){let t=this._getGpuText(e);t._batcher.updateElement(t)}_updateGpuText(e){let t=this._getGpuText(e);t.texture&&this._renderer.canvasText.decreaseReferenceCount(t.currentKey),e._resolution=e._autoResolution?this._renderer.resolution:e.resolution,t.texture=this._renderer.canvasText.getManagedTexture(e),t.currentKey=e.styleKey}_getGpuText(e){return e._gpuData[this._renderer.uid]||this.initGpuText(e)}initGpuText(e){let t=new Ri;return t.currentKey=`--`,t.renderable=e,t.transform=e.groupTransform,t.bounds={minX:0,maxX:1,minY:0,maxY:0},t.roundPixels=this._renderer._roundPixels|e._roundPixels,e._gpuData[this._renderer.uid]=t,this._managedTexts.add(e),t}onTextUnload(e){let t=e._gpuData[this._renderer.uid];if(!t)return;let{canvasText:n}=this._renderer;n.getReferenceCount(t.currentKey)>0?n.decreaseReferenceCount(t.currentKey):t.texture&&n.returnTexture(t.texture)}destroy(){this._managedTexts.destroy(),this._renderer=null}};zi.extension={type:[m.WebGLPipes,m.WebGPUPipes,m.CanvasPipes],name:`text`};var Bi=class{constructor(e,t){this._activeTextures={},this._renderer=e,this._retainCanvasContext=t}getTexture(e,t,n,r){typeof e==`string`&&(c(`8.0.0`,`CanvasTextSystem.getTexture: Use object TextOptions instead of separate arguments`),e={text:e,style:n,resolution:t}),e.style instanceof Ni||(e.style=new Ni(e.style)),typeof e.text!=`string`&&(e.text=e.text.toString());let{text:i,style:a,textureStyle:o,autoGenerateMipmaps:s}=e,l=e.resolution??this._renderer.resolution,{frame:u,canvasAndContext:d}=ji.getCanvasAndContext({text:i,style:a,resolution:l}),f=Or(d.canvas,u.width,u.height,l,s,o?.scaleMode);if(a.trim&&(u.pad(a.padding),f.frame.copyFrom(u),f.frame.scale(1/l),f.updateUvs()),a.filters){let e=this._applyFilters(f,a.filters);return this.returnTexture(f),ji.returnCanvasAndContext(d),e}return this._renderer.texture.initSource(f._source),this._retainCanvasContext||ji.returnCanvasAndContext(d),f}returnTexture(e){let t=e.source,n=t.resource;if(this._retainCanvasContext&&n?.getContext){let e=n.getContext(`2d`);e&&ji.returnCanvasAndContext({canvas:n,context:e})}t.resource=null,t.uploadMethodId=`unknown`,t.alphaMode=`no-premultiply-alpha`,fe.returnTexture(e)}renderTextToCanvas(){c(`8.10.0`,`CanvasTextSystem.renderTextToCanvas: no longer supported, use CanvasTextSystem.getTexture instead`)}getManagedTexture(e){e._resolution=e._autoResolution?this._renderer.resolution:e.resolution;let t=e.styleKey;if(this._activeTextures[t])return this._increaseReferenceCount(t),this._activeTextures[t].texture;let n=this.getTexture({text:e.text,style:e.style,resolution:e._resolution,textureStyle:e.textureStyle,autoGenerateMipmaps:e.autoGenerateMipmaps});return this._activeTextures[t]={texture:n,usageCount:1},n}decreaseReferenceCount(e){let t=this._activeTextures[e];t&&(t.usageCount--,t.usageCount===0&&(this.returnTexture(t.texture),this._activeTextures[e]=null))}getReferenceCount(e){return this._activeTextures[e]?.usageCount??0}_increaseReferenceCount(e){this._activeTextures[e].usageCount++}_applyFilters(e,t){let n=this._renderer.renderTarget.renderTarget,r=this._renderer.filter.generateFilteredTexture({texture:e,filters:t});return this._renderer.renderTarget.bind({target:n,clear:!1}),r}destroy(){this._renderer=null;for(let e in this._activeTextures)this._activeTextures[e]&&this.returnTexture(this._activeTextures[e].texture);this._activeTextures=null}},Vi=class extends Bi{constructor(e){super(e,!0)}};Vi.extension={type:[m.CanvasSystem],name:`canvasText`};var Hi=class extends Bi{constructor(e){super(e,!1)}};Hi.extension={type:[m.WebGLSystem,m.WebGPUSystem],name:`canvasText`},r.add(Vi),r.add(Hi),r.add(zi);var Ui=class extends Br{constructor(...e){let n=Vr(e,`Text`);super(n,Ni),this.renderPipeId=`text`,n.textureStyle&&(this.textureStyle=n.textureStyle instanceof u?n.textureStyle:new u(n.textureStyle),Ii(this.textureStyle)),this.autoGenerateMipmaps=n.autoGenerateMipmaps??t.defaultOptions.autoGenerateMipmaps}updateBounds(){let e=this._bounds,t=this._anchor,n=0,r=0;if(this._style.trim){let{frame:e,canvasAndContext:t}=ji.getCanvasAndContext({text:this.text,style:this._style,resolution:1});ji.returnCanvasAndContext(t),n=e.width,r=e.height}else{let e=wi.measureText(this._text,this._style);n=e.width,r=e.height}e.minX=-t._x*n,e.maxX=e.minX+n,e.minY=-t._y*r,e.maxY=e.minY+r}},Wi=class extends p{constructor(){super(...arguments),this.chars=Object.create(null),this.lineHeight=0,this.fontFamily=``,this.fontMetrics={fontSize:0,ascent:0,descent:0},this.baseLineOffset=0,this.distanceField={type:`none`,range:0},this.pages=[],this.applyFillAsTint=!0,this.baseMeasurementFontSize=100,this.baseRenderedFontSize=100}get font(){return c(l,`BitmapFont.font is deprecated, please use BitmapFont.fontFamily instead.`),this.fontFamily}get pageTextures(){return c(l,`BitmapFont.pageTextures is deprecated, please use BitmapFont.pages instead.`),this.pages}get size(){return c(l,`BitmapFont.size is deprecated, please use BitmapFont.fontMetrics.fontSize instead.`),this.fontMetrics.fontSize}get distanceFieldRange(){return c(l,`BitmapFont.distanceFieldRange is deprecated, please use BitmapFont.distanceField.range instead.`),this.distanceField.range}get distanceFieldType(){return c(l,`BitmapFont.distanceFieldType is deprecated, please use BitmapFont.distanceField.type instead.`),this.distanceField.type}destroy(e=!1){this.emit(`destroy`,this),this.removeAllListeners();for(let e in this.chars)this.chars[e].texture?.destroy();this.chars=null,e&&(this.pages.forEach(e=>e.texture.destroy(!0)),this.pages=null)}},Gi=class e extends Wi{constructor(t){super(),this.resolution=1,this.pages=[],this._padding=0,this._measureCache=Object.create(null),this._currentChars=[],this._currentX=0,this._currentY=0,this._currentMaxCharHeight=0,this._currentPageIndex=-1,this._skipKerning=!1;let n={...e.defaultOptions,...t};this._textureSize=n.textureSize,this._mipmap=n.mipmap;let r=n.style.clone();n.overrideFill&&(r._fill.color=16777215,r._fill.alpha=1,r._fill.texture=T.WHITE,r._fill.fill=null),this.applyFillAsTint=n.overrideFill;let i=r.fontSize;r.fontSize=this.baseMeasurementFontSize;let a=Ei(r);n.overrideSize?(r._stroke&&(r._stroke.width*=this.baseRenderedFontSize/i),r.dropShadow&&(r.dropShadow.blur*=this.baseRenderedFontSize/i,r.dropShadow.distance*=this.baseRenderedFontSize/i)):r.fontSize=this.baseRenderedFontSize=i,this._style=r,this._skipKerning=n.skipKerning??!1,this.resolution=n.resolution??1,this._padding=n.padding??4,n.textureStyle&&(this._textureStyle=n.textureStyle instanceof u?n.textureStyle:new u(n.textureStyle)),this.fontMetrics=wi.measureFont(a),this.lineHeight=r.lineHeight||this.fontMetrics.fontSize||r.fontSize}ensureCharacters(e){let t=wi.graphemeSegmenter(e).filter(e=>!this._currentChars.includes(e)).filter((e,t,n)=>n.indexOf(e)===t);if(!t.length)return;this._currentChars=[...this._currentChars,...t];let n;n=this._currentPageIndex===-1?this._nextPage():this.pages[this._currentPageIndex];let{canvas:r,context:i}=n.canvasAndContext,a=n.texture.source,o=this._style,c=this._currentX,l=this._currentY,u=this._currentMaxCharHeight,d=this.baseRenderedFontSize/this.baseMeasurementFontSize,f=(o.dropShadow?.distance??0)+(o._stroke?.width??0),p=this._padding+f,m=!1,h=r.width/this.resolution,g=r.height/this.resolution;for(let e=0;e<t.length;e++){let n=t[e],f=wi.measureText(n,o,r,!1);f.lineHeight=f.height;let _=f.width*d,v=Math.ceil((o.fontStyle===`italic`?2:1)*_),y=f.height*d,b=v+p*2,x=y+p*2;if(m=!1,n!==`
`&&n!==`\r`&&n!==`	`&&n!==` `&&(m=!0,u=Math.ceil(Math.max(x,u))),c+b>h&&(l+=u,u=x,c=0,l+u>g)){a.update();let e=this._nextPage();r=e.canvasAndContext.canvas,i=e.canvasAndContext.context,a=e.texture.source,c=0,l=0,u=0}let S=i.measureText(n).width/d;if(this.chars[n]={id:n.codePointAt(0),xOffset:-(p/d),yOffset:-(p/d),xAdvance:S,kerning:{}},m){this._drawGlyph(i,f,c+p,l+p,d,o);let e=a.width*d,t=a.height*d,r=new s(c/e*a.width,l/t*a.height,b/e*a.width,x/t*a.height);this.chars[n].texture=new T({source:a,frame:r}),c+=Math.ceil(b)}}a.update(),this._currentX=c,this._currentY=l,this._currentMaxCharHeight=u,this._skipKerning||this._applyKerning(t,i,d)}get pageTextures(){return c(l,`BitmapFont.pageTextures is deprecated, please use BitmapFont.pages instead.`),this.pages}_applyKerning(e,t,n){let r=this._measureCache;for(let i=0;i<e.length;i++){let a=e[i];for(let e=0;e<this._currentChars.length;e++){let i=this._currentChars[e],o=r[a];o||(o=r[a]=t.measureText(a).width);let s=r[i];s||(s=r[i]=t.measureText(i).width);let c=t.measureText(a+i).width,l=c-(o+s);l&&this.chars[a]&&(this.chars[a].kerning[i]=l/n),c=t.measureText(a+i).width,l=c-(o+s),l&&this.chars[i]&&(this.chars[i].kerning[a]=l/n)}}}_nextPage(){this._currentPageIndex++;let e=this.resolution,t=ae.getOptimalCanvasAndContext(this._textureSize,this._textureSize,e);this._setupContext(t.context,this._style,e);let n=e*(this.baseRenderedFontSize/this.baseMeasurementFontSize),r=new T({source:new P({resource:t.canvas,resolution:n,alphaMode:`premultiply-alpha-on-upload`,autoGenerateMipmaps:this._mipmap})});this._textureStyle&&(r.source.style=this._textureStyle);let i={canvasAndContext:t,texture:r};return this.pages[this._currentPageIndex]=i,i}_setupContext(e,t,n){t.fontSize=this.baseRenderedFontSize,e.scale(n,n),e.font=Ei(t),t.fontSize=this.baseMeasurementFontSize,e.textBaseline=t.textBaseline;let r=t._stroke,i=r?.width??0;if(r&&(e.lineWidth=i,e.lineJoin=r.join,e.miterLimit=r.miterLimit,e.strokeStyle=Oi(r,e)),t._fill&&(e.fillStyle=Oi(t._fill,e)),t.dropShadow){let r=t.dropShadow,i=f.shared.setValue(r.color).toArray(),a=r.blur*n,o=r.distance*n;e.shadowColor=`rgba(${i[0]*255},${i[1]*255},${i[2]*255},${r.alpha})`,e.shadowBlur=a,e.shadowOffsetX=Math.cos(r.angle)*o,e.shadowOffsetY=Math.sin(r.angle)*o}else e.shadowColor=`black`,e.shadowBlur=0,e.shadowOffsetX=0,e.shadowOffsetY=0}_drawGlyph(e,t,n,r,i,a){let o=t.text,s=t.fontProperties,c=(a._stroke?.width??0)*i,l=n+c/2,u=r-c/2,d=s.descent*i,f=t.lineHeight*i,p=!1;a.stroke&&c&&(p=!0,e.strokeText(o,l,u+f-d));let{shadowBlur:m,shadowOffsetX:h,shadowOffsetY:g}=e;a._fill&&(p&&(e.shadowBlur=0,e.shadowOffsetX=0,e.shadowOffsetY=0),e.fillText(o,l,u+f-d)),p&&(e.shadowBlur=m,e.shadowOffsetX=h,e.shadowOffsetY=g)}destroy(){super.destroy();for(let e=0;e<this.pages.length;e++){let{canvasAndContext:t,texture:n}=this.pages[e];ae.returnCanvasAndContext(t),n.destroy(!0)}this.pages=null}};Gi.defaultOptions={textureSize:512,style:new Ni,mipmap:!0};var Ki=Gi;function qi(e,t,n,r){let i={width:0,height:0,offsetY:0,scale:t.fontSize/n.baseMeasurementFontSize,lines:[{width:0,charPositions:[],spaceWidth:0,spacesIndex:[],chars:[]}]};i.offsetY=n.baseLineOffset;let a=i.lines[0],o=null,s=!0,c={spaceWord:!1,width:0,start:0,index:0,positions:[],chars:[]},l=n.baseMeasurementFontSize/t.fontSize,u=t.letterSpacing*l,d=t.wordWrapWidth*l,f=t.lineHeight?t.lineHeight*l:n.lineHeight,p=t.wordWrap&&t.breakWords,m=ui(t.whiteSpace),h=di(t.whiteSpace);if(m||h){let t=[],n=m;for(let r=0;r<e.length;r++){let i=e[r];if(i===`\r`||i===`
`){if(h)i===`\r`&&e[r+1]===`
`&&r++,i=` `;else{m&&(n=!0),t.push(i);continue}}if(si(i)){if(m&&ci(i)){if(n)continue;n=!0,t.push(` `)}else n=!1,t.push(i)}else n=!1,t.push(i)}e=t}let g=e=>{let t=a.width;for(let n=0;n<c.index;n++){let r=e.positions[n];a.chars.push(e.chars[n]),a.charPositions.push(r+t)}a.width+=e.width,(c.index>0||!m)&&(s=!1),c.width=0,c.index=0,c.chars.length=0},_=()=>{let e=a.chars.length-1;if(r){let t=a.chars[e];for(;ci(t);)a.width-=n.chars[t].xAdvance,a.spacesIndex.pop(),t=a.chars[--e]}i.width=Math.max(i.width,a.width),a={width:0,charPositions:[],chars:[],spaceWidth:0,spacesIndex:[]},s=!0,i.lines.push(a),i.height+=f},v=e=>e-u>d;for(let r=0;r<e.length+1;r++){let i,l=r===e.length;l||(i=e[r]);let d=n.chars[i];if(/(?:\s)/.test(i)||i===`\r`||i===`
`||l){if(!s&&t.wordWrap&&v(a.width+c.width)?(_(),g(c),!l&&d&&a.charPositions.push(0)):(c.start=a.width,g(c),!l&&d&&a.charPositions.push(0)),i===`\r`||i===`
`)_();else if(!l&&d){let e=d.xAdvance+(d.kerning?.[o]||0)+u;a.width+=e,a.spaceWidth=e,a.spacesIndex.push(a.charPositions.length),a.chars.push(i)}}else if(d){let e=d.kerning?.[o]||0,n=d.xAdvance+e+u;p&&v(c.width+n)&&(s||_(),g(c),_()),c.positions[c.index++]=c.width+e,c.chars.push(i),c.width+=n,li(i)&&(!s&&t.wordWrap&&v(a.width+c.width)&&_(),g(c))}o=i}return _(),t.align===`center`?Ji(i):t.align===`right`?Yi(i):t.align===`justify`&&Xi(i),i}function Ji(e){for(let t=0;t<e.lines.length;t++){let n=e.lines[t],r=e.width/2-n.width/2;for(let e=0;e<n.charPositions.length;e++)n.charPositions[e]+=r}}function Yi(e){for(let t=0;t<e.lines.length;t++){let n=e.lines[t],r=e.width-n.width;for(let e=0;e<n.charPositions.length;e++)n.charPositions[e]+=r}}function Xi(e){let t=e.width;for(let n=0;n<e.lines.length-2;n++){let r=e.lines[n],i=0,a=r.spacesIndex[i++],o=0,s=r.spacesIndex.length,c=(t-r.width)/s;for(let e=0;e<r.charPositions.length;e++)e===a&&(a=r.spacesIndex[i++],o+=c),r.charPositions[e]+=o}}function Zi(e){if(e===``)return[];typeof e==`string`&&(e=[e]);let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];if(Array.isArray(r)){if(r.length!==2)throw Error(`[BitmapFont]: Invalid character range length, expecting 2 got ${r.length}.`);if(r[0].length===0||r[1].length===0)throw Error(`[BitmapFont]: Invalid character delimiter.`);let e=r[0].charCodeAt(0),n=r[1].charCodeAt(0);if(n<e)throw Error(`[BitmapFont]: Invalid character range.`);for(let r=e,i=n;r<=i;r++)t.push(String.fromCharCode(r))}else t.push(...Array.from(r))}if(t.length===0)throw Error(`[BitmapFont]: Empty set when resolving characters.`);return t}var Qi=0,$i=new class{constructor(){this.ALPHA=[[`a`,`z`],[`A`,`Z`],` `],this.NUMERIC=[[`0`,`9`]],this.ALPHANUMERIC=[[`a`,`z`],[`A`,`Z`],[`0`,`9`],` `],this.ASCII=[[` `,`~`]],this.defaultOptions={chars:this.ALPHANUMERIC,resolution:1,padding:4,skipKerning:!1,textureStyle:null},this.measureCache=Yr(1e3)}getFont(e,t){let n=`${t.fontFamily}-bitmap`,r=!0;if(I.has(n)){let t=I.get(n);return t.ensureCharacters?.(e),t}if(t._fill.fill&&!t._stroke?(n+=t._fill.fill.styleKey,r=!1):(t._stroke||t.dropShadow)&&(n=`${t.styleKey}-bitmap`,r=!1),n+=`-${t.fontStyle}`,n+=`-${t.fontVariant}`,n+=`-${t.fontWeight}`,!I.has(n)){let e=Object.create(t);e._lineHeight=0;let i=new Ki({style:e,overrideFill:r,overrideSize:!0,...this.defaultOptions});Qi++,Qi>50&&E(`BitmapText`,`You have dynamically created ${Qi} bitmap fonts, this can be inefficient. Try pre installing your font styles using \`BitmapFont.install({name:"style1", style})\``),i.once(`destroy`,()=>{Qi--,I.remove(n)}),I.set(n,i)}let i=I.get(n);return i.ensureCharacters?.(e),i}getLayout(e,t,n=!0){let r=this.getFont(e,t),i=`${e}-${t.styleKey}-${n}`;if(this.measureCache.has(i))return this.measureCache.get(i);let a=qi(wi.graphemeSegmenter(e),t,r,n);return this.measureCache.set(i,a),a}measureText(e,t,n=!0){return this.getLayout(e,t,n)}install(...e){let t=e[0];typeof t==`string`&&(t={name:t,style:e[1],chars:e[2]?.chars,resolution:e[2]?.resolution,padding:e[2]?.padding,skipKerning:e[2]?.skipKerning},c(l,`BitmapFontManager.install(name, style, options) is deprecated, use BitmapFontManager.install({name, style, ...options})`));let n=t?.name;if(!n)throw Error("[BitmapFontManager] Property `name` is required.");t={...this.defaultOptions,...t};let r=t.style,i=r instanceof Ni?r:new Ni(r),a=new Ki({style:i,overrideFill:t.dynamicFill??this._canUseTintForStyle(i),skipKerning:t.skipKerning,padding:t.padding,resolution:t.resolution,overrideSize:!1,textureStyle:t.textureStyle}),o=Zi(t.chars);return a.ensureCharacters(o.join(``)),I.set(`${n}-bitmap`,a),a.once(`destroy`,()=>I.remove(`${n}-bitmap`)),a}uninstall(e){let t=`${e}-bitmap`,n=I.get(t);n&&n.destroy()}_canUseTintForStyle(e){return!e._stroke&&(!e.dropShadow||e.dropShadow.color===0)&&!e._fill.fill&&e._fill.color===16777215}};function ea(){let{userAgent:e}=b.get().getNavigator();return/^((?!chrome|android).)*safari/i.test(e)}var ta=class e{static _getPatternRepeat(e,t){let n=e&&e!==`clamp-to-edge`,r=t&&t!==`clamp-to-edge`;return n&&r?`repeat`:n?`repeat-x`:r?`repeat-y`:`no-repeat`}start(e,t,n){}execute(t,n){let r=n.elements;if(!r||!r.length)return;let i=t.renderer,a=i.canvasContext,o=a.activeContext;for(let t=0;t<r.length;t++){let s=r[t];if(!s.packAsQuad)continue;let c=s,l=c.texture,u=l?xe.getCanvasSource(l):null;if(!u)continue;let f=l.source.style,p=a.smoothProperty,m=f.scaleMode!==`nearest`;o[p]!==m&&(o[p]=m),a.setBlendMode(n.blendMode);let h=i.globalUniforms.globalUniformData?.worldColor??4294967295,g=c.color,_=(h>>>24&255)/255,v=(g>>>24&255)/255,y=i.filter?.alphaMultiplier??1,b=_*v*y;if(b<=0)continue;o.globalAlpha=b;let x=h&16777215,S=g&16777215,C=_e(se(S,x)),ee=l.frame,te=f.addressModeU??f.addressMode,w=f.addressModeV??f.addressMode,ne=e._getPatternRepeat(te,w),re=l.source._resolution??l.source.resolution??1,ie=c.renderable?.renderGroup?.isCachedAsTexture,ae=ee.x*re,oe=ee.y*re,T=ee.width*re,E=ee.height*re,ce=c.bounds,D=i.renderTarget.renderTarget.isRoot,le=ce.minX,ue=ce.minY,O=ce.maxX-ce.minX,de=ce.maxY-ce.minY,fe=l.rotate,k=l.uvs,pe=Math.min(k.x0,k.x1,k.x2,k.x3,k.y0,k.y1,k.y2,k.y3),me=Math.max(k.x0,k.x1,k.x2,k.x3,k.y0,k.y1,k.y2,k.y3),A=ne!==`no-repeat`&&(pe<0||me>1),j=fe&&(!!A||C===16777215&&!fe);j?(e._tempPatternMatrix.copyFrom(c.transform),d.matrixAppendRotationInv(e._tempPatternMatrix,fe,le,ue,O,de),a.setContextTransform(e._tempPatternMatrix,c.roundPixels===1,void 0,ie&&D)):a.setContextTransform(c.transform,c.roundPixels===1,void 0,ie&&D);let he=O,ge=de,ve=j?0:le,M=j?0:ue;if(!j&&c.roundPixels===1&&(ve|=0,M|=0),A){let t=u,n=C!==16777215&&!fe,r=ee.width<=l.source.width&&ee.height<=l.source.height;n&&r&&(t=xe.getTintedCanvas({texture:l},C));let i=o.createPattern(t,ne);if(!i)continue;let a=he,s=ge;if(a===0||s===0)continue;let c=1/a,d=1/s,f=(k.x1-k.x0)*c,p=(k.y1-k.y0)*c,m=(k.x3-k.x0)*d,h=(k.y3-k.y0)*d,g=k.x0-f*ve-m*M,_=k.y0-p*ve-h*M,v=l.source.pixelWidth,y=l.source.pixelHeight;e._tempPatternMatrix.set(f*v,p*y,m*v,h*y,g*v,_*y),xe.applyPatternTransform(i,e._tempPatternMatrix),o.fillStyle=i,o.fillRect(ve,M,he,ge)}else{let e=C!==16777215||fe?xe.getTintedCanvas({texture:l},C):u,t=e!==u;o.drawImage(e,t?0:ae,t?0:oe,t?e.width:T,t?e.height:E,ve,M,he,ge)}}}};ta._tempPatternMatrix=new D,ta.extension={type:[m.CanvasPipesAdaptor],name:`batch`};var na=ta,ra=class{constructor(){this._tempState=ve.for2d(),this._didUploadHash={}}init(e){e.renderer.runners.contextChange.add(this)}contextChange(){this._didUploadHash={}}start(e,t,n){let r=e.renderer,i=this._didUploadHash[n.uid];r.shader.bind(n,i),i||(this._didUploadHash[n.uid]=!0),r.shader.updateUniformGroup(r.globalUniforms.uniformGroup),r.geometry.bind(t,n.glProgram)}execute(e,t){let n=e.renderer;this._tempState.blendMode=t.blendMode,n.state.set(this._tempState);let r=t.textures.textures;for(let e=0;e<t.textures.count;e++)n.texture.bind(r[e],e);n.geometry.draw(t.topology,t.size,t.start)}};ra.extension={type:[m.WebGLPipesAdaptor],name:`batch`};var ia=ve.for2d(),aa=class{start(e,t,n){let r=e.renderer,i=r.encoder,a=n.gpuProgram;this._shader=n,this._geometry=t,i.setGeometry(t,a),ia.blendMode=`normal`,r.pipeline.getPipeline(t,a,ia,void 0,n._overrides);let o=r.globalUniforms.bindGroup;i.resetBindGroup(1),i.setBindGroup(0,o,a)}execute(e,t){let n=this._shader.gpuProgram,r=e.renderer,i=r.encoder;if(!t.bindGroup){let e=t.textures;t.bindGroup=We(e.textures,e.count,r.limits.maxBatchableTextures)}ia.blendMode=t.blendMode;let a=r.bindGroup.getBindGroup(t.bindGroup,n,1),o=r.pipeline.getPipeline(this._geometry,n,ia,t.topology,this._shader._overrides);t.bindGroup._touch(r.gc.now),i.setPipeline(o),i.renderPassEncoder.setBindGroup(1,a),i.renderPassEncoder.drawIndexed(t.size,1,t.start)}};aa.extension={type:[m.WebGPUPipesAdaptor],name:`batch`};var oa=class{constructor(e){this._colorStack=[],this._colorStackIndex=0,this._currentColor=0,this._renderer=e}buildStart(){this._colorStack[0]=15,this._colorStackIndex=1,this._currentColor=15}push(e,t,n){this._renderer.renderPipes.batch.break(n);let r=this._colorStack;r[this._colorStackIndex]=r[this._colorStackIndex-1]&e.mask;let i=this._colorStack[this._colorStackIndex];i!==this._currentColor&&(this._currentColor=i,n.add({renderPipeId:`colorMask`,colorMask:i,canBundle:!1})),this._colorStackIndex++}pop(e,t,n){this._renderer.renderPipes.batch.break(n);let r=this._colorStack;this._colorStackIndex--;let i=r[this._colorStackIndex-1];i!==this._currentColor&&(this._currentColor=i,n.add({renderPipeId:`colorMask`,colorMask:i,canBundle:!1}))}execute(e){}destroy(){this._renderer=null,this._colorStack=null}};oa.extension={type:[m.CanvasPipes],name:`colorMask`};function sa(e,t,n,r,i,a){a=Math.max(0,Math.min(a,Math.min(r,i)/2)),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.quadraticCurveTo(t+r,n,t+r,n+a),e.lineTo(t+r,n+i-a),e.quadraticCurveTo(t+r,n+i,t+r-a,n+i),e.lineTo(t+a,n+i),e.quadraticCurveTo(t,n+i,t,n+i-a),e.lineTo(t,n+a),e.quadraticCurveTo(t,n,t+a,n)}function ca(e,t){switch(t.type){case`rectangle`:{let n=t;e.rect(n.x,n.y,n.width,n.height);break}case`roundedRectangle`:{let n=t;sa(e,n.x,n.y,n.width,n.height,n.radius);break}case`circle`:{let n=t;e.moveTo(n.x+n.radius,n.y),e.arc(n.x,n.y,n.radius,0,Math.PI*2);break}case`ellipse`:{let n=t;e.ellipse?(e.moveTo(n.x+n.halfWidth,n.y),e.ellipse(n.x,n.y,n.halfWidth,n.halfHeight,0,0,Math.PI*2)):(e.save(),e.translate(n.x,n.y),e.scale(n.halfWidth,n.halfHeight),e.moveTo(1,0),e.arc(0,0,1,0,Math.PI*2),e.restore());break}case`triangle`:{let n=t;e.moveTo(n.x,n.y),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3),e.closePath();break}default:{let n=t,r=n.points;if(!r?.length)break;e.moveTo(r[0],r[1]);for(let t=2;t<r.length;t+=2)e.lineTo(r[t],r[t+1]);n.closePath&&e.closePath();break}}}function la(e,t,n){let r=[],i=[],a=[];if(!ze[t.type]?.build(t,r))return!1;let o=t.closePath??!0;Le(r,n,!1,o,i,a);for(let t=0;t<a.length;t+=3){let n=a[t]*2,r=a[t+1]*2,o=a[t+2]*2;e.moveTo(i[n],i[n+1]),e.lineTo(i[r],i[r+1]),e.lineTo(i[o],i[o+1]),e.closePath()}return!0}function ua(e,t){if(!t?.length)return!1;for(let n=0;n<t.length;n++){let r=t[n];if(!r?.shape)continue;let i=r.transform,a=i&&!i.isIdentity();a&&(e.save(),e.transform(i.a,i.b,i.c,i.d,i.tx,i.ty)),ca(e,r.shape),a&&e.restore()}return!0}var da=class{constructor(e){this._warnedMaskTypes=new Set,this._canvasMaskStack=[],this._renderer=e}push(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`stencilMask`,action:`pushMaskBegin`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}pop(e,t,n){this._renderer.renderPipes.batch.break(n),n.add({renderPipeId:`stencilMask`,action:`popMaskEnd`,mask:e,inverse:t._maskOptions.inverse,canBundle:!1})}execute(e){if(e.action!==`pushMaskBegin`&&e.action!==`popMaskEnd`)return;let t=this._renderer,n=t.canvasContext,r=n?.activeContext;if(!r)return;if(e.action===`popMaskEnd`){this._canvasMaskStack.pop()&&r.restore();return}e.inverse&&this._warnOnce(`inverse`,`CanvasRenderer: inverse masks are not supported on Canvas2D; ignoring inverse flag.`);let i=e.mask.mask;if(!(i instanceof z)){this._warnOnce(`nonGraphics`,`CanvasRenderer: only Graphics masks are supported in Canvas2D; skipping mask.`),this._canvasMaskStack.push(!1);return}let a=i,o=a.context?.instructions;if(!o?.length){this._canvasMaskStack.push(!1);return}r.save(),n.setContextTransform(a.groupTransform,(t._roundPixels|a._roundPixels)===1),r.beginPath();let s=!1,c=!1;for(let e=0;e<o.length;e++){let t=o[e],n=t.action;if(n!==`fill`&&n!==`stroke`)continue;let i=t.data,a=i?.path?.shapePath;if(!a?.shapePrimitives?.length)continue;let l=n===`stroke`,u=a.shapePrimitives;for(let e=0;e<u.length;e++){let t=u[e];if(!t?.shape)continue;let n=t.transform,a=n&&!n.isIdentity();a&&(r.save(),r.transform(n.a,n.b,n.c,n.d,n.tx,n.ty)),l&&i.style?s=la(r,t.shape,i.style)||s:(ca(r,t.shape),c=ua(r,t.holes)||c,s=!0),a&&r.restore()}}if(!s){r.restore(),this._canvasMaskStack.push(!1);return}c?r.clip(`evenodd`):r.clip(),this._canvasMaskStack.push(!0)}destroy(){this._renderer=null,this._warnedMaskTypes=null,this._canvasMaskStack=null}_warnOnce(e,t){this._warnedMaskTypes.has(e)||(this._warnedMaskTypes.add(e),E(t))}};da.extension={type:[m.CanvasPipes],name:`stencilMask`};var B=`source-over`;function fa(){let e=be(),t=Object.create(null);return t.inherit=B,t.none=B,t.normal=`source-over`,t.add=`lighter`,t.multiply=e?`multiply`:B,t.screen=e?`screen`:B,t.overlay=e?`overlay`:B,t.darken=e?`darken`:B,t.lighten=e?`lighten`:B,t[`color-dodge`]=e?`color-dodge`:B,t[`color-burn`]=e?`color-burn`:B,t[`hard-light`]=e?`hard-light`:B,t[`soft-light`]=e?`soft-light`:B,t.difference=e?`difference`:B,t.exclusion=e?`exclusion`:B,t.saturation=e?`saturation`:B,t.color=e?`color`:B,t.luminosity=e?`luminosity`:B,t[`linear-burn`]=e?`color-burn`:B,t[`linear-dodge`]=e?`color-dodge`:B,t[`linear-light`]=e?`hard-light`:B,t[`pin-light`]=e?`hard-light`:B,t[`vivid-light`]=e?`hard-light`:B,t[`hard-mix`]=B,t.negation=e?`difference`:B,t[`normal-npm`]=t.normal,t[`add-npm`]=t.add,t[`screen-npm`]=t.screen,t.erase=`destination-out`,t.subtract=B,t.divide=B,t.min=B,t.max=B,t}var pa=new D,ma=class{constructor(e){this.activeResolution=1,this.smoothProperty=`imageSmoothingEnabled`,this.blendModes=fa(),this._activeBlendMode=`normal`,this._projTransform=null,this._outerBlend=!1,this._warnedBlendModes=new Set,this._renderer=e}resolutionChange(e){this.activeResolution=e}init(){let e=this._renderer.background.alpha<1;if(this.rootContext=this._renderer.canvas.getContext(`2d`,{alpha:e}),this.activeContext=this.rootContext,this.activeResolution=this._renderer.resolution,!this.rootContext.imageSmoothingEnabled){let e=this.rootContext;e.webkitImageSmoothingEnabled?this.smoothProperty=`webkitImageSmoothingEnabled`:e.mozImageSmoothingEnabled?this.smoothProperty=`mozImageSmoothingEnabled`:e.oImageSmoothingEnabled?this.smoothProperty=`oImageSmoothingEnabled`:e.msImageSmoothingEnabled&&(this.smoothProperty=`msImageSmoothingEnabled`)}}setContextTransform(e,t,n,r){let i=r?D.IDENTITY:this._renderer.globalUniforms.globalUniformData?.worldTransformMatrix||D.IDENTITY,a=pa;a.copyFrom(i),a.append(e);let o=this._projTransform,s=this.activeResolution;if(n=n||s,o){let e=D.shared;e.copyFrom(a),e.prepend(o),a=e}t?this.activeContext.setTransform(a.a*n,a.b*n,a.c*n,a.d*n,a.tx*s|0,a.ty*s|0):this.activeContext.setTransform(a.a*n,a.b*n,a.c*n,a.d*n,a.tx*s,a.ty*s)}clear(e,t){let n=this.activeContext,r=this._renderer;if(n.clearRect(0,0,r.width,r.height),e){let i=f.shared.setValue(e);n.globalAlpha=t??i.alpha,n.fillStyle=i.toHex(),n.fillRect(0,0,r.width,r.height),n.globalAlpha=1}}setBlendMode(e){if(this._activeBlendMode===e)return;this._activeBlendMode=e,this._outerBlend=!1;let t=this.blendModes[e];if(!t){this._warnedBlendModes.has(e)||(console.warn(`CanvasRenderer: blend mode "${e}" is not supported in Canvas2D; falling back to "source-over".`),this._warnedBlendModes.add(e)),this.activeContext.globalCompositeOperation=`source-over`;return}this.activeContext.globalCompositeOperation=t}destroy(){this.rootContext=null,this.activeContext=null,this._warnedBlendModes.clear()}};ma.extension={type:[m.CanvasSystem],name:`canvasContext`};var ha=class{constructor(){this.maxTextures=16,this.maxBatchableTextures=16,this.maxUniformBindings=0}init(){}};ha.extension={type:[m.CanvasSystem],name:`limits`};var ga=`#808080`,_a=new D,va=new D,ya=new D,ba=new D,xa=new D;function Sa(e,t,n){e.beginPath();for(let r=0;r<n.length;r+=3){let i=n[r]*2,a=n[r+1]*2,o=n[r+2]*2;e.moveTo(t[i],t[i+1]),e.lineTo(t[a],t[a+1]),e.lineTo(t[o],t[o+1]),e.closePath()}e.fill()}function Ca(e){return`#${(e&16777215).toString(16).padStart(6,`0`)}`}function wa(e,t,n,r,i,a){a=Math.max(0,Math.min(a,Math.min(r,i)/2)),e.moveTo(t+a,n),e.lineTo(t+r-a,n),e.quadraticCurveTo(t+r,n,t+r,n+a),e.lineTo(t+r,n+i-a),e.quadraticCurveTo(t+r,n+i,t+r-a,n+i),e.lineTo(t+a,n+i),e.quadraticCurveTo(t,n+i,t,n+i-a),e.lineTo(t,n+a),e.quadraticCurveTo(t,n,t+a,n)}function Ta(e,t){switch(t.type){case`rectangle`:{let n=t;e.rect(n.x,n.y,n.width,n.height);break}case`roundedRectangle`:{let n=t;wa(e,n.x,n.y,n.width,n.height,n.radius);break}case`circle`:{let n=t;e.arc(n.x,n.y,n.radius,0,Math.PI*2);break}case`ellipse`:{let n=t;e.ellipse?e.ellipse(n.x,n.y,n.halfWidth,n.halfHeight,0,0,Math.PI*2):(e.save(),e.translate(n.x,n.y),e.scale(n.halfWidth,n.halfHeight),e.arc(0,0,1,0,Math.PI*2),e.restore());break}case`triangle`:{let n=t;e.moveTo(n.x,n.y),e.lineTo(n.x2,n.y2),e.lineTo(n.x3,n.y3),e.closePath();break}default:{let n=t,r=n.points;if(!r?.length)break;e.moveTo(r[0],r[1]);for(let t=2;t<r.length;t+=2)e.lineTo(r[t],r[t+1]);n.closePath&&e.closePath();break}}}function Ea(e,t){if(!t?.length)return!1;for(let n=0;n<t.length;n++){let r=t[n];if(!r?.shape)continue;let i=r.transform,a=i&&!i.isIdentity();a&&(e.save(),e.transform(i.a,i.b,i.c,i.d,i.tx,i.ty)),Ta(e,r.shape),a&&e.restore()}return!0}function Da(e,t,n,r){let i=e.fill;if(i instanceof Fe){i.buildGradient();let a=i.texture;if(a){let o=xe.getTintedPattern(a,t),s=n?ba.copyFrom(n).scale(a.source.pixelWidth,a.source.pixelHeight):ba.copyFrom(i.transform);return r&&!e.textureSpace&&s.append(r),xe.applyPatternTransform(o,s),o}}if(i instanceof Ie){let e=xe.getTintedPattern(i.texture,t);return xe.applyPatternTransform(e,i.transform,!1),e}let a=e.texture;if(a&&a!==T.WHITE){if(!a.source.resource)return ga;let r=xe.getTintedPattern(a,t),i=e.matrix;if(n){let{resolution:e}=a.source;if(i=ba.copyFrom(n),a.rotate){let{uvs:t,orig:n}=a;i.prepend(xa.set(t.x1-t.x0,t.y1-t.y0,t.x3-t.x0,t.y3-t.y0,t.x0,t.y0).invert()).scale(n.width*e,n.height*e)}else i.scale(a.source.pixelWidth,a.source.pixelHeight).translate(-a.frame.x*e,-a.frame.y*e)}return xe.applyPatternTransform(r,i),r}return Ca(t)}var Oa=class{constructor(){this.shader=null}contextChange(e){}execute(e,t){let n=e.renderer,r=n.canvasContext,i=r.activeContext,a=t.groupTransform,o=n.globalUniforms.globalUniformData?.worldColor??4294967295,s=t.groupColorAlpha,c=(o>>>24&255)/255,l=(s>>>24&255)/255,u=n.filter?.alphaMultiplier??1,f=c*l*u;if(f<=0)return;let p=o&16777215,m=s&16777215,h=_e(se(m,p)),g=n._roundPixels|t._roundPixels;i.save(),r.setContextTransform(a,g===1),r.setBlendMode(t.groupBlendMode);let _=t.context.instructions;for(let e=0;e<_.length;e++){let t=_[e];if(t.action===`texture`){let e=t.data,n=e.image,o=n?xe.getCanvasSource(n):null;if(!o)continue;let s=e.alpha*f;if(s<=0)continue;let c=se(e.style,h);i.globalAlpha=s;let l=o;c!==16777215&&(l=xe.getTintedCanvas({texture:n},c));let u=n.frame,p=n.source._resolution??n.source.resolution??1,m=u.x*p,_=u.y*p,v=u.width*p,y=u.height*p;l!==o&&(m=0,_=0);let b=e.transform,x=b&&!b.isIdentity(),S=n.rotate;x||S?(_a.copyFrom(a),x&&_a.append(b),S&&d.matrixAppendRotationInv(_a,S,e.dx,e.dy,e.dw,e.dh),r.setContextTransform(_a,g===1)):r.setContextTransform(a,g===1),i.drawImage(l,m,_,l===o?v:l.width,l===o?y:l.height,S?0:e.dx,S?0:e.dy,e.dw,e.dh),(x||S)&&r.setContextTransform(a,g===1);continue}let n=t.data,o=n?.path?.shapePath;if(!o?.shapePrimitives?.length)continue;let s=n.style,c=se(s.color,h),l=s.alpha*f;if(l<=0)continue;let u=t.action===`stroke`;if(i.globalAlpha=l,u){let e=s;i.lineWidth=e.width,i.lineCap=e.cap,i.lineJoin=e.join,i.miterLimit=e.miterLimit}let p=o.shapePrimitives;if(!u&&n.hole?.shapePath?.shapePrimitives?.length){let e=p[p.length-1];e.holes=n.hole.shapePath.shapePrimitives}for(let e=0;e<p.length;e++){let t=p[e];if(!t?.shape)continue;let n=t.transform,r=n&&!n.isIdentity(),o=s.texture&&s.texture!==T.WHITE,l=s.textureSpace===`global`?n:null,d=Da(s,c,o?Ve(va,s,t.shape,l):null,r?ya.copyFrom(a).append(n):a);if(r&&(i.save(),i.transform(n.a,n.b,n.c,n.d,n.tx,n.ty)),u){let e=s;if(e.alignment!==.5&&!e.pixelLine){let n=[],r=[],a=[];if(ze[t.shape.type]?.build(t.shape,n)){let o=t.shape.closePath??!0;Le(n,e,!1,o,r,a),i.fillStyle=d,Sa(i,r,a)}else i.strokeStyle=d,i.beginPath(),Ta(i,t.shape),i.stroke()}else i.strokeStyle=d,i.beginPath(),Ta(i,t.shape),i.stroke()}else i.fillStyle=d,i.beginPath(),Ta(i,t.shape),Ea(i,t.holes)?i.fill(`evenodd`):i.fill();r&&i.restore()}}i.restore()}destroy(){this.shader=null}};Oa.extension={type:[m.CanvasPipesAdaptor],name:`graphics`};var ka=class{init(e,t){this._renderer=e,this._renderTargetSystem=t}initGpuRenderTarget(e){let t=e.colorTexture,{canvas:n,context:r}=this._ensureCanvas(t);return{canvas:n,context:r,width:n.width,height:n.height}}resizeGpuRenderTarget(e){let t=e.colorTexture,{canvas:n}=this._ensureCanvas(t);n.width=e.pixelWidth,n.height=e.pixelHeight}startRenderPass(e,t,n,r){let i=this._renderTargetSystem.getGpuRenderTarget(e);this._renderer.canvasContext.activeContext=i.context,this._renderer.canvasContext.activeResolution=e.resolution,t&&this.clear(e,t,n,r)}clear(e,t,n,r){let i=this._renderTargetSystem.getGpuRenderTarget(e).context,a=r||{x:0,y:0,width:e.pixelWidth,height:e.pixelHeight};if(i.setTransform(1,0,0,1,0,0),i.clearRect(a.x,a.y,a.width,a.height),n){let e=f.shared.setValue(n);e.alpha>0&&(i.globalAlpha=e.alpha,i.fillStyle=e.toHex(),i.fillRect(a.x,a.y,a.width,a.height),i.globalAlpha=1)}}finishRenderPass(){}copyToTexture(e,t,n,r,i){let a=this._renderTargetSystem.getGpuRenderTarget(e).canvas,o=t.source,{context:s}=this._ensureCanvas(o),c=i?.x??0,l=i?.y??0;return s.drawImage(a,n.x,n.y,r.width,r.height,c,l,r.width,r.height),o.update(),t}copyDepthTexture(e,t,n,r,i){E(`[CanvasRenderTargetAdaptor] copyDepthTexture is not supported in the canvas renderer`)}destroyGpuRenderTarget(e){}_ensureCanvas(e){let t=e.resource;(!t||!ge.test(t))&&(t=b.get().createCanvas(e.pixelWidth,e.pixelHeight),e.resource=t),(t.width!==e.pixelWidth||t.height!==e.pixelHeight)&&(t.width=e.pixelWidth,t.height=e.pixelHeight);let n=t.getContext(`2d`);return{canvas:t,context:n}}},Aa=class extends Me{constructor(e){super(e),this.adaptor=new ka,this.adaptor.init(e,this)}};Aa.extension={type:[m.CanvasSystem],name:`renderTarget`};var ja=class{constructor(e){}init(){}initSource(e){}generateCanvas(e){let t=b.get().createCanvas(),n=t.getContext(`2d`),r=xe.getCanvasSource(e);if(!r)return t;let i=e.frame,a=e.source._resolution??e.source.resolution??1,o=i.x*a,s=i.y*a,c=i.width*a,l=i.height*a;return t.width=Math.ceil(c),t.height=Math.ceil(l),n.drawImage(r,o,s,c,l,0,0,c,l),t}getPixels(e){let t=this.generateCanvas(e);return{pixels:t.getContext(`2d`,{willReadFrequently:!0}).getImageData(0,0,t.width,t.height).data,width:t.width,height:t.height}}destroy(){}};ja.extension={type:[m.CanvasSystem],name:`texture`};var Ma=ne({CanvasRenderer:()=>Ba}),Na=[...Ae,ma,ha,ja,Aa],Pa=[Te,Ee,Se,ke,L,da,oa,je],Fa=[na,Oa],Ia=[],La=[],Ra=[],za=[];r.handleByNamedList(m.CanvasSystem,Ia),r.handleByNamedList(m.CanvasPipes,La),r.handleByNamedList(m.CanvasPipesAdaptor,Ra),r.handleByNamedList(m.CanvasLoader,za),r.add(...Na,...Pa,...Fa);var Ba=class extends R{constructor(){let e={name:`canvas`,type:ie.CANVAS,systems:Ia,renderPipes:La,renderPipeAdaptors:Ra,loaders:za};super(e)}},Va=(e=>(e[e.ELEMENT_ARRAY_BUFFER=34963]=`ELEMENT_ARRAY_BUFFER`,e[e.ARRAY_BUFFER=34962]=`ARRAY_BUFFER`,e[e.UNIFORM_BUFFER=35345]=`UNIFORM_BUFFER`,e))(Va||{}),Ha=class{constructor(e,t){this._lastBindBaseLocation=-1,this._lastBindCallId=-1,this.buffer=e||null,this.updateID=-1,this.byteLength=-1,this.type=t}destroy(){this.buffer=null,this.updateID=-1,this.byteLength=-1,this.type=-1,this._lastBindBaseLocation=-1,this._lastBindCallId=-1}},Ua=class{constructor(e){this._boundBufferBases=Object.create(null),this._minBaseLocation=0,this._nextBindBaseIndex=this._minBaseLocation,this._bindCallId=0,this._renderer=e,this._managedBuffers=new nt({renderer:e,type:`resource`,onUnload:this.onBufferUnload.bind(this),name:`glBuffer`})}destroy(){this._managedBuffers.destroy(),this._renderer=null,this._gl=null,this._boundBufferBases={}}contextChange(){this._gl=this._renderer.gl,this.destroyAll(!0),this._maxBindings=this._renderer.limits.maxUniformBindings}getGlBuffer(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]||this.createGLBuffer(e)}bind(e){let{_gl:t}=this,n=this.getGlBuffer(e);t.bindBuffer(n.type,n.buffer)}bindBufferBase(e,t){let{_gl:n}=this;this._boundBufferBases[t]!==e&&(this._boundBufferBases[t]=e,e._lastBindBaseLocation=t,n.bindBufferBase(n.UNIFORM_BUFFER,t,e.buffer))}nextBindBase(e){this._bindCallId++,this._minBaseLocation=0,e&&(this._boundBufferBases[0]=null,this._minBaseLocation=1,this._nextBindBaseIndex<1&&(this._nextBindBaseIndex=1))}freeLocationForBufferBase(e){let t=this.getLastBindBaseLocation(e);if(t>=this._minBaseLocation)return e._lastBindCallId=this._bindCallId,t;let n=0,r=this._nextBindBaseIndex;for(;n<2;){r>=this._maxBindings&&(r=this._minBaseLocation,n++);let e=this._boundBufferBases[r];if(e&&e._lastBindCallId===this._bindCallId){r++;continue}break}return t=r,this._nextBindBaseIndex=r+1,n>=2?-1:(e._lastBindCallId=this._bindCallId,this._boundBufferBases[t]=null,t)}getLastBindBaseLocation(e){let t=e._lastBindBaseLocation;return this._boundBufferBases[t]===e?t:-1}bindBufferRange(e,t,n,r){let{_gl:i}=this;n||(n=0),t||(t=0),this._boundBufferBases[t]=null,i.bindBufferRange(i.UNIFORM_BUFFER,t||0,e.buffer,n*256,r||256)}updateBuffer(e){let{_gl:t}=this,n=this.getGlBuffer(e);if(e._updateID===n.updateID)return n;n.updateID=e._updateID,t.bindBuffer(n.type,n.buffer);let r=e.data,i=e.descriptor.usage&x.STATIC?t.STATIC_DRAW:t.DYNAMIC_DRAW;return r?n.byteLength>=r.byteLength?t.bufferSubData(n.type,e._updateOffset,r,e._updateOffset/r.BYTES_PER_ELEMENT,(e._updateSize||r.byteLength)/r.BYTES_PER_ELEMENT):(n.byteLength=r.byteLength,t.bufferData(n.type,r,i)):(n.byteLength=e.descriptor.size,t.bufferData(n.type,n.byteLength,i)),n}destroyAll(e=!1){this._managedBuffers.removeAll(e)}onBufferUnload(e,t=!1){let n=e._gpuData[this._renderer.uid];n&&(t||this._gl.deleteBuffer(n.buffer))}createGLBuffer(e){let{_gl:t}=this,n=Va.ARRAY_BUFFER;e.descriptor.usage&x.INDEX?n=Va.ELEMENT_ARRAY_BUFFER:e.descriptor.usage&x.UNIFORM&&(n=Va.UNIFORM_BUFFER);let r=new Ha(t.createBuffer(),n);return e._gpuData[this._renderer.uid]=r,this._managedBuffers.add(e),r}resetState(){this._boundBufferBases=Object.create(null)}};Ua.extension={type:[m.WebGLSystem],name:`buffer`};var Wa=class e{constructor(e){this.supports={uint32Indices:!0,uniformBufferObject:!0,vertexArrayObject:!0,srgbTextures:!0,nonPowOf2wrapping:!0,msaa:!0,nonPowOf2mipmaps:!0},this._renderer=e,this.extensions=Object.create(null),this.handleContextLost=this.handleContextLost.bind(this),this.handleContextRestored=this.handleContextRestored.bind(this)}get isLost(){return!this.gl||this.gl.isContextLost()}contextChange(e){this.gl=e,this._renderer.gl=e}init(t){t={...e.defaultOptions,...t};let n=this.multiView=t.multiView;if(t.context&&n&&(E(`Renderer created with both a context and multiview enabled. Disabling multiView as both cannot work together.`),n=!1),this.canvas=n?b.get().createCanvas(this._renderer.canvas.width,this._renderer.canvas.height):this._renderer.view.canvas,t.context)this.initFromContext(t.context);else{let e=this._renderer.background.alpha<1,n=t.premultipliedAlpha??!0,r=t.antialias&&!this._renderer.backBuffer.useBackBuffer;this.createContext(t.preferWebGLVersion,{alpha:e,premultipliedAlpha:n,antialias:r,stencil:!0,preserveDrawingBuffer:t.preserveDrawingBuffer,powerPreference:t.powerPreference??`default`})}}ensureCanvasSize(e){if(!this.multiView){e!==this.canvas&&E(`multiView is disabled, but targetCanvas is not the main canvas`);return}let{canvas:t}=this;(t.width<e.width||t.height<e.height)&&(t.width=Math.max(e.width,e.width),t.height=Math.max(e.height,e.height))}initFromContext(e){this.gl=e,this.webGLVersion=e instanceof b.get().getWebGLRenderingContext()?1:2,this.getExtensions(),this.validateContext(e),this._renderer.runners.contextChange.emit(e);let t=this._renderer.view.canvas;t.addEventListener(`webglcontextlost`,this.handleContextLost,!1),t.addEventListener(`webglcontextrestored`,this.handleContextRestored,!1)}createContext(e,t){let n,r=this.canvas;if(e===2&&(n=r.getContext(`webgl2`,t)),!n&&(n=r.getContext(`webgl`,t),!n))throw Error(`This browser does not support WebGL. Try using the canvas renderer`);this.gl=n,this.initFromContext(this.gl)}getExtensions(){let{gl:e}=this,t={anisotropicFiltering:e.getExtension(`EXT_texture_filter_anisotropic`),floatTextureLinear:e.getExtension(`OES_texture_float_linear`),s3tc:e.getExtension(`WEBGL_compressed_texture_s3tc`),s3tc_sRGB:e.getExtension(`WEBGL_compressed_texture_s3tc_srgb`),etc:e.getExtension(`WEBGL_compressed_texture_etc`),etc1:e.getExtension(`WEBGL_compressed_texture_etc1`),pvrtc:e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`),atc:e.getExtension(`WEBGL_compressed_texture_atc`),astc:e.getExtension(`WEBGL_compressed_texture_astc`),bptc:e.getExtension(`EXT_texture_compression_bptc`),rgtc:e.getExtension(`EXT_texture_compression_rgtc`),loseContext:e.getExtension(`WEBGL_lose_context`)};if(this.webGLVersion===1)this.extensions={...t,drawBuffers:e.getExtension(`WEBGL_draw_buffers`),depthTexture:e.getExtension(`WEBGL_depth_texture`),vertexArrayObject:e.getExtension(`OES_vertex_array_object`)||e.getExtension(`MOZ_OES_vertex_array_object`)||e.getExtension(`WEBKIT_OES_vertex_array_object`),uint32ElementIndex:e.getExtension(`OES_element_index_uint`),floatTexture:e.getExtension(`OES_texture_float`),floatTextureLinear:e.getExtension(`OES_texture_float_linear`),textureHalfFloat:e.getExtension(`OES_texture_half_float`),textureHalfFloatLinear:e.getExtension(`OES_texture_half_float_linear`),vertexAttribDivisorANGLE:e.getExtension(`ANGLE_instanced_arrays`),srgb:e.getExtension(`EXT_sRGB`)};else{this.extensions={...t,colorBufferFloat:e.getExtension(`EXT_color_buffer_float`)};let n=e.getExtension(`WEBGL_provoking_vertex`);n&&n.provokingVertexWEBGL(n.FIRST_VERTEX_CONVENTION_WEBGL)}}handleContextLost(e){e.preventDefault(),this._contextLossForced&&(this._contextLossForced=!1,setTimeout(()=>{this.gl.isContextLost()&&this.extensions.loseContext?.restoreContext()},0))}handleContextRestored(){this.getExtensions(),this._renderer.runners.contextChange.emit(this.gl)}destroy(){let e=this._renderer.view.canvas;this._renderer=null,e.removeEventListener(`webglcontextlost`,this.handleContextLost),e.removeEventListener(`webglcontextrestored`,this.handleContextRestored),this.gl.useProgram(null),this.extensions.loseContext?.loseContext()}forceContextLoss(){this.extensions.loseContext?.loseContext(),this._contextLossForced=!0}validateContext(e){let t=e.getContextAttributes();t&&!t.stencil&&E(`Provided WebGL context does not have a stencil buffer, masks may not render correctly`);let n=this.supports,r=this.webGLVersion===2,i=this.extensions;n.uint32Indices=r||!!i.uint32ElementIndex,n.uniformBufferObject=r,n.vertexArrayObject=r||!!i.vertexArrayObject,n.srgbTextures=r||!!i.srgb,n.nonPowOf2wrapping=r,n.nonPowOf2mipmaps=r,n.msaa=r,n.uint32Indices||E(`Provided WebGL context does not support 32 index buffer, large scenes may not render correctly`)}};Wa.extension={type:[m.WebGLSystem],name:`context`},Wa.defaultOptions={context:null,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:void 0,preferWebGLVersion:2,multiView:!1};var Ga=Wa,Ka=(e=>(e[e.RGBA=6408]=`RGBA`,e[e.RGB=6407]=`RGB`,e[e.RG=33319]=`RG`,e[e.RED=6403]=`RED`,e[e.RGBA_INTEGER=36249]=`RGBA_INTEGER`,e[e.RGB_INTEGER=36248]=`RGB_INTEGER`,e[e.RG_INTEGER=33320]=`RG_INTEGER`,e[e.RED_INTEGER=36244]=`RED_INTEGER`,e[e.ALPHA=6406]=`ALPHA`,e[e.LUMINANCE=6409]=`LUMINANCE`,e[e.LUMINANCE_ALPHA=6410]=`LUMINANCE_ALPHA`,e[e.DEPTH_COMPONENT=6402]=`DEPTH_COMPONENT`,e[e.DEPTH_STENCIL=34041]=`DEPTH_STENCIL`,e))(Ka||{}),qa=(e=>(e[e.TEXTURE_2D=3553]=`TEXTURE_2D`,e[e.TEXTURE_CUBE_MAP=34067]=`TEXTURE_CUBE_MAP`,e[e.TEXTURE_2D_ARRAY=35866]=`TEXTURE_2D_ARRAY`,e[e.TEXTURE_CUBE_MAP_POSITIVE_X=34069]=`TEXTURE_CUBE_MAP_POSITIVE_X`,e[e.TEXTURE_CUBE_MAP_NEGATIVE_X=34070]=`TEXTURE_CUBE_MAP_NEGATIVE_X`,e[e.TEXTURE_CUBE_MAP_POSITIVE_Y=34071]=`TEXTURE_CUBE_MAP_POSITIVE_Y`,e[e.TEXTURE_CUBE_MAP_NEGATIVE_Y=34072]=`TEXTURE_CUBE_MAP_NEGATIVE_Y`,e[e.TEXTURE_CUBE_MAP_POSITIVE_Z=34073]=`TEXTURE_CUBE_MAP_POSITIVE_Z`,e[e.TEXTURE_CUBE_MAP_NEGATIVE_Z=34074]=`TEXTURE_CUBE_MAP_NEGATIVE_Z`,e))(qa||{}),V=(e=>(e[e.UNSIGNED_BYTE=5121]=`UNSIGNED_BYTE`,e[e.UNSIGNED_SHORT=5123]=`UNSIGNED_SHORT`,e[e.UNSIGNED_SHORT_5_6_5=33635]=`UNSIGNED_SHORT_5_6_5`,e[e.UNSIGNED_SHORT_4_4_4_4=32819]=`UNSIGNED_SHORT_4_4_4_4`,e[e.UNSIGNED_SHORT_5_5_5_1=32820]=`UNSIGNED_SHORT_5_5_5_1`,e[e.UNSIGNED_INT=5125]=`UNSIGNED_INT`,e[e.UNSIGNED_INT_10F_11F_11F_REV=35899]=`UNSIGNED_INT_10F_11F_11F_REV`,e[e.UNSIGNED_INT_2_10_10_10_REV=33640]=`UNSIGNED_INT_2_10_10_10_REV`,e[e.UNSIGNED_INT_24_8=34042]=`UNSIGNED_INT_24_8`,e[e.UNSIGNED_INT_5_9_9_9_REV=35902]=`UNSIGNED_INT_5_9_9_9_REV`,e[e.BYTE=5120]=`BYTE`,e[e.SHORT=5122]=`SHORT`,e[e.INT=5124]=`INT`,e[e.FLOAT=5126]=`FLOAT`,e[e.FLOAT_32_UNSIGNED_INT_24_8_REV=36269]=`FLOAT_32_UNSIGNED_INT_24_8_REV`,e[e.HALF_FLOAT=36193]=`HALF_FLOAT`,e))(V||{}),Ja={uint8x2:V.UNSIGNED_BYTE,uint8x4:V.UNSIGNED_BYTE,sint8x2:V.BYTE,sint8x4:V.BYTE,unorm8x2:V.UNSIGNED_BYTE,unorm8x4:V.UNSIGNED_BYTE,snorm8x2:V.BYTE,snorm8x4:V.BYTE,uint16x2:V.UNSIGNED_SHORT,uint16x4:V.UNSIGNED_SHORT,sint16x2:V.SHORT,sint16x4:V.SHORT,unorm16x2:V.UNSIGNED_SHORT,unorm16x4:V.UNSIGNED_SHORT,snorm16x2:V.SHORT,snorm16x4:V.SHORT,float16x2:V.HALF_FLOAT,float16x4:V.HALF_FLOAT,float32:V.FLOAT,float32x2:V.FLOAT,float32x3:V.FLOAT,float32x4:V.FLOAT,uint32:V.UNSIGNED_INT,uint32x2:V.UNSIGNED_INT,uint32x3:V.UNSIGNED_INT,uint32x4:V.UNSIGNED_INT,sint32:V.INT,sint32x2:V.INT,sint32x3:V.INT,sint32x4:V.INT};function Ya(e){return Ja[e]??Ja.float32}var Xa={"point-list":0,"line-list":1,"line-strip":3,"triangle-list":4,"triangle-strip":5},Za=class{constructor(){this.vaoCache=Object.create(null)}destroy(){this.vaoCache=Object.create(null)}},Qa=class{constructor(e){this._renderer=e,this._activeGeometry=null,this._activeVao=null,this.hasVao=!0,this.hasInstance=!0,this._managedGeometries=new nt({renderer:e,type:`resource`,onUnload:this.onGeometryUnload.bind(this),name:`glGeometry`})}contextChange(){let e=this.gl=this._renderer.gl;if(!this._renderer.context.supports.vertexArrayObject)throw Error(`[PixiJS] Vertex Array Objects are not supported on this device`);this.destroyAll(!0);let t=this._renderer.context.extensions.vertexArrayObject;t&&(e.createVertexArray=()=>t.createVertexArrayOES(),e.bindVertexArray=e=>t.bindVertexArrayOES(e),e.deleteVertexArray=e=>t.deleteVertexArrayOES(e));let n=this._renderer.context.extensions.vertexAttribDivisorANGLE;n&&(e.drawArraysInstanced=(e,t,r,i)=>{n.drawArraysInstancedANGLE(e,t,r,i)},e.drawElementsInstanced=(e,t,r,i,a)=>{n.drawElementsInstancedANGLE(e,t,r,i,a)},e.vertexAttribDivisor=(e,t)=>n.vertexAttribDivisorANGLE(e,t)),this._activeGeometry=null,this._activeVao=null}bind(e,t){let n=this.gl;this._activeGeometry=e;let r=this.getVao(e,t);this._activeVao!==r&&(this._activeVao=r,n.bindVertexArray(r)),this.updateBuffers()}resetState(){this.unbind()}updateBuffers(){let e=this._activeGeometry,t=this._renderer.buffer;for(let n=0;n<e.buffers.length;n++){let r=e.buffers[n];t.updateBuffer(r)}e._gcLastUsed=this._renderer.gc.now}checkCompatibility(e,t){let n=e.attributes,r=t._attributeData;for(let e in r)if(!n[e])throw Error(`shader and geometry incompatible, geometry missing the "${e}" attribute`)}getSignature(e,t){let n=e.attributes,r=t._attributeData,i=[`g`,e.uid];for(let e in n)r[e]&&i.push(e,r[e].location);return i.join(`-`)}getVao(e,t){return e._gpuData[this._renderer.uid]?.vaoCache[t._key]||this.initGeometryVao(e,t)}initGeometryVao(e,t,n=!0){let r=this._renderer.gl,i=this._renderer.buffer;this._renderer.shader._getProgramData(t),this.checkCompatibility(e,t);let a=this.getSignature(e,t),o=e._gpuData[this._renderer.uid];o||(o=new Za,e._gpuData[this._renderer.uid]=o,this._managedGeometries.add(e));let s=o.vaoCache,c=s[a];if(c)return s[t._key]=c,c;at(e,t._attributeData);let l=e.buffers;c=r.createVertexArray(),r.bindVertexArray(c);for(let e=0;e<l.length;e++){let t=l[e];i.bind(t)}return this.activateVao(e,t),s[t._key]=c,s[a]=c,r.bindVertexArray(null),c}onGeometryUnload(e,t=!1){let n=e._gpuData[this._renderer.uid];if(!n)return;let r=n.vaoCache;if(!t)for(let e in r)this._activeVao===r[e]&&this.resetState(),this.gl.deleteVertexArray(r[e])}destroyAll(e=!1){this._managedGeometries.removeAll(e)}activateVao(e,t){let n=this._renderer.gl,r=this._renderer.buffer,i=e.attributes;e.indexBuffer&&r.bind(e.indexBuffer);let a=null;for(let e in i){let o=i[e],s=o.buffer,c=r.getGlBuffer(s),l=t._attributeData[e];if(l){a!==c&&(r.bind(s),a=c);let e=l.location;n.enableVertexAttribArray(e);let t=v(o.format),i=Ya(o.format);if(l.format?.substring(1,4)===`int`?n.vertexAttribIPointer(e,t.size,i,o.stride,o.offset):n.vertexAttribPointer(e,t.size,i,t.normalised,o.stride,o.offset),o.instance){if(this.hasInstance){let t=o.divisor??1;n.vertexAttribDivisor(e,t)}else throw Error(`geometry error, GPU Instancing is not supported on this device`)}}}}draw(e,t,n,r){let{gl:i}=this._renderer,a=this._activeGeometry,o=Xa[e||a.topology];if(r??(r=a.instanceCount),a.indexBuffer){let e=a.indexBuffer.data.BYTES_PER_ELEMENT,s=e===2?i.UNSIGNED_SHORT:i.UNSIGNED_INT,c=t||a.indexCount||a.indexBuffer.data.length,l=(n||0)*e;r===1?i.drawElements(o,c,s,l):i.drawElementsInstanced(o,c,s,l,r)}else r===1?i.drawArrays(o,n||0,t||a.vertexCount):i.drawArraysInstanced(o,n||0,t||a.vertexCount,r);return this}unbind(){this.gl.bindVertexArray(null),this._activeVao=null,this._activeGeometry=null}destroy(){this._managedGeometries.destroy(),this._renderer=null,this.gl=null,this._activeVao=null,this._activeGeometry=null}};Qa.extension={type:[m.WebGLSystem],name:`geometry`};var $a=new te({attributes:{aPosition:[-1,-1,3,-1,-1,3]}}),eo=class e{constructor(e){this.useBackBuffer=!1,this._useBackBufferThisRender=!1,this._renderer=e}init(t={}){let{useBackBuffer:n,antialias:r}={...e.defaultOptions,...t};this.useBackBuffer=n,this._antialias=r,this._renderer.context.supports.msaa||(E(`antialiasing, is not supported on when using the back buffer`),this._antialias=!1),this._state=ve.for2d();let i=new y({vertex:`
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
                }`,name:`big-triangle`});this._bigTriangleShader=new g({glProgram:i,resources:{uTexture:T.WHITE.source}})}renderStart(e){let t=this._renderer.renderTarget.getRenderTarget(e.target);if(this._useBackBufferThisRender=this.useBackBuffer&&!!t.isRoot,this._useBackBufferThisRender){let t=this._renderer.renderTarget.getRenderTarget(e.target);this._targetTexture=t.colorTexture,e.target=this._getBackBufferTexture(t.colorTexture)}}renderEnd(){this._presentBackBuffer()}_presentBackBuffer(){let e=this._renderer;e.renderTarget.finishRenderPass(),this._useBackBufferThisRender&&(e.renderTarget.bind({target:this._targetTexture,clear:!1}),this._bigTriangleShader.resources.uTexture=this._backBufferTexture.source,e.encoder.draw({geometry:$a,shader:this._bigTriangleShader,state:this._state}))}_getBackBufferTexture(e){return this._backBufferTexture=this._backBufferTexture||new T({source:new t({width:e.width,height:e.height,resolution:e._resolution,antialias:this._antialias})}),this._backBufferTexture.source.resize(e.width,e.height,e._resolution),this._backBufferTexture}destroy(){this._backBufferTexture&&(this._backBufferTexture.destroy(),this._backBufferTexture=null)}};eo.extension={type:[m.WebGLSystem],name:`backBuffer`,priority:1},eo.defaultOptions={useBackBuffer:!1};var to=eo,no=class{constructor(e){this._colorMaskCache=15,this._renderer=e}setMask(e){this._colorMaskCache!==e&&(this._colorMaskCache=e,this._renderer.gl.colorMask(!!(e&8),!!(e&4),!!(e&2),!!(e&1)))}};no.extension={type:[m.WebGLSystem],name:`colorMask`};var ro=class{constructor(e){this.commandFinished=Promise.resolve(),this._renderer=e}setGeometry(e,t){this._renderer.geometry.bind(e,t.glProgram)}finishRenderPass(){}draw(e){let t=this._renderer,{geometry:n,shader:r,state:i,skipSync:a,topology:o,size:s,start:c,instanceCount:l}=e;t.shader.bind(r,a),t.geometry.bind(n,t.shader._activeProgram),i&&t.state.set(i),t.geometry.draw(o,s,c,l??n.instanceCount)}destroy(){this._renderer=null}};ro.extension={type:[m.WebGLSystem],name:`encoder`};var io=class{constructor(e){this._renderer=e}contextChange(){let e=this._renderer.gl;this.maxTextures=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),this.maxBatchableTextures=Je(this.maxTextures,e);let t=this._renderer.context.webGLVersion===2;this.maxUniformBindings=t?e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS):0}destroy(){}};io.extension={type:[m.WebGLSystem],name:`limits`};var ao=class{constructor(){this.width=-1,this.height=-1,this.msaa=!1,this._attachedMipLevel=0,this._attachedLayer=0,this.msaaRenderBuffer=[],this.stencilMode=$e.DISABLED,this.stencilReference=0,this.maskStackIndex=0}},oo=class{constructor(e){this._stencilCache={enabled:!1,stencilReference:0,stencilMode:$e.NONE},this._renderer=e,e.renderTarget.onRenderTargetChange.add(this)}contextChange(e){this._gl=e,this._comparisonFuncMapping={always:e.ALWAYS,never:e.NEVER,equal:e.EQUAL,"not-equal":e.NOTEQUAL,less:e.LESS,"less-equal":e.LEQUAL,greater:e.GREATER,"greater-equal":e.GEQUAL},this._stencilOpsMapping={keep:e.KEEP,zero:e.ZERO,replace:e.REPLACE,invert:e.INVERT,"increment-clamp":e.INCR,"decrement-clamp":e.DECR,"increment-wrap":e.INCR_WRAP,"decrement-wrap":e.DECR_WRAP},this._activeGpuRenderTarget=null,this.resetState()}onRenderTargetChange(e){if(this._activeRenderTarget===e)return;this._activeRenderTarget=e;let t=this._renderer.renderTarget.getGpuRenderTarget(e);this._activeGpuRenderTarget=t,this.setStencilMode(t.stencilMode,t.stencilReference)}resetState(){this._stencilCache.enabled=!1,this._stencilCache.stencilMode=$e.NONE,this._stencilCache.stencilReference=0}setStencilMode(e,t){let n=this._activeGpuRenderTarget??(this._activeGpuRenderTarget=this._renderer.renderTarget.getGpuRenderTarget(this._activeRenderTarget)),r=this._gl,i=mt[e],a=this._stencilCache;if(n.stencilMode=e,n.stencilReference=t,e===$e.DISABLED){this._stencilCache.enabled&&(this._stencilCache.enabled=!1,r.disable(r.STENCIL_TEST));return}this._stencilCache.enabled||(this._stencilCache.enabled=!0,r.enable(r.STENCIL_TEST)),(e!==a.stencilMode||a.stencilReference!==t)&&(a.stencilMode=e,a.stencilReference=t,r.stencilFunc(this._comparisonFuncMapping[i.stencilBack.compare],t,255),r.stencilOp(r.KEEP,r.KEEP,this._stencilOpsMapping[i.stencilBack.passOp]))}destroy(){this._renderer.renderTarget.onRenderTargetChange.remove(this),this._renderer=null,this._gl=null,this._activeRenderTarget=null,this._activeGpuRenderTarget=null}};oo.extension={type:[m.WebGLSystem],name:`stencil`};var so={f32:4,i32:4,"vec2<f32>":8,"vec3<f32>":12,"vec4<f32>":16,"vec2<i32>":8,"vec3<i32>":12,"vec4<i32>":16,u32:4,"vec2<u32>":8,"vec3<u32>":12,"vec4<u32>":16,"mat2x2<f32>":32,"mat3x3<f32>":48,"mat4x4<f32>":64};function co(e){let t=e.map(e=>({data:e,offset:0,size:0})),n=0,r=0;for(let e=0;e<t.length;e++){let i=t[e];if(n=so[i.data.type],!n)throw Error(`Unknown type ${i.data.type}`);i.data.size>1&&(n=Math.max(n,16)*i.data.size);let a=n===12?16:n;i.size=n;let o=r%16;o>0&&16-o<a?r+=(16-o)%16:r+=(n-o%n)%n,i.offset=r,r+=n}return r=Math.ceil(r/16)*16,{uboElements:t,size:r}}function lo(e,t){let n=Math.max(so[e.data.type]/16,1),r=e.data.value.length/e.data.size,i=(4-r%4)%4,a=e.data.type.indexOf(`i32`)>=0?`dataInt32`:`data`;return`
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
    `}function uo(e){return ct(e,ut,lo)}var fo=class extends dt{constructor(){super({createUboElements:co,generateUboSync:uo})}};fo.extension={type:[m.WebGLSystem],name:`ubo`};var po=class{constructor(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new s,this._boundFramebuffer=void 0}init(e,t){this._renderer=e,this._renderTargetSystem=t,e.runners.contextChange.add(this)}contextChange(){this._clearColorCache=[0,0,0,0],this._viewPortCache=new s,this._boundFramebuffer=void 0;let e=this._renderer.gl;this._drawBuffersCache=[];for(let t=1;t<=16;t++)this._drawBuffersCache[t]=Array.from({length:t},(t,n)=>e.COLOR_ATTACHMENT0+n)}copyToTexture(e,t,n,r,i){let a=this._renderTargetSystem,o=this._renderer,s=a.getGpuRenderTarget(e),c=o.gl;return this.finishRenderPass(e),c.bindFramebuffer(c.FRAMEBUFFER,s.resolveTargetFramebuffer),this._boundFramebuffer=s.resolveTargetFramebuffer,o.texture.bind(t,0),c.copyTexSubImage2D(c.TEXTURE_2D,0,i.x,i.y,n.x,n.y,r.width,r.height),t}copyDepthTexture(e,t,n,r,i){let a=this._renderTargetSystem,o=this._renderer.gl;this.finishRenderPass(e);let s=a.getRenderTarget(t),c=a.getGpuRenderTarget(e),l=a.getGpuRenderTarget(s);o.bindFramebuffer(o.READ_FRAMEBUFFER,c.framebuffer),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,l.framebuffer),this._boundFramebuffer=void 0,o.blitFramebuffer(n.x,n.y,n.x+r.width,n.y+r.height,i.x,i.y,i.x+r.width,i.y+r.height,o.DEPTH_BUFFER_BIT,o.NEAREST)}startRenderPass(e,t=!0,n,r,i=0,a=0){let o=this._renderTargetSystem.getGpuRenderTarget(e);if(a!==0&&this._renderer.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Rendering to array layers requires WebGL2.`);if(i>0){if(o.msaa)throw Error(`[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.`);if(this._renderer.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Rendering to mip levels requires WebGL2.`)}e.colorAttachments.forEach(e=>{this._renderer.texture.unbind(e.texture)});let s=this._renderer.gl;this.bindFramebuffer(o.framebuffer),!e.isRoot&&e.colorAttachments.length>0&&(o._attachedMipLevel!==i||o._attachedLayer!==a)&&(e.colorAttachments.forEach((e,t)=>{let n=e.texture,r=this._renderer.texture.getGlSource(n);if(r.target===s.TEXTURE_2D){if(a!==0)throw Error(`[RenderTargetSystem] layer must be 0 when rendering to 2D textures in WebGL.`);s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+t,s.TEXTURE_2D,r.texture,i)}else if(r.target===s.TEXTURE_2D_ARRAY){if(this._renderer.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Rendering to 2D array textures requires WebGL2.`);s.framebufferTextureLayer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+t,r.texture,i,a)}else if(r.target===s.TEXTURE_CUBE_MAP){if(a<0||a>5)throw Error(`[RenderTargetSystem] Cube map layer must be between 0 and 5.`);s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+t,s.TEXTURE_CUBE_MAP_POSITIVE_X+a,r.texture,i)}else throw Error(`[RenderTargetSystem] Unsupported texture target for render-to-layer in WebGL.`)}),o._attachedMipLevel=i,o._attachedLayer=a),o.framebuffer&&(e.depthStencilAttachment?this._attachDepthStencilTexture(e,i,a):!o.depthStencilRenderBuffer&&(e.stencil||e.depth)&&this._initStencil(o)),e.colorAttachments.length>1&&this._setDrawBuffers(e,s);let c=r.y;e.isRoot&&(c=e.pixelHeight-r.height-r.y);let l=this._viewPortCache;(l.x!==r.x||l.y!==c||l.width!==r.width||l.height!==r.height)&&(l.x=r.x,l.y=c,l.width=r.width,l.height=r.height,s.viewport(r.x,c,r.width,r.height)),this.clear(e,t,n)}finishRenderPass(e){let t=this._renderTargetSystem.getGpuRenderTarget(e);if(!t.msaa||e.colorAttachments.length===0)return;let n=this._renderer.gl;n.bindFramebuffer(n.FRAMEBUFFER,t.resolveTargetFramebuffer),n.bindFramebuffer(n.READ_FRAMEBUFFER,t.framebuffer),n.blitFramebuffer(0,0,t.width,t.height,0,0,t.width,t.height,n.COLOR_BUFFER_BIT,n.NEAREST),n.bindFramebuffer(n.FRAMEBUFFER,t.framebuffer),this._boundFramebuffer=t.framebuffer}initGpuRenderTarget(e){let t=this._renderer.gl,n=new ao;n._attachedMipLevel=0,n._attachedLayer=0;let r=e.colorTexture;return r instanceof ge?(this._renderer.context.ensureCanvasSize(r.resource),n.framebuffer=null,n):(n.width=e.pixelWidth,n.height=e.pixelHeight,e.colorAttachments.length===0?this._initDepth(e,n):this._initColor(e,n),e.depthStencilAttachment&&this._attachDepthStencilTexture(e,0,0),t.bindFramebuffer(t.FRAMEBUFFER,null),this._boundFramebuffer=null,n)}destroyGpuRenderTarget(e){let t=this._renderer.gl;e.framebuffer&&(t.deleteFramebuffer(e.framebuffer),e.framebuffer=null),e.resolveTargetFramebuffer&&(t.deleteFramebuffer(e.resolveTargetFramebuffer),e.resolveTargetFramebuffer=null),e.depthStencilRenderBuffer&&(t.deleteRenderbuffer(e.depthStencilRenderBuffer),e.depthStencilRenderBuffer=null),e.msaaRenderBuffer.forEach(e=>{t.deleteRenderbuffer(e)}),e.msaaRenderBuffer.length=0}clear(e,t,n,r,i=0,a=0){if(!t)return;if(a!==0)throw Error(`[RenderTargetSystem] Clearing array layers is not supported in WebGL renderer.`);let o=this._renderTargetSystem;if(typeof t==`boolean`&&(t=t?De.ALL:De.NONE),e.colorAttachments.length===0&&(t&=~De.COLOR,!t))return;let s=this._renderer.gl,c=!!(t&De.DEPTH)&&!this._renderer.state.depthMaskEnabled;if(t&De.COLOR){n??(n=o.defaultClearColor);let e=this._clearColorCache,t=n;(e[0]!==t[0]||e[1]!==t[1]||e[2]!==t[2]||e[3]!==t[3])&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],s.clearColor(t[0],t[1],t[2],t[3]))}c&&s.depthMask(!0),s.clear(t),c&&s.depthMask(!1)}resizeGpuRenderTarget(e){if(e.isRoot)return;let t=this._renderTargetSystem.getGpuRenderTarget(e);t.width=e.pixelWidth,t.height=e.pixelHeight,e.colorAttachments.length>0&&this._resizeColor(e,t),t.depthStencilRenderBuffer&&this._resizeStencil(t),this._boundFramebuffer=void 0}_initColor(e,t){let n=this._renderer,r=n.gl,i=r.createFramebuffer();if(t.resolveTargetFramebuffer=i,r.bindFramebuffer(r.FRAMEBUFFER,i),e.colorAttachments.forEach((e,i)=>{let a=e.texture;a.antialias&&(n.context.supports.msaa?t.msaa=!0:E(`[RenderTexture] Antialiasing on textures is not supported in WebGL1`)),n.texture.bindSource(a,0);let o=n.texture.getGlSource(a),s=o.texture;if(o.target===r.TEXTURE_2D)r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,r.TEXTURE_2D,s,0);else if(o.target===r.TEXTURE_2D_ARRAY){if(n.context.webGLVersion<2)throw Error(`[RenderTargetSystem] TEXTURE_2D_ARRAY requires WebGL2.`);r.framebufferTextureLayer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,s,0,0)}else if(o.target===r.TEXTURE_CUBE_MAP)r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,r.TEXTURE_CUBE_MAP_POSITIVE_X,s,0);else throw Error(`[RenderTargetSystem] Unsupported texture target for framebuffer attachment.`)}),t.msaa){let n=r.createFramebuffer();t.framebuffer=n,r.bindFramebuffer(r.FRAMEBUFFER,n),e.colorAttachments.forEach((e,n)=>{let i=r.createRenderbuffer();t.msaaRenderBuffer[n]=i})}else t.framebuffer=i;this._resizeColor(e,t)}_initDepth(e,t){let n=this._renderer;if(n.context.webGLVersion<2)throw Error(`[RenderTargetSystem] Depth-only render targets require WebGL2.`);let r=n.gl,i=r.createFramebuffer();t.resolveTargetFramebuffer=i,t.framebuffer=i,r.bindFramebuffer(r.FRAMEBUFFER,i),r.drawBuffers([r.NONE]),r.readBuffer(r.NONE)}_resizeColor(e,t){let n=e.colorAttachments[0].texture;if(t._attachedMipLevel=0,t._attachedLayer=0,e.colorAttachments.forEach((e,t)=>{t!==0&&e.texture.resize(n.width,n.height,n._resolution)}),t.msaa){let n=this._renderer,r=n.gl,i=t.framebuffer;r.bindFramebuffer(r.FRAMEBUFFER,i),e.colorAttachments.forEach((e,i)=>{let a=e.texture;n.texture.bindSource(a,0);let o=n.texture.getGlSource(a).internalFormat,s=t.msaaRenderBuffer[i];r.bindRenderbuffer(r.RENDERBUFFER,s),r.renderbufferStorageMultisample(r.RENDERBUFFER,4,o,a.pixelWidth,a.pixelHeight),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+i,r.RENDERBUFFER,s)})}}_attachDepthStencilTexture(e,t,n){let r=this._renderer,i=r.gl,a=e.depthStencilAttachment.texture,o=r.texture.getGlSource(a),s=o.texture,c=a.format,l;l=c===`depth24plus-stencil8`||c===`depth32float-stencil8`?i.DEPTH_STENCIL_ATTACHMENT:c===`stencil8`?i.STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,o.target===i.TEXTURE_2D?i.framebufferTexture2D(i.FRAMEBUFFER,l,i.TEXTURE_2D,s,t):o.target===i.TEXTURE_2D_ARRAY?i.framebufferTextureLayer(i.FRAMEBUFFER,l,s,t,n):o.target===i.TEXTURE_CUBE_MAP&&i.framebufferTexture2D(i.FRAMEBUFFER,l,i.TEXTURE_CUBE_MAP_POSITIVE_X+n,s,t)}_initStencil(e){if(e.framebuffer===null)return;let t=this._renderer.gl,n=t.createRenderbuffer();e.depthStencilRenderBuffer=n,t.bindRenderbuffer(t.RENDERBUFFER,n),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.RENDERBUFFER,n),this._resizeStencil(e)}_resizeStencil(e){let t=this._renderer.gl;t.bindRenderbuffer(t.RENDERBUFFER,e.depthStencilRenderBuffer),e.msaa?t.renderbufferStorageMultisample(t.RENDERBUFFER,4,t.DEPTH24_STENCIL8,e.width,e.height):t.renderbufferStorage(t.RENDERBUFFER,this._renderer.context.webGLVersion===2?t.DEPTH24_STENCIL8:t.DEPTH_STENCIL,e.width,e.height)}prerender(e){if(e.colorAttachments.length===0)return;let t=e.colorAttachments[0].texture.resource;this._renderer.context.multiView&&ge.test(t)&&this._renderer.context.ensureCanvasSize(t)}postrender(e){if(!this._renderer.context.multiView||e.colorAttachments.length===0)return;let t=e.colorAttachments[0].texture;if(ge.test(t.resource)){let e=this._renderer.context.canvas,n=t;n.context2D.drawImage(e,0,n.pixelHeight-e.height)}}_setDrawBuffers(e,t){let n=e.colorAttachments.length,r=this._drawBuffersCache[n];if(this._renderer.context.webGLVersion===1){let e=this._renderer.context.extensions.drawBuffers;e?e.drawBuffersWEBGL(r):E(`[RenderTexture] This WebGL1 context does not support rendering to multiple targets`)}else t.drawBuffers(r)}resetState(){this._boundFramebuffer=void 0,this._viewPortCache=new s,this._clearColorCache=[0,0,0,0]}bindFramebuffer(e){this._boundFramebuffer!==e&&(this._boundFramebuffer=e,this._renderer.gl.bindFramebuffer(this._renderer.gl.FRAMEBUFFER,e))}},mo=class extends Me{constructor(e){super(e),this.adaptor=new po,this.adaptor.init(e,this)}resetState(){this.adaptor.resetState()}};mo.extension={type:[m.WebGLSystem],name:`renderTarget`};var ho=class extends p{constructor(e,t){super(),this._resourceType=`textureView`,this._resourceId=i(`resource`),this.source=e,this.viewDescriptor=t,this._onChange=this._onChange.bind(this),this._onDestroy=this._onDestroy.bind(this),this.source.on(`change`,this._onChange),this.source.on(`destroy`,this._onDestroy)}_onChange(){this.emit(`change`,this)}_onDestroy(){this.destroy()}get destroyed(){return this.source.destroyed}destroy(){this.source&&(this.source.off(`change`,this._onChange),this.source.off(`destroy`,this._onDestroy)),this.emit(`destroy`,this),this.removeAllListeners()}};function go(e,n){let r=[],i=[`
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
                    `)}else if(d instanceof ht){let t=e._uniformBindMap[c][Number(u)];r.push(`
                    sS.bindUniformBlock(
                        resources[${u}],
                        '${t}',
                        ${e.glProgram._uniformBlockData[t].index}
                    );
                `)}else if(d instanceof t||d instanceof ho){let t=e._uniformBindMap[c][u],l=s.uniformData[t];l&&(a||(a=!0,i.push(`
                        var tS = r.texture;
                        `)),n._gl.uniform1i(l.location,o),r.push(`
                        tS.bind(resources[${u}], ${o});
                    `),o++)}}}let c=[...i,...r].join(`
`);return Function(`r`,`s`,`sD`,c)}var _o=class{constructor(e,t){this.program=e,this.uniformData=t,this.uniformGroups={},this.uniformDirtyGroups={},this.uniformBlockBindings={}}destroy(){this.uniformData=null,this.uniformGroups=null,this.uniformDirtyGroups=null,this.uniformBlockBindings=null,this.program=null}};function vo(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}function yo(e){let t=Array(e);for(let e=0;e<t.length;e++)t[e]=!1;return t}function bo(e,t){switch(e){case`float`:return 0;case`vec2`:return new Float32Array(2*t);case`vec3`:return new Float32Array(3*t);case`vec4`:return new Float32Array(4*t);case`int`:case`uint`:case`sampler2D`:case`sampler2DArray`:return 0;case`ivec2`:return new Int32Array(2*t);case`ivec3`:return new Int32Array(3*t);case`ivec4`:return new Int32Array(4*t);case`uvec2`:return new Uint32Array(2*t);case`uvec3`:return new Uint32Array(3*t);case`uvec4`:return new Uint32Array(4*t);case`bool`:return!1;case`bvec2`:return yo(2*t);case`bvec3`:return yo(3*t);case`bvec4`:return yo(4*t);case`mat2`:return new Float32Array([1,0,0,1]);case`mat3`:return new Float32Array([1,0,0,0,1,0,0,0,1]);case`mat4`:return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}return null}var xo=null,So={FLOAT:`float`,FLOAT_VEC2:`vec2`,FLOAT_VEC3:`vec3`,FLOAT_VEC4:`vec4`,INT:`int`,INT_VEC2:`ivec2`,INT_VEC3:`ivec3`,INT_VEC4:`ivec4`,UNSIGNED_INT:`uint`,UNSIGNED_INT_VEC2:`uvec2`,UNSIGNED_INT_VEC3:`uvec3`,UNSIGNED_INT_VEC4:`uvec4`,BOOL:`bool`,BOOL_VEC2:`bvec2`,BOOL_VEC3:`bvec3`,BOOL_VEC4:`bvec4`,FLOAT_MAT2:`mat2`,FLOAT_MAT3:`mat3`,FLOAT_MAT4:`mat4`,SAMPLER_2D:`sampler2D`,INT_SAMPLER_2D:`sampler2D`,UNSIGNED_INT_SAMPLER_2D:`sampler2D`,SAMPLER_2D_SHADOW:`sampler2DShadow`,SAMPLER_CUBE:`samplerCube`,INT_SAMPLER_CUBE:`samplerCube`,UNSIGNED_INT_SAMPLER_CUBE:`samplerCube`,SAMPLER_CUBE_SHADOW:`samplerCubeShadow`,SAMPLER_2D_ARRAY:`sampler2DArray`,INT_SAMPLER_2D_ARRAY:`sampler2DArray`,UNSIGNED_INT_SAMPLER_2D_ARRAY:`sampler2DArray`,SAMPLER_2D_ARRAY_SHADOW:`sampler2DArrayShadow`},Co={float:`float32`,vec2:`float32x2`,vec3:`float32x3`,vec4:`float32x4`,int:`sint32`,ivec2:`sint32x2`,ivec3:`sint32x3`,ivec4:`sint32x4`,uint:`uint32`,uvec2:`uint32x2`,uvec3:`uint32x3`,uvec4:`uint32x4`,bool:`uint32`,bvec2:`uint32x2`,bvec3:`uint32x3`,bvec4:`uint32x4`};function wo(e,t){if(!xo){let t=Object.keys(So);xo={};for(let n=0;n<t.length;++n){let r=t[n];xo[e[r]]=So[r]}}return xo[t]}function To(e,t){return Co[wo(e,t)]||`float32`}function Eo(e,t,n=!1){let r={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let i=t.getActiveAttrib(e,n);if(i.name.startsWith(`gl_`))continue;let a=To(t,i.type);r[i.name]={location:0,format:a,stride:v(a).stride,offset:0,instance:!1,start:0}}let a=Object.keys(r);if(n){a.sort((e,t)=>e>t?1:-1);for(let n=0;n<a.length;n++)r[a[n]].location=n,t.bindAttribLocation(e,n,a[n]);t.linkProgram(e)}else for(let n=0;n<a.length;n++)r[a[n]].location=t.getAttribLocation(e,a[n]);return r}function Do(e,t){if(!t.ACTIVE_UNIFORM_BLOCKS)return{};let n={},r=t.getProgramParameter(e,t.ACTIVE_UNIFORM_BLOCKS);for(let i=0;i<r;i++){let r=t.getActiveUniformBlockName(e,i);n[r]={name:r,index:t.getUniformBlockIndex(e,r),size:t.getActiveUniformBlockParameter(e,i,t.UNIFORM_BLOCK_DATA_SIZE)}}return n}function Oo(e,t){let n={},r=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<r;i++){let r=t.getActiveUniform(e,i),a=r.name.replace(/\[.*?\]$/,``),o=!!r.name.match(/\[.*?\]$/),s=wo(t,r.type);n[a]={name:a,index:i,type:s,size:r.size,isArray:o,value:bo(s,r.size)}}return n}function ko(e,t){let n=e.getShaderSource(t);if(n===null){console.error(`PixiJS Error: Could not retrieve shader source (WebGL context may be lost).`);return}let r=n.split(`
`).map((e,t)=>`${t}: ${e}`),i=e.getShaderInfoLog(t)??``,a=i.split(`
`),o={},s=a.map(e=>parseFloat(e.replace(/^ERROR\: 0\:([\d]+)\:.*$/,`$1`))).filter(e=>e&&!o[e]?(o[e]=!0,!0):!1),c=[``];s.forEach(e=>{r[e-1]=`%c${r[e-1]}%c`,c.push(`background: #FF0000; color:#FFFFFF; font-size: 10px`,`font-size: 10px`)}),c[0]=r.join(`
`),console.error(i),console.groupCollapsed(`click to view full shader code`),console.warn(...c),console.groupEnd()}function Ao(e,t,n,r){e.getProgramParameter(t,e.LINK_STATUS)||(e.getShaderParameter(n,e.COMPILE_STATUS)||ko(e,n),e.getShaderParameter(r,e.COMPILE_STATUS)||ko(e,r),console.error(`PixiJS Error: Could not initialize shader.`),e.getProgramInfoLog(t)!==``&&console.warn(`PixiJS Warning: gl.getProgramInfoLog()`,e.getProgramInfoLog(t)))}function jo(e,t){let n=vo(e,e.VERTEX_SHADER,t.vertex),r=vo(e,e.FRAGMENT_SHADER,t.fragment),i=e.createProgram();e.attachShader(i,n),e.attachShader(i,r);let a=t.transformFeedbackVaryings;a&&(typeof e.transformFeedbackVaryings==`function`?e.transformFeedbackVaryings(i,a.names,a.bufferMode===`separate`?e.SEPARATE_ATTRIBS:e.INTERLEAVED_ATTRIBS):E(`TransformFeedback is not supported but TransformFeedbackVaryings are given.`)),e.linkProgram(i),e.getProgramParameter(i,e.LINK_STATUS)||Ao(e,i,n,r),t._attributeData=Eo(i,e,!/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(t.vertex)),t._uniformData=Oo(i,e),t._uniformBlockData=Do(i,e),e.deleteShader(n),e.deleteShader(r);let o={};for(let n in t._uniformData){let r=t._uniformData[n];o[n]={location:e.getUniformLocation(i,n),value:bo(r.type,r.size)}}return new _o(i,o)}var Mo={textureCount:0,blockIndex:0},No=class{constructor(e){this._activeProgram=null,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._renderer=e}contextChange(e){this._gl=e,this._programDataHash=Object.create(null),this._shaderSyncFunctions=Object.create(null),this._activeProgram=null}bind(e,t){if(this._setProgram(e.glProgram),t)return;Mo.textureCount=0,Mo.blockIndex=0;let n=this._shaderSyncFunctions[e.glProgram._key];n||(n=this._shaderSyncFunctions[e.glProgram._key]=this._generateShaderSync(e,this)),this._renderer.buffer.nextBindBase(!!e.glProgram.transformFeedbackVaryings),n(this._renderer,e,Mo)}updateUniformGroup(e){this._renderer.uniformGroup.updateUniformGroup(e,this._activeProgram,Mo)}bindUniformBlock(e,t,n=0){let r=this._renderer.buffer,i=this._getProgramData(this._activeProgram),a=e._bufferResource;a||this._renderer.ubo.updateUniformGroup(e);let o=e.buffer,s=r.updateBuffer(o),c=r.freeLocationForBufferBase(s);if(a){let{offset:t,size:n}=e;t===0&&n===o.data.byteLength?r.bindBufferBase(s,c):r.bindBufferRange(s,c,t)}else r.getLastBindBaseLocation(s)!==c&&r.bindBufferBase(s,c);let l=this._activeProgram._uniformBlockData[t].index;i.uniformBlockBindings[n]!==c&&(i.uniformBlockBindings[n]=c,this._renderer.gl.uniformBlockBinding(i.program,l,c))}_setProgram(e){if(this._activeProgram===e)return;this._activeProgram=e;let t=this._getProgramData(e);this._gl.useProgram(t.program)}_getProgramData(e){return this._programDataHash[e._key]||this._createProgramData(e)}_createProgramData(e){let t=e._key;return this._programDataHash[t]=jo(this._gl,e),this._programDataHash[t]}destroy(){for(let e of Object.keys(this._programDataHash))this._programDataHash[e].destroy();this._programDataHash=null,this._shaderSyncFunctions=null,this._activeProgram=null,this._renderer=null,this._gl=null}_generateShaderSync(e,t){return go(e,t)}resetState(){this._activeProgram=null}};No.extension={type:[m.WebGLSystem],name:`shader`};var Po={f32:`if (cv !== v) {
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
        }`,"mat2x2<f32>":`gl.uniformMatrix2fv(location, false, v);`,"mat3x3<f32>":`gl.uniformMatrix3fv(location, false, v);`,"mat4x4<f32>":`gl.uniformMatrix4fv(location, false, v);`},Fo={f32:`gl.uniform1fv(location, v);`,"vec2<f32>":`gl.uniform2fv(location, v);`,"vec3<f32>":`gl.uniform3fv(location, v);`,"vec4<f32>":`gl.uniform4fv(location, v);`,"mat2x2<f32>":`gl.uniformMatrix2fv(location, false, v);`,"mat3x3<f32>":`gl.uniformMatrix3fv(location, false, v);`,"mat4x4<f32>":`gl.uniformMatrix4fv(location, false, v);`,i32:`gl.uniform1iv(location, v);`,"vec2<i32>":`gl.uniform2iv(location, v);`,"vec3<i32>":`gl.uniform3iv(location, v);`,"vec4<i32>":`gl.uniform4iv(location, v);`,u32:`gl.uniform1iv(location, v);`,"vec2<u32>":`gl.uniform2iv(location, v);`,"vec3<u32>":`gl.uniform3iv(location, v);`,"vec4<u32>":`gl.uniform4iv(location, v);`,bool:`gl.uniform1iv(location, v);`,"vec2<bool>":`gl.uniform2iv(location, v);`,"vec3<bool>":`gl.uniform3iv(location, v);`,"vec4<bool>":`gl.uniform4iv(location, v);`};function Io(e,t){let n=[`
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
                    `):e.uniforms[r]instanceof ht&&n.push(`
                        renderer.shader.bindBufferResource(uv.${r}, "${r}");
                    `);continue}let i=e.uniformStructures[r],a=!1;for(let e=0;e<it.length;e++){let t=it[e];if(i.type===t.type&&t.test(i)){n.push(`name = "${r}";`,it[e].uniform),a=!0;break}}if(!a){let e=(i.size===1?Po:Fo)[i.type].replace(`location`,`ud["${r}"].location`);n.push(`
            cu = ud["${r}"];
            cv = cu.value;
            v = uv["${r}"];
            ${e};`)}}return Function(`ud`,`uv`,`renderer`,`syncData`,n.join(`
`))}var Lo=class{constructor(e){this._cache={},this._uniformGroupSyncHash={},this._renderer=e,this.gl=null,this._cache={}}contextChange(e){this.gl=e}updateUniformGroup(e,t,n){let r=this._renderer.shader._getProgramData(t);(!e.isStatic||e._dirtyId!==r.uniformDirtyGroups[e.uid])&&(r.uniformDirtyGroups[e.uid]=e._dirtyId,this._getUniformSyncFunction(e,t)(r.uniformData,e.uniforms,this._renderer,n))}_getUniformSyncFunction(e,t){return this._uniformGroupSyncHash[e._signature]?.[t._key]||this._createUniformSyncFunction(e,t)}_createUniformSyncFunction(e,t){let n=this._uniformGroupSyncHash[e._signature]||(this._uniformGroupSyncHash[e._signature]={}),r=this._getSignature(e,t._uniformData,`u`);return this._cache[r]||(this._cache[r]=this._generateUniformsSync(e,t._uniformData)),n[t._key]=this._cache[r],n[t._key]}_generateUniformsSync(e,t){return Io(e,t)}_getSignature(e,t,n){let r=e.uniforms,i=[`${n}-`];for(let e in r)i.push(e),t[e]&&i.push(t[e].type);return i.join(`-`)}destroy(){this._renderer=null,this._cache=null}};Lo.extension={type:[m.WebGLSystem],name:`uniformGroup`};function Ro(e){let t={};if(t.normal=[e.ONE,e.ONE_MINUS_SRC_ALPHA],t.add=[e.ONE,e.ONE],t.multiply=[e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA],t.screen=[e.ONE,e.ONE_MINUS_SRC_COLOR,e.ONE,e.ONE_MINUS_SRC_ALPHA],t.none=[0,0],t[`normal-npm`]=[e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA],t[`add-npm`]=[e.SRC_ALPHA,e.ONE,e.ONE,e.ONE],t[`screen-npm`]=[e.SRC_ALPHA,e.ONE_MINUS_SRC_COLOR,e.ONE,e.ONE_MINUS_SRC_ALPHA],t.erase=[e.ZERO,e.ONE_MINUS_SRC_ALPHA],!(e instanceof b.get().getWebGLRenderingContext()))t.min=[e.ONE,e.ONE,e.ONE,e.ONE,e.MIN,e.MIN],t.max=[e.ONE,e.ONE,e.ONE,e.ONE,e.MAX,e.MAX];else{let n=e.getExtension(`EXT_blend_minmax`);n&&(t.min=[e.ONE,e.ONE,e.ONE,e.ONE,n.MIN_EXT,n.MIN_EXT],t.max=[e.ONE,e.ONE,e.ONE,e.ONE,n.MAX_EXT,n.MAX_EXT])}return t}var{BLEND:zo,OFFSET:Bo,CULLING:Vo,DEPTH_TEST:Ho,WINDING:Uo,DEPTH_MASK:Wo}=he,Go=class e{constructor(e){this._invertFrontFace=!1,this._renderer=e,this.gl=null,this.stateId=0,this.polygonOffset=0,this.blendMode=`none`,this._blendEq=!1,this.map=[],this.map[zo]=this.setBlend,this.map[Bo]=this.setOffset,this.map[Vo]=this.setCullFace,this.map[Ho]=this.setDepthTest,this.map[Uo]=this.setFrontFace,this.map[Wo]=this.setDepthMask,this.checks=[],this.defaultState=ve.for2d(),e.renderTarget.onRenderTargetChange.add(this)}onRenderTargetChange(e){this._invertFrontFace=this._renderer.renderTarget.isFrontFaceInverted(e,e.flipY),this._cullFace?this.setFrontFace(this._frontFace):this._frontFaceDirty=!0}contextChange(e){this.gl=e,this.blendModesMap=Ro(e),this.resetState()}set(e){if(e||(e=this.defaultState),this.stateId!==e.data){let t=this.stateId^e.data,n=0;for(;t;)t&1&&this.map[n].call(this,!!(e.data&1<<n)),t>>=1,n++;this.stateId=e.data}for(let t=0;t<this.checks.length;t++)this.checks[t](this,e)}forceState(e){e||(e=this.defaultState);for(let t=0;t<this.map.length;t++)this.map[t].call(this,!!(e.data&1<<t));for(let t=0;t<this.checks.length;t++)this.checks[t](this,e);this.stateId=e.data}setBlend(t){this._updateCheck(e._checkBlendMode,t),this.gl[t?`enable`:`disable`](this.gl.BLEND)}setOffset(t){this._updateCheck(e._checkPolygonOffset,t),this.gl[t?`enable`:`disable`](this.gl.POLYGON_OFFSET_FILL)}setDepthTest(e){this.gl[e?`enable`:`disable`](this.gl.DEPTH_TEST)}setDepthMask(e){this.gl.depthMask(e)}get depthMaskEnabled(){return!!(this.stateId&1<<Wo)}setCullFace(e){this._cullFace=e,this.gl[e?`enable`:`disable`](this.gl.CULL_FACE),this._cullFace&&this._frontFaceDirty&&this.setFrontFace(this._frontFace)}setFrontFace(e){this._frontFace=e,this._frontFaceDirty=!1;let t=this._invertFrontFace?!e:e;this._glFrontFace!==t&&(this._glFrontFace=t,this.gl.frontFace(this.gl[t?`CW`:`CCW`]))}setBlendMode(e){if(this.blendModesMap[e]||(e=`normal`),e===this.blendMode)return;this.blendMode=e;let t=this.blendModesMap[e],n=this.gl;t.length===2?n.blendFunc(t[0],t[1]):n.blendFuncSeparate(t[0],t[1],t[2],t[3]),t.length===6?(this._blendEq=!0,n.blendEquationSeparate(t[4],t[5])):this._blendEq&&(this._blendEq=!1,n.blendEquationSeparate(n.FUNC_ADD,n.FUNC_ADD))}setPolygonOffset(e,t){this.gl.polygonOffset(e,t)}resetState(){this._glFrontFace=!1,this._frontFace=!1,this._cullFace=!1,this._frontFaceDirty=!1,this._invertFrontFace=!1,this.gl.frontFace(this.gl.CCW),this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,!1),this.forceState(this.defaultState),this._blendEq=!0,this.blendMode=``,this.setBlendMode(`normal`)}_updateCheck(e,t){let n=this.checks.indexOf(e);t&&n===-1?this.checks.push(e):!t&&n!==-1&&this.checks.splice(n,1)}static _checkBlendMode(e,t){e.setBlendMode(t.blendMode)}static _checkPolygonOffset(e,t){e.setPolygonOffset(1,t.polygonOffset)}destroy(){this.gl=null,this.checks.length=0,this._renderer=null}};Go.extension={type:[m.WebGLSystem],name:`state`};var Ko=Go,qo=class{constructor(e){this.target=qa.TEXTURE_2D,this._layerInitMask=0,this.texture=e,this.width=-1,this.height=-1,this.type=V.UNSIGNED_BYTE,this.internalFormat=Ka.RGBA,this.format=Ka.RGBA,this.samplerType=0}destroy(){}},Jo={id:`buffer`,upload(e,t,n,r,i,a=!1){let o=i||t.target;!a&&t.width===e.width&&t.height===e.height?n.texSubImage2D(o,0,0,0,e.width,e.height,t.format,t.type,e.resource):n.texImage2D(o,0,t.internalFormat,e.width,e.height,0,t.format,t.type,e.resource),t.width=e.width,t.height=e.height}},Yo={"bc1-rgba-unorm":!0,"bc1-rgba-unorm-srgb":!0,"bc2-rgba-unorm":!0,"bc2-rgba-unorm-srgb":!0,"bc3-rgba-unorm":!0,"bc3-rgba-unorm-srgb":!0,"bc4-r-unorm":!0,"bc4-r-snorm":!0,"bc5-rg-unorm":!0,"bc5-rg-snorm":!0,"bc6h-rgb-ufloat":!0,"bc6h-rgb-float":!0,"bc7-rgba-unorm":!0,"bc7-rgba-unorm-srgb":!0,"etc2-rgb8unorm":!0,"etc2-rgb8unorm-srgb":!0,"etc2-rgb8a1unorm":!0,"etc2-rgb8a1unorm-srgb":!0,"etc2-rgba8unorm":!0,"etc2-rgba8unorm-srgb":!0,"eac-r11unorm":!0,"eac-r11snorm":!0,"eac-rg11unorm":!0,"eac-rg11snorm":!0,"astc-4x4-unorm":!0,"astc-4x4-unorm-srgb":!0,"astc-5x4-unorm":!0,"astc-5x4-unorm-srgb":!0,"astc-5x5-unorm":!0,"astc-5x5-unorm-srgb":!0,"astc-6x5-unorm":!0,"astc-6x5-unorm-srgb":!0,"astc-6x6-unorm":!0,"astc-6x6-unorm-srgb":!0,"astc-8x5-unorm":!0,"astc-8x5-unorm-srgb":!0,"astc-8x6-unorm":!0,"astc-8x6-unorm-srgb":!0,"astc-8x8-unorm":!0,"astc-8x8-unorm-srgb":!0,"astc-10x5-unorm":!0,"astc-10x5-unorm-srgb":!0,"astc-10x6-unorm":!0,"astc-10x6-unorm-srgb":!0,"astc-10x8-unorm":!0,"astc-10x8-unorm-srgb":!0,"astc-10x10-unorm":!0,"astc-10x10-unorm-srgb":!0,"astc-12x10-unorm":!0,"astc-12x10-unorm-srgb":!0,"astc-12x12-unorm":!0,"astc-12x12-unorm-srgb":!0},Xo={id:`compressed`,upload(e,t,n,r,i,a){let o=i??t.target;n.pixelStorei(n.UNPACK_ALIGNMENT,4);let s=e.pixelWidth,c=e.pixelHeight,l=!!Yo[e.format];for(let r=0;r<e.resource.length;r++){let i=e.resource[r];l?n.compressedTexImage2D(o,r,t.internalFormat,s,c,0,i):n.texImage2D(o,r,t.internalFormat,s,c,0,t.format,t.type,i),s=Math.max(s>>1,1),c=Math.max(c>>1,1)}}},Zo=[`right`,`left`,`top`,`bottom`,`front`,`back`];function Qo(e){return{id:`cube`,upload(t,n,r,i){let a=t.faces;for(let t=0;t<Zo.length;t++){let o=a[Zo[t]];o.resource&&((e[o.uploadMethodId]||e.image).upload(o,n,r,i,qa.TEXTURE_CUBE_MAP_POSITIVE_X+t,!(n._layerInitMask&1<<t)),n._layerInitMask|=1<<t)}n.width=t.pixelWidth,n.height=t.pixelHeight}}}var $o={id:`image`,upload(e,t,n,r,i,a=!1){let o=i||t.target,s=e.pixelWidth,c=e.pixelHeight,l=e.resourceWidth,u=e.resourceHeight,d=r===2,f=a||t.width!==s||t.height!==c,p=l>=s&&u>=c,m=e.resource;(d?es:ts)(n,o,t,s,c,l,u,m,f,p),t.width=s,t.height=c}};function es(e,t,n,r,i,a,o,s,c,l){if(!l){c&&e.texImage2D(t,0,n.internalFormat,r,i,0,n.format,n.type,null),e.texSubImage2D(t,0,0,0,a,o,n.format,n.type,s);return}if(!c){e.texSubImage2D(t,0,0,0,n.format,n.type,s);return}e.texImage2D(t,0,n.internalFormat,r,i,0,n.format,n.type,s)}function ts(e,t,n,r,i,a,o,s,c,l){if(!l){c&&e.texImage2D(t,0,n.internalFormat,r,i,0,n.format,n.type,null),e.texSubImage2D(t,0,0,0,n.format,n.type,s);return}if(!c){e.texSubImage2D(t,0,0,0,n.format,n.type,s);return}e.texImage2D(t,0,n.internalFormat,n.format,n.type,s)}var ns=ea(),rs={id:`video`,upload(e,t,n,r,i,a=ns){if(!e.isValid){let e=i??t.target;n.texImage2D(e,0,t.internalFormat,1,1,0,t.format,t.type,null);return}$o.upload(e,t,n,r,i,a)}},is={linear:9729,nearest:9728},as={linear:{linear:9987,nearest:9985},nearest:{linear:9986,nearest:9984}},os={"clamp-to-edge":33071,repeat:10497,"mirror-repeat":33648},ss={never:512,less:513,equal:514,"less-equal":515,greater:516,"not-equal":517,"greater-equal":518,always:519};function cs(e,t,n,r,i,a,o,s){let c=a;if(!s||e.addressModeU!==`repeat`||e.addressModeV!==`repeat`||e.addressModeW!==`repeat`){let n=os[o?`clamp-to-edge`:e.addressModeU],r=os[o?`clamp-to-edge`:e.addressModeV],a=os[o?`clamp-to-edge`:e.addressModeW];t[i](c,t.TEXTURE_WRAP_S,n),t[i](c,t.TEXTURE_WRAP_T,r),t.TEXTURE_WRAP_R&&t[i](c,t.TEXTURE_WRAP_R,a)}if((!s||e.magFilter!==`linear`)&&t[i](c,t.TEXTURE_MAG_FILTER,is[e.magFilter]),n){if(!s||e.mipmapFilter!==`linear`){let n=as[e.minFilter][e.mipmapFilter];t[i](c,t.TEXTURE_MIN_FILTER,n)}}else t[i](c,t.TEXTURE_MIN_FILTER,is[e.minFilter]);if(r&&e.maxAnisotropy>1){let n=Math.min(e.maxAnisotropy,t.getParameter(r.MAX_TEXTURE_MAX_ANISOTROPY_EXT));t[i](c,r.TEXTURE_MAX_ANISOTROPY_EXT,n)}e.compare?(t[i](c,t.TEXTURE_COMPARE_FUNC,ss[e.compare]),t[i](c,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE)):s||t[i](c,t.TEXTURE_COMPARE_MODE,t.NONE)}function ls(e){return{r8unorm:e.RED,r8snorm:e.RED,r8uint:e.RED,r8sint:e.RED,r16uint:e.RED,r16sint:e.RED,r16float:e.RED,rg8unorm:e.RG,rg8snorm:e.RG,rg8uint:e.RG,rg8sint:e.RG,r32uint:e.RED,r32sint:e.RED,r32float:e.RED,rg16uint:e.RG,rg16sint:e.RG,rg16float:e.RG,rgba8unorm:e.RGBA,"rgba8unorm-srgb":e.RGBA,rgba8snorm:e.RGBA,rgba8uint:e.RGBA,rgba8sint:e.RGBA,bgra8unorm:e.RGBA,"bgra8unorm-srgb":e.RGBA,rgb9e5ufloat:e.RGB,rgb10a2unorm:e.RGBA,rg11b10ufloat:e.RGB,rg32uint:e.RG,rg32sint:e.RG,rg32float:e.RG,rgba16uint:e.RGBA,rgba16sint:e.RGBA,rgba16float:e.RGBA,rgba32uint:e.RGBA,rgba32sint:e.RGBA,rgba32float:e.RGBA,stencil8:e.STENCIL_INDEX8,depth16unorm:e.DEPTH_COMPONENT,depth24plus:e.DEPTH_COMPONENT,"depth24plus-stencil8":e.DEPTH_STENCIL,depth32float:e.DEPTH_COMPONENT,"depth32float-stencil8":e.DEPTH_STENCIL}}function us(e,t){let n={},r=e.RGBA;return e instanceof b.get().getWebGLRenderingContext()?t.srgb&&(n={"rgba8unorm-srgb":t.srgb.SRGB8_ALPHA8_EXT,"bgra8unorm-srgb":t.srgb.SRGB8_ALPHA8_EXT}):(n={"rgba8unorm-srgb":e.SRGB8_ALPHA8,"bgra8unorm-srgb":e.SRGB8_ALPHA8},r=e.RGBA8),{r8unorm:e.R8,r8snorm:e.R8_SNORM,r8uint:e.R8UI,r8sint:e.R8I,r16uint:e.R16UI,r16sint:e.R16I,r16float:e.R16F,rg8unorm:e.RG8,rg8snorm:e.RG8_SNORM,rg8uint:e.RG8UI,rg8sint:e.RG8I,r32uint:e.R32UI,r32sint:e.R32I,r32float:e.R32F,rg16uint:e.RG16UI,rg16sint:e.RG16I,rg16float:e.RG16F,rgba8unorm:e.RGBA,...n,rgba8snorm:e.RGBA8_SNORM,rgba8uint:e.RGBA8UI,rgba8sint:e.RGBA8I,bgra8unorm:r,rgb9e5ufloat:e.RGB9_E5,rgb10a2unorm:e.RGB10_A2,rg11b10ufloat:e.R11F_G11F_B10F,rg32uint:e.RG32UI,rg32sint:e.RG32I,rg32float:e.RG32F,rgba16uint:e.RGBA16UI,rgba16sint:e.RGBA16I,rgba16float:e.RGBA16F,rgba32uint:e.RGBA32UI,rgba32sint:e.RGBA32I,rgba32float:e.RGBA32F,stencil8:e.STENCIL_INDEX8,depth16unorm:e.DEPTH_COMPONENT16,depth24plus:e.DEPTH_COMPONENT24,"depth24plus-stencil8":e.DEPTH24_STENCIL8,depth32float:e.DEPTH_COMPONENT32F,"depth32float-stencil8":e.DEPTH32F_STENCIL8,...t.s3tc?{"bc1-rgba-unorm":t.s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT,"bc2-rgba-unorm":t.s3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT,"bc3-rgba-unorm":t.s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT}:{},...t.s3tc_sRGB?{"bc1-rgba-unorm-srgb":t.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT,"bc2-rgba-unorm-srgb":t.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT,"bc3-rgba-unorm-srgb":t.s3tc_sRGB.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}:{},...t.rgtc?{"bc4-r-unorm":t.rgtc.COMPRESSED_RED_RGTC1_EXT,"bc4-r-snorm":t.rgtc.COMPRESSED_SIGNED_RED_RGTC1_EXT,"bc5-rg-unorm":t.rgtc.COMPRESSED_RED_GREEN_RGTC2_EXT,"bc5-rg-snorm":t.rgtc.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}:{},...t.bptc?{"bc6h-rgb-float":t.bptc.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT,"bc6h-rgb-ufloat":t.bptc.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT,"bc7-rgba-unorm":t.bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,"bc7-rgba-unorm-srgb":t.bptc.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT}:{},...t.etc?{"etc2-rgb8unorm":t.etc.COMPRESSED_RGB8_ETC2,"etc2-rgb8unorm-srgb":t.etc.COMPRESSED_SRGB8_ETC2,"etc2-rgb8a1unorm":t.etc.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgb8a1unorm-srgb":t.etc.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2,"etc2-rgba8unorm":t.etc.COMPRESSED_RGBA8_ETC2_EAC,"etc2-rgba8unorm-srgb":t.etc.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC,"eac-r11unorm":t.etc.COMPRESSED_R11_EAC,"eac-rg11unorm":t.etc.COMPRESSED_SIGNED_RG11_EAC}:{},...t.astc?{"astc-4x4-unorm":t.astc.COMPRESSED_RGBA_ASTC_4x4_KHR,"astc-4x4-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR,"astc-5x4-unorm":t.astc.COMPRESSED_RGBA_ASTC_5x4_KHR,"astc-5x4-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR,"astc-5x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_5x5_KHR,"astc-5x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR,"astc-6x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_6x5_KHR,"astc-6x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR,"astc-6x6-unorm":t.astc.COMPRESSED_RGBA_ASTC_6x6_KHR,"astc-6x6-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR,"astc-8x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_8x5_KHR,"astc-8x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR,"astc-8x6-unorm":t.astc.COMPRESSED_RGBA_ASTC_8x6_KHR,"astc-8x6-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR,"astc-8x8-unorm":t.astc.COMPRESSED_RGBA_ASTC_8x8_KHR,"astc-8x8-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR,"astc-10x5-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x5_KHR,"astc-10x5-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR,"astc-10x6-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x6_KHR,"astc-10x6-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR,"astc-10x8-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x8_KHR,"astc-10x8-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR,"astc-10x10-unorm":t.astc.COMPRESSED_RGBA_ASTC_10x10_KHR,"astc-10x10-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR,"astc-12x10-unorm":t.astc.COMPRESSED_RGBA_ASTC_12x10_KHR,"astc-12x10-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR,"astc-12x12-unorm":t.astc.COMPRESSED_RGBA_ASTC_12x12_KHR,"astc-12x12-unorm-srgb":t.astc.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR}:{}}}function ds(e){return{r8unorm:e.UNSIGNED_BYTE,r8snorm:e.BYTE,r8uint:e.UNSIGNED_BYTE,r8sint:e.BYTE,r16uint:e.UNSIGNED_SHORT,r16sint:e.SHORT,r16float:e.HALF_FLOAT,rg8unorm:e.UNSIGNED_BYTE,rg8snorm:e.BYTE,rg8uint:e.UNSIGNED_BYTE,rg8sint:e.BYTE,r32uint:e.UNSIGNED_INT,r32sint:e.INT,r32float:e.FLOAT,rg16uint:e.UNSIGNED_SHORT,rg16sint:e.SHORT,rg16float:e.HALF_FLOAT,rgba8unorm:e.UNSIGNED_BYTE,"rgba8unorm-srgb":e.UNSIGNED_BYTE,rgba8snorm:e.BYTE,rgba8uint:e.UNSIGNED_BYTE,rgba8sint:e.BYTE,bgra8unorm:e.UNSIGNED_BYTE,"bgra8unorm-srgb":e.UNSIGNED_BYTE,rgb9e5ufloat:e.UNSIGNED_INT_5_9_9_9_REV,rgb10a2unorm:e.UNSIGNED_INT_2_10_10_10_REV,rg11b10ufloat:e.UNSIGNED_INT_10F_11F_11F_REV,rg32uint:e.UNSIGNED_INT,rg32sint:e.INT,rg32float:e.FLOAT,rgba16uint:e.UNSIGNED_SHORT,rgba16sint:e.SHORT,rgba16float:e.HALF_FLOAT,rgba32uint:e.UNSIGNED_INT,rgba32sint:e.INT,rgba32float:e.FLOAT,stencil8:e.UNSIGNED_BYTE,depth16unorm:e.UNSIGNED_SHORT,depth24plus:e.UNSIGNED_INT,"depth24plus-stencil8":e.UNSIGNED_INT_24_8,depth32float:e.FLOAT,"depth32float-stencil8":e.FLOAT_32_UNSIGNED_INT_24_8_REV}}function fs(e){return{"2d":e.TEXTURE_2D,cube:e.TEXTURE_CUBE_MAP,"1d":null,"3d":e?.TEXTURE_3D||null,"2d-array":e?.TEXTURE_2D_ARRAY||null,"cube-array":e?.TEXTURE_CUBE_MAP_ARRAY||null}}var ps=4,ms=class e{constructor(t){this._glSamplers=Object.create(null),this._boundTextures=[],this._activeTextureLocation=-1,this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1,this._useSeparateSamplers=!1,this._renderer=t,this._managedTextures=new nt({renderer:t,type:`resource`,onUnload:this.onSourceUnload.bind(this),name:`glTexture`});let n={image:$o,buffer:Jo,video:rs,compressed:Xo,...e.uploadExtensions};this._uploads={...n,cube:Qo(n)}}get managedTextures(){return Object.values(this._managedTextures.items)}contextChange(e){this._gl=e,this._mapFormatToInternalFormat||(this._mapFormatToInternalFormat=us(e,this._renderer.context.extensions),this._mapFormatToType=ds(e),this._mapFormatToFormat=ls(e),this._mapViewDimensionToGlTarget=fs(e)),this._managedTextures.removeAll(!0),this._glSamplers=Object.create(null),this._boundSamplers=Object.create(null),this._premultiplyAlpha=!1;for(let e=0;e<16;e++)this.bind(T.EMPTY,e)}initSource(e){this.bind(e)}bind(e,t=0){let n=e.source;e?(this.bindSource(n,t),this._useSeparateSamplers&&this._bindSampler(n.style,t)):(this.bindSource(null,t),this._useSeparateSamplers&&this._bindSampler(null,t))}bindSource(e,t=0){let n=this._gl;if(e._gcLastUsed=this._renderer.gc.now,this._boundTextures[t]!==e){this._boundTextures[t]=e,this._activateLocation(t),e||(e=T.EMPTY.source);let r=this.getGlSource(e);n.bindTexture(r.target,r.texture)}}_bindSampler(e,t=0){let n=this._gl;if(!e){this._boundSamplers[t]=null,n.bindSampler(t,null);return}let r=this._getGlSampler(e);this._boundSamplers[t]!==r&&(this._boundSamplers[t]=r,n.bindSampler(t,r))}unbind(e){let t=e.source,n=this._boundTextures,r=this._gl;for(let e=0;e<n.length;e++)if(n[e]===t){this._activateLocation(e);let i=this.getGlSource(t);r.bindTexture(i.target,null),n[e]=null}}_activateLocation(e){this._activeTextureLocation!==e&&(this._activeTextureLocation=e,this._gl.activeTexture(this._gl.TEXTURE0+e))}_initSource(e){let t=this._gl,n=new qo(t.createTexture());if(n.type=this._mapFormatToType[e.format],n.internalFormat=this._mapFormatToInternalFormat[e.format],n.format=this._mapFormatToFormat[e.format],n.target=this._mapViewDimensionToGlTarget[e.viewDimension],n.target===null)throw Error(`Unsupported view dimension: ${e.viewDimension} with this webgl version: ${this._renderer.context.webGLVersion}`);if(e.autoGenerateMipmaps&&(this._renderer.context.supports.nonPowOf2mipmaps||e.isPowerOfTwo)){let t=Math.max(e.width,e.height);e.mipLevelCount=Math.floor(Math.log2(t))+1}return e._gpuData[this._renderer.uid]=n,this._managedTextures.add(e)&&(e.on(`update`,this.onSourceUpdate,this),e.on(`resize`,this.onSourceUpdate,this),e.on(`styleChange`,this.onStyleChange,this),e.on(`updateMipmaps`,this.onUpdateMipmaps,this)),this.onSourceUpdate(e),this.updateStyle(e,!1),n}onStyleChange(e){this.updateStyle(e,!1)}updateStyle(e,t){let n=this._gl,r=this.getGlSource(e);n.bindTexture(r.target,r.texture),this._boundTextures[this._activeTextureLocation]=e,cs(e.style,n,e.mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,`texParameteri`,r.target,!this._renderer.context.supports.nonPowOf2wrapping&&!e.isPowerOfTwo,t)}onSourceUnload(e,t=!1){let n=e._gpuData[this._renderer.uid];n&&(t||(this.unbind(e),this._gl.deleteTexture(n.texture)),e.off(`update`,this.onSourceUpdate,this),e.off(`resize`,this.onSourceUpdate,this),e.off(`styleChange`,this.onStyleChange,this),e.off(`updateMipmaps`,this.onUpdateMipmaps,this))}onSourceUpdate(e){let t=this._gl,n=this.getGlSource(e);t.bindTexture(n.target,n.texture),this._boundTextures[this._activeTextureLocation]=e;let r=e.alphaMode===`premultiply-alpha-on-upload`;if(this._premultiplyAlpha!==r&&(this._premultiplyAlpha=r,t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r)),this._uploads[e.uploadMethodId])this._uploads[e.uploadMethodId].upload(e,n,t,this._renderer.context.webGLVersion);else if(n.target===t.TEXTURE_2D)this._initEmptyTexture2D(n,e);else if(n.target===t.TEXTURE_2D_ARRAY)this._initEmptyTexture2DArray(n,e);else if(n.target===t.TEXTURE_CUBE_MAP)this._initEmptyTextureCube(n,e);else throw Error(`[GlTextureSystem] Unsupported texture target for empty allocation.`);this._applyMipRange(n,e),e.autoGenerateMipmaps&&e.mipLevelCount>1&&this.onUpdateMipmaps(e,!1)}onUpdateMipmaps(e,t=!0){t&&this.bindSource(e,0);let n=this.getGlSource(e);this._gl.generateMipmap(n.target)}_initEmptyTexture2D(e,t){let n=this._gl;n.texImage2D(n.TEXTURE_2D,0,e.internalFormat,t.pixelWidth,t.pixelHeight,0,e.format,e.type,null);let r=Math.max(t.pixelWidth>>1,1),i=Math.max(t.pixelHeight>>1,1);for(let a=1;a<t.mipLevelCount;a++)n.texImage2D(n.TEXTURE_2D,a,e.internalFormat,r,i,0,e.format,e.type,null),r=Math.max(r>>1,1),i=Math.max(i>>1,1)}_initEmptyTexture2DArray(e,t){if(this._renderer.context.webGLVersion!==2)throw Error(`[GlTextureSystem] TEXTURE_2D_ARRAY requires WebGL2.`);let n=this._gl,r=Math.max(t.arrayLayerCount|0,1);n.texImage3D(n.TEXTURE_2D_ARRAY,0,e.internalFormat,t.pixelWidth,t.pixelHeight,r,0,e.format,e.type,null);let i=Math.max(t.pixelWidth>>1,1),a=Math.max(t.pixelHeight>>1,1);for(let o=1;o<t.mipLevelCount;o++)n.texImage3D(n.TEXTURE_2D_ARRAY,o,e.internalFormat,i,a,r,0,e.format,e.type,null),i=Math.max(i>>1,1),a=Math.max(a>>1,1)}_initEmptyTextureCube(e,t){let n=this._gl;for(let r=0;r<6;r++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+r,0,e.internalFormat,t.pixelWidth,t.pixelHeight,0,e.format,e.type,null);let r=Math.max(t.pixelWidth>>1,1),i=Math.max(t.pixelHeight>>1,1);for(let a=1;a<t.mipLevelCount;a++){for(let t=0;t<6;t++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+t,a,e.internalFormat,r,i,0,e.format,e.type,null);r=Math.max(r>>1,1),i=Math.max(i>>1,1)}}_applyMipRange(e,t){if(this._renderer.context.webGLVersion!==2||t.mipLevelCount<=1)return;let n=this._gl,r=Math.max((t.mipLevelCount|0)-1,0);n.texParameteri(e.target,n.TEXTURE_BASE_LEVEL,0),n.texParameteri(e.target,n.TEXTURE_MAX_LEVEL,r)}_initSampler(e){let t=this._gl,n=this._gl.createSampler();return this._glSamplers[e._resourceId]=n,cs(e,t,this._boundTextures[this._activeTextureLocation].mipLevelCount>1,this._renderer.context.extensions.anisotropicFiltering,`samplerParameteri`,n,!1,!0),this._glSamplers[e._resourceId]}_getGlSampler(e){return this._glSamplers[e._resourceId]||this._initSampler(e)}getGlSource(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]||this._initSource(e)}generateCanvas(e){let{pixels:t,width:n,height:r}=this.getPixels(e),i=b.get().createCanvas();i.width=n,i.height=r;let a=i.getContext(`2d`);if(a){let e=a.createImageData(n,r);e.data.set(t),a.putImageData(e,0,0)}return i}getPixels(e){let t=e.source.resolution,n=e.frame,r=Math.max(Math.round(n.width*t),1),i=Math.max(Math.round(n.height*t),1),a=new Uint8Array(ps*r*i),o=this._renderer,s=o.renderTarget.getRenderTarget(e),c=o.renderTarget.getGpuRenderTarget(s),l=o.gl;return o.renderTarget.adaptor.bindFramebuffer(c.resolveTargetFramebuffer),l.readPixels(Math.round(n.x*t),Math.round(n.y*t),r,i,l.RGBA,l.UNSIGNED_BYTE,a),{pixels:new Uint8ClampedArray(a.buffer),width:r,height:i}}destroy(){this._managedTextures.destroy(),this._glSamplers=null,this._boundTextures=null,this._boundSamplers=null,this._mapFormatToInternalFormat=null,this._mapFormatToType=null,this._mapFormatToFormat=null,this._uploads=null,this._renderer=null}resetState(){this._activeTextureLocation=-1,this._boundTextures.fill(T.EMPTY.source),this._boundSamplers=Object.create(null);let e=this._gl;this._premultiplyAlpha=!1,e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,this._premultiplyAlpha)}};ms.extension={type:[m.WebGLSystem],name:`texture`},ms.uploadExtensions=Object.create(null);var hs=ms;r.handleByMap(m.TextureUploaderWebGL,hs.uploadExtensions);var gs=class{contextChange(e){let t=new C({uColor:{value:new Float32Array([1,1,1,1]),type:`vec4<f32>`},uTransformMatrix:{value:new D,type:`mat3x3<f32>`},uRound:{value:0,type:`f32`}}),n=e.limits.maxBatchableTextures,r=rt({name:`graphics`,bits:[Xe,tt(n),st,Ge]});this.shader=new g({glProgram:r,resources:{localUniforms:t,batchSamplers:et(n)}})}execute(e,t){let n=t.context,r=n.customShader||this.shader,i=e.renderer,{batcher:a,instructions:o}=i.graphicsContext.getContextRenderData(n);r.groups[0]=i.globalUniforms.bindGroup,i.state.set(e.state),i.shader.bind(r),i.geometry.bind(a.geometry,r.glProgram);let s=o.instructions;for(let e=0;e<o.instructionSize;e++){let t=s[e];if(t.size){for(let e=0;e<t.textures.count;e++)i.texture.bind(t.textures.textures[e],e);i.geometry.draw(t.topology,t.size,t.start)}}}destroy(){this.shader.destroy(!0),this.shader=null}};gs.extension={type:[m.WebGLPipesAdaptor],name:`graphics`};var _s=class{init(){let e=rt({name:`mesh`,bits:[st,gt,Ge]});this._shader=new g({glProgram:e,resources:{uTexture:T.EMPTY.source,textureUniforms:{uTextureMatrix:{type:`mat3x3<f32>`,value:new D}}}})}execute(e,t){let n=e.renderer,r=t._shader;if(!r){r=this._shader;let e=t.texture,n=e.source;r.resources.uTexture=n,r.resources.uSampler=n.style,r.resources.textureUniforms.uniforms.uTextureMatrix=e.textureMatrix.mapCoord}else if(!r.glProgram){E(`Mesh shader has no glProgram`,t.shader);return}r.groups[100]=n.globalUniforms.bindGroup,r.groups[101]=e.localUniformsBindGroup,n.encoder.draw({geometry:t._geometry,shader:r,state:t.state})}destroy(){this._shader.destroy(!0),this._shader=null}};_s.extension={type:[m.WebGLPipesAdaptor],name:`mesh`};var vs=ne({WebGLRenderer:()=>Es}),ys=[...Ae,fo,to,Ga,io,Ua,hs,mo,Qa,Lo,No,ro,Ko,oo,no],bs=[...Oe],xs=[ra,_s,gs],Ss=[],Cs=[],ws=[],Ts=[];r.handleByNamedList(m.WebGLSystem,Ss),r.handleByNamedList(m.WebGLPipes,Cs),r.handleByNamedList(m.WebGLPipesAdaptor,ws),r.handleByNamedList(m.WebGLLoader,Ts),r.add(...ys,...bs,...xs);var Es=class extends R{constructor(){let e={name:`webgl`,type:ie.WEBGL,systems:Ss,renderPipes:Cs,renderPipeAdaptors:ws,loaders:Ts};super(e)}},Ds=class{constructor(e,t){this.autoGarbageCollect=!0,this._gpuData=null,this.gpuBindGroup=e,this._gcLastUsed=t}unload(){this.gpuBindGroup=null}},Os=class{constructor(e){this._hash=Object.create(null),this._renderer=e,e.gc.addResourceHash(this,`_hash`,`resource`),e.gc.addCollection(this,`_hash`,`hash`)}contextChange(e){this._gpu=e,this._hash=Object.create(null)}getBindGroup(e,t,n){let r=`${e._key}:${t._layoutKey<<4|n}`,i=this._hash[r];return i?(i._gcLastUsed=this._renderer.gc.now,i.gpuBindGroup):this._createBindGroup(r,e,t,n)}_createBindGroup(e,t,n,r){let i=this._gpu.device,a=n.layout[r],o=[],s=this._renderer;for(let e in a){let n=t.resources[e]??t.resources[a[e]];if(!n||n.destroyed)throw Error(`[BindGroup] the resource bound as '${e}' was destroyed while a shader still uses it. Remove it from the shader before destroying it.`);let r;if(n._resourceType===`uniformGroup`){let e=n;s.ubo.updateUniformGroup(e);let t=e.buffer;r={buffer:s.buffer.getGPUBuffer(t),offset:0,size:t.descriptor.size}}else if(n._resourceType===`buffer`){let e=n;r={buffer:s.buffer.getGPUBuffer(e),offset:0,size:e.descriptor.size}}else if(n._resourceType===`bufferResource`){let e=n;r={buffer:s.buffer.getGPUBuffer(e.buffer),offset:e.offset,size:e.size??e.buffer.descriptor.size}}else if(n._resourceType===`textureSampler`){let e=n;r=s.texture.getGpuSampler(e)}else if(n._resourceType===`textureSource`){let e=n;r=s.texture.getTextureView(e)}else if(n._resourceType===`textureView`){let e=n;r=s.texture.getTextureView(e.source,e.viewDescriptor)}o.push({binding:a[e],resource:r})}let c=s.shader.getProgramData(n).bindGroups[r],l=i.createBindGroup({layout:c,entries:o});return this._hash[e]=new Ds(l,s.gc.now),l}destroy(){this._hash=null,this._renderer=null}};Os.extension={type:[m.WebGPUSystem],name:`bindGroup`};var ks=class{constructor(e){this.gpuBuffer=e}destroy(){this.gpuBuffer.destroy(),this.gpuBuffer=null}},As=class{constructor(e){this._renderer=e,this._managedBuffers=new nt({renderer:e,type:`resource`,onUnload:this.onBufferUnload.bind(this),name:`gpuBuffer`})}contextChange(e){this._gpu=e,this.destroyAll()}getGPUBuffer(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]?.gpuBuffer||this.createGPUBuffer(e)}updateBuffer(e){let t=this.getGPUBuffer(e),n=e.data;return e._updateID&&n&&(e._updateID=0,this._gpu.device.queue.writeBuffer(t,e._updateOffset,n.buffer,n.byteOffset+e._updateOffset,(e._updateSize||n.byteLength)+3&-4)),t}destroyAll(){this._managedBuffers.removeAll()}onBufferUnload(e){e.off(`update`,this.updateBuffer,this),e.off(`change`,this.onBufferChange,this)}createGPUBuffer(e){let t=this._gpu.device.createBuffer(e.descriptor);return e._updateID=0,e.data&&(Ze(e.data.buffer,t.getMappedRange(),e.data.byteOffset,e.data.byteLength),t.unmap()),e._gpuData[this._renderer.uid]=new ks(t),this._managedBuffers.add(e)&&(e.on(`update`,this.updateBuffer,this),e.on(`change`,this.onBufferChange,this)),t}onBufferChange(e){this._managedBuffers.remove(e),e._updateID=0,this.createGPUBuffer(e)}destroy(){this._managedBuffers.destroy(),this._renderer=null,this._gpu=null}};As.extension={type:[m.WebGPUSystem],name:`buffer`};var js=class{constructor({minUniformOffsetAlignment:e}){this._minUniformOffsetAlignment=256,this.byteIndex=0,this._minUniformOffsetAlignment=e,this.data=new Float32Array(65535)}clear(){this.byteIndex=0}addEmptyGroup(e){if(e>this._minUniformOffsetAlignment/4)throw Error(`UniformBufferBatch: array is too large: ${e*4}`);let t=this.byteIndex,n=t+e*4;if(n=Math.ceil(n/this._minUniformOffsetAlignment)*this._minUniformOffsetAlignment,n>this.data.length*4)throw Error(`UniformBufferBatch: ubo batch got too big`);return this.byteIndex=n,t}addGroup(e){let t=this.addEmptyGroup(e.length);for(let n=0;n<e.length;n++)this.data[t/4+n]=e[n];return t}destroy(){this.data=null}},Ms=class{constructor(e){this._colorMaskCache=15,this._renderer=e}setMask(e){this._colorMaskCache!==e&&(this._colorMaskCache=e,this._renderer.pipeline.setColorMask(e))}destroy(){this._renderer=null,this._colorMaskCache=null}};Ms.extension={type:[m.WebGPUSystem],name:`colorMask`};var Ns=class{constructor(e){this._renderer=e}async init(e){return this._initPromise?this._initPromise:(this._options=e,this._initPromise=(e.gpu?Promise.resolve(e.gpu):this._createDeviceAndAdaptor(e)).then(e=>this._setGpu(e)),this._initPromise)}_setGpu(e){this.gpu=e,this.extensions={transientAttachment:typeof GPUTextureUsage.TRANSIENT_ATTACHMENT==`number`},this._options.gpu||e.device.lost.then(()=>this._restoreDevice()).catch(e=>E(`WebGPU device was lost and could not be restored`,e)),this._renderer.runners.contextChange.emit(this.gpu)}async _restoreDevice(){if(!this._renderer)return;let e=await this._createDeviceAndAdaptor(this._options);if(!this._renderer){e.device.destroy();return}this._setGpu(e)}contextChange(e){this._renderer.gpu=e}async _createDeviceAndAdaptor(e){let t=await b.get().getNavigator().gpu.requestAdapter({powerPreference:e.powerPreference,forceFallbackAdapter:e.forceFallbackAdapter});if(!t)throw Error(`WebGPU not supported. No GPU adapter was returned by navigator.gpu.requestAdapter().`);let n=[`texture-compression-bc`,`texture-compression-astc`,`texture-compression-etc2`,`indirect-first-instance`].filter(e=>t.features.has(e));return{adapter:t,device:await t.requestDevice({requiredFeatures:n,requiredLimits:{maxSampledTexturesPerShaderStage:t.limits.maxSampledTexturesPerShaderStage,maxSamplersPerShaderStage:t.limits.maxSamplersPerShaderStage}})}}destroy(){this._options?.gpu||this.gpu?.device.destroy(),this.gpu=null,this.extensions=null,this._renderer=null}};Ns.extension={type:[m.WebGPUSystem],name:`device`},Ns.defaultOptions={powerPreference:void 0,forceFallbackAdapter:!1};var Ps=class{constructor(e,t,n,r){this.gpuBundle=e,this.stateKey=t,this.device=n,this.label=r}},Fs=class{constructor(e){this._boundBindGroup=Object.create(null),this._boundVertexBuffer=Object.create(null),this._renderer=e;for(let e=0;e<16;e++)this._boundBindGroup[e]={bindGroup:null,program:null,key:null}}renderStart(){this.commandFinished=new Promise(e=>{this._resolveCommandFinished=e}),this.commandEncoder=this._renderer.gpu.device.createCommandEncoder()}beginRenderPass(e){this.endRenderPass(),this._clearCache(),this._passEncoder=this.commandEncoder.beginRenderPass(e.descriptor),this.renderPassEncoder=this._passEncoder}endRenderPass(){this._passEncoder&&this._passEncoder.end(),this.renderPassEncoder=null,this._passEncoder=null}beginBundle(e){if(this._passEncoder!==this.renderPassEncoder)throw Error(`Cannot begin a new render bundle while one is already being recorded.`);this._clearCache();let t=this._renderer.pipeline,n=t.getBundleDescriptor();n.label=e,this._bundleStateKey=t.bundleStateKey,this._bundleLabel=e,this.renderPassEncoder=this._gpu.device.createRenderBundleEncoder(n)}endBundle(){let e=this.renderPassEncoder;if(!e||!(`finish`in e))throw Error(`endBundle called without an active render bundle.`);let t=e.finish({label:this._bundleLabel});return this.renderPassEncoder=this._passEncoder,this._clearCache(),new Ps(t,this._bundleStateKey,this._gpu.device,this._bundleLabel)}isBundleValid(e){return e?.stateKey===this._renderer.pipeline.bundleStateKey&&e.device===this._gpu.device}executeBundle(e){let t=[];if(Array.isArray(e))for(let n=0;n<e.length;n++)t[n]=this._getGpuBundle(e[n]);else t[0]=this._getGpuBundle(e);this._clearCache(),this._passEncoder.executeBundles(t)}_getGpuBundle(e){return this.isBundleValid(e)||E(`Render bundle ${e?.label??`(unlabeled)`} was recorded against a different render target state or on a lost device. Re-record it \u2014 replaying it will either be rejected by WebGPU or draw with the wrong winding. Check encoder.isBundleValid(bundle) before executing.`),e.gpuBundle}setViewport(e){this._passEncoder.setViewport(e.x,e.y,e.width,e.height,0,1)}setStencilReference(e){this._passEncoder.setStencilReference(e)}setPipelineFromGeometryProgramAndState(e,t,n,r,i){let a=this._renderer.pipeline.getPipeline(e,t,n,r,i);this.setPipeline(a)}setPipeline(e){this._boundPipeline!==e&&(this._boundPipeline=e,this.renderPassEncoder.setPipeline(e))}_setVertexBuffer(e,t){this._boundVertexBuffer[e]!==t&&(this._boundVertexBuffer[e]=t,this.renderPassEncoder.setVertexBuffer(e,this._renderer.buffer.updateBuffer(t)))}_setIndexBuffer(e){if(this._boundIndexBuffer===e)return;this._boundIndexBuffer=e;let t=e.data.BYTES_PER_ELEMENT===2?`uint16`:`uint32`;this.renderPassEncoder.setIndexBuffer(this._renderer.buffer.updateBuffer(e),t)}resetBindGroup(e){let t=this._boundBindGroup[e];t.bindGroup=null,t.program=null,t.key=null}setBindGroup(e,t,n){let r=this._boundBindGroup[e];if(r.bindGroup===t&&r.program===n&&r.key===t._key)return;r.bindGroup=t,r.program=n,r.key=t._key,t._touch(this._renderer.gc.now);let i=this._renderer.bindGroup.getBindGroup(t,n,e);this.renderPassEncoder.setBindGroup(e,i)}setGeometry(e,t){let n=this._renderer.pipeline.getBufferNamesToBind(e,t);for(let t in n)this._setVertexBuffer(parseInt(t,10),e.attributes[n[t]].buffer);e.indexBuffer&&this._setIndexBuffer(e.indexBuffer)}_setShaderBindGroups(e,t){let n=e.gpuProgram;for(let r in e.groups){if(!n.layout[r])continue;let i=e.groups[r];t||this._syncBindGroup(i),this.setBindGroup(r,i,n)}}_syncBindGroup(e){for(let t in e.resources){let n=e.resources[t];n&&n.isUniformGroup&&this._renderer.ubo.updateUniformGroup(n)}}draw(e){let{geometry:t,shader:n,state:r,topology:i,size:a,start:o,baseVertex:s,instanceCount:c,skipSync:l,firstInstance:u}=e;this.setPipelineFromGeometryProgramAndState(t,n.gpuProgram,r,i,n._overrides),this.setGeometry(t,n.gpuProgram),this._setShaderBindGroups(n,l),t.indexBuffer?this.renderPassEncoder.drawIndexed(a||t.indexCount||t.indexBuffer.data.length,c??t.instanceCount,o||0,s||0,u||0):this.renderPassEncoder.draw(a||t.vertexCount,c??t.instanceCount,o||0,u||0)}drawIndirect(e){let{geometry:t,shader:n,state:r,topology:i,skipSync:a,indirectBuffer:o,indirectOffset:s}=e;this.setPipelineFromGeometryProgramAndState(t,n.gpuProgram,r,i,n._overrides),this.setGeometry(t,n.gpuProgram),this._setShaderBindGroups(n,a),t.indexBuffer?this.renderPassEncoder.drawIndexedIndirect(o,s):this.renderPassEncoder.drawIndirect(o,s)}finishRenderPass(){this._passEncoder&&(this._passEncoder.end(),this.renderPassEncoder=null,this._passEncoder=null)}postrender(){this.finishRenderPass(),this._gpu.device.queue.submit([this.commandEncoder.finish()]),this._resolveCommandFinished(),this.commandEncoder=null}_clearCache(){for(let e=0;e<16;e++){let t=this._boundBindGroup[e];t.bindGroup=null,t.program=null,t.key=null,this._boundVertexBuffer[e]=null}this._boundIndexBuffer=null,this._boundPipeline=null}destroy(){this._renderer=null,this._gpu=null,this._boundBindGroup=null,this._boundVertexBuffer=null,this._boundIndexBuffer=null,this._boundPipeline=null,this.renderPassEncoder=null,this._passEncoder=null}contextChange(e){this._gpu=e}};Fs.extension={type:[m.WebGPUSystem],name:`encoder`,priority:1};var Is=class{constructor(e){this.supportsOverrideConstants=!1,this._renderer=e}contextChange(){let e=this._renderer.device.gpu.device;this.maxTextures=Math.min(e.limits.maxSampledTexturesPerShaderStage,e.limits.maxSamplersPerShaderStage),this.maxBatchableTextures=this.maxTextures,this._detectOverrideConstantsSupport(e)}_detectOverrideConstantsSupport(e){e.pushErrorScope(`validation`);let t=e.createShaderModule({code:`override TEST_VALUE: f32 = 0.0;
@compute @workgroup_size(1) fn main() {}`});e.createComputePipeline({layout:`auto`,compute:{module:t,entryPoint:`main`,constants:{TEST_VALUE:1}}}),e.popErrorScope().then(e=>{this.supportsOverrideConstants=!e})}destroy(){}};Is.extension={type:[m.WebGPUSystem],name:`limits`};var Ls=class{constructor(e){this._renderer=e,e.renderTarget.onRenderTargetChange.add(this)}contextChange(){this._activeGpuRenderTarget=null}onRenderTargetChange(e){let t=this._renderer.renderTarget.getGpuRenderTarget(e);this._activeRenderTarget=e,this._activeGpuRenderTarget=t,this.setStencilMode(t.stencilMode,t.stencilReference)}setStencilMode(e,t){let n=this._activeGpuRenderTarget??(this._activeGpuRenderTarget=this._renderer.renderTarget.getGpuRenderTarget(this._activeRenderTarget));n.stencilMode=e,n.stencilReference=t;let r=this._renderer;r.pipeline.setStencilMode(e),r.encoder.setStencilReference(t)}destroy(){this._renderer.renderTarget.onRenderTargetChange.remove(this),this._renderer=null,this._activeRenderTarget=null,this._activeGpuRenderTarget=null}};Ls.extension={type:[m.WebGPUSystem],name:`stencil`};var Rs={i32:{align:4,size:4},u32:{align:4,size:4},f32:{align:4,size:4},f16:{align:2,size:2},"vec2<i32>":{align:8,size:8},"vec2<u32>":{align:8,size:8},"vec2<f32>":{align:8,size:8},"vec2<f16>":{align:4,size:4},"vec3<i32>":{align:16,size:12},"vec3<u32>":{align:16,size:12},"vec3<f32>":{align:16,size:12},"vec3<f16>":{align:8,size:6},"vec4<i32>":{align:16,size:16},"vec4<u32>":{align:16,size:16},"vec4<f32>":{align:16,size:16},"vec4<f16>":{align:8,size:8},"mat2x2<f32>":{align:8,size:16},"mat2x2<f16>":{align:4,size:8},"mat3x2<f32>":{align:8,size:24},"mat3x2<f16>":{align:4,size:12},"mat4x2<f32>":{align:8,size:32},"mat4x2<f16>":{align:4,size:16},"mat2x3<f32>":{align:16,size:32},"mat2x3<f16>":{align:8,size:16},"mat3x3<f32>":{align:16,size:48},"mat3x3<f16>":{align:8,size:24},"mat4x3<f32>":{align:16,size:64},"mat4x3<f16>":{align:8,size:32},"mat2x4<f32>":{align:16,size:32},"mat2x4<f16>":{align:8,size:16},"mat3x4<f32>":{align:16,size:48},"mat3x4<f16>":{align:8,size:24},"mat4x4<f32>":{align:16,size:64},"mat4x4<f16>":{align:8,size:32}};function zs(e){let t=e.map(e=>({data:e,offset:0,size:0})),n=0;for(let e=0;e<t.length;e++){let r=t[e],i=Rs[r.data.type].size,a=Rs[r.data.type].align;if(!Rs[r.data.type])throw Error(`[Pixi.js] WebGPU UniformBuffer: Unknown type ${r.data.type}`);r.data.size>1&&(i=Math.max(i,a)*r.data.size),n=Math.ceil(n/a)*a,r.size=i,r.offset=n,n+=i}return n=Math.ceil(n/16)*16,{uboElements:t,size:n}}function Bs(e,t){let{size:n,align:r}=Rs[e.data.type],i=(r-n)/4,a=e.data.type.indexOf(`i32`)>=0?`dataInt32`:`data`;return`
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
     `}function Vs(e){return ct(e,pt,Bs)}var Hs=class extends dt{constructor(){super({createUboElements:zs,generateUboSync:Vs})}};Hs.extension={type:[m.WebGPUSystem],name:`ubo`};var Us=128,Ws=class{constructor(e){this._bindGroupHash=Object.create(null),this._buffers=[],this._bindGroups=[],this._bufferResources=[],this._renderer=e,this._batchBuffer=new js({minUniformOffsetAlignment:Us});let t=256/Us;for(let e=0;e<t;e++){let t=x.UNIFORM|x.COPY_DST;e===0&&(t|=x.COPY_SRC),this._buffers.push(new re({data:this._batchBuffer.data,usage:t}))}}renderEnd(){this._uploadBindGroups(),this._resetBindGroups()}_resetBindGroups(){this._bindGroupHash=Object.create(null),this._batchBuffer.clear()}getUniformBindGroup(e,t){if(!t&&this._bindGroupHash[e.uid])return this._bindGroupHash[e.uid];this._renderer.ubo.ensureUniformGroup(e);let n=e.buffer.data,r=this._batchBuffer.addEmptyGroup(n.length);return this._renderer.ubo.syncUniformGroup(e,this._batchBuffer.data,r/4),this._bindGroupHash[e.uid]=this._getBindGroup(r/Us),this._bindGroupHash[e.uid]}getUboResource(e){this._renderer.ubo.updateUniformGroup(e);let t=e.buffer.data,n=this._batchBuffer.addGroup(t);return this._getBufferResource(n/Us)}getArrayBindGroup(e){let t=this._batchBuffer.addGroup(e);return this._getBindGroup(t/Us)}getArrayBufferResource(e){let t=this._batchBuffer.addGroup(e)/Us;return this._getBufferResource(t)}_getBufferResource(e){if(!this._bufferResources[e]){let t=this._buffers[e%2];this._bufferResources[e]=new ht({buffer:t,offset:(e/2|0)*256,size:Us})}return this._bufferResources[e]}_getBindGroup(e){if(!this._bindGroups[e]){let t=new _({0:this._getBufferResource(e)});this._bindGroups[e]=t}return this._bindGroups[e]}_uploadBindGroups(){let e=this._renderer.buffer,t=this._buffers[0];t.update(this._batchBuffer.byteIndex),e.updateBuffer(t);let n=this._renderer.gpu.device.createCommandEncoder();for(let r=1;r<this._buffers.length;r++){let i=this._buffers[r];n.copyBufferToBuffer(e.getGPUBuffer(t),Us,e.getGPUBuffer(i),0,this._batchBuffer.byteIndex)}this._renderer.gpu.device.queue.submit([n.finish()])}destroy(){for(let e=0;e<this._bindGroups.length;e++)this._bindGroups[e]?.destroy();this._bindGroups=null,this._bindGroupHash=null;for(let e=0;e<this._buffers.length;e++)this._buffers[e].destroy();this._buffers=null;for(let e=0;e<this._bufferResources.length;e++)this._bufferResources[e].destroy();this._bufferResources=null,this._batchBuffer.destroy(),this._renderer=null}};Ws.extension={type:[m.WebGPUPipes],name:`uniformBatch`};var Gs={"point-list":0,"line-list":1,"line-strip":2,"triangle-list":3,"triangle-strip":4},Ks=new w({}),qs={"depth24plus-stencil8":{depth:!0,stencil:!0,index:1},depth24plus:{depth:!0,stencil:!1,index:2},depth32float:{depth:!0,stencil:!1,index:3},"depth32float-stencil8":{depth:!0,stencil:!0,index:4},depth16unorm:{depth:!0,stencil:!1,index:5},stencil8:{depth:!1,stencil:!0,index:6}},Js={depth:!1,stencil:!1,index:0};function Ys(e,t){for(let[n,r]of Object.entries(t)){let t=RegExp(`override\\s+${n}\\s*:\\s*(\\w+)\\s*(?:=[^;]*)?;`);e=e.replace(t,(e,t)=>{let i;return i=t===`u32`?`${Math.trunc(r)}u`:t===`i32`?`${Math.trunc(r)}`:Number.isInteger(r)?`${r}.0`:`${r}`,`const ${n}: ${t} = ${i};`})}return e}function Xs(e,t,n,r,i,a){return e*35184372088832+t*536870912+a*16384+(n<<8)+(r<<3)+i}var Zs=Object.create(null),Qs=0;function $s(e){let t=Zs[e];return t===void 0&&(t=Zs[e]=Qs++),t}function ec(e,t,n,r,i,a,o,s){return s<<20|a<<16|i<<13|n<<9|e<<6|o<<5|r<<1|t}function tc(e,t,n,r,i,a,o){return o<<11|a<<10|i<<9|r<<8|n<<5|t<<1|e}var nc=class{constructor(e){this._moduleCache=Object.create(null),this._bufferLayoutsCache=Object.create(null),this._bindingNamesCache=Object.create(null),this._pipeCache=new Map,this._pipeStateCaches=Object.create(null),this._colorMask=15,this._multisampleCount=1,this._colorTargetCount=1,this._colorFormat=`bgra8unorm`,this._colorFormatId=$s(`bgra8unorm`),this._depthStencilFormat=`depth24plus-stencil8`,this._depthStencilFormatData=Js,this._depthReadOnly=!1,this._stencilReadOnly=!1,this._invertFrontFace=!1,this._renderer=e}contextChange(e){this._gpu=e,this._moduleCache=Object.create(null),this._pipeStateCaches=Object.create(null),this.setStencilMode($e.DISABLED),this._updatePipeHash()}setMultisampleCount(e){this._multisampleCount!==e&&(this._multisampleCount=e,this._updatePipeHash())}setRenderTarget(e){let t=e.colorAttachments[0]?.texture;this._multisampleCount=t?.source.antialias?4:1,this._colorTargetCount=e.colorAttachments.length,this._colorFormat=t?.format??`bgra8unorm`,this._colorFormatId=$s(this._colorFormat),this._depthStencilFormat=e.depthStencilAttachment?.texture.format,this._depthStencilFormatData=qs[this._depthStencilFormat]||Js,this._depthReadOnly=e.depthStencilAttachment?.depthReadOnly??!1,this._stencilReadOnly=e.depthStencilAttachment?.stencilReadOnly??this._depthReadOnly,this._invertFrontFace=this._renderer.renderTarget.isFrontFaceInverted(e,e.flipY),this._updatePipeHash()}setColorMask(e){this._colorMask!==e&&(this._colorMask=e,this._updatePipeHash())}setStencilMode(e){this._stencilMode!==e&&(this._stencilMode=e,this._stencilState=mt[e],this._updatePipeHash())}get bundleStateKey(){let e=this._depthStencilFormatData;return tc(this._multisampleCount===1?0:1,this._colorTargetCount,e.index,e.depth&&this._depthReadOnly?1:0,e.stencil&&this._stencilReadOnly?1:0,+!!this._invertFrontFace,this._colorFormatId)}getBundleDescriptor(){let e=[];for(let t=0;t<this._colorTargetCount;t++)e.push(this._colorFormat);let t={colorFormats:e,sampleCount:this._multisampleCount},n=this._depthStencilFormatData;return(n.depth||n.stencil)&&(t.depthStencilFormat=this._depthStencilFormat,n.depth&&this._depthReadOnly&&(t.depthReadOnly=!0),n.stencil&&this._stencilReadOnly&&(t.stencilReadOnly=!0)),t}setPipeline(e,t,n,r){let i=this.getPipeline(e,t,n);r.setPipeline(i)}getPipelineKey(e,t,n,r,i){return e._layoutKey||(at(e,t.attributeData),this._generateBufferKey(e)),Xs(e._layoutKey,t._layoutKey,n.data,n._blendModeId,Gs[r],i.id)}getPipeline(e,t,n,r,i){e._layoutKey||(at(e,t.attributeData),this._generateBufferKey(e)),r||(r=e.topology),i||(i=Ks);let a=Xs(e._layoutKey,t._layoutKey,n.data,n._blendModeId,Gs[r],i.id),o=this._pipeCache.get(a);return o||(o=this._createPipeline(e,t,n,r,i),this._pipeCache.set(a,o)),o}_createPipeline(e,t,n,r,i){let a=this._gpu.device,o=this._createVertexBufferLayouts(e,t),s=this._renderer.state.getColorTargets(n,this._colorTargetCount,this._colorFormat),c=this._stencilMode===$e.RENDERING_MASK_ADD?0:this._colorMask;for(let e=0;e<s.length;e++)s[e].writeMask=c;let l=this._renderer.shader.getProgramData(t).pipeline,u=Object.keys(i.data).length>0,d=t.vertex.source,f=t.fragment.source,p;u&&(this._renderer.limits.supportsOverrideConstants?p=i.data:(d=Ys(d,i.data),f=Ys(f,i.data)));let m={vertex:{module:this._getModule(d),entryPoint:t.vertex.entryPoint,constants:p,buffers:o},fragment:{module:this._getModule(f),entryPoint:t.fragment.entryPoint,targets:s,constants:p},primitive:{topology:r,cullMode:n.culling?`back`:`none`,frontFace:n.clockwiseFrontFace===this._invertFrontFace?`ccw`:`cw`},layout:l,multisample:{count:this._multisampleCount},label:t.name?`PIXI Pipeline (${t.name})`:`PIXI Pipeline`};if(this._depthStencilFormatData.depth||this._depthStencilFormatData.stencil){let e=this._depthStencilFormatData;m.depthStencil={...this._stencilState,format:this._depthStencilFormat,depthWriteEnabled:e.depth?n.depthMask&&!this._depthReadOnly:!1,depthCompare:e.depth&&n.depthTest?`less`:`always`}}return a.createRenderPipeline(m)}_getModule(e){return this._moduleCache[e]||this._createModule(e)}_createModule(e){let t=this._gpu.device;return this._moduleCache[e]=t.createShaderModule({code:e}),this._moduleCache[e]}_generateBufferKey(e){let t=[],n=0,r=Object.keys(e.attributes).sort();for(let i=0;i<r.length;i++){let a=e.attributes[r[i]];t[n++]=a.offset,t[n++]=a.format,t[n++]=a.stride,t[n++]=a.instance}let i=t.join(`|`);return e._layoutKey=ee(i,`geometry`),e._layoutKey}_generateAttributeLocationsKey(e){let t=[],n=0,r=Object.keys(e.attributeData).sort();for(let i=0;i<r.length;i++){let a=e.attributeData[r[i]];t[n++]=a.location}let i=t.join(`|`);return e._attributeLocationsKey=ee(i,`programAttributes`),e._attributeLocationsKey}getBufferNamesToBind(e,t){let n=e._layoutKey<<16|t._attributeLocationsKey;if(this._bindingNamesCache[n])return this._bindingNamesCache[n];let r=this._createVertexBufferLayouts(e,t),i=Object.create(null),a=t.attributeData;for(let e=0;e<r.length;e++){let t=Object.values(r[e].attributes)[0].shaderLocation;for(let n in a)if(a[n].location===t){i[e]=n;break}}return this._bindingNamesCache[n]=i,i}_createVertexBufferLayouts(e,t){t._attributeLocationsKey||this._generateAttributeLocationsKey(t);let n=e._layoutKey<<16|t._attributeLocationsKey;if(this._bufferLayoutsCache[n])return this._bufferLayoutsCache[n];let r=[];return e.buffers.forEach(n=>{let i={arrayStride:0,stepMode:`vertex`,attributes:[]},a=i.attributes;for(let r in t.attributeData){let o=e.attributes[r];(o.divisor??1)!==1&&E(`Attribute ${r} has an invalid divisor value of '${o.divisor}'. WebGPU only supports a divisor value of 1`),o.buffer===n&&(i.arrayStride=o.stride,i.stepMode=o.instance?`instance`:`vertex`,a.push({shaderLocation:t.attributeData[r].location,offset:o.offset,format:o.format}))}a.length&&r.push(i)}),this._bufferLayoutsCache[n]=r,r}_updatePipeHash(){var e;let t=ec(this._stencilMode,this._multisampleCount===1?0:1,this._colorMask,this._colorTargetCount,this._depthStencilFormatData.index,this._colorFormatId,+!!this._depthReadOnly,+!!this._invertFrontFace);this._pipeCache=(e=this._pipeStateCaches)[t]??(e[t]=new Map)}destroy(){this._bufferLayoutsCache=null,this._pipeCache=null,this._gpu=null,this._renderer=null,this._bindingNamesCache=null,this._pipeStateCaches=null,this._moduleCache=null}};nc.extension={type:[m.WebGPUSystem],name:`pipeline`};var rc=class{constructor(){this.contexts=[],this.msaaTextures=[],this.msaaSamples=1,this.stencilMode=$e.DISABLED,this.stencilReference=0,this.maskStackIndex=0}},ic={bgra8unorm:!0,rgba8unorm:!0,rgba16float:!0};function ac(e){if(ic[e])return e;let t=navigator.gpu.getPreferredCanvasFormat();return E(`[WebGPU] CanvasSource format '${e}' is not a valid GPUCanvasContext format. Falling back to '${t}'. Allowed formats are: bgra8unorm, rgba8unorm, rgba16float.`),t}var oc=class{constructor(){this._activePass=null}init(e,t){this._renderer=e,this._renderTargetSystem=t}copyToTexture(e,t,n,r,i){let a=this._renderer;this.finishRenderPass();let o=this._getGpuColorTexture(e),s=a.texture.getGpuSource(t.source);return a.encoder.commandEncoder.copyTextureToTexture({texture:o,origin:n},{texture:s,origin:i},r),t}copyDepthTexture(e,t,n,r,i){let a=this._renderer;this.finishRenderPass();let o=e.depthStencilAttachment.texture,s=a.texture.getGpuSource(o),c=a.texture.getGpuSource(t.source),l=a.encoder.commandEncoder===null,u=l?a.gpu.device.createCommandEncoder():a.encoder.commandEncoder;u.copyTextureToTexture({texture:s,origin:n},{texture:c,origin:i},{width:r.width,height:r.height}),l&&a.gpu.device.queue.submit([u.finish()])}startRenderPass(e,t=!0,n,r,i=0,a=0){let o=this._renderTargetSystem.getGpuRenderTarget(e);if(a!==0&&o.msaaTextures?.length)throw Error(`[RenderTargetSystem] Rendering to array layers is not supported with MSAA render targets.`);if(i>0&&o.msaaTextures?.length)throw Error(`[RenderTargetSystem] Rendering to mip levels is not supported with MSAA render targets.`);let s=t;typeof s==`boolean`&&(s=s?De.ALL:De.NONE),(e.stencil||e.depth)&&!e.depthStencilAttachment&&e.ensureDepthStencilTexture();let c=!!e.depthStencilAttachment,l=this._activePass,u=l!==null&&l.renderTarget===e&&l.mipLevel===i&&l.layer===a&&l.depthStencil===c&&this._renderer.encoder.renderPassEncoder!==null&&s===De.NONE;if(this._renderer.pipeline.setRenderTarget(e),u){this._renderer.encoder.setViewport(r);return}o.descriptor=this.getDescriptor(e,t,n,i,a),this._renderer.encoder.beginRenderPass(o),this._renderer.encoder.setViewport(r),this._activePass={renderTarget:e,mipLevel:i,layer:a,depthStencil:c}}finishRenderPass(){this._renderer.encoder.endRenderPass(),this._activePass=null}_getGpuColorTexture(e){if(e.colorAttachments.length===0)throw Error(`[GpuRenderTargetAdaptor] cannot get gpu color texture from a depth-only render target`);let t=e.colorAttachments[0].texture;return t instanceof ge&&t._gpuContext?t._gpuContext.getCurrentTexture():this._renderer.texture.getGpuSource(t)}getDescriptor(e,t,n,r=0,i=0){typeof t==`boolean`&&(t=t?De.ALL:De.NONE);let a=this._renderTargetSystem,o=a.getGpuRenderTarget(e),s=e.colorAttachments.map((e,s)=>{let c=e.texture,l=c instanceof ge?c._gpuContext:null,u,d;if(l){if(i!==0)throw Error(`[RenderTargetSystem] Rendering to array layers is not supported for canvas targets.`);u=l.getCurrentTexture().createView(e.viewDescriptor)}else u=this._renderer.texture.getTextureRenderTargetView(e.texture,r,i,e.viewDescriptor);let f=!1;o.msaaTextures[s]&&(d=u,u=this._renderer.texture.getTextureView(o.msaaTextures[s]),f=o.msaaTextures[s].transient);let p=e.loadOp;t!==void 0&&(p=t&De.COLOR?`clear`:`load`),n??(n=a.defaultClearColor);let m=e.storeOp??`store`,h={view:u,resolveTarget:d,storeOp:f?`discard`:m,loadOp:p};p===`clear`&&(n??(n=e.clearValue??a.defaultClearColor),h.clearValue=n);for(let t in e)t!==`texture`&&t!==`viewDescriptor`&&t!==`clearValue`&&t!==`loadOp`&&t!==`storeOp`&&(h[t]=e[t]);return h}),c;if(e.depthStencilAttachment){o.msaa&&(e.depthStencilAttachment.texture.sampleCount=4),e.depthStencilAttachment.texture.transient=!!o.msaaTextures[0]?.transient;let n=e.depthStencilAttachment,a=n.texture.format.includes(`stencil`),s=n.texture.format.includes(`depth`),l=n.texture.transient?`discard`:`store`;c={view:this._renderer.texture.getTextureRenderTargetView(n.texture,r,i,n.viewDescriptor)};let u=n.depthReadOnly??!1,d=n.stencilReadOnly??u;a&&!d?(c.stencilLoadOp=t&De.STENCIL?`clear`:n.stencilLoadOp??`load`,c.stencilStoreOp=n.stencilStoreOp??l,c.stencilLoadOp===`clear`&&(c.stencilClearValue=n.stencilClearValue??0)):a&&d&&(c.stencilReadOnly=!0),s&&!u?(c.depthLoadOp=t&De.DEPTH?`clear`:n.depthLoadOp??`load`,c.depthStoreOp=n.depthStoreOp??l,c.depthLoadOp===`clear`&&(c.depthClearValue=n.depthClearValue??1)):s&&u&&(c.depthReadOnly=!0);for(let e in n)e!==`texture`&&e!==`viewDescriptor`&&e!==`stencilLoadOp`&&e!==`stencilStoreOp`&&e!==`stencilClearValue`&&e!==`stencilReadOnly`&&e!==`depthLoadOp`&&e!==`depthStoreOp`&&e!==`depthClearValue`&&e!==`depthReadOnly`&&(c[e]=n[e])}return{colorAttachments:s,depthStencilAttachment:c,label:e.label}}clear(e,t=!0,n,r,i=0,a=0){if(!t)return;let{gpu:o,encoder:s}=this._renderer,c=o.device;if(s.commandEncoder===null){let o=c.createCommandEncoder(),s=this.getDescriptor(e,t,n,i,a),l=o.beginRenderPass(s);l.setViewport(r.x,r.y,r.width,r.height,0,1),l.end();let u=o.finish();c.queue.submit([u])}else this.startRenderPass(e,t,n,r,i,a)}initGpuRenderTarget(e){e.isRoot=!0;let n=new rc;return e.colorAttachments.forEach((e,r)=>{let i=e.texture;if(i instanceof ge){let e=i._gpuContext??(i._gpuContext=i.resource.getContext(`webgpu`)),t=i.transparent?`premultiplied`:`opaque`,a=ac(i.format);try{e.configure({device:this._renderer.gpu.device,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC,format:a,alphaMode:t,...a===`rgba16float`?{toneMapping:{mode:`extended`}}:{}})}catch(e){console.error(e)}n.contexts[r]=e}if(n.msaa=i.source.antialias,i.antialias){let e=new t({width:0,height:0,sampleCount:4,autoGenerateMipmaps:!1,transient:i.transient,arrayLayerCount:i.arrayLayerCount,format:i.format});n.msaaTextures[r]=e}}),n.msaa&&(n.msaaSamples=4,e.depthStencilAttachment&&(e.depthStencilAttachment.texture.sampleCount=4,e.depthStencilAttachment.texture.transient=!!n.msaaTextures[0]?.transient)),n}destroyGpuRenderTarget(e){e.contexts.forEach(e=>{e.unconfigure()}),e.msaaTextures.forEach(e=>{e.destroy()}),e.msaaTextures.length=0,e.contexts.length=0}ensureDepthStencilTexture(e){let t=this._renderTargetSystem.getGpuRenderTarget(e);e.depthStencilAttachment&&t.msaa&&(e.depthStencilAttachment.texture.sampleCount=4)}resizeGpuRenderTarget(e){let t=this._renderTargetSystem.getGpuRenderTarget(e);t.width=e.width,t.height=e.height,t.msaa&&e.colorAttachments.forEach((e,n)=>{let r=e.texture;t.msaaTextures[n]?.resize(r.width,r.height,r._resolution)})}},sc=class extends Me{constructor(e){super(e),this.adaptor=new oc,this.adaptor.init(e,this)}};sc.extension={type:[m.WebGPUSystem],name:`renderTarget`};var cc=class{constructor(){this._gpuProgramData=Object.create(null)}contextChange(e){this._gpu=e,this._gpuProgramData=Object.create(null)}getProgramData(e){return this._gpuProgramData[e._layoutKey]||this._createGPUProgramData(e)}_createGPUProgramData(e){let t=this._gpu.device,n=e.gpuLayout.map(e=>t.createBindGroupLayout({entries:e})),r={bindGroupLayouts:n};return this._gpuProgramData[e._layoutKey]={bindGroups:n,pipeline:t.createPipelineLayout(r)},this._gpuProgramData[e._layoutKey]}destroy(){this._gpu=null,this._gpuProgramData=null}};cc.extension={type:[m.WebGPUSystem],name:`shader`};var lc={};lc.normal={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`}},lc.add={alpha:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one`,operation:`add`}},lc.multiply={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`dst`,dstFactor:`one-minus-src-alpha`,operation:`add`}},lc.screen={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one-minus-src`,operation:`add`}},lc.overlay={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`one`,dstFactor:`one-minus-src`,operation:`add`}},lc.none={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`zero`,dstFactor:`zero`,operation:`add`}},lc[`normal-npm`]={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src-alpha`,operation:`add`}},lc[`add-npm`]={alpha:{srcFactor:`one`,dstFactor:`one`,operation:`add`},color:{srcFactor:`src-alpha`,dstFactor:`one`,operation:`add`}},lc[`screen-npm`]={alpha:{srcFactor:`one`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`src-alpha`,dstFactor:`one-minus-src`,operation:`add`}},lc.erase={alpha:{srcFactor:`zero`,dstFactor:`one-minus-src-alpha`,operation:`add`},color:{srcFactor:`zero`,dstFactor:`one-minus-src`,operation:`add`}},lc.min={alpha:{srcFactor:`one`,dstFactor:`one`,operation:`min`},color:{srcFactor:`one`,dstFactor:`one`,operation:`min`}},lc.max={alpha:{srcFactor:`one`,dstFactor:`one`,operation:`max`},color:{srcFactor:`one`,dstFactor:`one`,operation:`max`}};var uc=class{constructor(){this.defaultState=new ve,this.defaultState.blend=!0}contextChange(e){this.gpu=e}getColorTargets(e,t,n){let r=e.blend?lc[e.blendMode]||lc.normal:void 0,i=[];for(let e=0;e<t;e++)i[e]={format:n,writeMask:0,blend:r};return i}destroy(){this.gpu=null}};uc.extension={type:[m.WebGPUSystem],name:`state`};var dc={type:`image`,upload(e,t,n,r=0){let i=e.resource,a=(e.pixelWidth|0)*(e.pixelHeight|0),o=i.byteLength/a;n.device.queue.writeTexture({texture:t,origin:{x:0,y:0,z:r}},i,{offset:0,rowsPerImage:e.pixelHeight,bytesPerRow:e.pixelWidth*o},{width:e.pixelWidth,height:e.pixelHeight,depthOrArrayLayers:1})}},fc={"bc1-rgba-unorm":{blockBytes:8,blockWidth:4,blockHeight:4},"bc2-rgba-unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"bc3-rgba-unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"bc7-rgba-unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"etc1-rgb-unorm":{blockBytes:8,blockWidth:4,blockHeight:4},"etc2-rgba8unorm":{blockBytes:16,blockWidth:4,blockHeight:4},"astc-4x4-unorm":{blockBytes:16,blockWidth:4,blockHeight:4}},pc={blockBytes:4,blockWidth:1,blockHeight:1},mc={type:`compressed`,upload(e,t,n,r=0){let i=e.pixelWidth,a=e.pixelHeight,o=fc[e.format]||pc;for(let s=0;s<e.resource.length;s++){let c=e.resource[s],l=Math.ceil(i/o.blockWidth)*o.blockBytes;n.device.queue.writeTexture({texture:t,mipLevel:s,origin:{x:0,y:0,z:r}},c,{offset:0,bytesPerRow:l},{width:Math.ceil(i/o.blockWidth)*o.blockWidth,height:Math.ceil(a/o.blockHeight)*o.blockHeight,depthOrArrayLayers:1}),i=Math.max(i>>1,1),a=Math.max(a>>1,1)}}},hc=[`right`,`left`,`top`,`bottom`,`front`,`back`];function gc(e){return{type:`cube`,upload(t,n,r){let i=t.faces;for(let t=0;t<hc.length;t++){let a=i[hc[t]];(e[a.uploadMethodId]||e.image).upload(a,n,r,t)}}}}var _c={type:`image`,upload(e,t,n,r=0){let i=e.resource;if(!i)return;if(globalThis.HTMLImageElement&&i instanceof HTMLImageElement){let t=b.get().createCanvas(i.width,i.height);t.getContext(`2d`).drawImage(i,0,0,i.width,i.height),e.resource=t,E(`ImageSource: Image element passed, converting to canvas and replacing resource.`)}let a=Math.min(t.width,e.resourceWidth||e.pixelWidth),o=Math.min(t.height,e.resourceHeight||e.pixelHeight),s=e.alphaMode===`premultiply-alpha-on-upload`;n.device.queue.copyExternalImageToTexture({source:i},{texture:t,origin:{x:0,y:0,z:r},premultipliedAlpha:s},{width:a,height:o})}},vc={type:`video`,upload(e,t,n,r){_c.upload(e,t,n,r)}},yc=class{constructor(e){this.device=e,this.sampler=e.createSampler({minFilter:`linear`}),this.pipelines={}}_getMipmapPipeline(e){let t=this.pipelines[e];return t||(this.mipmapShaderModule||(this.mipmapShaderModule=this.device.createShaderModule({code:`
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
                    `})),t=this.device.createRenderPipeline({layout:`auto`,vertex:{module:this.mipmapShaderModule,entryPoint:`vertexMain`},fragment:{module:this.mipmapShaderModule,entryPoint:`fragmentMain`,targets:[{format:e}]}}),this.pipelines[e]=t),t}generateMipmap(e){let t=this._getMipmapPipeline(e.format);if(e.dimension===`3d`||e.dimension===`1d`)throw Error(`Generating mipmaps for non-2d textures is currently unsupported!`);let n=e,r=e.depthOrArrayLayers||1,i=e.usage&GPUTextureUsage.RENDER_ATTACHMENT;if(!i){let t={size:{width:Math.ceil(e.width/2),height:Math.ceil(e.height/2),depthOrArrayLayers:r},format:e.format,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC|GPUTextureUsage.RENDER_ATTACHMENT,mipLevelCount:e.mipLevelCount-1};n=this.device.createTexture(t)}let a=this.device.createCommandEncoder({}),o=t.getBindGroupLayout(0);for(let s=0;s<r;++s){let r=e.createView({baseMipLevel:0,mipLevelCount:1,dimension:`2d`,baseArrayLayer:s,arrayLayerCount:1}),c=+!!i;for(let i=1;i<e.mipLevelCount;++i){let e=n.createView({baseMipLevel:c++,mipLevelCount:1,dimension:`2d`,baseArrayLayer:s,arrayLayerCount:1}),i=a.beginRenderPass({colorAttachments:[{view:e,storeOp:`store`,loadOp:`clear`,clearValue:{r:0,g:0,b:0,a:0}}]}),l=this.device.createBindGroup({layout:o,entries:[{binding:0,resource:this.sampler},{binding:1,resource:r}]});i.setPipeline(t),i.setBindGroup(0,l),i.draw(3,1,0,0),i.end(),r=e}}if(!i){let t={width:Math.ceil(e.width/2),height:Math.ceil(e.height/2),depthOrArrayLayers:r};for(let r=1;r<e.mipLevelCount;++r)a.copyTextureToTexture({texture:n,mipLevel:r-1},{texture:e,mipLevel:r},t),t.width=Math.ceil(t.width/2),t.height=Math.ceil(t.height/2)}return this.device.queue.submit([a.finish()]),i||n.destroy(),e}},bc=class{constructor(e){this.textureView=null,this.textureViews=Object.create(null),this.gpuTexture=e}destroy(){this.gpuTexture.destroy(),this.textureView=null,this.textureViews=null,this.gpuTexture=null}};function xc(e){return`${e.format||``}.${e.dimension||``}.${e.aspect||``}.${e.baseMipLevel||0}.${e.mipLevelCount||``}.${e.baseArrayLayer||0}.${e.arrayLayerCount||``}`}var Sc=class e{constructor(t){this._gpuSamplers=Object.create(null),this._bindGroupHash=Object.create(null),this._renderer=t,t.gc.addCollection(this,`_bindGroupHash`,`hash`),this._managedTextures=new nt({renderer:t,type:`resource`,onUnload:this.onSourceUnload.bind(this),name:`gpuTextureSource`});let n={image:_c,buffer:dc,video:vc,compressed:mc,...e.uploadExtensions};this._uploads={...n,cube:gc(n)}}get managedTextures(){return Object.values(this._managedTextures.items)}contextChange(e){this._gpu=e,this._managedTextures.removeAll(),this._gpuSamplers=Object.create(null),this._mipmapGenerator=null}initSource(e){return e._gpuData[this._renderer.uid]?.gpuTexture||this._initSource(e)}_initSource(e){if(e.autoGenerateMipmaps){let t=Math.max(e.pixelWidth,e.pixelHeight);e.mipLevelCount=Math.floor(Math.log2(t))+1}let t;e.sampleCount>1?(t=GPUTextureUsage.RENDER_ATTACHMENT,e.transient&&this._renderer.device.extensions.transientAttachment&&(t|=GPUTextureUsage.TRANSIENT_ATTACHMENT)):(t=GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,e.uploadMethodId!==`compressed`&&(t|=GPUTextureUsage.RENDER_ATTACHMENT,t|=GPUTextureUsage.COPY_SRC));let n=fc[e.format]||{blockBytes:4,blockWidth:1,blockHeight:1},r=Math.ceil(e.pixelWidth/n.blockWidth)*n.blockWidth,i=Math.ceil(e.pixelHeight/n.blockHeight)*n.blockHeight,a={label:e.label,size:{width:r,height:i,depthOrArrayLayers:e.arrayLayerCount},format:e.format,sampleCount:e.sampleCount,mipLevelCount:e.mipLevelCount,dimension:e.dimension,usage:t},o=this._gpu.device.createTexture(a);return e._gpuData[this._renderer.uid]=new bc(o),this._managedTextures.add(e)&&(e.on(`update`,this.onSourceUpdate,this),e.on(`resize`,this.onSourceResize,this),e.on(`updateMipmaps`,this.onUpdateMipmaps,this)),this.onSourceUpdate(e),o}onSourceUpdate(e){let t=this.getGpuSource(e);t&&(this._uploads[e.uploadMethodId]&&this._uploads[e.uploadMethodId].upload(e,t,this._gpu),e.autoGenerateMipmaps&&e.mipLevelCount>1&&this.onUpdateMipmaps(e))}onUpdateMipmaps(e){this._mipmapGenerator||(this._mipmapGenerator=new yc(this._gpu.device));let t=this.getGpuSource(e);this._mipmapGenerator.generateMipmap(t)}onSourceUnload(e){e.off(`update`,this.onSourceUpdate,this),e.off(`resize`,this.onSourceResize,this),e.off(`updateMipmaps`,this.onUpdateMipmaps,this)}onSourceResize(e){e._gcLastUsed=this._renderer.gc.now;let t=e._gpuData[this._renderer.uid],n=t?.gpuTexture;n?(n.width!==e.pixelWidth||n.height!==e.pixelHeight)&&(t.destroy(),this._bindGroupHash[e.uid]=null,e._gpuData[this._renderer.uid]=null,this.initSource(e)):this.initSource(e)}_initSampler(e){return this._gpuSamplers[e._resourceId]=this._gpu.device.createSampler(e),this._gpuSamplers[e._resourceId]}getGpuSampler(e){return this._gpuSamplers[e._resourceId]||this._initSampler(e)}getGpuSource(e){return e._gcLastUsed=this._renderer.gc.now,e._gpuData[this._renderer.uid]?.gpuTexture||this.initSource(e)}getTextureBindGroup(e){return this._bindGroupHash[e.uid]||this._createTextureBindGroup(e)}_createTextureBindGroup(e){let t=e.source;return this._bindGroupHash[e.uid]=new _({0:t,1:t.style,2:new C({uTextureMatrix:{type:`mat3x3<f32>`,value:e.textureMatrix.mapCoord}})}),this._bindGroupHash[e.uid]}getTextureView(e,t){var n;let r=e.source;r._gcLastUsed=this._renderer.gc.now;let i=r._gpuData[this._renderer.uid];i||(this.initSource(r),i=r._gpuData[this._renderer.uid]);let a=t?xc(t):0;return(n=i.textureViews)[a]||(n[a]=i.gpuTexture.createView({dimension:r.viewDimension,...t})),i.textureViews[a]}getTextureRenderTargetView(e,t=0,n=0,r){var i;let a=e.source;a._gcLastUsed=this._renderer.gc.now;let o=a._gpuData[this._renderer.uid];o||(this.initSource(a),o=a._gpuData[this._renderer.uid]);let s=n*(a.mipLevelCount||1)+t+1;return r&&(s=`${s}.${xc(r)}`),(i=o.textureViews)[s]||(i[s]=o.gpuTexture.createView({dimension:`2d`,baseMipLevel:t,mipLevelCount:1,baseArrayLayer:n,arrayLayerCount:1,...r})),o.textureViews[s]}generateCanvas(e){let t=this._renderer,n=t.gpu.device.createCommandEncoder(),r=b.get().createCanvas();r.width=e.source.pixelWidth,r.height=e.source.pixelHeight;let i=r.getContext(`webgpu`);return i.configure({device:t.gpu.device,usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC,format:b.get().getNavigator().gpu.getPreferredCanvasFormat(),alphaMode:`premultiplied`}),n.copyTextureToTexture({texture:t.texture.getGpuSource(e.source),origin:{x:0,y:0}},{texture:i.getCurrentTexture()},{width:r.width,height:r.height}),t.gpu.device.queue.submit([n.finish()]),r}getPixels(e){let t=this.generateCanvas(e),n=ae.getOptimalCanvasAndContext(t.width,t.height),r=n.context;r.drawImage(t,0,0);let{width:i,height:a}=t,o=r.getImageData(0,0,i,a),s=new Uint8ClampedArray(o.data.buffer);return ae.returnCanvasAndContext(n),{pixels:s,width:i,height:a}}destroy(){this._managedTextures.destroy();for(let e of Object.keys(this._bindGroupHash)){let t=Number(e);this._bindGroupHash[t]?.destroy()}this._renderer=null,this._gpu=null,this._mipmapGenerator=null,this._gpuSamplers=null,this._bindGroupHash=null}};Sc.extension={type:[m.WebGPUSystem],name:`texture`},Sc.uploadExtensions=Object.create(null);var Cc=Sc;r.handleByMap(m.TextureUploaderWebGPU,Cc.uploadExtensions);var wc=class{constructor(){this._maxTextures=0}contextChange(e){let t=new C({uTransformMatrix:{value:new D,type:`mat3x3<f32>`},uColor:{value:new Float32Array([1,1,1,1]),type:`vec4<f32>`},uRound:{value:0,type:`f32`}});this._maxTextures=e.limits.maxBatchableTextures;let n=qe({name:`graphics`,bits:[Ke,Qe(this._maxTextures),ft,Ye]});this.shader=new g({gpuProgram:n,resources:{localUniforms:t}})}execute(e,t){let n=t.context,r=n.customShader||this.shader,i=e.renderer,{batcher:a,instructions:o}=i.graphicsContext.getContextRenderData(n),s=i.encoder;s.setGeometry(a.geometry,r.gpuProgram);let c=i.globalUniforms.bindGroup;s.setBindGroup(0,c,r.gpuProgram);let l=i.renderPipes.uniformBatch.getUniformBindGroup(r.resources.localUniforms,!0);s.setBindGroup(2,l,r.gpuProgram);let u=o.instructions,d=null;for(let t=0;t<o.instructionSize;t++){let n=u[t];if(n.topology!==d&&(d=n.topology,s.setPipelineFromGeometryProgramAndState(a.geometry,r.gpuProgram,e.state,n.topology,r._overrides)),r.groups[1]=n.bindGroup,!n.gpuBindGroup){let e=n.textures;n.bindGroup=We(e.textures,e.count,this._maxTextures),n.gpuBindGroup=i.bindGroup.getBindGroup(n.bindGroup,r.gpuProgram,1)}s.setBindGroup(1,n.bindGroup,r.gpuProgram),s.renderPassEncoder.drawIndexed(n.size,1,n.start)}}destroy(){this.shader.destroy(),this.shader=null}};wc.extension={type:[m.WebGPUPipesAdaptor],name:`graphics`};var Tc=class{init(){let e=qe({name:`mesh`,bits:[ot,lt,Ye]});this._shader=new g({gpuProgram:e,resources:{uTexture:T.EMPTY._source,uSampler:T.EMPTY._source.style,textureUniforms:{uTextureMatrix:{type:`mat3x3<f32>`,value:new D}}}})}execute(e,t){let n=e.renderer,r=t._shader;if(!r)r=this._shader,r.groups[2]=n.texture.getTextureBindGroup(t.texture);else if(!r.gpuProgram){E(`Mesh shader has no gpuProgram`,t.shader);return}let i=r.gpuProgram;if(i.autoAssignGlobalUniforms&&(r.groups[0]=n.globalUniforms.bindGroup),i.autoAssignLocalUniforms){let t=e.localUniforms;r.groups[1]=n.renderPipes.uniformBatch.getUniformBindGroup(t,!0)}n.encoder.draw({geometry:t._geometry,shader:r,state:t.state})}destroy(){this._shader.destroy(),this._shader=null}};Tc.extension={type:[m.WebGPUPipesAdaptor],name:`mesh`};var Ec=ne({WebGPURenderer:()=>Pc}),Dc=[...Ae,Hs,Fs,Ns,Is,As,Cc,sc,cc,uc,nc,Ms,Ls,Os],Oc=[...Oe,Ws],kc=[aa,Tc,wc],Ac=[],jc=[],Mc=[],Nc=[];r.handleByNamedList(m.WebGPUSystem,Ac),r.handleByNamedList(m.WebGPUPipes,jc),r.handleByNamedList(m.WebGPUPipesAdaptor,Mc),r.handleByNamedList(m.WebGPULoader,Nc),r.add(...Dc,...Oc,...kc);var Pc=class extends R{constructor(){let e={name:`webgpu`,type:ie.WEBGPU,systems:Ac,renderPipes:jc,renderPipeAdaptors:Mc,loaders:Nc};super(e)}},Fc=ne({BitmapFont:()=>Ic}),Ic=class extends Wi{constructor(e,t){super();let{textures:n,data:r}=e;Object.keys(r.pages).forEach(e=>{let t=r.pages[parseInt(e,10)],i=n[t.id];this.pages.push({texture:i})}),Object.keys(r.chars).forEach(e=>{let t=r.chars[e],{frame:i,source:a,rotate:o}=n[t.page],c=d.transformRectCoords(t,i,o,new s),l=new T({frame:c,orig:new s(0,0,t.width,t.height),source:a,rotate:o});this.chars[e]={id:e.codePointAt(0),xOffset:t.xOffset,yOffset:t.yOffset,xAdvance:t.xAdvance,kerning:t.kerning??{},texture:l}}),this.baseRenderedFontSize=r.fontSize,this.baseMeasurementFontSize=r.fontSize,this.fontMetrics={ascent:0,descent:0,fontSize:r.fontSize},this.baseLineOffset=r.baseLineOffset,this.lineHeight=r.lineHeight,this.fontFamily=r.fontFamily,this.distanceField=r.distanceField??{type:`none`,range:0},this.url=t}destroy(){super.destroy();for(let e=0;e<this.pages.length;e++){let{texture:t}=this.pages[e];t.destroy(!0)}this.pages=null}static install(e){$i.install(e)}static uninstall(e){$i.uninstall(e)}};r.add(xt,St);var Lc=a(o(((e,t)=>{(function(n,r){typeof e==`object`&&t!==void 0?t.exports=r():typeof define==`function`&&define.amd?define(r):n.JSON5=r()})(e,(function(){function e(e,t){return t={exports:{}},e(t,t.exports),t.exports}var t=e(function(e){var t=e.exports=typeof window<`u`&&window.Math==Math?window:typeof self<`u`&&self.Math==Math?self:Function(`return this`)();typeof __g==`number`&&(__g=t)}),n=e(function(e){var t=e.exports={version:`2.6.5`};typeof __e==`number`&&(__e=t)});n.version;var r=function(e){return typeof e==`object`?e!==null:typeof e==`function`},i=function(e){if(!r(e))throw TypeError(e+` is not an object!`);return e},a=function(e){try{return!!e()}catch{return!0}},o=!a(function(){return Object.defineProperty({},"a",{get:function(){return 7}}).a!=7}),s=t.document,c=r(s)&&r(s.createElement),l=function(e){return c?s.createElement(e):{}},u=!o&&!a(function(){return Object.defineProperty(l(`div`),"a",{get:function(){return 7}}).a!=7}),d=function(e,t){if(!r(e))return e;var n,i;if(t&&typeof(n=e.toString)==`function`&&!r(i=n.call(e))||typeof(n=e.valueOf)==`function`&&!r(i=n.call(e))||!t&&typeof(n=e.toString)==`function`&&!r(i=n.call(e)))return i;throw TypeError(`Can't convert object to primitive value`)},f=Object.defineProperty,p={f:o?Object.defineProperty:function(e,t,n){if(i(e),t=d(t,!0),i(n),u)try{return f(e,t,n)}catch{}if(`get`in n||`set`in n)throw TypeError(`Accessors not supported!`);return`value`in n&&(e[t]=n.value),e}},m=function(e,t){return{enumerable:!(e&1),configurable:!(e&2),writable:!(e&4),value:t}},h=o?function(e,t,n){return p.f(e,t,m(1,n))}:function(e,t,n){return e[t]=n,e},g={}.hasOwnProperty,_=function(e,t){return g.call(e,t)},v=0,y=Math.random(),b=function(e){return`Symbol(${e===void 0?``:e})_${(++v+y).toString(36)}`},x=e(function(e){var r=`__core-js_shared__`,i=t[r]||(t[r]={});(e.exports=function(e,t){return i[e]||(i[e]=t===void 0?{}:t)})(`versions`,[]).push({version:n.version,mode:`global`,copyright:`© 2019 Denis Pushkarev (zloirock.ru)`})})(`native-function-to-string`,Function.toString),S=e(function(e){var r=b(`src`),i=`toString`,a=(``+x).split(i);n.inspectSource=function(e){return x.call(e)},(e.exports=function(e,n,i,o){var s=typeof i==`function`;s&&(_(i,`name`)||h(i,`name`,n)),e[n]!==i&&(s&&(_(i,r)||h(i,r,e[n]?``+e[n]:a.join(String(n)))),e===t?e[n]=i:o?e[n]?e[n]=i:h(e,n,i):(delete e[n],h(e,n,i)))})(Function.prototype,i,function(){return typeof this==`function`&&this[r]||x.call(this)})}),C=function(e){if(typeof e!=`function`)throw TypeError(e+` is not a function!`);return e},ee=function(e,t,n){if(C(e),t===void 0)return e;switch(n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,i){return e.call(t,n,r,i)}}return function(){return e.apply(t,arguments)}},te=`prototype`,w=function(e,r,i){var a=e&w.F,o=e&w.G,s=e&w.S,c=e&w.P,l=e&w.B,u=o?t:s?t[r]||(t[r]={}):(t[r]||{})[te],d=o?n:n[r]||(n[r]={}),f=d[te]||(d[te]={}),p,m,g,_;for(p in o&&(i=r),i)m=!a&&u&&u[p]!==void 0,g=(m?u:i)[p],_=l&&m?ee(g,t):c&&typeof g==`function`?ee(Function.call,g):g,u&&S(u,p,g,e&w.U),d[p]!=g&&h(d,p,_),c&&f[p]!=g&&(f[p]=g)};t.core=n,w.F=1,w.G=2,w.S=4,w.P=8,w.B=16,w.W=32,w.U=64,w.R=128;var ne=w,re=Math.ceil,ie=Math.floor,ae=function(e){return isNaN(e=+e)?0:(e>0?ie:re)(e)},oe=function(e){if(e==null)throw TypeError(`Can't call method on  `+e);return e},se=function(e){return function(t,n){var r=String(oe(t)),i=ae(n),a=r.length,o,s;return i<0||i>=a?e?``:void 0:(o=r.charCodeAt(i),o<55296||o>56319||i+1===a||(s=r.charCodeAt(i+1))<56320||s>57343?e?r.charAt(i):o:e?r.slice(i,i+2):(o-55296<<10)+(s-56320)+65536)}}(!1);ne(ne.P,`String`,{codePointAt:function(e){return se(this,e)}}),n.String.codePointAt;var T=Math.max,E=Math.min,ce=function(e,t){return e=ae(e),e<0?T(e+t,0):E(e,t)},D=String.fromCharCode,le=String.fromCodePoint;ne(ne.S+ne.F*(!!le&&le.length!=1),`String`,{fromCodePoint:function(e){for(var t=arguments,n=[],r=arguments.length,i=0,a;r>i;){if(a=+t[i++],ce(a,1114111)!==a)throw RangeError(a+` is not a valid code point`);n.push(a<65536?D(a):D(((a-=65536)>>10)+55296,a%1024+56320))}return n.join(``)}}),n.String.fromCodePoint;var ue={Space_Separator:/[\u1680\u2000-\u200A\u202F\u205F\u3000]/,ID_Start:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/,ID_Continue:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/},O={isSpaceSeparator:function(e){return typeof e==`string`&&ue.Space_Separator.test(e)},isIdStartChar:function(e){return typeof e==`string`&&(e>=`a`&&e<=`z`||e>=`A`&&e<=`Z`||e===`$`||e===`_`||ue.ID_Start.test(e))},isIdContinueChar:function(e){return typeof e==`string`&&(e>=`a`&&e<=`z`||e>=`A`&&e<=`Z`||e>=`0`&&e<=`9`||e===`$`||e===`_`||e===`‌`||e===`‍`||ue.ID_Continue.test(e))},isDigit:function(e){return typeof e==`string`&&/[0-9]/.test(e)},isHexDigit:function(e){return typeof e==`string`&&/[0-9A-Fa-f]/.test(e)}},de,fe,k,pe,me,A,j,he,ge,_e=function(e,t){de=String(e),fe=`start`,k=[],pe=0,me=1,A=0,j=void 0,he=void 0,ge=void 0;do j=xe(),De[fe]();while(j.type!==`eof`);return typeof t==`function`?ve({"":ge},``,t):ge};function ve(e,t,n){var r=e[t];if(typeof r==`object`&&r){if(Array.isArray(r))for(var i=0;i<r.length;i++){var a=String(i),o=ve(r,a,n);o===void 0?delete r[a]:Object.defineProperty(r,a,{value:o,writable:!0,enumerable:!0,configurable:!0})}else for(var s in r){var c=ve(r,s,n);c===void 0?delete r[s]:Object.defineProperty(r,s,{value:c,writable:!0,enumerable:!0,configurable:!0})}}return n.call(e,t,r)}var M,N,ye,be,P;function xe(){for(M=`default`,N=``,ye=!1,be=1;;){P=F();var e=Se[M]();if(e)return e}}function F(){if(de[pe])return String.fromCodePoint(de.codePointAt(pe))}function I(){var e=F();return e===`
`?(me++,A=0):e?A+=e.length:A++,e&&(pe+=e.length),e}var Se={default:function(){switch(P){case`	`:case`\v`:case`\f`:case` `:case`\xA0`:case`﻿`:case`
`:case`\r`:case`\u2028`:case`\u2029`:I();return;case`/`:I(),M=`comment`;return;case void 0:return I(),L(`eof`)}if(O.isSpaceSeparator(P)){I();return}return Se[fe]()},comment:function(){switch(P){case`*`:I(),M=`multiLineComment`;return;case`/`:I(),M=`singleLineComment`;return}throw R(I())},multiLineComment:function(){switch(P){case`*`:I(),M=`multiLineCommentAsterisk`;return;case void 0:throw R(I())}I()},multiLineCommentAsterisk:function(){switch(P){case`*`:I();return;case`/`:I(),M=`default`;return;case void 0:throw R(I())}I(),M=`multiLineComment`},singleLineComment:function(){switch(P){case`
`:case`\r`:case`\u2028`:case`\u2029`:I(),M=`default`;return;case void 0:return I(),L(`eof`)}I()},value:function(){switch(P){case`{`:case`[`:return L(`punctuator`,I());case`n`:return I(),Ce(`ull`),L(`null`,null);case`t`:return I(),Ce(`rue`),L(`boolean`,!0);case`f`:return I(),Ce(`alse`),L(`boolean`,!1);case`-`:case`+`:I()===`-`&&(be=-1),M=`sign`;return;case`.`:N=I(),M=`decimalPointLeading`;return;case`0`:N=I(),M=`zero`;return;case`1`:case`2`:case`3`:case`4`:case`5`:case`6`:case`7`:case`8`:case`9`:N=I(),M=`decimalInteger`;return;case`I`:return I(),Ce(`nfinity`),L(`numeric`,1/0);case`N`:return I(),Ce(`aN`),L(`numeric`,NaN);case`"`:case`'`:ye=I()===`"`,N=``,M=`string`;return}throw R(I())},identifierNameStartEscape:function(){if(P!==`u`)throw R(I());I();var e=Ee();switch(e){case`$`:case`_`:break;default:if(!O.isIdStartChar(e))throw je()}N+=e,M=`identifierName`},identifierName:function(){switch(P){case`$`:case`_`:case`‌`:case`‍`:N+=I();return;case`\\`:I(),M=`identifierNameEscape`;return}if(O.isIdContinueChar(P)){N+=I();return}return L(`identifier`,N)},identifierNameEscape:function(){if(P!==`u`)throw R(I());I();var e=Ee();switch(e){case`$`:case`_`:case`‌`:case`‍`:break;default:if(!O.isIdContinueChar(e))throw je()}N+=e,M=`identifierName`},sign:function(){switch(P){case`.`:N=I(),M=`decimalPointLeading`;return;case`0`:N=I(),M=`zero`;return;case`1`:case`2`:case`3`:case`4`:case`5`:case`6`:case`7`:case`8`:case`9`:N=I(),M=`decimalInteger`;return;case`I`:return I(),Ce(`nfinity`),L(`numeric`,be*(1/0));case`N`:return I(),Ce(`aN`),L(`numeric`,NaN)}throw R(I())},zero:function(){switch(P){case`.`:N+=I(),M=`decimalPoint`;return;case`e`:case`E`:N+=I(),M=`decimalExponent`;return;case`x`:case`X`:N+=I(),M=`hexadecimal`;return}return L(`numeric`,be*0)},decimalInteger:function(){switch(P){case`.`:N+=I(),M=`decimalPoint`;return;case`e`:case`E`:N+=I(),M=`decimalExponent`;return}if(O.isDigit(P)){N+=I();return}return L(`numeric`,be*Number(N))},decimalPointLeading:function(){if(O.isDigit(P)){N+=I(),M=`decimalFraction`;return}throw R(I())},decimalPoint:function(){switch(P){case`e`:case`E`:N+=I(),M=`decimalExponent`;return}if(O.isDigit(P)){N+=I(),M=`decimalFraction`;return}return L(`numeric`,be*Number(N))},decimalFraction:function(){switch(P){case`e`:case`E`:N+=I(),M=`decimalExponent`;return}if(O.isDigit(P)){N+=I();return}return L(`numeric`,be*Number(N))},decimalExponent:function(){switch(P){case`+`:case`-`:N+=I(),M=`decimalExponentSign`;return}if(O.isDigit(P)){N+=I(),M=`decimalExponentInteger`;return}throw R(I())},decimalExponentSign:function(){if(O.isDigit(P)){N+=I(),M=`decimalExponentInteger`;return}throw R(I())},decimalExponentInteger:function(){if(O.isDigit(P)){N+=I();return}return L(`numeric`,be*Number(N))},hexadecimal:function(){if(O.isHexDigit(P)){N+=I(),M=`hexadecimalInteger`;return}throw R(I())},hexadecimalInteger:function(){if(O.isHexDigit(P)){N+=I();return}return L(`numeric`,be*Number(N))},string:function(){switch(P){case`\\`:I(),N+=we();return;case`"`:if(ye)return I(),L(`string`,N);N+=I();return;case`'`:if(!ye)return I(),L(`string`,N);N+=I();return;case`
`:case`\r`:throw R(I());case`\u2028`:case`\u2029`:Me(P);break;case void 0:throw R(I())}N+=I()},start:function(){switch(P){case`{`:case`[`:return L(`punctuator`,I())}M=`value`},beforePropertyName:function(){switch(P){case`$`:case`_`:N=I(),M=`identifierName`;return;case`\\`:I(),M=`identifierNameStartEscape`;return;case`}`:return L(`punctuator`,I());case`"`:case`'`:ye=I()===`"`,M=`string`;return}if(O.isIdStartChar(P)){N+=I(),M=`identifierName`;return}throw R(I())},afterPropertyName:function(){if(P===`:`)return L(`punctuator`,I());throw R(I())},beforePropertyValue:function(){M=`value`},afterPropertyValue:function(){switch(P){case`,`:case`}`:return L(`punctuator`,I())}throw R(I())},beforeArrayValue:function(){if(P===`]`)return L(`punctuator`,I());M=`value`},afterArrayValue:function(){switch(P){case`,`:case`]`:return L(`punctuator`,I())}throw R(I())},end:function(){throw R(I())}};function L(e,t){return{type:e,value:t,line:me,column:A}}function Ce(e){for(var t=0,n=e;t<n.length;t+=1){var r=n[t];if(F()!==r)throw R(I());I()}}function we(){switch(F()){case`b`:return I(),`\b`;case`f`:return I(),`\f`;case`n`:return I(),`
`;case`r`:return I(),`\r`;case`t`:return I(),`	`;case`v`:return I(),`\v`;case`0`:if(I(),O.isDigit(F()))throw R(I());return`\0`;case`x`:return I(),Te();case`u`:return I(),Ee();case`
`:case`\u2028`:case`\u2029`:return I(),``;case`\r`:return I(),F()===`
`&&I(),``;case`1`:case`2`:case`3`:case`4`:case`5`:case`6`:case`7`:case`8`:case`9`:throw R(I());case void 0:throw R(I())}return I()}function Te(){var e=``,t=F();if(!O.isHexDigit(t)||(e+=I(),t=F(),!O.isHexDigit(t)))throw R(I());return e+=I(),String.fromCodePoint(parseInt(e,16))}function Ee(){for(var e=``,t=4;t-->0;){var n=F();if(!O.isHexDigit(n))throw R(I());e+=I()}return String.fromCodePoint(parseInt(e,16))}var De={start:function(){if(j.type===`eof`)throw Ae();Oe()},beforePropertyName:function(){switch(j.type){case`identifier`:case`string`:he=j.value,fe=`afterPropertyName`;return;case`punctuator`:ke();return;case`eof`:throw Ae()}},afterPropertyName:function(){if(j.type===`eof`)throw Ae();fe=`beforePropertyValue`},beforePropertyValue:function(){if(j.type===`eof`)throw Ae();Oe()},beforeArrayValue:function(){if(j.type===`eof`)throw Ae();if(j.type===`punctuator`&&j.value===`]`){ke();return}Oe()},afterPropertyValue:function(){if(j.type===`eof`)throw Ae();switch(j.value){case`,`:fe=`beforePropertyName`;return;case`}`:ke()}},afterArrayValue:function(){if(j.type===`eof`)throw Ae();switch(j.value){case`,`:fe=`beforeArrayValue`;return;case`]`:ke()}},end:function(){}};function Oe(){var e;switch(j.type){case`punctuator`:switch(j.value){case`{`:e={};break;case`[`:e=[]}break;case`null`:case`boolean`:case`numeric`:case`string`:e=j.value}if(ge===void 0)ge=e;else{var t=k[k.length-1];Array.isArray(t)?t.push(e):Object.defineProperty(t,he,{value:e,writable:!0,enumerable:!0,configurable:!0})}if(typeof e==`object`&&e)k.push(e),fe=Array.isArray(e)?`beforeArrayValue`:`beforePropertyName`;else{var n=k[k.length-1];fe=n==null?`end`:Array.isArray(n)?`afterArrayValue`:`afterPropertyValue`}}function ke(){k.pop();var e=k[k.length-1];fe=e==null?`end`:Array.isArray(e)?`afterArrayValue`:`afterPropertyValue`}function R(e){return Pe(e===void 0?`JSON5: invalid end of input at `+me+`:`+A:`JSON5: invalid character '`+Ne(e)+`' at `+me+`:`+A)}function Ae(){return Pe(`JSON5: invalid end of input at `+me+`:`+A)}function je(){return A-=5,Pe(`JSON5: invalid identifier character at `+me+`:`+A)}function Me(e){console.warn(`JSON5: '`+Ne(e)+`' in strings is not valid ECMAScript; consider escaping`)}function Ne(e){var t={"'":`\\'`,'"':`\\"`,"\\":`\\\\`,"\b":`\\b`,"\f":`\\f`,"\n":`\\n`,"\r":`\\r`,"	":`\\t`,"\v":`\\v`,"\0":`\\0`,"\u2028":`\\u2028`,"\u2029":`\\u2029`};if(t[e])return t[e];if(e<` `){var n=e.charCodeAt(0).toString(16);return`\\x`+(`00`+n).substring(n.length)}return e}function Pe(e){var t=SyntaxError(e);return t.lineNumber=me,t.columnNumber=A,t}return{parse:_e,stringify:function(e,t,n){var r=[],i=``,a,o,s=``,c;if(typeof t==`object`&&t&&!Array.isArray(t)&&(n=t.space,c=t.quote,t=t.replacer),typeof t==`function`)o=t;else if(Array.isArray(t)){a=[];for(var l=0,u=t;l<u.length;l+=1){var d=u[l],f=void 0;typeof d==`string`?f=d:(typeof d==`number`||d instanceof String||d instanceof Number)&&(f=String(d)),f!==void 0&&a.indexOf(f)<0&&a.push(f)}}return n instanceof Number?n=Number(n):n instanceof String&&(n=String(n)),typeof n==`number`?n>0&&(n=Math.min(10,Math.floor(n)),s=`          `.substr(0,n)):typeof n==`string`&&(s=n.substr(0,10)),p(``,{"":e});function p(e,t){var n=t[e];switch(n!=null&&(typeof n.toJSON5==`function`?n=n.toJSON5(e):typeof n.toJSON==`function`&&(n=n.toJSON(e))),o&&(n=o.call(t,e,n)),n instanceof Number?n=Number(n):n instanceof String?n=String(n):n instanceof Boolean&&(n=n.valueOf()),n){case null:return`null`;case!0:return`true`;case!1:return`false`}if(typeof n==`string`)return m(n,!1);if(typeof n==`number`)return String(n);if(typeof n==`object`)return Array.isArray(n)?_(n):h(n)}function m(e){for(var t={"'":.1,'"':.2},n={"'":`\\'`,'"':`\\"`,"\\":`\\\\`,"\b":`\\b`,"\f":`\\f`,"\n":`\\n`,"\r":`\\r`,"	":`\\t`,"\v":`\\v`,"\0":`\\0`,"\u2028":`\\u2028`,"\u2029":`\\u2029`},r=``,i=0;i<e.length;i++){var a=e[i];switch(a){case`'`:case`"`:t[a]++,r+=a;continue;case`\0`:if(O.isDigit(e[i+1])){r+=`\\x00`;continue}}if(n[a]){r+=n[a];continue}if(a<` `){var o=a.charCodeAt(0).toString(16);r+=`\\x`+(`00`+o).substring(o.length);continue}r+=a}var s=c||Object.keys(t).reduce(function(e,n){return t[e]<t[n]?e:n});return r=r.replace(new RegExp(s,`g`),n[s]),s+r+s}function h(e){if(r.indexOf(e)>=0)throw TypeError(`Converting circular structure to JSON5`);r.push(e);var t=i;i+=s;for(var n=a||Object.keys(e),o=[],c=0,l=n;c<l.length;c+=1){var u=l[c],d=p(u,e);if(d!==void 0){var f=g(u)+`:`;s!==``&&(f+=` `),f+=d,o.push(f)}}var m;if(o.length===0)m=`{}`;else{var h;if(s===``)h=o.join(`,`),m=`{`+h+`}`;else{var _=`,
`+i;h=o.join(_),m=`{
`+i+h+`,
`+t+`}`}}return r.pop(),i=t,m}function g(e){if(e.length===0)return m(e,!0);var t=String.fromCodePoint(e.codePointAt(0));if(!O.isIdStartChar(t))return m(e,!0);for(var n=t.length;n<e.length;n++)if(!O.isIdContinueChar(String.fromCodePoint(e.codePointAt(n))))return m(e,!0);return e}function _(e){if(r.indexOf(e)>=0)throw TypeError(`Converting circular structure to JSON5`);r.push(e);var t=i;i+=s;for(var n=[],a=0;a<e.length;a++){var o=p(String(a),e);n.push(o===void 0?`null`:o)}var c;if(n.length===0)c=`[]`;else if(s===``)c=`[`+n.join(`,`)+`]`;else{var l=`,
`+i,u=n.join(l);c=`[
`+i+u+`,
`+t+`]`}return r.pop(),i=t,c}}}}))}))(),1),Rc=`{
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

    // **击败 BOSS** 得多少分：整局最大的一笔，其它都是零钱。这也是唯一一个"赢"的事件——\`n    // 关卡不再因为距离走完而结束（见 config/levels.json5 的 boss），所以这笔钱就是通关的报酬。
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
  // 下面一点是气泡阶段/天赋/技能那一行，再往下是（临时的）run 横幅。
  //
  // 关卡的地标标签（鱼群 / 气泡潮 / 爆发）已经删掉了：关卡本来就会在事件发生的那一刻用横幅喊一次，
  // 而屏幕边上一列常驻的段落名读起来像菜单，不像水里的景象。
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
      // 放在 88 而不是紧贴顶部：上面那一带有气泡阶段/天赋/技能那一行（y≈22），再往上是关卡的横幅
      // （"XX 出现了 · 击败它才能离开这一关"），横幅是左对齐的大字，血条居中但名字会撞上它。
      "y": 88,
      // 血条占画布宽度的比例，以及高度（设计像素）。
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

    // 总的进度图：一行小圆点，一关一颗，通了就点亮。
    //
    // 它回答的是"这一局走到哪了"，和 BOSS 血条（这一关走到哪了）是两个不同的事实。**只在关卡里有**：
    // 菜单和图鉴上没有"这一局"。
    "progressChart": {
      // 圆点离画布顶边的距离、半径、间距，以及离右边缘的距离。
      "y": 22,
      "pipRadius": 5,
      "pipGap": 8,
      "rightInset": 16,
      // 已通 / 未通 / 当前 的颜色与不透明度。
      "doneColour": 0x6fe3ff,
      "doneAlpha": 1,
      "pendingColour": 0x6fe3ff,
      "pendingAlpha": 0.22,
      "currentColour": 0xffd479,
      "currentAlpha": 0.95,
      // 下面那行"总进度 N/6"的字号与颜色。
      "labelSize": 11,
      "labelColour": 0x7fc4e8
    },

    // 结算卡（破裂 / 冲破海面时那几行结果）。
    "resultsCard": {
      // 字号。
      "size": 26,
      // 卡片中心的纵向位置，占画布高度的比例。
      "yRatio": 0.3,
      // 卡片最宽能占画布宽度的比例：**超过就换行**，不会像以前那样被屏幕两边切掉。
      "widthRatio": 0.92
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

    // 纯 ASCII 文字用的等宽字体：目前只有左上角那排调试读数（build / fps / depth …）。
    //
    // 单独一项，是因为那几行靠空格对齐成列，换成比例字体就读不出列了；而它一个汉字都没有，
    // 不会碰到上面那个回退字体的坑。想让整个界面统一成一种字体，把这一项写成和上面一样即可。
    "monoFontFamily": "ui-monospace, SF Mono, Menlo, Consolas, monospace",
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

        // 外圈光晕色。**要亮，不要饱和**——它以大圆压在气泡内部之上（这是"发光"的做法），
        // 亮度直接决定气泡内部多亮。两个不透明度分别是最外圈和靠内那一圈。
        "glow": 0x9beeff,
        "glowOuterAlpha": 0.16,
        "glowInnerAlpha": 0.22,
        "glowOuterRadiusRatio": 1.55,
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
        "glowOuterAlpha": 0.16,
        "glowInnerAlpha": 0.22,
        "glowOuterRadiusRatio": 1.55,
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
        "glowOuterAlpha": 0.16,
        "glowInnerAlpha": 0.22,
        "glowOuterRadiusRatio": 1.55,
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
    // 开局体积。1.0 是设计基准。
    "start": 1.0,

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

    // 一次受击损失多少体积。固定值，与当前体积无关——这是"挨几下"能算得清的前提。
    "hitCost": 0.2,

    // 吸收一个泡泡能得到多少体积，相对泡泡自身体积的比例。
    // 小于 1 意味着吃小泡泡是亏的（抵消不了成长带来的风险），大泡泡才值得追。
    "absorbEfficiency": 1.0,

    // 气泡的视觉半径，相对泳道宽度的比例（在体积 = 1.0 时）。
    "laneRatio": 0.0425
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
  // ---------------------------------------------------------------------------------------------
  // 掉落物（拾取物）的外观
  // ---------------------------------------------------------------------------------------------
  //
  // 每种一行（\`skill\` = 技能掉落物，\`upgrade\` = 能力升级）。颜色以外都是相对泳道宽度的比例，
  // 所以手机和桌面窗口上看起来的相对大小一致。
  //
  // \`upgrade\` 画成**两个叠起来的箭头**而不是技能那个菱形：形状是玩家在余光里分辨"这是什么"的第一线索，
  // 而这两个掉落物的效果完全不同（一个换掉技能槽，一个永久加强火力）。
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
    // 节奏是"慢 → 渐回"两段：先按 slowFactor 硬慢 slowSeconds，再花 recoverSeconds 线性回到原速。
    "slowFactor": 0.25,
    "slowSeconds": 0.5,
    "recoverSeconds": 0.3
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
  // 三种来源，速率刻意拉开：随时间最慢、打跑/吞噬居中、擦边最快（也最危险）、BOSS 一大笔。
  //
  // 升级池装的是"枪 + 身体 + 技能"（拾取系统已废除，枪管/射速/技能都从这里来）：
  // 必选、全池均匀随机、数值型可叠加、按气泡类型过滤废牌（普通气泡不会抽到吞噬专属）。
  // 跨关保留、死亡清零——和分数同等待遇。
  "mutation": {
    // 随时间自动积累：每秒多少点。最慢的来源——纯挂机 80 秒攒满第一级（首级 80 点），战斗打法更快。
    // 刻意让首级落在这个窗口：第一次升级是选路线的节点，60-90 秒内要能到，玩家先玩明白基础气泡再定身份。
    "autoPerSecond": 1.0,

    // 每种事件给多少点。和 score 表一样：设成 0 就等于把这件事从突变值里拿掉。
    "gain": {
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
      // **贴脸击杀**：在接触半径的 pointBlankRadius 倍以内用枪打跑一只怪（小字「贴脸」）。
      "pointBlank": 8,
      // **远距拆弹**：在爆炸半径外把炸弹鱼打死（小字「拆弹」）。一次性低频事件，给得比贴脸多。
      "defuse": 15,
      // 击败 BOSS：一大笔，跨关携带时滚进下一关的条里（"打完 boss 开局半管"）。
      "boss": 100
    },

    // 贴脸击杀的判定半径：接触半径（你的 + 它的）的多少倍以内算贴脸。
    "pointBlankRadius": 1.3,

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
    "first": 80,
    "growth": 1.3,

    // 选完突变恢复游戏的瞬间给多少秒无敌（角色闪烁）。防止"选完当场被打死"的绝杀。
    "resumeInvulnerableSeconds": 0.5,

    // 每张数值卡一选的量级。卡的名字和文案在 src/mutations.ts（那是内容），这里只有数。
    "pool": {
      // 子弹伤害 +15%/张，可叠加。
      "damagePerPick": 0.15,
      // 转向灵敏度 +10%/张（乘在天赋基准上）。
      "steerPerPick": 0.1,
      // 上升速度 +10%/张（乘在天赋基准上）。
      "ascentPerPick": 0.1,
      // 受伤减免 +8%/张（加在天赋基准上，封顶 0.9）。
      "armorPerPick": 0.08,
      // 修复：立刻回多少体积（一次性，不叠加）。
      "healVolume": 0.5,
      // 受击无敌时长 +0.2 秒/张。
      "invulnSecondsPerPick": 0.2,
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
      // 子弹速度 +25%/张（仅弹幕路线）。
      "bulletSpeedPerPick": 0.25,
      // 子弹半径 +30%/张（仅弹幕路线）：判定和画面同一个数，看见多大就撞多大。
      "bulletRadiusPerPick": 0.3,
      // 子弹射程 +40%/张（仅弹幕路线）：寿命就是射程。
      "bulletRangePerPick": 0.4
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
     // 电鳗：快一点、密一点，因为它的主题是电。
      "eel": { "perSecond": 1.1, "speedPerSecond": 0.3, "spread": 1, "spreadRadians": 0, "damage": 1, "shape": "bolt" },

      // 海胆：**尖刺**，比你见过的其它子弹都快。它本来只会"躺在那儿扎你"，现在既会扎人也会放刺。
      "urchin": { "perSecond": 0.8, "speedPerSecond": 0.5, "spread": 1, "spreadRadians": 0, "damage": 1, "shape": "spike" },

      // ---------------------------------------------------------------------------------------------
      // 四位枪手
      // ---------------------------------------------------------------------------------------------
      //
      // **射水鱼**：基本射手。电鳗是"打不死的纯威胁"，射水鱼是日常款——3 点血，枪能处理掉。
      // 慢节奏（0.8/秒）、中速弹（0.35 泳道/秒），第一课"会开枪的东西也可以被赶走"。
      "archer": { "perSecond": 0.8, "speedPerSecond": 0.35, "spread": 1, "spreadRadians": 0, "damage": 1, "shape": "bolt" },

      // **手枪虾**：精英。单发**大号空化弹**（约 2.6 倍弹径，命中圈和擦弹圈同步变大）
      // × **每次命中 2 个命中点**——\`damage\` 这个字段自射手表诞生起就校验却从未被读，
      // 手枪虾是第一个让它说不一样的话的射手。射速极慢（0.35/秒）、弹速全表最快（0.8 泳道/秒）：
      // 稀疏、快、重，一发就是半管血的威胁。
      "pistol": { "perSecond": 0.35, "speedPerSecond": 0.8, "spread": 1, "spreadRadians": 0, "damage": 2, "shape": "bolt", "radiusRatio": 0.042 },

      // **刺魨**：防御反击型。\`perSecond: 0\` = **从不主动开火**——它的刺什么时候出取决于你什么时候打它
      // （见 hazards.puffer 的反击配置）。这一行只描述刺本身：快、直、尖刺外形。
      "puffer": { "perSecond": 0, "speedPerSecond": 0.45, "spread": 1, "spreadRadians": 0, "damage": 1, "shape": "spike" },

      // **海星**：弹幕型。这一行只定**节奏**（每 2.5 秒一轮）和弹速；一轮打几发、往哪转
      // 是 hazards.starfish 的事——齐射的方向是固定的星形，不瞄人。
      "starfish": { "perSecond": 0.4, "speedPerSecond": 0.3, "spread": 1, "spreadRadians": 0, "damage": 1, "shape": "bolt" }
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
    "label": "正在下潜…",
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
    "speedWindowSeconds": 3
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
  // 想要你给的那个例子（0ms 强度 0 / 15ms 0.25 / 60ms 0）就是：seconds 0.06、riseFraction 0.25、peakIntensity 0.25。
  //
  // **peakIntensity 是"最亮时有多白"**：0.25 = 每个像素朝白色走 25%，保留 75% 本来的颜色。
  // 1.0 = 整个剪影变成纯白（旧的行为，会盖掉贴图本身的细节，所以默认调下来了）。
  // **0 = 整个全身闪白关掉**；设置面板里的"降低闪烁"开关关的也是这一层（只关全身闪白，火花 / 伤害数字 / 重击轮廓都保留）。
  "hitFlash": {
    // 闪多久（秒）。50–70ms 是"看得见但不残留"的区间；0.06 = 60ms。
    "seconds": 0.06,
    // 峰值强度（0..1）。0.25 ≈ 你要求的 20%–30%。**这个数是"全身闪白"的总开关之一：设 0 就彻底不闪。**
    "peakIntensity": 0.25,
    // 升到峰值用掉生命周期的多少比例。0.25 = 前 15ms 冲上去，剩下 45ms 衰减（对应你给的例子）。
    "riseFraction": 0.25,
    // **冷却（秒）**：上一次闪白开始后这么久之内，新的命中不会重新点亮它，只是让正在播的那一次继续播完。
    // 没有冷却的话，一秒十几发的枪会让它一直停在最亮处——那就不是"闪"而是"整只变成白色"了。
    // 0.14 在 0.06 的闪白长度下发火时大约每 2.3 发点亮一次，看起来是"一下一下"的。
    "cooldownSeconds": 0.14,
    // 闪的颜色与"程序画的身体"（没有贴图的敌人）的不透明度。贴图用的是上面的 peakIntensity，这里是那条路径的参数。
    "colour": 0xffffff,
    "alpha": 0.85,
    // 白色覆盖层相对物体半径的倍率（同样是"程序画的身体"那条路径用的）。
    "radiusScale": 1.1
  },

  // ---------------------------------------------------------------------------------------------
  // 命中反馈：重击 / 暴击（只有大伤害才有的两层强调）
  // ---------------------------------------------------------------------------------------------
  //
  // 普通命中 = 火花 + 轻闪白。**重击**再往上加两层：套在身体外的一圈轮廓高亮，和一次很轻的屏幕震动。
  // "多重算重击"由伤害数字决定，不是由武器种类决定——所以以后加一把高伤害的枪，它自动就是重击，不用改代码。
  //
  // 当前的伤害量级：\`bullets.damage\` 是 1，枪的升级（rateTiers + maxStreams）是**同一帧多发**，
  // 所以"两发同时命中同一只"在面板上就是一次 2 点的伤害事件 → heavyDamage: 2 正好让满级双管触发重击，
  // 单管不会。critDamage 目前够不到（留给你以后的高伤害武器），系数到了就是"暴击"，震动按比例更强。
  "hitFeedback": {
    // 伤害达到这个数才算"重击"：触发轮廓高亮 + 轻微屏幕震动。
    "heavyDamage": 2,
    // 伤害达到这个数算"暴击"：震动更强（按 min(1, 伤害 / critDamage) 给强度）。
    "critDamage": 4,
    // 轮廓高亮的颜色、峰值不透明度、相对身体半径的位置、线宽（比例）。
    "heavyOutlineColour": 0xfff2c8,
    "heavyOutlineAlpha": 0.85,
    "heavyOutlineRadiusScale": 1.28,
    "heavyOutlineWidthRatio": 0.14,
    // 轮廓亮多久（秒）。比闪白长：闪白说"打中了"，轮廓说"这一下很重"，后者值得多停一会儿。
    "heavyOutlineSeconds": 0.18,
    // 屏幕震动：设计像素幅度（乘 1 强度的值）与时长（秒）。**0 = 关掉重击的震动。**
    // 8px / 0.12s 是"感觉到一下"而不是"镜头在晃"。
    "heavyShakePixels": 8,
    "heavyShakeSeconds": 0.12
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
    "cooldownSeconds": 2
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
    // 而它的**碰撞直径只有 37px**——也就是说"看得见的鱼比会撞到你的那个圈大 2.5 倍"。
    // 这是 \`scale\` 的定义（只影响观感，不影响碰撞），但 2.5 是全场最高的比例（灯笼鱼 1.35、水母 1.45、盲虾 1.4），
    // 觉得"看着大、其实很好躲"就把 scale 调到 1.0–1.4，**同时按新宽度重定网格**（见 README 的像素化一节）。
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
    // **\`scale\` 不是"想多大就多大"**：它是"图片宽度 = 碰撞直径 × scale"，和 hazards.radius 一起决定
    // **画出来宽度**，而画出来宽度又决定像素网格。所以：
    //
    //     画出来宽度 = 2 × radius(mechanics 的 hazards.radius) × 412 × scale
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
    // 它本来就会放"电箭"（\`enemyBullets.shooters.eel\`，1.1 发/秒、射程 420m、\`shape: "bolt"\`），
    // 所以"放电攻击"不需要第二个机制：**开火的那一瞬间切到带电弧的姿势**，过一会儿回待机。
    // 玩家看到的"它电你了"就是它开火的样子，而开火是它早就在做的事。
    //
    // \`attackSeconds\` 是放电姿势亮多久。射一发的间隔是 1/1.1 ≈ 0.91 秒，0.45 就是"半程带电"：
    // 电弧闪一下再熄。**调大到 0.9 会让这张攻击图变成它的常态**，那待机那张就白做了。
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
      "alpha": 1
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
    }
  },

  "hazards": {
    // ---------------------------------------------------------------------------------------------
    // 体型：每种敌人的半径（占泳道宽度的比例）
    // ---------------------------------------------------------------------------------------------
    //
    // 它同时决定**碰撞**、**绘制大小**和**图鉴卡片里的大小**，所以只有这一处来源，改完刷新即可，不用重新构建。
    // 比例而不是米：窄手机上泳道更窄，比例能让敌人保持"占屏幕多少"的观感一致。
    "radius": {
      "fish": 0.035,
      // **金枪鱼**：比鱼大一档（0.035 → 0.045，+29%）。它是新敌人，行为照旧是鱼那套（追猎 + 冲锋），
      // 区别只在体型。想再大一点就改这里——**同时要改网格**（\`sheet --grid 画出来宽度/1.4\`），
      // 因为像素密度是按"画到屏幕上多大"定的，见 README 的像素化一节。
      "tuna": 0.045,
      // ---------------------------------------------------------------------------------------------
      // 第 4 关的四个猎食者：同一种行为、四种体型。半径决定**碰撞圈**和**画出来多大**（两者是同一个值），
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
    // 受击后的减速倍率和持续秒数（水母）。
    "slowFactor": 0.55,
    "slowSeconds": 1.5,

    // ---------------------------------------------------------------------------------------------
    // 水母
    // ---------------------------------------------------------------------------------------------
    //
    // 它碰到你时扣几个命中点。
    //
    // 减速本身是水母存在的理由（它是"你在错的时间站在错的地方"这件事的账单），但只有减速的话，
    // **碰到水母比碰到鱼更划算**——而一只又慢又躲不开的漂浮物绝不能是这样。现在它要见血，
    // 而减速让这笔血更疼：你既受了伤，接下来一秒还很笨拙。
    "jelly": {
      "contactDamage": 1
    },

    // ---------------------------------------------------------------------------------------------
    // 血量：被小泡泡子弹打几下才会跑
    // ---------------------------------------------------------------------------------------------
    //
    // 掉光血**不等于死**：它会掉头加速游出屏幕（见下面的 fleeSpeedFactor）。设计上这是有意的——
    // 生物在这个游戏里不是拿来杀的，"把它赶走"才是玩家能做的事（和"吃掉它"并列的第二条出路）。
    //
    // 0 = 子弹对它无效，直接穿过去。默认**只有鱼有血**：要打的是追上来的鱼，其它生物（水母、
    // 螃蟹、海胆、炸弹鱼、电鳗…）保持原来的威胁感。想让哪一种也能被打跑，把它的数字改成正数即可。
    // 每种危险物都必须在这里有一行，漏了会加载报错（见 src/mechanisms.ts 的检查）。
    "health": {
      // 鱼 2：两发打跑。它现在会冲锋，所以"打得跑"是它唯一的弱点。
      "fish": 2,
      // 金枪鱼 3：比鱼厚一点（它比鱼大一档）。也可以给 2 让它和鱼一样脆——那它就是一个更大的靶子。
      "tuna": 3,
      // 第 4 关的四个猎食者：血量跟着体型走，而**海豚是例外**——它只有 3，和鱼一样脆。
      // 它是四个里唯一"可以早早吃掉"的一个，这是刻意的：一关全是不好惹的东西，玩家就只剩躲了。
      // 座头鲸 8：全场最厚，但也是最慢的，慢到你来得及决定是打它还是绕开。
      "dolphin": 3,
      "octopus": 5,
      "shark": 6,
      "whale": 8,
      // 水母 2：比鱼软一点，但它会从侧面冲过来，所以"打得跑"是它唯一的弱点。
      "jelly": 2,
      "trash": 0,
      "crab": 0,
      // 海胆 15：它能开枪，所以"打得跑"是慢工（15 发），但它掉头就跑。
      "urchin": 15,
      // 炸弹鱼 10：你可以在它靠近之前打爆它——但那是**原地**爆炸，离太近照样挨。
      "bombfish": 10,
      // BOSS 的血量在**关卡**里给（见 config/levels.json5 的 boss.health）：同一只 BOSS 在第二关可以更厚，\`n      // 那是关卡强度，不是机制。这里留一行是为了让"每种危险物一行"这条约定继续成立。
      "boss": 0,
      // 喷口（黑烟囱）：**碰到就是死**（5 点伤害，而体积 1 的气泡只有 1 点血）。\`n      // 它不"打跑"，它是地形：这一关要学的是**横向离开**，不是硬扛。
      "vent": 0,
      "mineral": 0,
      "shrimp": 2,
      "angler": 10,
      "torpedo": 2,
    // 电击水母：碰到或被攻击都会放一圈电。血量给 2：它是"别乱碰"的，不是"打不动的"。
      "zapper": 2,
      // 第六关：碎浪泡沫是**环境干扰**，打不掉（0 血 = 子弹穿过去），它挡住的是你的视线和判定。
      "foam": 0,
      "rain": 0,
      "eel": 0,
      "rot": 0,
      "oil": 0,
      // 四位枪手全部可被打跑（这是它们和"打不死的电鳗"的分界）：
      // 射水鱼 3（日常款，几发就跑）、海星 4（软）、刺魨 6（硬，而且打它有代价）、手枪虾 10（精英）。
      "archer": 3,
      "pistol": 10,
      "puffer": 6,
      "starfish": 4
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
    // （0.714 × 1.4 ≈ 1 点），所以单独调其中一个会让它数学上无法造成伤害——那正是这两个数放在同一块里的理由。
    "trash": {
      // 缠住你时每秒吸走多少血。
      "drainPerSecond": 0.714,
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
    // **这一关的招牌**：喷口上方是一根致命的柱子，进去就是死（\`contactDamage\` 5 点，而开局气泡只有 1 点血）。
    // 它教的不是"躲子弹"，而是"横向离开"——唯一能救你的是左右键，不是往上冲。
    //
    // 公平性的全部依据是**看得见**：柱子会画出上升的烟流和一条边界线，而且喷发是**周期性的**
    // （\`periodSeconds\`），所以玩家能学会节拍，而不是被一根看不见的柱子随机处死。
    "vent": {
      // 柱子的半径（泳道比例）与它的伤害。伤害给得远高于任何血量，就是"会被杀死"的意思。
      "radiusRatio": 0.085,
      "contactDamage": 5,

      // 喷发一个周期多少秒，以及一个周期里喷多久。剩下的时间是**安全窗口**——玩家就是靠它过去的。
      "periodSeconds": 4.2,
      "activeSeconds": 2.6,

      // 喷发前的预警时长（秒）：烟流变亮变粗，这时候还来得及横移出去。
      "warnSeconds": 0.7,

      // 烟流外观。
      "plumeColour": 0x2a1b22,
      "glowColour": 0xff5a3c,
      "edgeColour": 0xffb066,
      "edgeAlpha": 0.7
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

    // 盲眼虾：从侧面缓慢靠近，试图戳破气泡。
    "shrimp": {
      // 横向逼近速度（泳道宽/秒）。慢，而且**不追踪**——它朝一个方向走到底。
      "driftSpeedFactor": 0.11,
      // 它戳一下扣几点。
      "contactDamage": 1
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
      "contactDamage": 0,
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
      "contactDamage": 1,
      "colour": 0xbfe8ff,
      "lengthRatio": 0.09
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
      "chainDamage": 4,
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
      "contactDamage": 1
    },

    // ---------------------------------------------------------------------------------------------
    // BOSS：每关最后必须打掉的那只
    // ---------------------------------------------------------------------------------------------
    //
    // **它不属于水流**：BOSS 不随水漂走，而是**咬住画面**——它一直停在你上方 \`holdMeters\` 处横向游弋，
    // 所以你不可能"跑过去"。血量、名字、出现位置是**关卡**给的（那只属于关卡强度），
    // 这里只管它怎么动、怎么打、多大、什么颜色。
    "boss": {
      // 它悬停的高度，三个数一起决定，**因为它必须以"看得见"为准**。
      //
      // 这里原来只有一个绝对值 330m。手机上可见深度约 800m，330 稳稳在屏内；但**窗口越宽越扁，可见深度越小**
      // （1280x720 只有约 289m），330 就跑到屏幕上方去了——BOSS 悬在画面外，玩家永远看不到它，
      // 而关卡又只有打死它才结束。这就是"第一关的 BOSS 没有出现"。
      //
      // 现在：\`holdMeters\` 是**上限**，实际高度 = 可见深度 × \`holdBandRatio\`，再夹到 \`holdMinMeters\` 之上。
      // 于是它在任何窗口里都在屏内，而且不会贴到脸上。
      "holdMeters": 330,
      "holdBandRatio": 0.34,
      "holdMinMeters": 90,

      // 横向游弋的幅度（泳道比例）与周期（秒）。这是"弹幕从一个会动的炮台来"的全部来源。
      "patrolAmplitude": 0.36,
      "patrolPeriodSeconds": 4.6,

      // 它横向追你的速度（泳道/秒）。比玩家慢，所以它压过来的时候你有地方去。
      "seekSpeedFactor": 0.16,

      // 碰到它扣几点。
      "contactDamage": 1,

      // 体型（泳道比例）。做得大是刻意的：它是这一关的答案，不是又一条鱼。
      "radiusRatio": 0.11,

      // 默认颜色；关卡可以覆盖它（config/levels.json5 的 boss.colour）。
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
    // 电鳗
    // ---------------------------------------------------------------------------------------------
    //
    // **电鳗**：它的威胁是**射出来的电箭打中你**——躲得掉，但会连续来（约 1.1 发/秒）。
    //
    // 被电期间**左右操作是反的**——这就是规格说的"短暂失控"。刻意只反横向：关卡是纵向上升的，
    // 把纵向也反过来会让玩家觉得是关卡坏了，而不是气泡被电了，而"手不听话"恰恰是要让人立刻察觉的。
    // 0.5 秒是刻意短：它的作用是让人**慌一下**并为此改航线，不是让人白白送命。
    "eel": {
      // **电箭打中你，失控多久（秒）。** 设成 0 就整条关掉，电鳗变成普通的硬家伙。
      "boltShockSeconds": 0.5,
      // 被电期间气泡上那圈锯齿电光的颜色与线宽（相对气泡半径）。
      //
      // 这个提示**必须存在**：控制反转是玩家唯一会怀疑"游戏坏了"的机制，所以失灵的瞬间必须在气泡上看得见，
      // 而且要看起来像"我被电了"而不是"我按错了"。刻意用近乎白的冷色而不是电鳗自己的黄绿——
      // 阶段色已经占了气泡本体，电鳗的色是给**它**用的，这个是给**我**用的。
      "shockColor": 0xeaffff,
      "shockWidthRatio": 0.14
    },
    // ---------------------------------------------------------------------------------------------
    // 四位枪手（移动与各自的核心机制；弹药的节奏/速度/伤害在 enemyBullets.shooters 那边）
    // ---------------------------------------------------------------------------------------------
    //
    // 四个都是**随水流漂的炮台**：枪手的威胁在弹不在脚，而漂着下坠本身就会扫过玩家的泳道——
    // 和电鳗/海胆同一套移动模型，玩家不需要学第二条移动规则。
    //
    // **射水鱼**：唯一只管漂的——它的全部个性都在射手行里（弹型、节奏、可打跑的 3 点血）。
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
      // 只有值，没有用武之地：edibleAtTier 把它锁在 99，所以 BOSS 永远吃不到。表要有这一行，\`n      // 只是为了让"两张表的键必须一致"那条加载期检查继续有效。
      "boss": 40,
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
      "starfish": 0.35
    },

    // 吃下每种危险物所需的**档位**，对应上面 tierVolume 的下标 + 1。
    //   1 = 体积 0.0 起（开局就能吃，现在没有这种）
    //   2 = 体积 2.2 起
    //   3 = 体积 4.0 起
    //   4 = 体积 6.0 起
    //   5 = 体积 8.5 起
    //
    // 现在的阶梯：鱼 2、水母 3、垃圾 3、螃蟹 4、**炸弹鱼 2、海胆 3、电鳗 2**。
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
      "vent": 5,
      "mineral": 5,
      "shrimp": 2,
      "angler": 3,
      "torpedo": 3,
      "zapper": 3,
      "foam": 5,
      "rain": 5,
      "urchin": 3,
      "eel": 2,
      "rot": 3,
      "oil": 2,
      // 四位枪手全是 3 档（体积 4.0 起）：开局它们是纯威胁，长到中期变成补给——
      // 和水母同档，"会开枪的东西也能吃"是反转节奏的一部分。
      "archer": 3,
      "pistol": 3,
      "puffer": 3,
      "starfish": 3
    },

    // 吃下危险物得到的质量，相对它自身 mass 的比例。
    // 小于 1 表示"吃有损耗"：吃一只鱼得到的比它自身轻，于是不能靠吃危险物无限膨胀。
    "massEfficiency": 0.85,

    // 吃下危险物时的短暂无敌（秒）。和阶段晋升同理由：刚完成一次吞食就被旁边的东西撞上，
    // 手感上会觉得游戏在惩罚你做对了事。
    "eatInvulnerableSeconds": 0.35,

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

    // 速度，单位是"泳道宽/秒"。屏幕上看到的接近速度 = 这个 + 关卡自己的卷动速度（水在往下走），
    // 所以不用把它调得很大也能追上迎面来的东西。
    "speedPerSecond": 1.6,

    // 半径，相对泳道宽。做得很小：它是泡泡，不是炮弹，不该挡住玩家看危险物的视线。
    "radiusRatio": 0.011,

    // 每发伤害（点）。和 hazards.health 一起决定"几发打跑一条鱼"：默认 2 血 ÷ 1 伤 = 两发。
    "damage": 1,

    // ---------------------------------------------------------------------------------------------
    // 火力升级（拾取"能力升级"之后）
    // ---------------------------------------------------------------------------------------------
    //
    // 每拾取一个，枪就**多一排**：一次齐射从每排各出一发（不是提高射速），所以 DPS 成倍增长。
    // 和"射速升级"是两个独立的乘数：排数 × 射速，各有各的上限，各自一个道具。
    // 排的横向间距按泳道宽度的比例给，两条弹道会分别在气泡左右，中间留出缝——既看得出是两排，
    // 也不会把整个泳道糊住（那会让"躲"这件事失去意义，因为敌人也在同一条泳道里）。
    "upgradeSpreadRatio": 0.075,

    // 排数上限。默认 2（也就是这个道具的承诺："同时发射两排"）。
    // **设成 3 或 4 它就能叠加**：再捡一个就再多一排，到上限为止。上限内重复拾取会被消耗掉但不再变化。
    "maxStreams": 2,

    // 存活秒数。超时就消失，免得屏幕被子弹堆满（也会限制射程）。
    "lifeSeconds": 2.2,

    // 外观：一颗亮芯 + 一圈淡边，和其它泡泡一样的画法，所以它是"气泡"而不是"激光"。
    "colour": 0xd8fbff,
    "alpha": 0.85,
    "rimColour": 0x7fc4e8,
    "rimAlpha": 0.7
  },
  // ---------------------------------------------------------------------------------------------
  // 图鉴页（主菜单进入）
  // ---------------------------------------------------------------------------------------------
  //
  // 一页一页的卡片：敌人、环境、气泡自己、技能、天赋。**卡片里的数字不是写死的**——质量、档位、耐久、
  // 技能次数这些都从下面那些段里读出来（\`src/codex.ts\` 只提供文案），所以改了数值图鉴就会跟着变，
  // 而不是变成一份没人维护的旧说明书。
  //
  // 下面这些全是**排版**：单位是设计像素，会乘上 HUD 的设计缩放（\`designScale\`），所以在手机和桌面上
  // 比例一致。想改观感就改这里，不用碰代码。
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

  "codex": {
    // **全屏预览**（点卡片放大看图）的遮罩：颜色与不透明度。压在整张画布上，所以文字要能压得住。
    "previewScrimColour": 0x030a17,
    "previewScrimAlpha": 0.96,
    // 卡片网格：列 × 行 = 一页几张。每页固定这么多，放不下就翻页（页脚有页码）。
    "columns": 2,
    "rows": 3,

    // 页面四边的留白、卡片之间的间隙。
    "margin": 16,
    "gap": 8,

    // 页头（标题 + 页签 + 页码）占的高度，以及页脚（翻页/返回按钮）占的高度。
    "headerHeight": 104,
    "footerHeight": 46,

    // 标题。
    "titleSize": 22,
    "titleY": 18,
    "titleColour": 0xeaf9ff,

    // 分类页签一行：高度、间距、文字大小，以及选中/未选中的底色与文字色。
    "tabHeight": 26,
    "tabGap": 4,
    "tabTextSize": 12,
    "tabFill": 0x0d2233,
    "tabStroke": 0x2f5f86,
    "tabTextColour": 0x7fb6d4,
    "activeTabFill": 0x1d3f5c,
    "activeTabStroke": 0x9fe4ff,
    "activeTabTextColour": 0xeaf9ff,

    // 页码那一行。
    "pageTextSize": 10,
    "pageTextColour": 0x6fa8c8,

    // 卡片本体：圆角、底色、边线。
    "cardRadius": 8,
    "cardFill": 0x0a1c2e,
    "cardFillAlpha": 0.92,
    "cardStroke": 0x2f5f86,
    "cardStrokeAlpha": 0.65,
    "cardPad": 10,

    // 卡片里图标的边长（正方形区域），以及它离卡片左上角的距离。
    "iconSize": 46,

    // 卡片文字：名字、一句话、以及"事实"行的标签与值。
    "nameSize": 15,
    "nameColour": 0xeaf9ff,
    "taglineSize": 10,
    "taglineColour": 0x9fc7de,
    "factSize": 9,
    "factLeading": 13,
    // 「事实」的标签列宽度（设计像素）：值从这一列之后开始，所以数值在卡片上成列对齐。
    "factLabelWidth": 46,
    "factLabelColour": 0x6fa8c8,
    "factValueColour": 0xd8fbff,
    "noteSize": 9,
    "noteColour": 0x7fb6d4,
    "noteLeading": 12,
    // 要点行前面那个「·」的缩进（设计像素）。它是一颗**独立的文字对象**而不是拼在句首的字符：
    // 拼进去就等于在句子里放了一个空格，而 Pixi 的换行以空格分词——整句中文会被当成一个"词"，
    // 于是它换到下一行、只留下一个孤零零的「·」在上面。
    "noteBulletIndent": 11,

    // 页脚按钮：大小、底色、边线、文字。
    "buttonHeight": 30,
    "buttonPad": 14,
    "buttonRadius": 7,
    "buttonFill": 0x123048,
    "buttonStroke": 0x3d7fa8,
    "buttonTextColour": 0xd8fbff,
    "buttonTextSize": 12,

    // 没有自己配色可用时，图标用的颜色：收集物（泡泡）、技能掉落物、天赋。
    // 有配色的实体一律用它们自己的（危险物用 hazards、障碍用 obstacles、吸附用 suction）。
    "collectableColour": 0xaef2ff,
    "skillColour": 0xe8d6ff,
    "talentColour": 0xffcf6b
  },

  // ---------------------------------------------------------------------------------------------
  // 主菜单的按钮
  // ---------------------------------------------------------------------------------------------
  //
  // 两个入口：开始游戏、图鉴。它们**共用同一套几何**（宽/高/圆角/间距），因为两个按钮错开尺寸会让菜单看起来
  // 没对齐；想分别调就把几何也拆成两套，但先别。
  //
  // 「图鉴」用的是**描边式**而不是填充式：它是次要入口，一眼看上去主次就该分得开，不必读文字。
  "menu": {
    // 按钮宽度是泳道宽度的比例，但有像素上限——宽窗口下泳道是 900px，按钮不该跟着长到 630px。
    "buttonWidthRatio": 0.7,
    "buttonMaxWidth": 280,
    "buttonHeight": 52,
    "buttonRadius": 12,

    // 两个按钮之间的纵向间距。
    "buttonGap": 14,

    // 「开始游戏」：填充色、按下时的填充色、文字色与字号。文字用深色，因为底是亮的。
    "primaryFill": 0x6fe3ff,
    "primaryPressedFill": 0x8fe3ff,
    "primaryTextColour": 0x08131f,
    "primaryTextSize": 18,

    // 「图鉴」：底色、按下时的底色、描边与它的不透明度、文字色与字号。
    "secondaryFill": 0x0d2233,
    "secondaryPressedFill": 0x1d3f5c,
    "secondaryStroke": 0x9fe4ff,
    "secondaryStrokeAlpha": 0.75,
    "secondaryTextColour": 0xd8fbff,
    "secondaryTextSize": 15,

    // 「开始游戏」那一圈的描边，以及它的透明度。
    "buttonStroke": 0xd8fbff,
    "buttonStrokeAlpha": 0.8,

    // --------------------------------------------------------------------------------------------
    // 主菜单那行字（关卡格与「开始游戏」之间）：基础气泡的一句话介绍。
    // 选角行随类型系统一起删了——这行字还在，因为关卡格是从它往上量的。
    // --------------------------------------------------------------------------------------------
    //
    // 那行字与「开始游戏」之间的间距，以及它自己的字号。
    "taglineGap": 16,
    "taglineSize": 12,
    // --------------------------------------------------------------------------------------------
    // 关卡选择（主菜单）
    // ---------------------------------------------------------------------------------------------
    //
    // 一局玩哪一关现在是个选择。**关卡顺序就是解锁顺序**：通关第 N 关解锁第 N+1 关，
    // 所以这一行同时是"选择"和"进度"的显示位置。
    //
    // 三种状态：选中（填充）、可选（描边）、**锁着**（更暗、更冷，文字也暗）。
    // 锁着的那一格按下去不会有反应——不是报错，是"还不能选"。
    "levelRowHeight": 34,
    // 关卡行与它下面那行文字（锁着的提示 / 解锁通知）的间距。
    "levelRowGap": 10,
    // 关卡行与上方标题之间的间距。
    "levelRowTopGap": 40,
    "levelTextSize": 13,
    // 关卡名字下面那行状态文字的字号。
    "levelNoteSize": 11,
    // 一格关卡能占的最大宽度比例（关卡多了会平分整行，但不能挤成一条）。
    "levelMaxWidthRatio": 0.3,

    // 每颗关卡药丸至少占菜单宽度的这个比例。**它决定一行放几颗**：0.3 → 一行 3 颗（6 关就是两行）。
    // 调小 = 一行塞更多（名字更挤），调大 = 更早换行。
    "levelMinWidthRatio": 0.3,
    "levelSelectedFill": 0x2f6f8f,
    "levelSelectedStroke": 0xd8fbff,
    "levelSelectedTextColour": 0xeafcff,
    "levelIdleFill": 0x0f2333,
    "levelIdleStroke": 0x4f86a8,
    "levelIdleTextColour": 0x9fc4d8,
    // 锁着的那一格：填充更暗、描边更弱，文字也压暗。刻意不用锁的图标——一个暗格子加一行说明就够，
    // 而且图标要在 canvas 里手画，代价和收益不成比例。
    "levelLockedFill": 0x0a1a26,
    "levelLockedStroke": 0x2c4a5e,
    "levelLockedTextColour": 0x54748a,
    // 状态文字的颜色：普通提示、以及"解锁了"的高亮。
    "levelNoteColour": 0x7fb2cc,
    "levelUnlockColour": 0xffd479
  },

  // ---------------------------------------------------------------------------------------------
  // 障碍物（木箱、珊瑚、封路木箱、渔网）
  // ---------------------------------------------------------------------------------------------
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
    // 每种障碍的"要做多少功才能弄掉它"。
    //
    // 木箱/珊瑚/封路木箱/管虫的单位是**伤害点**（撞击伤害，或暴怒气泡的冲撞/爆破伤害）。
    // **渔网的单位是秒**——它不是被打碎的，是被**撕开**的：挂在网上每过一秒就算 1 点，所以
    // 0.4 就是"在网里待 0.4 秒"。
    //
    // 0.4 秒这个数是被**物理**定下来的，不是手感：玩家被卷轴以 25m/s 带着走，和一张网的重叠大概只有 0.5 秒
    // （接触距离约 13m）。任何比这更长的撕裂时间都意味着"一次穿过永远撕不开"，而那会让网看起来什么都没做。
    "health": {
      "crate": 1.0,
      "coral": 3.5,
      // 3.0：暴怒气泡的冲撞（slamDamageBase 1.8）两下、爆破（obstacleDamage 1.6）两下。
      "wall": 3.0,
      // 0.4 秒的撕开时间，见上面的说明。
      "net": 0.4,
      // 管虫：软体，受刺激才伸出来。3.0 和封路木箱一样厚——它挡的是路线，不是血量。
      "tube": 3.0
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
    "ramDamagePerVolume": 1.1,

    // 撞不碎时对玩家造成的伤害（点）。**渔网不适用**：它软，只会拖慢你，不掉血。
    "collideDamage": 1,

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
          { "image": "珊瑚-管状", "scale": 1.36 }
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
  // 现在每个形态的配色只有两套：成长阶段（青→金→粉，基础与吞噬/弹幕路线）和怒气（蓝→橙→红，沸腾路线）。
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

    // 冲撞（按住压缩蓄力、松手发动）。
    "charge": {
      // 冲撞的初速，两个轴分别给：竖直用"每秒多少个屏幕高度"，水平用"每秒多少个泳道宽"。
      // 单位是**屏幕比例**，和蟹的击飞冲量同一套（见 main.ts 里那段换算说明），所以不会一帧飞出屏幕。
      // 位移大致等于 速度 × hazards.launchDecaySeconds（冲量按指数衰减）。
      "launchScreenSpeed": 2.0,
      "launchLateralSpeed": 1.1,

      // 冲撞的"猛撞窗口"：松手后这段时间内的接触算冲撞，之后只是普通位移。
      // 短了会撞空，长了会变成"一直在猛撞"。
      "slamSeconds": 0.55,

      /**
       * 破坏力：P = base × (1 + rageScale × 怒气/上限)。
       *
       * 这是设计文档第八节的公式，满怒时是基础值的 2.5 倍（1 + 1.5）。
       *
       * **关键：破坏力只由怒气决定，和体积无关。** 这不是随手一写，它是对设计文档里那个风险
       * （"挨打换来怒气，但挨打也让你快死了，于是有怒气却用不出来"）的**正面回答**：
       * 变小不会让武器失效，所以"残血反打"是可行的，而不是死循环。
       */
      "slamDamageBase": 1.0,
      "slamRageScale": 1.5,

      // 撞中东西要花怒气：撞到普通障碍 −15，把东西撞碎 −35。
      // 这既是"怒气是消耗品"的来源，也让冲撞不能一直按着不放手。
      "rageCostPerHit": 15,
      "rageCostPerBreak": 35,

      /**
       * 冲撞能不能撞碎"任何体积都撞不碎"的东西（\`obstacles.ramVolume\` 为 null 的：封路木箱和渔网）。
       *
       * 设计文档把这一条列为必须一起定的问题（第四次「和已有障碍规则的对齐」）：\`wall\` 的答案是
       * "弹药或最小缺口"，而暴躁气泡的答案是"怒气够高就撞碎"——同一道题的第三个答案。
       *
       * 默认 **true**，理由是：如果暴躁气泡对木箱也无能为力，那它的核心动词就变成了一句空话，
       * 而它为此付出的代价是**怒气**（撞碎 −35），也就是"用受伤换来的资源买一次通行"。
       * 想让封路木箱对它也保持绝对的墙，把这里改成 false 就行。
       */
      "slamBreaksUnrammable": true,

      // 蓄力时方向锁定：按住时如果拖动/方向键**没有**输入，就沿用最后一次的朝向；有输入就继续更新朝向。
      // 所以"拖着瞄准 → 松手锁定 → 放手冲"是自然动作，而完全不瞄也能直接向上冲（下面这个兜底方向）。
      "defaultAimY": 1,
      "defaultAimX": 0
    },

    /**
     * 外观：**只有颜色随怒气变**，几何与透明度共用下面的 \`look\` 段。
     *
     * 这是刻意的：设计文档要求蓝色 → 橙色 → 红色 → 赤红，而这四个阶段共用同一个气泡形状，
     * 差别全在色相上。把二十项几何复制四遍，只会让"改一下光晕半径"变成改四处。
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
      {
        "name": "失控", "minRage": 85,
        "rim": 0xff2438, "glow": 0xff5a5a, "sheen": 0xffd0d0, "specular": 0xffd0d0, "hudColor": 0xff5566,
        "shake": 0.042, "swell": 0.085
      }
    ],

    // 四个怒气阶段共用的几何与透明度（颜色在上面每一阶段里）。
    "look": {
      "radius": 1.0,
      "inner": 0xeafcff,
      "innerAlpha": 0.16,
      "rimAlpha": 0.95,
      "rimWidthRatio": 0.14,
      "glowOuterAlpha": 0.1,
      "glowInnerAlpha": 0.2,
      "glowOuterRadiusRatio": 1.75,
      "glowInnerRadiusRatio": 1.22,
      // 内侧的第二道细环：暴怒以上用**形状**再加一层信号，因为橙和红在小尺寸下不好区分。
      "innerRing": true,
      "innerRingAlpha": 0.5,
      "innerRingWidthRatio": 0.06,
      "sheenAlpha": 0.5,
      "specularAlpha": 0.7
    },

    // 冲撞时把判定半径放大一点，让"撞中"比贴边更容易——冲撞是主动动作，判太严会显得没反应。
    "slamRadiusBonus": 0.3,

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
       * 1.6 是**刻意只够震碎"脆弱岩层"**：木箱（1.0）和渔网（0.4）碎掉，珊瑚（3.5）和封路木箱（3.0）
       * 只掉一层皮。撞开木箱是**冲撞**的活（\`slam\`），如果爆破也能一键开路，那冲撞就没有存在理由了——
       * 两条路必须各有各的答案。
       */
      "obstacleDamage": 1.6,

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
        // BOSS 也是 push：怒气爆发推得动它，但清不掉。**这是刻意的**——一个能被技能删掉的 BOSS\`n        // 会让"这一关的终点"取决于你有没有那个技能，那它就不是终点了。
        "boss": "push",
        // 热液喷口和它的矿物颗粒是**地形**：冲击波推不动它们，也清不掉。\`n        "vent": "push",
        "mineral": "push",
        "zapper": "destroy",
        "foam": "push",
        "rain": "push",
        "shrimp": "destroy",
        "angler": "push",
        "torpedo": "push",
        // 喷口是地形：冲击波推不动它（它长在海床上），也清不掉。
        "vent": "push",
        "mineral": "push",
        "zapper": "destroy",
        "foam": "push",
        "rain": "push"
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
    "overload": {
      // 倒计时长度（秒）。设计文档说"约数秒"，4 秒是它给的具体建议。
      "seconds": 4.0,

      // 转向灵敏度降低：失控期间两轴速度乘这个系数（和渔网用同一套 \`applySlow\`，所以两条机制的"变笨"
      // 是同一件事，不会出现两种手感）。1 = 不惩罚。
      "steerFactor": 0.55,

      /**
       * 碰撞体积增大：判定半径乘 (1 + 这个值)。
       *
       * 这一次**判定真的变大**，和外观里的 \`swell\` 不同——\`swell\` 是画出来的呼吸（判定不动），
       * 而设计文档第三节明确写的是"碰撞体积增大"。两个数都留着是因为它们回答的是两个问题：
       * 一个是"看起来在膨胀"，一个是"真的更容易被撞到"。屏幕上的半径在失控时同时乘上两者。
       */
      "radiusBonus": 0.22,

      // 失控期间的撞击破坏力：设计文档说"能够摧毁大部分普通障碍"。
      // 它和冲撞用的是同一条路径（\`slam\`），区别是**失控期间不花怒气**——否则连续撞几下就把怒气撞光，
      // 而那时玩家已经没法用爆破解套了，倒计时会变成纯粹的陷阱。
      "ramDamage": 6.0,

      // "撞碎一个大型目标"算释放：血量 ≥ 这个值的障碍（珊瑚 3.5、封路木箱 3.0）撞碎就结束失控。
      // 木箱（1.0）和渔网（0.4）不算——它们太小，撞碎它们是顺手，不是"释放"。
      "releaseHealth": 3.0,

      /**
       * 没释放的惩罚：重伤若干"命中点"，**但永远不会因此破裂**。
       *
       * 只掉到还剩 1 个命中点为止：一个玩家没来得及按按钮，不该被判死刑。
       * 设计文档说得很清楚："不会直接结束游戏"。
       */
      "punishHits": 3
    },

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

      // 音乐总音量（再乘以设置里的音量）。
    "music": {
      "volume": 0.5,
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
    // 也是让"天赋反噬"变成雪崩的那一环。
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
    // 从**下方**进场时这个速度要盖过水流速度（关卡的 scrollSpeed，默认 25），否则它会一直被水流带着往下，
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

  // =====================================================================================================
  // 技能（skills）：关卡里捡到的道具。**每个道具的全部数值都在它自己那一块里**——
  // 想知道"冲刺有多快"只需要看 dash，不用在几张按数字类型分的表之间数下标。
  //
  // 为什么它们在配置文件里而不是在 src/skills.ts 里：它们全是**平衡数值**，而平衡是这个文件存在的理由。
  // 代码那边只留"这个道具叫什么、说什么"（名字和一句话说明是内容，不是旋钮）。
  //
  // 名字（name）和说明（blurb）在 src/skills.ts 的 SKILLS 表里；这一块只管数字。
  // 缺一项会在启动时报错并点名——所以加一个技能时，这里少写一行不是"用默认值"，是打不开。
  // =====================================================================================================
  "skills": {
    "dash": {
      // 拿到手能用几次。次数是这个游戏的稀缺资源，所以两个"清场"的技能最少（见 decoy / burst）。
      "uses": 3,
      // 效果持续秒数。0 = 瞬间生效、没有持续时间（不占玩家身上的技能槽）。
      "durationSeconds": 1.5,
      // 持续期间的上升倍率。2.6 = 这段时间里爬升速度是平时的 2.6 倍。
      "ascentMultiplier": 2.6
    },

    "decoy": {
      "uses": 2,
      "durationSeconds": 0,
      // 假气泡把鱼吸过来的半径（米）。大一点才有"整片鱼被引走"的观感。
      "decoyRadiusMeters": 260,
      // 假气泡存在多久（秒）。
      "decoySeconds": 4
    },

    "vortex": {
      "uses": 1,
      "durationSeconds": 1.2,
      // 收集物被吸过来的半径（米）。
      "vortexRadiusMeters": 220,
      // 每秒把收集物拉近多少（距离的比例）。**故意不是瞬间**：一下全吸到手上，屏幕上就没有气泡自己的
      // 移动了，而这个游戏的手感全在那个移动上。
      "vortexPullPerSecond": 2.2
    },

    "stink": {
      "uses": 2,
      "durationSeconds": 1.0,
      // 把垃圾袋和水母推开的半径（米）。"推开"和"清掉"是两件事——臭云只推，不删。
      "stinkRadiusMeters": 170
    },

    "shell": {
      "uses": 2,
      "durationSeconds": 3,
      // 无敌秒数。和 durationSeconds 分开写是刻意的：壳的效果（无敌 + 推开）可以比玩家身上的计时更长，
      // 改一个不该顺手改另一个。
      "invulnerableSeconds": 3,
      // 期间把危险物推开的半径（米）。
      "shellRadiusMeters": 320
    },

    "burst": {
      "uses": 1,
      "durationSeconds": 0,
      // 把周围一切推开的半径（米）。**它只推不删**：直接删掉实体，尾盘的密度就没有意义了。
      "burstRadiusMeters": 320
    }
  },

  // =====================================================================================================
  // 天赋（talents）：出生时随机roll一个，一局不变。同样一块一个。
  //
  // 设计上的共同点（见 src/talents.ts 的文件头）：**每个天赋都有代价**——
  // 救命的机制同时是敌人繁殖的机制。所以这里的数字一半是"给你什么"，一半是"收你什么"。
  //
  // 名字和说明在 src/talents.ts 的 TALENTS 表里。
  // =====================================================================================================
  "talents": {
    "soda": {
      // 上升倍率。+25% 上升，代价是横向更飘。
      "ascentMultiplier": 1.25,
      // 横向操控被削到多少（比例）。**用"减少操控权"而不是"加质量"来表达"飘"**：
      // 这个模型里只有操控权，操控权小 = 一次修正飘出去更远，玩家感到的就是滑。
      "steerPenalty": 0.6
    },

    "silt": {
      // 出生体积。更大 = 更结实，也更容易被鱼和水母优先锁定（这就是它的代价）。
      "startVolume": 1.3,
      // 挨打时**免除**缩小多少（0..1）。0.6 = 只吃 40% 的缩小。
      "shrinkResistance": 0.6
    },

    "fish-fart": {
      // 屁清场的半径（米）。碰到鱼自动放，所以它更像反射而不是护盾。
      "radiusMeters": 70,
      // 冷却秒数。没有冷却的话玩家可以一直往鱼身上撞——这也是它必须是"反射"的原因。
      "cooldownSeconds": 1.4,
      // 一个屁留下几个诱饵气泡。**这是这个天赋的反噬**：屁推开鱼，同时喂鱼让它们分裂，
      // 所以救完场不收尾的话，鱼群会变多。
      "baitCount": 3
    }
  }
}















































`;function H(e){throw Error(`config/mechanics.json5 is invalid: ${e}\nThe file is JSON5, so it allows // comments, trailing commas, unquoted keys and hex literals.`)}function zc(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.values(e);return t.length>0&&t.every(e=>typeof e==`number`&&Number.isFinite(e))}function Bc(e){return[{path:`${e}.lifeSeconds`,check:e=>typeof e==`number`&&e>.2&&e<=12,describe:`seconds above 0.2 and at most 12`},{path:`${e}.risePx`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`design pixels between 0 and 200`},{path:`${e}.riseEase`,check:e=>typeof e==`number`&&e>.05&&e<=6,describe:`an exponent above 0.05 and at most 6`},{path:`${e}.size`,check:e=>typeof e==`number`&&e>=8&&e<=48,describe:`a font size between 8 and 48`},{path:`${e}.colour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`${e}.alpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`${e}.weight`,check:e=>e===`bold`||e===`normal`,describe:`'bold' or 'normal'`},{path:`${e}.prefix`,check:e=>typeof e==`string`&&e.length<=8,describe:`a string of at most 8 characters; the empty string is allowed`},{path:`${e}.fadeFrom`,check:e=>typeof e==`number`&&e>=0&&e<1,describe:`a fraction of the life, at least 0 and below 1`},{path:`${e}.fadeEase`,check:e=>typeof e==`number`&&e>.05&&e<=6,describe:`an exponent above 0.05 and at most 6`},{path:`${e}.anchorX`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction between 0 and 1`},{path:`${e}.anchorY`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction between 0 and 1`},{path:`${e}.max`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`a whole number of popups between 0 and 200; 0 turns this style of number off entirely`}]}function Vc(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.values(e);if(t.length===0)return!1;let n=[`triggerMeters`,`telegraphSeconds`,`travelSeconds`,`cooldownSeconds`];return t.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return n.every(e=>typeof t[e]==`number`&&Number.isFinite(t[e])&&t[e]>=0)?typeof t.bowRatio==`number`&&Number.isFinite(t.bowRatio)&&Math.abs(t.bowRatio)<=2:!1})}function Hc(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.values(e);if(t.length===0)return!1;let n=[`perSecond`,`speedPerSecond`,`spread`,`spreadRadians`,`damage`];return t.every(e=>{if(typeof e!=`object`||!e)return!1;let t=e;return t.shape!==void 0&&t.shape!==`bolt`&&t.shape!==`spike`||t.radiusRatio!==void 0&&(typeof t.radiusRatio!=`number`||!Number.isFinite(t.radiusRatio)||t.radiusRatio<=0||t.radiusRatio>.2)?!1:n.every(e=>typeof t[e]==`number`&&Number.isFinite(t[e])&&t[e]>=0)})}function U(e){return typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=16777215||typeof e==`string`&&/^#[0-9a-fA-F]{6}$/.test(e)}function Uc(e){return typeof e==`string`&&e.length>0}function Wc(e){return typeof e!=`object`||!e||Array.isArray(e)?!1:Object.values(e).every(e=>{if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=e;return!(typeof t.frames==`string`&&t.frames.length>0&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=1&&t.count<=64||Array.isArray(t.frames)&&t.frames.length>=1&&t.frames.every(e=>typeof e==`string`&&e.length>0))||t.once!==void 0&&typeof t.once!=`boolean`?!1:typeof t.framesPerSecond==`number`&&t.framesPerSecond>.05&&t.framesPerSecond<=60&&typeof t.maxSeconds==`number`&&t.maxSeconds>.02&&t.maxSeconds<=30})}function Gc(e){let t=Kc;for(let n of e.split(`.`)){if(typeof t!=`object`||!t)return;t=t[n]}return t}var Kc;try{Kc=Lc.default.parse(Rc)}catch(e){H(`it is not valid JSON5 (${e.message})`)}(typeof Kc!=`object`||!Kc)&&H(`the top level must be an object`);var qc=[{key:`radius`,what:`radius multiplier, above 0.05 and under 8`,ok:e=>typeof e==`number`&&e>.05&&e<8},...[`inner`,`rim`,`glow`,`sheen`,`specular`,`hudColor`].map(e=>({key:e,what:`colour, either 0xrrggbb or "#rrggbb"`,ok:e=>typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=16777215||typeof e==`string`&&/^#[0-9a-fA-F]{6}$/.test(e)})),...[`innerAlpha`,`rimAlpha`,`glowOuterAlpha`,`glowInnerAlpha`,`innerRingAlpha`,`sheenAlpha`,`specularAlpha`].map(e=>({key:e,what:`opacity between 0 and 1`,ok:e=>typeof e==`number`&&e>=0&&e<=1})),...[`rimWidthRatio`,`innerRingWidthRatio`].map(e=>({key:e,what:`stroke width as a fraction of the radius, between 0.01 and 0.5`,ok:e=>typeof e==`number`&&e>=.01&&e<=.5})),...[`glowOuterRadiusRatio`,`glowInnerRadiusRatio`].map(e=>({key:e,what:`radius as a multiple of the bubble radius, at least 1`,ok:e=>typeof e==`number`&&e>=1&&e<=4})),{key:`innerRing`,what:`true or false`,ok:e=>typeof e==`boolean`},{key:`name`,what:`the stage name shown on the HUD`,ok:e=>typeof e==`string`&&e.length>0}],Jc=[`titleColour`,`tabFill`,`tabStroke`,`tabTextColour`,`activeTabFill`,`activeTabStroke`,`activeTabTextColour`,`pageTextColour`,`cardFill`,`cardStroke`,`nameColour`,`taglineColour`,`factLabelColour`,`factValueColour`,`noteColour`,`buttonFill`,`buttonStroke`,`buttonTextColour`,`collectableColour`,`skillColour`,`talentColour`],Yc=[`crate`,`coral`,`wall`,`net`,`tube`],Xc=[...[`drivenOff`,`absorb`,`eaten`,`boss`].map(e=>({path:`score.${e}`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=1e5,describe:`points for this event, between 0 and 100000; 0 takes the event out of the score`})),{path:`enemyBullets.shooters`,check:e=>Hc(e),describe:`an object of hazard kind to a shooter row`},{path:`enemyBullets.rangeMeters`,check:e=>typeof e==`number`&&e>=40&&e<=2e3,describe:`metres between 40 and 2000`},{path:`enemyBullets.radiusRatio`,check:e=>typeof e==`number`&&e>.002&&e<.2,describe:`a fraction of the lane width above 0.002 and below 0.2`},{path:`enemyBullets.lifeSeconds`,check:e=>typeof e==`number`&&e>=.5&&e<=30,describe:`seconds between 0.5 and 30`},{path:`enemyBullets.coreColour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`enemyBullets.rimColour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`enemyBullets.rimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`charges.chargers`,check:e=>Vc(e),describe:`an object of hazard kind to { triggerMeters, telegraphSeconds, travelSeconds, bowRatio, cooldownSeconds, approach }`},...[`telegraphColour`,`trailColour`].map(e=>({path:`charges.${e}`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`})),...[`telegraphAlpha`,`trailAlpha`].map(e=>({path:`charges.${e}`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`})),{path:`graze.radiusMultiplier`,check:e=>typeof e==`number`&&e>1&&e<=6,describe:`a multiple of the contact radius above 1 and at most 6`},{path:`graze.slowFactor`,check:e=>typeof e==`number`&&e>.05&&e<=1,describe:`a timescale above 0.05 and at most 1 (1 is no slow at all)`},{path:`graze.slowSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`seconds between 0 and 3`},{path:`graze.recoverSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`seconds between 0 and 3`},...Bc(`grazePopups`),{path:`mutation.autoPerSecond`,check:e=>typeof e==`number`&&e>=0&&e<=50,describe:`mutation points per second between 0 and 50`},...[`drivenOff`,`eaten`,`graze`,`bulletGraze`,`pointBlank`,`defuse`,`boss`].map(e=>({path:`mutation.gain.${e}`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=1e4,describe:`mutation points for this event, between 0 and 10000; 0 takes the event out of the economy`})),{path:`mutation.pointBlankRadius`,check:e=>typeof e==`number`&&e>=1&&e<=3,describe:`a multiple of the contact radius, at least 1 and at most 3`},...Bc(`mutation.callouts`),{path:`mutation.first`,check:e=>typeof e==`number`&&e>=1&&e<=1e5,describe:`the cost of the first level, between 1 and 100000`},{path:`mutation.growth`,check:e=>typeof e==`number`&&e>=1&&e<=4,describe:`the per-level cost multiplier, at least 1 and at most 4`},{path:`mutation.resumeInvulnerableSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`seconds between 0 and 3`},...[`damagePerPick`,`steerPerPick`,`ascentPerPick`,`armorPerPick`,`healVolume`,`invulnSecondsPerPick`,`ragePerPick`,`suctionPerPick`,`eatInvulnSecondsPerPick`,`appetiteTiersPerPick`,`burstRadiusPerPick`,`rageDecayReductionPerPick`,`bulletSpeedPerPick`,`bulletRadiusPerPick`,`bulletRangePerPick`].map(e=>({path:`mutation.pool.${e}`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=5,describe:`a per-pick amount between 0 and 5`})),{path:`mutation.gauge.widthRatio`,check:e=>typeof e==`number`&&e>.05&&e<=1,describe:`a fraction of the lane width above 0.05 and at most 1`},{path:`mutation.gauge.height`,check:e=>typeof e==`number`&&e>=2&&e<=60,describe:`design pixels between 2 and 60`},{path:`mutation.gauge.gap`,check:e=>typeof e==`number`&&e>=0&&e<=60,describe:`design pixels between 0 and 60`},{path:`mutation.gauge.radius`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`design pixels between 0 and 30`},{path:`mutation.gauge.trackColour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.trackAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`mutation.gauge.trackStroke`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.trackStrokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`mutation.gauge.fillColour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.fillAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`mutation.gauge.readyStroke`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`mutation.gauge.readyStrokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`mutation.gauge.labelSize`,check:e=>typeof e==`number`&&e>=8&&e<=40,describe:`a font size between 8 and 40`},{path:`mutation.gauge.labelColour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},...Bc(`score.popups`),...Bc(`damagePopups`),{path:`hud.resultsCard.size`,check:e=>typeof e==`number`&&e>=10&&e<=60,describe:`a font size between 10 and 60`},{path:`hud.resultsCard.yRatio`,check:e=>typeof e==`number`&&e>=.05&&e<=.9,describe:`a fraction of the canvas height between 0.05 and 0.9`},{path:`hud.resultsCard.widthRatio`,check:e=>typeof e==`number`&&e>=.3&&e<=1,describe:`a fraction of the canvas width between 0.3 and 1`},{path:`hud.progressChart.y`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`hud.progressChart.pipRadius`,check:e=>typeof e==`number`&&e>=1&&e<=30,describe:`design pixels between 1 and 30`},{path:`hud.progressChart.pipGap`,check:e=>typeof e==`number`&&e>=0&&e<=60,describe:`design pixels between 0 and 60`},{path:`hud.progressChart.rightInset`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`design pixels between 0 and 200`},{path:`hud.progressChart.doneColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.progressChart.doneAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hud.progressChart.pendingColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.progressChart.pendingAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hud.progressChart.currentColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.progressChart.currentAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hud.progressChart.labelSize`,check:e=>typeof e==`number`&&e>=8&&e<=40,describe:`a font size between 8 and 40`},{path:`hud.progressChart.labelColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.score.x`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`hud.score.y`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`hud.score.size`,check:e=>typeof e==`number`&&e>=8&&e<=60,describe:`a font size between 8 and 60`},{path:`hud.score.colour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.score.alpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hud.bossBar.y`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`hud.bossBar.widthRatio`,check:e=>typeof e==`number`&&e>.1&&e<=1,describe:`a fraction of the canvas width above 0.1 and at most 1`},{path:`hud.bossBar.height`,check:e=>typeof e==`number`&&e>=2&&e<=60,describe:`design pixels between 2 and 60`},{path:`hud.bossBar.nameSize`,check:e=>typeof e==`number`&&e>=8&&e<=60,describe:`a font size between 8 and 60`},{path:`hud.bossBar.nameOffset`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`design pixels between 0 and 200`},{path:`hud.bossBar.nameColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.fillColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.backColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.backAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hud.bossBar.borderColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hud.bossBar.borderAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`touch.buttonRadius`,check:e=>typeof e==`number`&&e>=16&&e<=80,describe:`design pixels between 16 and 80`},{path:`touch.buttonMaxRadiusRatio`,check:e=>typeof e==`number`&&e>.03&&e<.45,describe:`a fraction of the lane width, above 0.03 and below 0.45`},{path:`touch.rightInset`,check:e=>typeof e==`number`&&e>=0&&e<=80,describe:`design pixels between 0 and 80`},{path:`touch.bottomInset`,check:e=>typeof e==`number`&&e>=0&&e<=120,describe:`design pixels between 0 and 120`},{path:`touch.buttonGap`,check:e=>typeof e==`number`&&e>=0&&e<=60,describe:`design pixels between 0 and 60`},{path:`text.fontFamily`,check:e=>typeof e==`string`&&e.trim().length>0,describe:`a CSS font-family list, with a font that has the Chinese glyphs FIRST`},{path:`text.monoFontFamily`,check:e=>typeof e==`string`&&e.trim().length>0,describe:`a CSS font-family list for ASCII-only text (the debug readout)`},{path:`stages.speedMultiplier`,check:e=>Array.isArray(e)&&e.length>=2&&e.every(e=>typeof e==`number`),describe:`an array of at least two numbers`},{path:`stages.minSpeedMultiplier`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a number above 0 and at most 1`},{path:`stages.absorbToStage2`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`stages.absorbToStage3`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`stages.growInvulnerableSeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`stages.appearance`,check:e=>Array.isArray(e)&&e.length>=2&&e.every(e=>typeof e==`object`&&!!e),describe:`an array of at least two stage objects`},{path:`volume.start`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`volume.max`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`volume.hitCost`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`volume.absorbEfficiency`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`volume.laneRatio`,check:e=>typeof e==`number`&&e>0&&e<.5,describe:`a small number above 0`},{path:`movement.keyboardCrossingSeconds`,check:e=>typeof e==`number`&&e>.05,describe:`seconds above 0.05`},{path:`movement.verticalSpeedScale`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`movement.drag.sensitivity`,check:e=>typeof e==`number`&&e>0&&e<=4,describe:`a displacement multiplier above 0 and at most 4; 1 is finger-for-finger`},{path:`movement.drag.penaltiesApply`,check:e=>typeof e==`boolean`,describe:`true or false; false keeps the drag a strict 1:1 with the finger`},{path:`background.tileScreens`,check:e=>typeof e==`number`&&e>=.5&&e<=6,describe:`screen heights between 0.5 and 6`},{path:`background.countScale`,check:e=>typeof e==`number`&&e>=0&&e<=4,describe:`a multiplier between 0 and 4`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&U(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.riseMin`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`background.tileScreens`,check:e=>typeof e==`number`&&e>=.5&&e<=6,describe:`screen heights between 0.5 and 6`},{path:`background.countScale`,check:e=>typeof e==`number`&&e>=0&&e<=4,describe:`a multiplier between 0 and 4`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&U(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.riseMax`,check:e=>typeof e==`number`&&e>=Gc(`collectables.riseMin`),describe:`at least riseMin`},{path:`background.tileScreens`,check:e=>typeof e==`number`&&e>=.5&&e<=6,describe:`screen heights between 0.5 and 6`},{path:`background.countScale`,check:e=>typeof e==`number`&&e>=0&&e<=4,describe:`a multiplier between 0 and 4`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&U(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.riseSpeedExponent`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`background.tileScreens`,check:e=>typeof e==`number`&&e>=.5&&e<=6,describe:`screen heights between 0.5 and 6`},{path:`background.countScale`,check:e=>typeof e==`number`&&e>=0&&e<=4,describe:`a multiplier between 0 and 4`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&U(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.wobbleMin`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`background.tileScreens`,check:e=>typeof e==`number`&&e>=.5&&e<=6,describe:`screen heights between 0.5 and 6`},{path:`background.countScale`,check:e=>typeof e==`number`&&e>=0&&e<=4,describe:`a multiplier between 0 and 4`},{path:`background.layers`,check:e=>Array.isArray(e)&&e.length===4&&e.every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return typeof t.speedFactor==`number`&&t.speedFactor>=0&&t.speedFactor<=3&&typeof t.count==`number`&&Number.isInteger(t.count)&&t.count>=0&&t.count<=400&&typeof t.sizeRatio==`number`&&t.sizeRatio>=0&&t.sizeRatio<=.1&&U(t.colour)&&typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`exactly four layers (farthest first), each { speedFactor, count, sizeRatio, colour, alpha }`},{path:`collectables.wobbleMax`,check:e=>typeof e==`number`&&e>=Gc(`collectables.wobbleMin`),describe:`at least wobbleMin`},{path:`hazards.radius`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>typeof e==`number`&&e>.001&&e<=.5),describe:`an object of kind -> radius fraction between 0.001 and 0.5`},{path:`hazards.vent.radiusRatio`,check:e=>typeof e==`number`&&e>.01&&e<=.5,describe:`a fraction of the lane width above 0.01 and at most 0.5`},{path:`hazards.vent.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=50,describe:`hit points between 0 and 50`},{path:`hazards.vent.periodSeconds`,check:e=>typeof e==`number`&&e>=.5&&e<=60,describe:`seconds between 0.5 and 60`},{path:`hazards.vent.activeSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=60,describe:`seconds between 0 and 60`},{path:`hazards.vent.warnSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`seconds between 0 and 10`},{path:`hazards.vent.plumeColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.vent.glowColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.vent.edgeColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.vent.edgeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hazards.mineral.riseSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.mineral.wobbleAmplitude`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction of the lane width between 0 and 1`},{path:`hazards.mineral.wobblePeriodSeconds`,check:e=>typeof e==`number`&&e>=.2&&e<=30,describe:`seconds between 0.2 and 30`},{path:`hazards.mineral.lifeMeters`,check:e=>typeof e==`number`&&e>=50&&e<=5e3,describe:`metres between 50 and 5000`},{path:`hazards.shrimp.driftSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.shrimp.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.angler.driftFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a fraction of the current between 0 and 3`},{path:`hazards.angler.lureMeters`,check:e=>typeof e==`number`&&e>=20&&e<=800,describe:`metres between 20 and 800`},{path:`hazards.angler.telegraphSeconds`,check:e=>typeof e==`number`&&e>.1&&e<=5,describe:`seconds above 0.1 and at most 5`},{path:`hazards.angler.travelSeconds`,check:e=>typeof e==`number`&&e>.05&&e<=5,describe:`seconds above 0.05 and at most 5`},{path:`hazards.angler.cooldownSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30`},{path:`hazards.angler.bowRatio`,check:e=>typeof e==`number`&&Math.abs(e)<=2,describe:`a curve amount from -2 to 2`},{path:`hazards.angler.lureColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.angler.lureRadiusRatio`,check:e=>typeof e==`number`&&e>.002&&e<=.2,describe:`a fraction of the lane width above 0.002 and at most 0.2`},{path:`hazards.angler.lurePulsePerSecond`,check:e=>typeof e==`number`&&e>=0&&e<=20,describe:`cycles per second between 0 and 20`},{path:`hazards.angler.lureOffsetRatio`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a multiple of the body radius between 0 and 3`},{path:`hazards.zapper.ringRadiusRatio`,check:e=>typeof e==`number`&&e>.02&&e<=1.5,describe:`a fraction of the lane width above 0.02 and at most 1.5`},{path:`hazards.zapper.ringDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.zapper.ringSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=5,describe:`seconds between 0 and 5`},{path:`hazards.zapper.ringCooldownSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`seconds between 0 and 10`},{path:`hazards.zapper.dischargesWhenHit`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`hazards.zapper.bellColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.zapper.ringColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.zapper.ringAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hazards.charge.max`,check:e=>typeof e==`number`&&e>0&&e<=1e3,describe:`a number above 0 and at most 1000`},{path:`hazards.charge.chainAt`,check:e=>typeof e==`number`&&e>=0&&e<=1e3,describe:`a threshold between 0 and 1000`},{path:`hazards.charge.perRingHit`,check:e=>typeof e==`number`&&e>=0&&e<=1e3,describe:`charge between 0 and 1000`},{path:`hazards.charge.perSecondNearZapper`,check:e=>typeof e==`number`&&e>=0&&e<=1e3,describe:`charge per second between 0 and 1000`},{path:`hazards.charge.decayPerSecond`,check:e=>typeof e==`number`&&e>=0&&e<=1e3,describe:`charge per second between 0 and 1000`},{path:`hazards.charge.nearMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.charge.chainRangeMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.charge.chainJumpMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.charge.chainDamage`,check:e=>typeof e==`number`&&e>=0&&e<=100,describe:`hit points between 0 and 100`},{path:`hazards.charge.chainMaxTargets`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=64,describe:`a whole number of targets between 1 and 64`},{path:`hazards.charge.chainSelfDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.charge.bubbleRingColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.charge.bubbleRingWidthRatio`,check:e=>typeof e==`number`&&e>.001&&e<=.4,describe:`a fraction of the lane width above 0.001 and at most 0.4`},{path:`hazards.charge.burstColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.charge.burstAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hazards.charge.burstSeconds`,check:e=>typeof e==`number`&&e>=.05&&e<=5,describe:`seconds between 0.05 and 5`},{path:`hazards.foam.radiusRatio`,check:e=>typeof e==`number`&&e>.005&&e<=.3,describe:`a fraction of the lane width above 0.005 and at most 0.3`},{path:`hazards.foam.lifeSeconds`,check:e=>typeof e==`number`&&e>=.2&&e<=60,describe:`seconds between 0.2 and 60`},{path:`hazards.foam.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.foam.colour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.foam.rimColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.foam.alpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hazards.foam.rimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hazards.rain.fallSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.rain.pushMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.rain.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.rain.colour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.rain.lengthRatio`,check:e=>typeof e==`number`&&e>.005&&e<=.6,describe:`a fraction of the lane width above 0.005 and at most 0.6`},{path:`hazards.torpedo.runSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.torpedo.runMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.torpedo.seekSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.torpedo.seekSeconds`,check:e=>typeof e==`number`&&e>=.5&&e<=60,describe:`seconds between 0.5 and 60`},{path:`hazards.torpedo.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.bombfish.seekSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.bombfish.armMeters`,check:e=>typeof e==`number`&&e>=10&&e<=600,describe:`metres between 10 and 600`},{path:`hazards.bombfish.fuseSeconds`,check:e=>typeof e==`number`&&e>.2&&e<=15,describe:`seconds above 0.2 and at most 15`},{path:`hazards.bombfish.blastRadiusRatio`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction of the lane width between 0 and 1`},{path:`hazards.bombfish.blastDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.bombfish.blastShakePixels`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`design pixels between 0 and 40; 0 disables the shake`},{path:`hazards.bombfish.blastShakeSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=2,describe:`seconds between 0 and 2`},{path:`hazards.jelly.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10; 0 makes a jellyfish a pure slow again`},{path:`hazards.slowFactor`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a number above 0 and at most 1`},{path:`hazards.slowSeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`hazards.health`,check:e=>zc(e)&&Object.values(e).every(e=>e>=0),describe:`an object of hazard kind to hit points, e.g. { fish: 3, jelly: 0 }; 0 means the bullets pass through`},{path:`hazards.fleeScreensPerSecond`,check:e=>typeof e==`number`&&e>.05&&e<=8,describe:`screen heights per second, above 0.05 and at most 8; 0.9 is about a second to leave the screen`},{path:`hazards.fleeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1 for a creature that is leaving`},{path:`hazards.crab.armDistanceMeters`,check:e=>typeof e==`number`&&e>=0,describe:`metres of 0 or more; the distance at which the fuse is lit`},{path:`hazards.crab.fuseSeconds`,check:e=>typeof e==`number`&&e>0,describe:`seconds above 0`},{path:`hazards.crab.launchMps`,check:e=>typeof e==`number`&&e>=0,describe:`metres per second, 0 or more`},{path:`hazards.crab.apexSeconds`,check:e=>typeof e==`number`&&e>0,describe:`seconds above 0`},{path:`hazards.crab.launchScreenBonus`,check:e=>typeof e==`number`&&e>=0,describe:`a multiplier of 0 or more`},{path:`hazards.launchDecaySeconds`,check:e=>typeof e==`number`&&e>.01,describe:`seconds above 0.01`},{path:`hazards.trash.drainPerSecond`,check:e=>typeof e==`number`&&e>0,describe:`hit points per second above 0`},{path:`hazards.trash.minGripSeconds`,check:e=>typeof e==`number`&&e>0,describe:`seconds above 0`},{path:`hazards.eel.boltShockSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`seconds between 0 and 10; 0 disables the control loss an eel's bolt causes`},...[`archer`,`pistol`,`puffer`,`starfish`].map(e=>({path:`hazards.${e}.driftFactor`,check:e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=2,describe:`a multiple of the current between 0 and 2; smaller loiters longer`})),{path:`hazards.puffer.countersWhenHit`,check:e=>typeof e==`boolean`,describe:`whether a hit is answered with a ring of spikes`},{path:`hazards.puffer.counterCooldownSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`seconds between 0 and 10`},{path:`hazards.puffer.spikeCount`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=2&&e<=24,describe:`a whole number of spikes between 2 and 24`},{path:`hazards.starfish.volleyCount`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=3&&e<=12,describe:`a whole number of directions between 3 and 12`},{path:`hazards.starfish.volleySpinRadians`,check:e=>typeof e==`number`&&e>=0&&e<=Math.PI,describe:`radians between 0 and pi; 0 means the rosette never turns`},{path:`hazards.eel.shockColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.eel.shockWidthRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.6,describe:`a stroke width ratio between 0 and 0.6`},{path:`hazards.invulnerableSeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`consumption.tierVolume`,check:e=>Array.isArray(e)&&e.length>=2&&e.every(e=>typeof e==`number`&&e>=0)&&e[0]===0,describe:`an array of at least two non-negative volumes, starting at 0 (index 0 is tier 1)`},{path:`consumption.mass`,check:e=>zc(e)&&Object.keys(e).length>=1,describe:`an object of hazard kind to mass, e.g. { fish: 0.28, jelly: 0.42 }`},{path:`consumption.edibleAtTier`,check:e=>zc(e)&&Object.keys(e).length>=1,describe:`an object of hazard kind to the volume tier that can eat it`},{path:`consumption.massEfficiency`,check:e=>typeof e==`number`&&e>0&&e<=2,describe:`a number above 0 and at most 2`},{path:`consumption.eatInvulnerableSeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`consumption.marker.edibleColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`consumption.marker.widthRatio`,check:e=>typeof e==`number`&&e>=.01&&e<=.6,describe:`a stroke width ratio between 0.01 and 0.6`},{path:`consumption.marker.edibleAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`consumption.marker.blockedAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`consumption.marker.showBlocked`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`suction.radiusRatio`,check:e=>typeof e==`number`&&e>.02&&e<1,describe:`a fraction of the lane width, above 0.02 and below 1`},{path:`suction.radiusPerVolume`,check:e=>typeof e==`number`&&e>=0,describe:`a non-negative fraction of the lane width`},{path:`suction.maxRadiusRatio`,check:e=>typeof e==`number`&&e>.02&&e<=1.5,describe:`a fraction of the lane width, above 0.02 and at most 1.5`},{path:`suction.pullPerSecond`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`suction.heavyRatio`,check:e=>typeof e==`number`&&e>1,describe:`a ratio above 1`},{path:`suction.heavyFloor`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction between 0 and 1`},{path:`suction.moveSpeedFactor`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a fraction above 0 and at most 1`},{path:`suction.fieldColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`suction.fieldAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`suction.fieldWidthRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.6,describe:`a stroke width ratio between 0 and 0.6`},{path:`suction.tetherAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`suction.tetherWidthRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.6,describe:`a stroke width ratio between 0 and 0.6`},{path:`bullets.image`,check:e=>typeof e==`string`,describe:`a file name in src/assets/ without its extension, or an empty string for the drawn dot`},{path:`bullets.imageAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`bullets.imageTint`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`bullets.imageScale`,check:e=>typeof e==`number`&&e>.1&&e<=4,describe:`a multiplier above 0.1 and at most 4`},{path:`bullets.rateTiers`,check:e=>Array.isArray(e)&&e.length>=1&&e.length<=8&&e.every(e=>typeof e==`number`&&Number.isFinite(e)&&e>=0&&e<=30),describe:`a non-empty list of up to 8 rounds-per-second values between 0 and 30; the FIRST is what a run starts at`},{path:`bullets.speedPerSecond`,check:e=>typeof e==`number`&&e>0&&e<=8,describe:`lane widths per second, above 0 and at most 8`},{path:`bullets.radiusRatio`,check:e=>typeof e==`number`&&e>.001&&e<=.1,describe:`a fraction of the lane width, above 0.001 and at most 0.1`},{path:`bullets.upgradeSpreadRatio`,check:e=>typeof e==`number`&&e>.005&&e<.3,describe:`a fraction of the lane width above 0.005 and below 0.3`},{path:`bullets.maxStreams`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=8,describe:`a whole number of gun rows between 1 and 8`},{path:`bullets.damage`,check:e=>typeof e==`number`&&e>0,describe:`a number of hit points above 0`},{path:`bullets.lifeSeconds`,check:e=>typeof e==`number`&&e>.05&&e<=10,describe:`seconds above 0.05 and at most 10`},{path:`bullets.alpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`bullets.rimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},...[`colour`,`rimColour`].map(e=>({path:`bullets.${e}`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`hazardArt`,check:e=>typeof e!=`object`||!e||Array.isArray(e)?!1:Object.values(e).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;if(t.front!==void 0&&t.front!==`left`&&t.front!==`right`||t.charge!==void 0&&!Uc(t.charge)||t.dead!==void 0&&!Uc(t.dead)||t.spriteFlashScale!==void 0&&(typeof t.spriteFlashScale!=`number`||t.spriteFlashScale<0||t.spriteFlashScale>2)||t.spin!==void 0&&(typeof t.spin!=`number`||t.spin<-6||t.spin>6)||t.volleyAligned!==void 0&&typeof t.volleyAligned!=`boolean`||t.volleyBaseRadians!==void 0&&(typeof t.volleyBaseRadians!=`number`||!Number.isFinite(t.volleyBaseRadians))||t.facesPlayer!==void 0&&typeof t.facesPlayer!=`boolean`||t.attackSeconds!==void 0&&(typeof t.attackSeconds!=`number`||t.attackSeconds<=.02||t.attackSeconds>30))return!1;let n=t.variants;if(n!==void 0){if(!Array.isArray(n)||n.length===0||t.move!==void 0||t.scale!==void 0||!n.every(e=>e&&typeof e==`object`&&Uc(e.move)&&typeof e.scale==`number`&&e.scale>.05&&e.scale<=6))return!1}else if(!Uc(t.move)||typeof t.scale!=`number`||t.scale<=.05||t.scale>6)return!1;return typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1}),describe:`an object of kind -> { move, scale } or { variants: [{ move, scale }], and either way charge?, attack?, dead?, front?, spriteFlashScale?, spin?, volleyAligned?, volleyBaseRadians?, attackSeconds?, alpha, lure? }, where each state is a picture name or an animation`},{path:`animations`,check:e=>Wc(e),describe:'an object of animation name -> { frames, count?, framesPerSecond, maxSeconds, once? }; `frames` is a "{n}" pattern plus `count`, or a list of picture names'},{path:`hazardFront`,check:e=>e===`left`||e===`right`,describe:`"left" or "right": which way round a creature with a picture counts as facing`},{path:`hazardFacing.cooldownSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 lets a creature turn every frame`},{path:`angry.look.inner`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.boss.holdMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.boss.holdBandRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a fraction of the visible depth, above 0 and at most 1`},{path:`hazards.boss.holdMinMeters`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres between 0 and 2000`},{path:`hazards.boss.patrolAmplitude`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a lane fraction between 0 and 1`},{path:`hazards.boss.patrolPeriodSeconds`,check:e=>typeof e==`number`&&e>.2&&e<=60,describe:`seconds above 0.2 and at most 60`},{path:`hazards.boss.seekSpeedFactor`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`lane widths per second between 0 and 3`},{path:`hazards.boss.contactDamage`,check:e=>typeof e==`number`&&e>=0&&e<=10,describe:`hit points between 0 and 10`},{path:`hazards.boss.radiusRatio`,check:e=>typeof e==`number`&&e>.001&&e<=.5,describe:`a lane fraction above 0.001 and at most 0.5`},{path:`hazards.boss.colour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.boss.eyeColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.boss.armourColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.boss.weakPointWidthRatio`,check:e=>typeof e==`number`&&e>0&&e<=.5,describe:`a lane fraction above 0 and at most 0.5`},{path:`hazards.boss.hitFlashColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`hazards.boss.hitFlashStrength`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an intensity between 0 and 1 for the DRAWN boss body; 0 means it does not flash`},{path:`chargeTrail.image`,check:e=>typeof e==`string`,describe:`a file name in src/assets/ without its extension, or an empty string to disable it`},{path:`chargeTrail.columns`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=16,describe:`whole columns between 1 and 16`},{path:`chargeTrail.rows`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=16,describe:`whole rows between 1 and 16`},{path:`chargeTrail.count`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=24,describe:`whole bubbles between 1 and 24`},{path:`chargeTrail.spread`,check:e=>typeof e==`number`&&e>=0&&e<=4,describe:`a multiple between 0 and 4`},{path:`chargeTrail.jitter`,check:e=>typeof e==`number`&&e>=0&&e<=Math.PI,describe:`radians of jitter up to half a turn`},{path:`chargeTrail.scaleVariance`,check:e=>typeof e==`number`&&e>=0&&e<=2,describe:`a fraction between 0 and 2`},{path:`chargeTrail.sizeFalloff`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction between 0 and 1`},{path:`chargeTrail.behindFactor`,check:e=>typeof e==`number`&&e>=0&&e<=6,describe:`a multiple between 0 and 6`},{path:`chargeTrail.frameSeconds`,check:e=>typeof e==`number`&&e>.005&&e<=2,describe:`seconds per frame above 0.005 and at most 2`},{path:`chargeTrail.sizeRatio`,check:e=>typeof e==`number`&&e>0&&e<=.5,describe:`a lane fraction above 0 and at most 0.5`},{path:`chargeTrail.alpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`particles.maxParticles`,check:e=>typeof e==`number`&&e>=0&&e<=4e3,describe:`a count between 0 and 4000`},{path:`particles.hitCount`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`a count between 0 and 200`},{path:`particles.hitSpeed`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres per second between 0 and 2000`},{path:`particles.hitLife`,check:e=>typeof e==`number`&&e>0&&e<=10,describe:`seconds above 0 and at most 10`},{path:`particles.hitSize`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`metres between 0 and 200`},{path:`particles.defeatCount`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`a count between 0 and 400`},{path:`particles.defeatSpeed`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres per second between 0 and 2000`},{path:`particles.defeatLife`,check:e=>typeof e==`number`&&e>0&&e<=10,describe:`seconds above 0 and at most 10`},{path:`particles.defeatSize`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`metres between 0 and 200`},{path:`particles.defeatColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`particles.defeatJitter`,check:e=>typeof e==`number`&&e>=0&&e<=Math.PI*2,describe:`radians of jitter, at most a full turn`},{path:`particles.drag`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a per-frame retention above 0 and at most 1`},{path:`particles.descentSpeed`,check:e=>typeof e==`number`&&e>=0&&e<=2e3,describe:`metres per second between 0 and 2000`},{path:`explosions.seconds`,check:e=>typeof e==`number`&&e>.05&&e<=5,describe:`seconds above 0.05 and at most 5`},{path:`explosions.strokeColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`explosions.strokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`explosions.strokeStartRatio`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a multiple of the blast radius between 0 and 3`},{path:`explosions.strokeEndRatio`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a multiple of the blast radius between 0 and 3`},{path:`explosions.strokeWidthRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a stroke width as a fraction of the radius, above 0 and at most 1`},{path:`explosions.coreColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`explosions.coreAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`explosions.coreStartRatio`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a multiple of the blast radius between 0 and 3`},{path:`explosions.coreEndRatio`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a multiple of the blast radius between 0 and 3`},{path:`loading.scrimColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.scrimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`loading.trackColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.barColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.barHeight`,check:e=>typeof e==`number`&&e>=2&&e<=60,describe:`design pixels between 2 and 60`},{path:`loading.maxWidth`,check:e=>typeof e==`number`&&e>=80&&e<=2e3,describe:`design pixels between 80 and 2000`},{path:`loading.label`,check:e=>typeof e==`string`,describe:`a string`},{path:`loading.titleSize`,check:e=>typeof e==`number`&&e>=8&&e<=60,describe:`a font size between 8 and 60`},{path:`loading.titleColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.textColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`loading.textSize`,check:e=>typeof e==`number`&&e>=8&&e<=60,describe:`a font size between 8 and 60`},{path:`loading.lineHeight`,check:e=>typeof e==`number`&&e>=8&&e<=80,describe:`a line height between 8 and 80 design pixels`},{path:`loading.gapTitle`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`loading.gapBar`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`loading.gapStats`,check:e=>typeof e==`number`&&e>=0&&e<=400,describe:`design pixels between 0 and 400`},{path:`loading.speedWindowSeconds`,check:e=>typeof e==`number`&&e>=.25&&e<=30,describe:`seconds between 0.25 and 30 that the reported rate is averaged over`},{path:`hitFlash.seconds`,check:e=>typeof e==`number`&&e>0&&e<=2,describe:`seconds above 0 and at most 2`},{path:`hitFlash.peakIntensity`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an intensity between 0 and 1; 0 disables the full-body flash`},{path:`hitFlash.riseFraction`,check:e=>typeof e==`number`&&e>0&&e<1,describe:`a fraction above 0 and below 1 of the flash spent rising to its peak`},{path:`hitFlash.cooldownSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=2,describe:`seconds between 0 and 2; 0 lets every hit restart the flash`},{path:`hitFlash.colour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`hitFlash.alpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hitFlash.radiusScale`,check:e=>typeof e==`number`&&e>.2&&e<=3,describe:`a multiplier above 0.2 and at most 3`},{path:`hitFeedback.heavyDamage`,check:e=>typeof e==`number`&&e>0&&e<=100,describe:`damage above 0 and at most 100 at which a hit counts as heavy`},{path:`hitFeedback.critDamage`,check:e=>typeof e==`number`&&e>0&&e<=1e3,describe:`damage above 0 and at most 1000 at which a hit counts as critical; should be above heavyDamage`},{path:`hitFeedback.heavyOutlineColour`,check:U,describe:`a colour, either 0xrrggbb or a "#rrggbb" string`},{path:`hitFeedback.heavyOutlineAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`hitFeedback.heavyOutlineRadiusScale`,check:e=>typeof e==`number`&&e>.3&&e<=4,describe:`a multiple of the body radius above 0.3 and at most 4`},{path:`hitFeedback.heavyOutlineWidthRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a stroke width ratio above 0 and at most 1`},{path:`hitFeedback.heavyOutlineSeconds`,check:e=>typeof e==`number`&&e>.01&&e<=3,describe:`seconds above 0.01 and at most 3`},{path:`hitFeedback.heavyShakePixels`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`design pixels between 0 and 40; 0 disables the heavy hit shake`},{path:`hitFeedback.heavyShakeSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=2,describe:`seconds between 0 and 2`},{path:`hitKnockback.meters`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`metres of recoil per landed hit, between 0 and 200; 0 turns the knockback off`},{path:`hitKnockback.seconds`,check:e=>typeof e==`number`&&e>.01&&e<=2,describe:`seconds above 0.01 and at most 2, over which the recoil is spent`},{path:`hazards.boss.knockbackScale`,check:e=>typeof e==`number`&&e>=0&&e<=2,describe:`a multiplier on hitKnockback.meters between 0 and 2; the boss holds station, so 0.5 is a nudge rather than a shove`},{path:`hazards.boss.attackEverySeconds`,check:e=>typeof e==`number`&&e>=.5&&e<=60,describe:`seconds between claw swings, at least 0.5 and at most 60`},{path:`hazards.boss.attackSprayFrame`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=64,describe:`a frame number of animations.boss-attack, from 1`},{path:`hazards.boss.attackSprayCount`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=40,describe:`a whole number of grit pieces from 0 to 40; 0 makes the swing a pure animation`},{path:`hazards.boss.attackSpraySpread`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a lane fraction between 0 and 3`},{path:`hazards.boss.attackSpraySeconds`,check:e=>typeof e==`number`&&e>=.05&&e<=3,describe:`seconds of travel between 0.05 and 3; this is the dodge window, so short is unfair and long is harmless`},{path:`hazards.boss.attackSprayFromX`,check:e=>typeof e==`number`&&e>=-4&&e<=4,describe:`a multiple of the boss radius between -4 and 4`},{path:`hazards.boss.attackSprayFromY`,check:e=>typeof e==`number`&&e>=-4&&e<=4,describe:`a multiple of the boss radius between -4 and 4; negative is below the body, which is where a claw is`},{path:`hazards.boss.attackSprayBowRatio`,check:e=>typeof e==`number`&&Math.abs(e)<=2,describe:`a bow as a fraction of the distance travelled, between -2 and 2`},{path:`playerBubble.image`,check:e=>typeof e==`string`,describe:`a file name in src/assets/ without its extension, or an empty string for the drawn bubble`},{path:`playerBubble.imageAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`playerBubble.imageTint`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`playerBubble.imageRotation`,check:e=>typeof e==`number`&&e>=-360&&e<=360,describe:`degrees between -360 and 360`},{path:`playerBubble.imageScale`,check:e=>typeof e==`number`&&e>.1&&e<=4,describe:`a multiplier above 0.1 and at most 4`},{path:`playerBubble.keepDetails`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`codex.previewScrimColour`,check:U,describe:`a colour, either 0xrrggbb or a #rrggbb string`},{path:`codex.previewScrimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`codex.columns`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=4,describe:`a whole number of columns between 1 and 4`},{path:`codex.rows`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=6,describe:`a whole number of rows between 1 and 6`},{path:`codex.margin`,check:e=>typeof e==`number`&&e>=0&&e<=80,describe:`design pixels between 0 and 80`},{path:`codex.gap`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`design pixels between 0 and 40`},{path:`codex.headerHeight`,check:e=>typeof e==`number`&&e>=40&&e<=300,describe:`design pixels between 40 and 300`},{path:`codex.footerHeight`,check:e=>typeof e==`number`&&e>=20&&e<=200,describe:`design pixels between 20 and 200`},{path:`codex.titleSize`,check:e=>typeof e==`number`&&e>=8&&e<=48,describe:`a font size between 8 and 48`},{path:`codex.titleY`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`design pixels between 0 and 200`},{path:`codex.tabHeight`,check:e=>typeof e==`number`&&e>=10&&e<=80,describe:`design pixels between 10 and 80`},{path:`codex.tabGap`,check:e=>typeof e==`number`&&e>=0&&e<=24,describe:`design pixels between 0 and 24`},{path:`codex.tabTextSize`,check:e=>typeof e==`number`&&e>=6&&e<=32,describe:`a font size between 6 and 32`},{path:`codex.pageTextSize`,check:e=>typeof e==`number`&&e>=6&&e<=32,describe:`a font size between 6 and 32`},{path:`codex.cardRadius`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`a corner radius between 0 and 40`},{path:`codex.cardFillAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`codex.cardStrokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`codex.cardPad`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`design pixels between 0 and 40`},{path:`codex.iconSize`,check:e=>typeof e==`number`&&e>=12&&e<=120,describe:`design pixels between 12 and 120`},{path:`codex.nameSize`,check:e=>typeof e==`number`&&e>=8&&e<=40,describe:`a font size between 8 and 40`},{path:`codex.taglineSize`,check:e=>typeof e==`number`&&e>=6&&e<=32,describe:`a font size between 6 and 32`},{path:`codex.factSize`,check:e=>typeof e==`number`&&e>=5&&e<=32,describe:`a font size between 5 and 32`},{path:`codex.factLeading`,check:e=>typeof e==`number`&&e>=6&&e<=40,describe:`line spacing between 6 and 40`},{path:`codex.factLabelWidth`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`design pixels between 0 and 200`},{path:`codex.noteSize`,check:e=>typeof e==`number`&&e>=5&&e<=32,describe:`a font size between 5 and 32`},{path:`codex.noteLeading`,check:e=>typeof e==`number`&&e>=6&&e<=40,describe:`line spacing between 6 and 40`},{path:`codex.noteBulletIndent`,check:e=>typeof e==`number`&&e>=0&&e<=60,describe:`design pixels between 0 and 60`},{path:`codex.buttonHeight`,check:e=>typeof e==`number`&&e>=12&&e<=90,describe:`design pixels between 12 and 90`},{path:`codex.buttonPad`,check:e=>typeof e==`number`&&e>=0&&e<=80,describe:`design pixels between 0 and 80`},{path:`codex.buttonRadius`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`a corner radius between 0 and 40`},{path:`codex.buttonTextSize`,check:e=>typeof e==`number`&&e>=6&&e<=32,describe:`a font size between 6 and 32`},...Jc.map(e=>({path:`codex.${e}`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`menu.buttonWidthRatio`,check:e=>typeof e==`number`&&e>.1&&e<1,describe:`a fraction of the lane width, above 0.1 and below 1`},{path:`menu.buttonMaxWidth`,check:e=>typeof e==`number`&&e>=60&&e<=600,describe:`a pixel width between 60 and 600`},{path:`menu.buttonHeight`,check:e=>typeof e==`number`&&e>=20&&e<=120,describe:`a pixel height between 20 and 120`},{path:`menu.buttonRadius`,check:e=>typeof e==`number`&&e>=0&&e<=60,describe:`a corner radius between 0 and 60`},{path:`menu.buttonGap`,check:e=>typeof e==`number`&&e>=0&&e<=80,describe:`design pixels between 0 and 80`},{path:`menu.primaryTextSize`,check:e=>typeof e==`number`&&e>=8&&e<=48,describe:`a font size between 8 and 48`},{path:`menu.secondaryTextSize`,check:e=>typeof e==`number`&&e>=8&&e<=48,describe:`a font size between 8 and 48`},{path:`menu.secondaryStrokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`menu.buttonStrokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`menu.taglineGap`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`a number between 0 and 200`},{path:`menu.taglineSize`,check:e=>typeof e==`number`&&e>4&&e<=60,describe:`a number above 4 and at most 60`},{path:`menu.levelRowHeight`,check:e=>typeof e==`number`&&e>4&&e<=200,describe:`a number above 4 and at most 200`},{path:`menu.levelRowGap`,check:e=>typeof e==`number`&&e>=0&&e<=200,describe:`a number between 0 and 200`},{path:`menu.levelRowTopGap`,check:e=>typeof e==`number`&&e>=0&&e<=600,describe:`a number between 0 and 600`},{path:`menu.levelTextSize`,check:e=>typeof e==`number`&&e>4&&e<=60,describe:`a number above 4 and at most 60`},{path:`menu.levelNoteSize`,check:e=>typeof e==`number`&&e>4&&e<=60,describe:`a number above 4 and at most 60`},{path:`menu.levelMinWidthRatio`,check:e=>typeof e==`number`&&e>=.05&&e<=1,describe:`a fraction of the menu width between 0.05 and 1`},{path:`menu.levelMaxWidthRatio`,check:e=>typeof e==`number`&&e>.05&&e<=1,describe:`a fraction above 0.05 and at most 1`},...[`levelSelectedFill`,`levelSelectedStroke`,`levelSelectedTextColour`,`levelIdleFill`,`levelIdleStroke`,`levelIdleTextColour`,`levelLockedFill`,`levelLockedStroke`,`levelLockedTextColour`,`levelNoteColour`,`levelUnlockColour`].map(e=>({path:`menu.${e}`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),...[`primaryFill`,`primaryPressedFill`,`primaryTextColour`,`secondaryFill`,`secondaryPressedFill`,`secondaryStroke`,`secondaryTextColour`,`buttonStroke`].map(e=>({path:`menu.${e}`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`audio.clearSting.notes`,check:e=>Array.isArray(e)&&e.length>=1&&e.length<=12&&e.every(e=>typeof e==`number`&&Math.abs(e)<=36),describe:`a list of 1 to 12 semitone offsets from the track root`},{path:`audio.clearSting.gapSeconds`,check:e=>typeof e==`number`&&e>=.03&&e<=2,describe:`seconds between 0.03 and 2`},{path:`audio.clearHoldSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=5,describe:`seconds between 0 and 5`},{path:`audio.ascendScreensPerSecond`,check:e=>typeof e==`number`&&e>.05&&e<=6,describe:`screen heights per second above 0.05 and at most 6`},{path:`summary.maxWidth`,check:e=>typeof e==`number`&&e>=120&&e<=2e3,describe:`design pixels between 120 and 2000`},{path:`summary.maxHeight`,check:e=>typeof e==`number`&&e>=120&&e<=2e3,describe:`design pixels between 120 and 2000`},{path:`summary.scoreSize`,check:e=>typeof e==`number`&&e>=12&&e<=120,describe:`a font size between 12 and 120`},{path:`summary.scoreColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.lineSize`,check:e=>typeof e==`number`&&e>=8&&e<=60,describe:`a font size between 8 and 60`},{path:`summary.lineColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.panelColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.panelRimColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.scrimColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.scrimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`summary.buttonColour`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`summary.buttonLabel`,check:e=>typeof e==`string`&&e.length>=1,describe:`a non-empty label`},{path:`audio.music.volume`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a level between 0 and 1`},{path:`audio.music.tracks`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e,n=e=>e===`sine`||e===`square`||e===`sawtooth`||e===`triangle`;return typeof t.rootHz==`number`&&t.rootHz>20&&t.rootHz<2e3&&typeof t.stepPerMinute==`number`&&t.stepPerMinute>4&&t.stepPerMinute<=600&&typeof t.stepsPerChord==`number`&&Number.isInteger(t.stepsPerChord)&&t.stepsPerChord>=1&&t.stepsPerChord<=32&&Array.isArray(t.chords)&&t.chords.length>=1&&t.chords.every(e=>Array.isArray(e)&&e.length>=1&&e.every(e=>typeof e==`number`))&&Array.isArray(t.pattern)&&t.pattern.length>=1&&t.pattern.every(e=>typeof e==`number`&&Number.isInteger(e)&&e>=0)&&n(t.wave)&&n(t.padWave)&&typeof t.arpGain==`number`&&t.arpGain>=0&&t.arpGain<=1&&typeof t.padGain==`number`&&t.padGain>=0&&t.padGain<=1&&typeof t.noteSeconds==`number`&&t.noteSeconds>.02&&t.noteSeconds<=8&&typeof t.cutoffHz==`number`&&t.cutoffHz>=80&&t.cutoffHz<=12e3&&typeof t.detuneCents==`number`&&Math.abs(t.detuneCents)<=100}),describe:`an object of level id to a music recipe (rootHz, stepPerMinute, stepsPerChord, chords, pattern, wave, padWave, arpGain, padGain, noteSeconds, cutoffHz, detuneCents)`},{path:`audio.ambientVolume`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a level between 0 and 1`},{path:`audio.musicVolume`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity-like level between 0 and 1`},{path:`audio.bulletHitVolume`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a level between 0 and 1; 0 mutes the bullet hit`},{path:`audio.bulletFireVolume`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a level between 0 and 1; 0 mutes the shot`},{path:`obstacles.health`,check:e=>zc(e)&&Object.keys(e).length>=1,describe:`an object of obstacle kind to hit points`},{path:`obstacles.radius`,check:e=>zc(e)&&Object.keys(e).length>=1,describe:`an object of obstacle kind to a radius fraction`},{path:`obstacles.ramVolume`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.entries(e).every(([,e])=>e===null||typeof e==`number`&&e>=0),describe:`an object of obstacle kind to a volume, or to null for "cannot be rammed at all"`},{path:`obstacles.minGapFraction`,check:e=>typeof e==`number`&&e>.02&&e<.9,describe:`a fraction above 0.02 and below 0.9`},{path:`obstacles.ramVolumeThreshold`,check:e=>typeof e==`number`&&e>=0,describe:`a volume of 0 or more`},{path:`obstacles.ramDamagePerVolume`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`obstacles.collideDamage`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`obstacles.collideInvulnerableSeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`obstacles.netDrag`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a speed multiplier above 0 and at most 1`},{path:`obstacles.netDragSeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`obstacles.crateColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.crateRimColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.coralColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.coralRimColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.wallColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.wallRimColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.netColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.netRimColor`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.tubeColor`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.tubeRimColor`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`obstacles.netMesh`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=2&&e<=10,describe:`a whole number of mesh lines between 2 and 10`},{path:`obstacles.crackWidthRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.5,describe:`a stroke width ratio between 0 and 0.5`},{path:`obstacles.damagedDarken`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction between 0 and 1`},{path:`obstacles.art`,check:e=>typeof e!=`object`||!e||Array.isArray(e)?!1:Object.values(e).every(e=>{if(!e||typeof e!=`object`||Array.isArray(e))return!1;let t=e;return!Array.isArray(t.variants)||t.variants.length===0||!t.variants.every(e=>e&&typeof e==`object`&&typeof e.image==`string`&&e.image.length>0&&typeof e.scale==`number`&&e.scale>.05&&e.scale<=6)?!1:typeof t.alpha==`number`&&t.alpha>=0&&t.alpha<=1&&typeof t.swayDegrees==`number`&&t.swayDegrees>=0&&t.swayDegrees<=45&&typeof t.swaySeconds==`number`&&t.swaySeconds>.05&&t.swaySeconds<=60}),describe:`an object of obstacle kind -> { variants: [{ image, scale }], alpha, swayDegrees, swaySeconds }; each obstacle picks one variant by its own id`},{path:`emergence.fishPerceptionBaseMeters`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`emergence.fishPerceptionPerVolume`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`emergence.fishFeedToSplit`,check:e=>typeof e==`number`&&e>=2,describe:`2 or more, or nothing would ever split`},{path:`emergence.fishHardCap`,check:e=>typeof e==`number`&&e>=1,describe:`1 or more`},{path:`emergence.seekBiggestRangeMeters`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`spawning.enterSpeedMps`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`spawning.offscreenMarginRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a fraction above 0 and at most 1`},{path:`spawning.bottomMarginRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a fraction above 0 and at most 1`},{path:`spawning.insideMarginRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.5,describe:`a fraction between 0 and 0.5`},{path:`spawning.entryDepth`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction between 0 and 1`},{path:`angry.rage.max`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.rage.perHit`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0, or no hit would ever matter`},{path:`angry.rage.decayPerSecond`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`angry.rage.decayDelaySeconds`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`angry.charge.launchScreenSpeed`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.charge.launchLateralSpeed`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.charge.slamSeconds`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.charge.slamDamageBase`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.charge.slamRageScale`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`angry.charge.rageCostPerHit`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`angry.charge.rageCostPerBreak`,check:e=>typeof e==`number`&&e>=0,describe:`a number of 0 or more`},{path:`angry.charge.slamBreaksUnrammable`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`angry.charge.defaultAimX`,check:e=>typeof e==`number`&&e>=-1&&e<=1,describe:`a direction between -1 and 1`},{path:`angry.charge.defaultAimY`,check:e=>typeof e==`number`&&e>=-1&&e<=1,describe:`a direction between -1 and 1`},{path:`angry.slamRadiusBonus`,check:e=>typeof e==`number`&&e>=0&&e<=3,describe:`a fraction between 0 and 3`},{path:`angry.burst.radiusBaseRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a fraction of the lane above 0 and at most 1`},{path:`angry.burst.radiusMaxRatio`,check:e=>typeof e==`number`&&e>0&&e<=2,describe:`a fraction of the lane above 0 and at most 2`},{path:`angry.burst.obstacleDamage`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.burst.knockbackMeters`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.burst.pushImpact`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.burst.hazardMode`,check:e=>typeof e==`object`&&!!e&&!Array.isArray(e)&&Object.values(e).every(e=>e===`destroy`||e===`push`),describe:`an object of hazard kind to "destroy" or "push"`},{path:`angry.burst.waveSeconds`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.burst.waveWidthRatio`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a stroke width ratio above 0 and at most 1`},{path:`angry.burst.waveColour`,check:e=>U(e),describe:`a colour, either 0xrrggbb or "#rrggbb"`},{path:`angry.gauge.widthRatio`,check:e=>typeof e==`number`&&e>.05&&e<=1,describe:`a fraction of the lane above 0.05 and at most 1`},{path:`angry.overload.seconds`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.overload.steerFactor`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a speed multiplier above 0 and at most 1`},{path:`angry.overload.radiusBonus`,check:e=>typeof e==`number`&&e>=0&&e<=2,describe:`a fraction between 0 and 2`},{path:`angry.overload.ramDamage`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.overload.releaseHealth`,check:e=>typeof e==`number`&&e>0,describe:`a number above 0`},{path:`angry.overload.punishHits`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=20,describe:`a whole number of hit points between 0 and 20`},{path:`angry.gauge.height`,check:e=>typeof e==`number`&&e>=2&&e<=40,describe:`design pixels between 2 and 40`},{path:`angry.gauge.gap`,check:e=>typeof e==`number`&&e>=0&&e<=40,describe:`design pixels between 0 and 40`},{path:`angry.gauge.radius`,check:e=>typeof e==`number`&&e>=0&&e<=20,describe:`a corner radius between 0 and 20`},{path:`angry.gauge.trackAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.gauge.trackStrokeAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.gauge.fillAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.gauge.tickAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.gauge.tickWidth`,check:e=>typeof e==`number`&&e>=0&&e<=6,describe:`a stroke width between 0 and 6`},...[`trackColour`,`trackStroke`,`tickColour`].map(e=>({path:`angry.gauge.${e}`,check:U,describe:`a colour, either 0xrrggbb or "#rrggbb"`})),{path:`angry.look.radius`,check:e=>typeof e==`number`&&e>0&&e<=4,describe:`a multiplier above 0 and at most 4`},{path:`angry.look.innerAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.look.rimAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.look.rimWidthRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.6,describe:`a stroke width ratio between 0 and 0.6`},{path:`angry.look.glowOuterAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.look.glowInnerAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.look.glowOuterRadiusRatio`,check:e=>typeof e==`number`&&e>=1&&e<=4,describe:`a radius ratio between 1 and 4`},{path:`angry.look.glowInnerRadiusRatio`,check:e=>typeof e==`number`&&e>=1&&e<=4,describe:`a radius ratio between 1 and 4`},{path:`angry.look.innerRing`,check:e=>typeof e==`boolean`,describe:`true or false`},{path:`angry.look.innerRingAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.look.innerRingWidthRatio`,check:e=>typeof e==`number`&&e>=0&&e<=.6,describe:`a stroke width ratio between 0 and 0.6`},{path:`angry.look.sheenAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`angry.look.specularAlpha`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`an opacity between 0 and 1`},{path:`skills.dash.uses`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=10,describe:`a whole number of uses between 1 and 10`},{path:`skills.dash.durationSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 means the effect is instant`},{path:`skills.dash.ascentMultiplier`,check:e=>typeof e==`number`&&e>=1&&e<=10,describe:`an ascent multiplier between 1 and 10`},{path:`skills.decoy.uses`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=10,describe:`a whole number of uses between 1 and 10`},{path:`skills.decoy.durationSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 means the effect is instant`},{path:`skills.decoy.decoyRadiusMeters`,check:e=>typeof e==`number`&&e>=10&&e<=2e3,describe:`metres between 10 and 2000`},{path:`skills.decoy.decoySeconds`,check:e=>typeof e==`number`&&e>=.1&&e<=60,describe:`seconds between 0.1 and 60`},{path:`skills.vortex.uses`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=10,describe:`a whole number of uses between 1 and 10`},{path:`skills.vortex.durationSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 means the effect is instant`},{path:`skills.vortex.vortexRadiusMeters`,check:e=>typeof e==`number`&&e>=10&&e<=2e3,describe:`metres between 10 and 2000`},{path:`skills.vortex.vortexPullPerSecond`,check:e=>typeof e==`number`&&e>=.1&&e<=20,describe:`a pull of 0.1 to 20 times the distance per second`},{path:`skills.stink.uses`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=10,describe:`a whole number of uses between 1 and 10`},{path:`skills.stink.durationSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 means the effect is instant`},{path:`skills.stink.stinkRadiusMeters`,check:e=>typeof e==`number`&&e>=10&&e<=2e3,describe:`metres between 10 and 2000`},{path:`skills.shell.uses`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=10,describe:`a whole number of uses between 1 and 10`},{path:`skills.shell.durationSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 means the effect is instant`},{path:`skills.shell.invulnerableSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30`},{path:`skills.shell.shellRadiusMeters`,check:e=>typeof e==`number`&&e>=10&&e<=2e3,describe:`metres between 10 and 2000`},{path:`skills.burst.uses`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=1&&e<=10,describe:`a whole number of uses between 1 and 10`},{path:`skills.burst.durationSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30; 0 means the effect is instant`},{path:`skills.burst.burstRadiusMeters`,check:e=>typeof e==`number`&&e>=10&&e<=2e3,describe:`metres between 10 and 2000`},{path:`talents.soda.ascentMultiplier`,check:e=>typeof e==`number`&&e>=1&&e<=10,describe:`an ascent multiplier between 1 and 10`},{path:`talents.soda.steerPenalty`,check:e=>typeof e==`number`&&e>0&&e<=1,describe:`a fraction of the steering authority, above 0 and at most 1`},{path:`talents.silt.startVolume`,check:e=>typeof e==`number`&&e>.2&&e<=10,describe:`a starting volume above 0.2 and at most 10`},{path:`talents.silt.shrinkResistance`,check:e=>typeof e==`number`&&e>=0&&e<=1,describe:`a fraction of the shrink ignored, between 0 and 1`},{path:`talents.fish-fart.radiusMeters`,check:e=>typeof e==`number`&&e>=10&&e<=2e3,describe:`metres between 10 and 2000`},{path:`talents.fish-fart.cooldownSeconds`,check:e=>typeof e==`number`&&e>=0&&e<=30,describe:`seconds between 0 and 30`},{path:`talents.fish-fart.baitCount`,check:e=>typeof e==`number`&&Number.isInteger(e)&&e>=0&&e<=20,describe:`a whole number of bait bubbles between 0 and 20`}],Zc=[{path:`angry.appearance`,by:`RAGE_APPEARANCE_RULES, key by key`}];function Qc(e,t,n){if(!(typeof e==`object`&&e&&!Array.isArray(e)&&Object.keys(e).length>0)){n.push(t);return}for(let[r,i]of Object.entries(e))Qc(i,t?`${t}.${r}`:r,n)}(typeof Kc!=`object`||!Kc)&&H(`the top level must be an object`);for(let e of Xc){let t=Gc(e.path);t===void 0&&H(`"${e.path}" is missing. It should be ${e.describe}.`),e.check(t)||H(`"${e.path}" is ${JSON.stringify(t)}, but it should be ${e.describe}.`)}{let e=Xc.map(e=>e.path),t=t=>{let n=e=>t===e||t.startsWith(`${e}.`);return e.some(n)||Zc.some(e=>n(e.path))},n=[];Qc(Kc,``,n);let r=n.filter(e=>!t(e));r.length&&H(`${r.length} value(s) in the file are validated by nothing: ${r.join(`, `)}. Every knob needs a rule in REQUIRED (so a bad value names itself), or an entry in VALIDATED_AS_A_WHOLE saying which pass does check it. An unvalidated key is a key that silently does nothing when it is misspelled.`)}var W=Kc;for(let e of[`health`,`radius`]){let t=Object.keys(W.obstacles[e]).sort(),n=[...Yc].sort(),r=n.filter(e=>!t.includes(e)),i=t.filter(e=>!n.includes(e));(r.length||i.length)&&H(`obstacles.${e} must have exactly one row per obstacle kind`+(r.length?`; missing: ${r.join(`, `)}`:``)+(i.length?`; not a kind: ${i.join(`, `)}`:``))}{let e=Object.keys(W.obstacles.ramVolume).filter(e=>!Yc.includes(e));e.length&&H(`obstacles.ramVolume names kinds that do not exist: ${e.join(`, `)}`)}var $c=Object.keys(W.consumption.mass).sort(),el=Object.keys(W.consumption.edibleAtTier).sort();if($c.join(`,`)!==el.join(`,`)){let e=$c.filter(e=>!el.includes(e)),t=el.filter(e=>!$c.includes(e));H(`consumption.mass and consumption.edibleAtTier must list the same hazard kinds`+(e.length?`; missing from edibleAtTier: ${e.join(`, `)}`:``)+(t.length?`; missing from mass: ${t.join(`, `)}`:``))}for(let[e,t]of Object.entries(W.consumption.edibleAtTier))(t<1||t>W.consumption.tierVolume.length)&&H(`consumption.edibleAtTier.${e} is ${t}, but consumption.tierVolume defines only ${W.consumption.tierVolume.length} tiers (1..${W.consumption.tierVolume.length})`);W.stages.appearance.forEach((e,t)=>{for(let n of qc){let r=e[n.key];r===void 0&&H(`stages.appearance[${t}].${n.key} is missing. It should be ${n.what}.`),n.ok(r)||H(`stages.appearance[${t}].${n.key} is ${JSON.stringify(r)}, but it should be ${n.what}.`)}});function tl(e,t){if(typeof e==`number`)return e;let n=Number.parseInt(e.slice(1),16);return Number.isFinite(n)||H(`${t} is "${e}", which is not a colour`),n}var nl=[`inner`,`rim`,`glow`,`sheen`,`specular`,`hudColor`];W.stages.appearance.forEach((e,t)=>{for(let n of nl)e[n]=tl(e[n],`stages.appearance[${t}].${n}`)});var rl=[{key:`name`,ok:e=>typeof e==`string`&&e.length>0,what:`a non-empty name`},{key:`minRage`,ok:e=>typeof e==`number`&&e>=0,what:`a rage of 0 or more`},{key:`rim`,ok:U,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`glow`,ok:U,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`sheen`,ok:U,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`specular`,ok:U,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`hudColor`,ok:U,what:`a colour, either 0xrrggbb or "#rrggbb"`},{key:`shake`,ok:e=>typeof e==`number`&&e>=0&&e<=.3,what:`a fraction between 0 and 0.3`},{key:`swell`,ok:e=>typeof e==`number`&&e>=0&&e<=1,what:`a fraction between 0 and 1`}],il=[`rim`,`glow`,`sheen`,`specular`,`hudColor`];W.angry.appearance.forEach((e,t)=>{for(let n of rl){let r=e[n.key];r===void 0&&H(`angry.appearance[${t}].${n.key} is missing. It should be ${n.what}.`),n.ok(r)||H(`angry.appearance[${t}].${n.key} is ${JSON.stringify(r)}, but it should be ${n.what}.`)}let n=e;for(let e of il)n[e]=tl(n[e],`angry.appearance[${t}].${e}`)});{let e=W.angry.look;e.inner=tl(e.inner,`angry.look.inner`)}W.angry.burst.waveColour=tl(W.angry.burst.waveColour,`angry.burst.waveColour`);{let e=W.angry.gauge;for(let t of[`trackColour`,`trackStroke`,`tickColour`])e[t]=tl(e[t],`angry.gauge.${t}`)}{let e=Object.keys(W.angry.burst.hazardMode).sort(),t=Object.keys(W.consumption.mass).sort(),n=t.filter(t=>!e.includes(t)),r=e.filter(e=>!t.includes(e));(n.length||r.length)&&H(`angry.burst.hazardMode must say what a wave does to every hazard kind`+(n.length?`; missing: ${n.join(`, `)}`:``)+(r.length?`; not a hazard kind: ${r.join(`, `)}`:``))}{let e=Object.keys(W.hazards.health).sort(),t=Object.keys(W.consumption.mass).sort(),n=t.filter(t=>!e.includes(t)),r=e.filter(e=>!t.includes(e));(n.length||r.length)&&H(`hazards.health must state hit points for every hazard kind (0 = immune to the bullets)`+(n.length?`; missing: ${n.join(`, `)}`:``)+(r.length?`; not a hazard kind: ${r.join(`, `)}`:``))}{let e=Object.keys(W.consumption.mass),t=Object.keys(W.charges.chargers).filter(t=>!e.includes(t));t.length&&H(`charges.chargers names something that is not a hazard kind: ${t.join(`, `)}`);let n=Object.keys(W.enemyBullets.shooters).filter(t=>!e.includes(t));n.length&&H(`enemyBullets.shooters names something that is not a hazard kind: ${n.join(`, `)}`)}{let e=W.angry.appearance;e.length||H(`angry.appearance must have at least one row`),e[0].minRage!==0&&H(`angry.appearance[0].minRage is ${e[0].minRage}, but the first row must start at 0`);for(let t=1;t<e.length;t++)e[t].minRage<=e[t-1].minRage&&H(`angry.appearance[${t}].minRage is ${e[t].minRage}, which is not above angry.appearance[${t-1}].minRage (${e[t-1].minRage}); the rows must ascend`);let t=e[e.length-1].minRage;t>W.angry.rage.max&&H(`angry.appearance's last stage starts at ${t}, above angry.rage.max (${W.angry.rage.max}) -- unreachable`)}for(let[e,t,n]of[[`consumption.marker.edibleColor`,()=>W.consumption.marker.edibleColor,e=>W.consumption.marker.edibleColor=e],[`suction.fieldColor`,()=>W.suction.fieldColor,e=>W.suction.fieldColor=e],[`hazards.eel.shockColor`,()=>W.hazards.eel.shockColor,e=>W.hazards.eel.shockColor=e],[`obstacles.crateColor`,()=>W.obstacles.crateColor,e=>W.obstacles.crateColor=e],[`obstacles.crateRimColor`,()=>W.obstacles.crateRimColor,e=>W.obstacles.crateRimColor=e],[`obstacles.coralColor`,()=>W.obstacles.coralColor,e=>W.obstacles.coralColor=e],[`obstacles.coralRimColor`,()=>W.obstacles.coralRimColor,e=>W.obstacles.coralRimColor=e],[`obstacles.wallColor`,()=>W.obstacles.wallColor,e=>W.obstacles.wallColor=e],[`obstacles.wallRimColor`,()=>W.obstacles.wallRimColor,e=>W.obstacles.wallRimColor=e],[`obstacles.netColor`,()=>W.obstacles.netColor,e=>W.obstacles.netColor=e],[`obstacles.netRimColor`,()=>W.obstacles.netRimColor,e=>W.obstacles.netRimColor=e]])n(tl(t(),e));{let e=W.codex;for(let t of Jc)e[t]=tl(e[t],`codex.${t}`)}{let e=W.menu;for(let t of[`primaryFill`,`primaryPressedFill`,`primaryTextColour`,`secondaryFill`,`secondaryPressedFill`,`secondaryStroke`,`secondaryTextColour`,`buttonStroke`])e[t]=tl(e[t],`menu.${t}`)}var al={width:540,height:960},ol=5.5,sl=W.movement.keyboardCrossingSeconds,cl=2.5,ll=6.5,ul=1/120,dl=.38,G={get volumeMax(){return W.volume.max},set volumeMax(e){W.volume.max=e},get absorbEfficiency(){return W.volume.absorbEfficiency},set absorbEfficiency(e){W.volume.absorbEfficiency=e},get bubbleLaneRatio(){return W.volume.laneRatio},set bubbleLaneRatio(e){W.volume.laneRatio=e},get hitPointVolume(){return W.volume.hitCost},set hitPointVolume(e){W.volume.hitCost=e},get verticalSpeedScale(){return W.movement.verticalSpeedScale},set verticalSpeedScale(e){W.movement.verticalSpeedScale=e},get bubbleRiseMin(){return W.collectables.riseMin},set bubbleRiseMin(e){W.collectables.riseMin=e},get bubbleRiseMax(){return W.collectables.riseMax},set bubbleRiseMax(e){W.collectables.riseMax=e},get riseSpeedExponent(){return W.collectables.riseSpeedExponent},set riseSpeedExponent(e){W.collectables.riseSpeedExponent=e},get bubbleWobbleMin(){return W.collectables.wobbleMin},set bubbleWobbleMin(e){W.collectables.wobbleMin=e},get bubbleWobbleMax(){return W.collectables.wobbleMax},set bubbleWobbleMax(e){W.collectables.wobbleMax=e},get hazardSlowFactor(){return W.hazards.slowFactor},set hazardSlowFactor(e){W.hazards.slowFactor=e},get hazardSlowSeconds(){return W.hazards.slowSeconds},set hazardSlowSeconds(e){W.hazards.slowSeconds=e},get hazardLaunchDecaySeconds(){return W.hazards.launchDecaySeconds},set hazardLaunchDecaySeconds(e){W.hazards.launchDecaySeconds=e},get invulnerableSeconds(){return W.hazards.invulnerableSeconds},set invulnerableSeconds(e){W.hazards.invulnerableSeconds=e}},fl={frames:{"冲锋拖尾.png":{frame:{h:284,w:284,x:2,y:2},rotated:!1,sourceSize:{h:284,w:284},trimmed:!1},"刺魨.png":{frame:{h:41,w:46,x:290,y:2},rotated:!1,sourceSize:{h:41,w:46},trimmed:!1},"大白鲨-游动-1.png":{frame:{h:61,w:98,x:290,y:47},rotated:!1,sourceSize:{h:61,w:98},trimmed:!1},"大白鲨-游动-2.png":{frame:{h:61,w:98,x:392,y:47},rotated:!1,sourceSize:{h:61,w:98},trimmed:!1},"大白鲨-游动-3.png":{frame:{h:61,w:98,x:494,y:47},rotated:!1,sourceSize:{h:61,w:98},trimmed:!1},"大白鲨-游动-4.png":{frame:{h:61,w:98,x:596,y:47},rotated:!1,sourceSize:{h:61,w:98},trimmed:!1},"射水鱼.png":{frame:{h:21,w:40,x:340,y:2},rotated:!1,sourceSize:{h:21,w:40},trimmed:!1},"小鱼-游动-1.png":{frame:{h:21,w:41,x:384,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼-游动-2.png":{frame:{h:21,w:41,x:429,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼-游动-3.png":{frame:{h:21,w:41,x:474,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼-游动-4.png":{frame:{h:21,w:41,x:519,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼2-游动-1.png":{frame:{h:14,w:41,x:340,y:27},rotated:!1,sourceSize:{h:14,w:41},trimmed:!1},"小鱼2-游动-2.png":{frame:{h:14,w:41,x:385,y:27},rotated:!1,sourceSize:{h:14,w:41},trimmed:!1},"小鱼2-游动-3.png":{frame:{h:14,w:41,x:430,y:27},rotated:!1,sourceSize:{h:14,w:41},trimmed:!1},"小鱼2-游动-4.png":{frame:{h:14,w:41,x:475,y:27},rotated:!1,sourceSize:{h:14,w:41},trimmed:!1},"小鱼3-游动-1.png":{frame:{h:21,w:41,x:564,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼3-游动-2.png":{frame:{h:21,w:41,x:609,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼3-游动-3.png":{frame:{h:21,w:41,x:654,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼3-游动-4.png":{frame:{h:21,w:41,x:699,y:2},rotated:!1,sourceSize:{h:21,w:41},trimmed:!1},"小鱼4-游动-1.png":{frame:{h:22,w:41,x:698,y:47},rotated:!1,sourceSize:{h:22,w:41},trimmed:!1},"小鱼4-游动-2.png":{frame:{h:22,w:41,x:743,y:47},rotated:!1,sourceSize:{h:22,w:41},trimmed:!1},"小鱼4-游动-3.png":{frame:{h:22,w:41,x:788,y:47},rotated:!1,sourceSize:{h:22,w:41},trimmed:!1},"小鱼4-游动-4.png":{frame:{h:22,w:41,x:698,y:73},rotated:!1,sourceSize:{h:22,w:41},trimmed:!1},"座头鲸-游动-1.png":{frame:{h:70,w:111,x:290,y:112},rotated:!1,sourceSize:{h:70,w:111},trimmed:!1},"座头鲸-游动-2.png":{frame:{h:70,w:111,x:405,y:112},rotated:!1,sourceSize:{h:70,w:111},trimmed:!1},"座头鲸-游动-3.png":{frame:{h:70,w:111,x:520,y:112},rotated:!1,sourceSize:{h:70,w:111},trimmed:!1},"座头鲸-游动-4.png":{frame:{h:70,w:111,x:635,y:112},rotated:!1,sourceSize:{h:70,w:111},trimmed:!1},"手枪虾.png":{frame:{h:40,w:51,x:750,y:112},rotated:!1,sourceSize:{h:40,w:51},trimmed:!1},"水母-待机-1.png":{frame:{h:77,w:52,x:290,y:186},rotated:!1,sourceSize:{h:77,w:52},trimmed:!1},"水母-待机-2.png":{frame:{h:77,w:52,x:346,y:186},rotated:!1,sourceSize:{h:77,w:52},trimmed:!1},"水母-待机-3.png":{frame:{h:77,w:52,x:402,y:186},rotated:!1,sourceSize:{h:77,w:52},trimmed:!1},"水母-待机-4.png":{frame:{h:77,w:52,x:458,y:186},rotated:!1,sourceSize:{h:77,w:52},trimmed:!1},"海星.png":{frame:{h:51,w:52,x:514,y:186},rotated:!1,sourceSize:{h:51,w:52},trimmed:!1},"海胆.png":{frame:{h:48,w:51,x:570,y:186},rotated:!1,sourceSize:{h:48,w:51},trimmed:!1},"海豚-游动-1.png":{frame:{h:50,w:66,x:2,y:290},rotated:!1,sourceSize:{h:50,w:66},trimmed:!1},"海豚-游动-2.png":{frame:{h:50,w:66,x:72,y:290},rotated:!1,sourceSize:{h:50,w:66},trimmed:!1},"海豚-游动-3.png":{frame:{h:50,w:66,x:142,y:290},rotated:!1,sourceSize:{h:50,w:66},trimmed:!1},"海豚-游动-4.png":{frame:{h:50,w:66,x:212,y:290},rotated:!1,sourceSize:{h:50,w:66},trimmed:!1},"灯笼鱼-冲锋.png":{frame:{h:80,w:80,x:2,y:344},rotated:!1,sourceSize:{h:80,w:80},trimmed:!1},"灯笼鱼-移动.png":{frame:{h:80,w:80,x:86,y:344},rotated:!1,sourceSize:{h:80,w:80},trimmed:!1},"玩家子弹.png":{frame:{h:12,w:12,x:520,y:27},rotated:!1,sourceSize:{h:12,w:12},trimmed:!1},"玩家气泡.png":{frame:{h:36,w:36,x:805,y:112},rotated:!1,sourceSize:{h:36,w:36},trimmed:!1},"珊瑚-团状.png":{frame:{h:87,w:87,x:2,y:428},rotated:!1,sourceSize:{h:87,w:87},trimmed:!1},"珊瑚-扇形.png":{frame:{h:75,w:78,x:170,y:344},rotated:!1,sourceSize:{h:75,w:78},trimmed:!1},"珊瑚-枝状.png":{frame:{h:71,w:67,x:252,y:344},rotated:!1,sourceSize:{h:71,w:67},trimmed:!1},"珊瑚-桌状.png":{frame:{h:66,w:90,x:323,y:344},rotated:!1,sourceSize:{h:66,w:90},trimmed:!1},"珊瑚-管状.png":{frame:{h:58,w:84,x:417,y:344},rotated:!1,sourceSize:{h:58,w:84},trimmed:!1},"珊瑚.png":{frame:{h:71,w:83,x:93,y:428},rotated:!1,sourceSize:{h:71,w:83},trimmed:!1},"电鳗-放电.png":{frame:{h:53,w:78,x:505,y:344},rotated:!1,sourceSize:{h:53,w:78},trimmed:!1},"电鳗.png":{frame:{h:66,w:78,x:180,y:428},rotated:!1,sourceSize:{h:66,w:78},trimmed:!1},"盲虾-蓄力.png":{frame:{h:56,w:56,x:262,y:428},rotated:!1,sourceSize:{h:56,w:56},trimmed:!1},"盲虾.png":{frame:{h:56,w:56,x:322,y:428},rotated:!1,sourceSize:{h:56,w:56},trimmed:!1},"章鱼-游动-1.png":{frame:{h:79,w:79,x:2,y:519},rotated:!1,sourceSize:{h:79,w:79},trimmed:!1},"章鱼-游动-2.png":{frame:{h:79,w:79,x:85,y:519},rotated:!1,sourceSize:{h:79,w:79},trimmed:!1},"章鱼-游动-3.png":{frame:{h:79,w:79,x:168,y:519},rotated:!1,sourceSize:{h:79,w:79},trimmed:!1},"章鱼-游动-4.png":{frame:{h:79,w:79,x:251,y:519},rotated:!1,sourceSize:{h:79,w:79},trimmed:!1},"管虫.png":{frame:{h:78,w:48,x:334,y:519},rotated:!1,sourceSize:{h:78,w:48},trimmed:!1},"螃蟹-BOSS-待机-1.png":{frame:{h:192,w:192,x:2,y:602},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-待机-2.png":{frame:{h:192,w:192,x:198,y:602},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-待机-3.png":{frame:{h:192,w:192,x:394,y:602},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-待机-4.png":{frame:{h:192,w:192,x:590,y:602},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-攻击-1.png":{frame:{h:221,w:192,x:2,y:798},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-2.png":{frame:{h:221,w:192,x:198,y:798},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-3.png":{frame:{h:221,w:192,x:394,y:798},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-4.png":{frame:{h:221,w:192,x:590,y:798},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-5.png":{frame:{h:221,w:192,x:2,y:1023},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-6.png":{frame:{h:221,w:192,x:198,y:1023},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-7.png":{frame:{h:221,w:192,x:394,y:1023},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-攻击-8.png":{frame:{h:221,w:192,x:590,y:1023},rotated:!1,sourceSize:{h:221,w:192},trimmed:!1},"螃蟹-BOSS-死亡-1.png":{frame:{h:192,w:192,x:2,y:1248},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-死亡-2.png":{frame:{h:192,w:192,x:198,y:1248},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-死亡-3.png":{frame:{h:192,w:192,x:394,y:1248},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"螃蟹-BOSS-死亡-4.png":{frame:{h:192,w:192,x:590,y:1248},rotated:!1,sourceSize:{h:192,w:192},trimmed:!1},"金枪鱼-游动-1.png":{frame:{h:38,w:70,x:786,y:602},rotated:!1,sourceSize:{h:38,w:70},trimmed:!1},"金枪鱼-游动-2.png":{frame:{h:38,w:70,x:786,y:644},rotated:!1,sourceSize:{h:38,w:70},trimmed:!1},"金枪鱼-游动-3.png":{frame:{h:38,w:70,x:786,y:686},rotated:!1,sourceSize:{h:38,w:70},trimmed:!1},"金枪鱼-游动-4.png":{frame:{h:38,w:70,x:786,y:728},rotated:!1,sourceSize:{h:38,w:70},trimmed:!1}},meta:{app:`pack-atlas.py`,decodedBytes:4967360,encoding:`lossless WebP`,encodingNote:`pixel exact`,format:`RGBA8888`,image:`atlas-1.webp`,page:1,scale:`1`,size:{h:1444,w:860},sources:{"冲锋拖尾.png":{bytes:11149,sha256:`66e08d504bb19a6ca537ac344a8849cafb253747c116350d42ca0af56ffdf632`},"刺魨.png":{bytes:3299,sha256:`1269a32d44046571a1e012bb79f6476f5bd26948277314e7d63ae2648db0b626`},"大白鲨-游动-1.png":{bytes:7058,sha256:`29273eb44cda9b874dbdc2ea1c6544b3a64c7e053a737b51758ac8774f112bef`},"大白鲨-游动-2.png":{bytes:6883,sha256:`2289e4564e6577800612e4221520bb396c6b609d8ae7e7c69b13dee0c0143563`},"大白鲨-游动-3.png":{bytes:7176,sha256:`954274e11cdf864e5d1890036ab5680d76f61daaf00f56534230369a7307cde6`},"大白鲨-游动-4.png":{bytes:7150,sha256:`fd5b8fdf2814f9f6140cdfe58a0b7e5a53397ed4e13be92abce7c364812a81e1`},"射水鱼.png":{bytes:1259,sha256:`54be0faa21127588a8ef7b1278fd615fda3d027a2d2887fe3e839e549c1d0567`},"小鱼-游动-1.png":{bytes:1532,sha256:`5d0b51ed4069fb354acc3c1f4916558df75272435bd8cd976455294ae7c9255a`},"小鱼-游动-2.png":{bytes:1539,sha256:`0f96fc63b7374a8cf7b9b2f2b19c4cf2aa9f50ce9b674316d85efb4e62215c56`},"小鱼-游动-3.png":{bytes:1524,sha256:`b69564cb28fd575900a33a015f858a95e99c1c6551f508b38238ccf29aca80b0`},"小鱼-游动-4.png":{bytes:1520,sha256:`a7d065af753f91bc0a848356ebd1293c4c89aa5db9cf7b18f8729ba2eb36794a`},"小鱼2-游动-1.png":{bytes:1069,sha256:`7e0360e98a93ede46c732eed52c40ab80f6c50e5cf7412c85c2fde92bdf94a73`},"小鱼2-游动-2.png":{bytes:1053,sha256:`b8ec60d3c2d56811c4d01a46ed601e3cf7d996dca36b1fdf999c823f4b457c9d`},"小鱼2-游动-3.png":{bytes:1062,sha256:`6f9b8ce9ae3c2404593c18fb40c81f7ec8e7428fee78a3df7e52c9e963f0fb27`},"小鱼2-游动-4.png":{bytes:1067,sha256:`a4ee690a67e5b9ceb1b6006538c3474d00c1749d8e9cdf6dba5bda758782431a`},"小鱼3-游动-1.png":{bytes:1491,sha256:`a7f09fbf40ee9c1236676a867443478635f7a2b1b0f0e9f3cc88c18bc8c8eac4`},"小鱼3-游动-2.png":{bytes:1501,sha256:`a092897482a535ebf0abf021a2484865906377e4f7ba67ed5b3a334688b22727`},"小鱼3-游动-3.png":{bytes:1485,sha256:`56880e775f62a8f4c91a9b1b728e3627b55ed3095d12cd295e5d82e907b3829d`},"小鱼3-游动-4.png":{bytes:1487,sha256:`93de02157f089a830f5c71a08e30c43c99db6d7f2274b6299c81a8c6f5c19912`},"小鱼4-游动-1.png":{bytes:1745,sha256:`ac616c7b7336c14ee29806f3fb7064732f233a415e96e1b21e3bd04ebbba8fb4`},"小鱼4-游动-2.png":{bytes:1759,sha256:`4786d96e1bda2479d8555e724d72c0e220b8adc766f056d773405c58b8020338`},"小鱼4-游动-3.png":{bytes:1714,sha256:`07dff23b0343d99d3e94e8ff82e7aea66f244ddc9eef9c9983910be89fc01c6d`},"小鱼4-游动-4.png":{bytes:1739,sha256:`90dc15f58004406bc98035112961ead74312fed805f051fe2c8f25702786ed6c`},"座头鲸-游动-1.png":{bytes:8341,sha256:`b877f6087c68feadb60553b81f41eb8570ff135177ba2683fafe6225a1b3e3fc`},"座头鲸-游动-2.png":{bytes:8252,sha256:`6b21a644a40636a3709002e4ddb4f64b98f631a5c63f679c8439475b3827dced`},"座头鲸-游动-3.png":{bytes:8424,sha256:`68edf1b4ff601f71e546d917033c26824eb824513526c9b9f82b357cfeb48d92`},"座头鲸-游动-4.png":{bytes:8410,sha256:`ce63c164dafa8c1337fb623a8033a78de2cb8476bb66dd98f94afdfe73c22e90`},"手枪虾.png":{bytes:2729,sha256:`a4c12db2a92f4d190622866c083c829ddf92361d81c700d1598feaeef072e04b`},"水母-待机-1.png":{bytes:5416,sha256:`35b430545cd8bd91bc18d8f1e83707ff6ff7e44eef3b070fdccef21250c2bd77`},"水母-待机-2.png":{bytes:4567,sha256:`b572e39ef362f2d48b4d5a382fcd5e648eba05dcfb74977433d32f868f908ee9`},"水母-待机-3.png":{bytes:7227,sha256:`76c1f50e82bd8331ebb26e8c2e36a946d2388011acdda1e2d81dd472f6f9740a`},"水母-待机-4.png":{bytes:4927,sha256:`b1b6111d49c292adc74f809348c953240beb56d1e4c10f3fbc7de6e0325c0473`},"海星.png":{bytes:2538,sha256:`0597be35ef49ae3b2d3504aaeac528bb55bd8f8b3b29129a8270ac308514587e`},"海胆.png":{bytes:5230,sha256:`5677ed2df413f1a01cc4185f33102cc27a47bc5e1c5d4e1e14cf29cac62e831a`},"海豚-游动-1.png":{bytes:3693,sha256:`772cd61abafad7b1739a76998681b26617af8b7d5ab0e303b58667eb5f12f003`},"海豚-游动-2.png":{bytes:3732,sha256:`55ead9b10863f22a780f45e8a8242e931a0ac0c4f4900a6bb6aeba1e56d0621c`},"海豚-游动-3.png":{bytes:3641,sha256:`b7fba44042578bc33da0d682cd3b1728e4855d9147e14621bdeb9a26f09929ae`},"海豚-游动-4.png":{bytes:3617,sha256:`ad02702fce60f7acc4baa46d68f68c1c4655ef48e3b9caa8ea74b159acc2c249`},"灯笼鱼-冲锋.png":{bytes:4820,sha256:`16b124cf0963bd5c0d81ee5b5ae739803318a5a3e7ce606d4f544c7b41501f9f`},"灯笼鱼-移动.png":{bytes:4641,sha256:`3520a31ccfd2c8a879e1e487da7252a905ac01df3c522c0c921cf5b8393c56f7`},"玩家子弹.png":{bytes:317,sha256:`afc452bcb8e040136b43fb269867b697ff772cb8b182ef0c4892be41c5408a06`},"玩家气泡.png":{bytes:1131,sha256:`9c3625f8835fd1b4bc19b98aa849ef20c796ed336170d69b8419891dae9c51be`},"珊瑚-团状.png":{bytes:10909,sha256:`6e2ea9470b8b39e58e09a43d6c0f29a3449d1d690b02963042615207186079eb`},"珊瑚-扇形.png":{bytes:13971,sha256:`d88470b6d618114ffc05faf21ae1acaff897a30d65f0d4a1bc3f413c88c5347f`},"珊瑚-枝状.png":{bytes:7189,sha256:`ec58d64ca86a1c5f85709c2f7b7084307981c1d6c73fa1614466695dbe003d0c`},"珊瑚-桌状.png":{bytes:8610,sha256:`8f5b0b483ebb61b12d245b88dab06cf3203d3b7d9fae09a2309e5ccceaf8e33a`},"珊瑚-管状.png":{bytes:7346,sha256:`eb2ccb835261b5933042ad5fd1ef57c6ef8ff2ea8f68dc79ba28e525e6326739`},"珊瑚.png":{bytes:11377,sha256:`116e542855d0b0dc26b9c30e8ad885879acb4f2c0a32ed6ab16b834c526a6a1f`},"电鳗-放电.png":{bytes:5767,sha256:`5e52e9cfb24f1f7ffa017e9ba4c15fcef6a41da64c06449d6fb26b77ade8f860`},"电鳗.png":{bytes:3332,sha256:`7f5648a14dbb8ea588b8f305d02a70f78df2284289a16f851b65305561e3b2a7`},"盲虾-蓄力.png":{bytes:2952,sha256:`fc4f18d0f6b631a57f5263fdb3c216aff9f509c44737423a67caea54b8fffb06`},"盲虾.png":{bytes:2381,sha256:`1b58ca5c485936a93eb82068e698fb3584bf7f08111ddf69ecd480d488416fd6`},"章鱼-游动-1.png":{bytes:9396,sha256:`10516bbf5198457e676cfac5bb2e1ba5cb532ffdfec51b2a36a539aa8f554117`},"章鱼-游动-2.png":{bytes:9486,sha256:`21ea0277fd60f100be341b5dfb16a276059303ce96068d23862d30590a9f4490`},"章鱼-游动-3.png":{bytes:9291,sha256:`587a19f06cc161cfe3dfe943f05fa15f6fc26c9fc006ba7cc19e67f6d565438e`},"章鱼-游动-4.png":{bytes:9317,sha256:`b5c45a27fa350642273d0ea2fdd5bd367c3313eec650acdd177a8167304c5a31`},"管虫.png":{bytes:6238,sha256:`eaf2f735433d917016b63727f9e5dbffb660c3751bfdf400a1916d2e5854a80e`},"螃蟹-BOSS-待机-1.png":{bytes:28746,sha256:`f680b0e9202d74e6275f476be728732a8e4c7d53d3b518751666c09f23ba34e8`},"螃蟹-BOSS-待机-2.png":{bytes:29998,sha256:`6a1f5c9c81ec0c36cb1006b922cc60d9dbfa3009fef76133d4f746c3a4f5e548`},"螃蟹-BOSS-待机-3.png":{bytes:29226,sha256:`4f2d0e91ee3a3aab93e5eb276222431a788731b13d36f721c144eebc50efa86f`},"螃蟹-BOSS-待机-4.png":{bytes:27826,sha256:`589d662b5b04c5edc23c40a23ffed382419e3abf960a70f3e0dedccc16c70fc4`},"螃蟹-BOSS-攻击-1.png":{bytes:30894,sha256:`e7e44519940487e41c475e591c0af299ed98966516b6555c30b436dc6a799a17`},"螃蟹-BOSS-攻击-2.png":{bytes:32198,sha256:`1b072a2525f65d23e6eaface82b738802e63a9ba8fb2dfb858b8fb32cf1fc407`},"螃蟹-BOSS-攻击-3.png":{bytes:26332,sha256:`b99ca767cc5ab272dd7113958e615a8f6d6a0af243fd65fa36ecb9396e29304f`},"螃蟹-BOSS-攻击-4.png":{bytes:34212,sha256:`6e27dc184050a87229f7d3425a4aa2bcc27a1f1b2787c2fee6d338db2329ce39`},"螃蟹-BOSS-攻击-5.png":{bytes:32716,sha256:`60684c2cc70e7e748b052b337e352103297521e2d9068bcf629ba1f71d5a2789`},"螃蟹-BOSS-攻击-6.png":{bytes:30378,sha256:`c92346b8ed0c50f05646f51e4393bc762405669c3ac386025b3910a2c6464b66`},"螃蟹-BOSS-攻击-7.png":{bytes:29460,sha256:`6f696ef2208523690eb4b5f69d72bb1fd70142229de7c26b3f655f5784b650e2`},"螃蟹-BOSS-攻击-8.png":{bytes:31036,sha256:`54861770a6530cda24e777a1a5567d84e328b9ddb71543d76e55dd9207309b21`},"螃蟹-BOSS-死亡-1.png":{bytes:29170,sha256:`86a494ad5cfe1dcf680c605974f8bc98be5b7c06344dc3ebea34e8b1e74c680b`},"螃蟹-BOSS-死亡-2.png":{bytes:29153,sha256:`ae8fae2de6474b6cd8a31fc90494ea9d873b9098729462afb1bac385a96b0afa`},"螃蟹-BOSS-死亡-3.png":{bytes:38203,sha256:`d2ac2b37a84dde6f5669a7280991b6ca7f99dfa77acad7ba5287929297d67e99`},"螃蟹-BOSS-死亡-4.png":{bytes:13729,sha256:`0fc2ad3d2c24e9dd6fd297f12821c2df37dae2a8e6cf4fcc6ce97eda5b0bf6a8`},"金枪鱼-游动-1.png":{bytes:3092,sha256:`35b861eb10fd44f0a67e6ff1c159d98f5d26438eb655c46edad7c2f581b179b0`},"金枪鱼-游动-2.png":{bytes:3058,sha256:`96e9bcc6aa2bb00026c479fdcab98f7ed26eaa40fc2d745f6450d8f3ccd0cdc2`},"金枪鱼-游动-3.png":{bytes:3048,sha256:`a2210a8f7af324574c64e4a376dc5e2b599e5b8b770ede3bfbb7ed4fc9711f7a`},"金枪鱼-游动-4.png":{bytes:3062,sha256:`c5f17cde9ff9364db5b4a0643a51c80e01c7fde4ab2d6c84a7b8f0cf1c118627`}},textureBytes:295656,version:`1.0`}},pl=new URL(`atlas-1-DqRJ-2wx.webp`,import.meta.url).href,ml=new URL(`黑烟囱墓场-最远景-Dp7Td2Af.jpg`,import.meta.url).href,hl=new URL(`黑烟囱墓场-远景-CiyQc9A6.jpg`,import.meta.url).href;function gl(e){let{frames:t}=e;if(Array.isArray(t))return t;let n=Math.max(1,Math.round(e.count??1));return Array.from({length:n},(e,n)=>t.replace(`{n}`,String(n+1)))}function _l(e){let t=Math.max(1,gl(e).length);return Math.min(e.maxSeconds,t/Math.max(.01,e.framesPerSecond))}function vl(e,t){let n=Math.max(1,gl(e).length),r=_l(e),i=Math.floor(n/r*Math.max(0,t));return e.once?Math.min(n-1,i):i%n}function yl(e){let t=1;for(let n=e.parent;n;n=n.parent)t*=n.scale?.y??1;return t<0}var bl=Object.assign({"./assets/atlas/atlas-1.json":fl}),xl=Object.assign({"./assets/atlas/atlas-1.webp":pl}),Sl=Object.assign({"./assets/黑烟囱墓场-最远景.jpg":ml,"./assets/黑烟囱墓场-远景.jpg":hl});function Cl(e){return e.replace(/^.*\//,``).replace(/\.[^.]+$/,``)}var wl=new Map,Tl=new Map,El=new Map;for(let[e,t]of Object.entries(bl)){let n=Cl(e),r=Object.entries(xl).find(([e])=>Cl(e)===n)?.[1];if(!r){console.warn(`[assets] the atlas manifest ${n}.json has no texture beside it -- was the pack interrupted?`);continue}Tl.set(n,{id:n,data:t,url:r});for(let[e,r]of Object.entries(t.frames??{}))wl.has(Cl(e))||wl.set(Cl(e),{page:n,key:e,width:r.frame.w,height:r.frame.h})}for(let[e,t]of Object.entries(Sl))El.set(Cl(e),t);var Dl=new Map,Ol=new Map;async function kl(e){let t=Dl.get(e);if(t)return t;let n=Ol.get(e);if(n)return n;let r=Tl.get(e);if(!r)return null;let i=(async()=>{let t=await Tr.load(r.url);t.source.scaleMode=`nearest`,t.source.update();let n=new Qt(t,r.data);return await n.parse(),Dl.set(e,n),n})().catch(t=>(console.warn(`[assets] could not load atlas page ${e}: ${t instanceof Error?t.message:String(t)}`),null)).finally(()=>{Ol.delete(e)});return Ol.set(e,i),i}function Al(e){let t=wl.get(e);if(!t)return null;let n=Dl.get(t.page)?.textures[t.key];return n&&n.width>0?n:null}function jl(e){if(!e)return``;let t=Cl(e);return El.get(t)||(wl.has(t)||console.warn(`[assets] no separate file called "`+e+`". Its own file: `+[...El.keys()].join(`, `)),``)}function Ml(){return[...[...wl.values()].map(e=>e.key),...Object.keys(Sl).map(e=>e.replace(/^\.\/assets\//,``))]}async function Nl(e){let t=Cl(e),n=wl.get(t);if(n){let t=(await kl(n.page))?.textures[n.key];return!t||t.width<=0?(console.warn(`[assets] ${e} is in ${n.page} but came out empty`),null):t}let r=El.get(t);if(!r)return console.warn(`[assets] no picture called "`+e+`". Available: `+Ml().join(`, `)),null;try{let t=await Tr.load(r);return!t||t.width<=0?(console.warn(`[assets] `+e+` decoded to an empty texture`),null):t}catch(t){return console.warn(`[assets] could not load `+e+`: `+(t instanceof Error?t.message:String(t))),null}}function Pl(e){return Promise.all(gl(e).map(e=>Nl(e))).then(e=>e.filter(e=>e!==null))}function Fl(e){let t=Cl(e);if(wl.has(t))return Al(t);let n=El.get(t);if(!n)return null;let r=Tr.get(n);return r&&r.width>0?r:null}var Il=new Map;async function Ll(e){let t=new Map;return await Promise.all(e.map(async e=>{let n=Il.get(e);if(n!==void 0){t.set(e,n);return}let r=0;try{let t=(await fetch(e,{method:`HEAD`})).headers.get(`content-length`),n=t===null?NaN:Number(t);Number.isFinite(n)&&n>0&&(r=n)}catch{}Il.set(e,r),t.set(e,r)})),t}async function Rl(e,t){let n=new Set,r=new Set;for(let t of e){if(t.length===0)continue;let e=Cl(t),i=wl.get(e);i?n.add(i.page):El.has(e)&&r.add(e)}let i=[...[...n].sort().map(e=>({url:Tl.get(e)?.url??``,load:()=>kl(e)})),...[...r].sort().map(e=>({url:El.get(e)??``,load:()=>Nl(e)}))],a=performance.now(),o=new Map,s=[],c=e=>e.reduce((e,t)=>e+(o.get(t)??0),0),l=()=>t({done:s.length,total:i.length,bytesDone:c(s),bytesTotal:c(i.map(e=>e.url)),seconds:(performance.now()-a)/1e3});l(),Ll(i.map(e=>e.url).filter(e=>e.length>0)).then(e=>{for(let[t,n]of e)o.set(t,n);l()}),await Promise.all(i.map(async e=>{await e.load(),s.push(e.url),l()}))}function zl(e){"@babel/helpers - typeof";return zl=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},zl(e)}function Bl(e,t){if(zl(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(zl(r)!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function Vl(e){var t=Bl(e,`string`);return zl(t)==`symbol`?t:t+``}function K(e,t,n){return(t=Vl(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var Hl=class{constructor(e){K(this,`spec`,void 0),K(this,`root`,new j),K(this,`sprites`,[]),K(this,`loaded`,!1),K(this,`loadError`,``),K(this,`canvasWidth`,0),K(this,`canvasHeight`,0),K(this,`laneWidthMeters`,0),this.spec=e,this.root.eventMode=`none`;let t=new Image;t.decoding=`async`,t.onload=()=>{let n=T.from(t);for(let t=0;t<2;t++){let t=new M(n);t.anchor.set(.5,0),t.alpha=e.alpha,t.tint=e.tint,t.eventMode=`none`,this.root.addChild(t),this.sprites.push(t)}this.loaded=!0,this.loadError=``,this.applyLayout()},t.onerror=()=>{this.loaded=!1,this.loadError=`the image could not be loaded`,console.warn(`[backdrop] could not load `+e.image)};let n=jl(e.image);if(!n){this.loadError=`no such image: `+e.image;return}t.src=n}get isLoaded(){return this.loaded}get error(){return this.loadError}layout(e,t,n=0){this.laneWidthMeters=n,this.canvasWidth=e,this.canvasHeight=t,this.applyLayout()}applyLayout(){this.sprites.length}draw(e,t){if(this.sprites.length===0||this.canvasWidth<=0||t<=0)return;let n=this.laneWidthMeters>0?this.laneWidthMeters*t:this.canvasWidth,r=this.canvasHeight*this.spec.heightScreens,i=r,a=(e*this.spec.speedFactor*t%i+i)%i;for(let[e,t]of this.sprites.entries())t.width=n,t.height=r,t.x=this.canvasWidth/2,t.y=a-e*i}},Ul=class{constructor(){K(this,`root`,new j),K(this,`layers`,[]),K(this,`offsets`,[]),this.root.eventMode=`none`;for(let e=0;e<W.background.layers.length;e++){let e=new z;e.eventMode=`none`,this.root.addChild(e),this.layers.push({g:e,motes:[]})}}layout(e,t){let n=W.background;for(let[r,i]of this.layers.entries()){let a=n.layers[r],o=Math.max(40,t*n.tileScreens);i.motes.length=0;let s=Math.round(a.count*n.countScale);for(let t=0;t<s;t++)i.motes.push({x:Math.random()*e,y:Math.random()*o*2,r:e*a.sizeRatio*(.6+Math.random()*.8)})}}get layerOffsetsRef(){return this.offsets}draw(e,t,n){let r=W.background,i=Math.max(1,n-t),a=Math.max(40,i*r.tileScreens);for(let[i,o]of this.layers.entries()){let s=r.layers[i],c=o.g;if(c.clear(),s.alpha<=.005||s.count<=0)continue;let l=e*s.speedFactor;this.offsets[i]=l;for(let e of o.motes){let r=e.y+l;r=t+((r-t)%(a*2)+a*2)%(a*2);let i=r>n?r-a*2:r;i<t-a||i>n+a||c.circle(e.x,i,e.r)}c.fill({color:s.colour,alpha:s.alpha})}}},Wl=`// =====================================================================================================
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
//   1. **热流乘升**（\`vent\`）：喷口上方是死的，唯一的解法是**横向离开**。喷发是周期性的，安全窗口看得见。
//   2. **路会被封住**（\`tube\` 管虫群）：管虫受刺激才伸出来，所以"走哪条缝"是个要看一眼再决定的事。
{
  id: 'black-smokers',
  name: '黑烟囱墓场',
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
  scrollLength: 2500,

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

    // 从右侧进、在屏幕内上下摆两次、从左侧出去的一串鱼。教学用的那条。
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

    // 从屏幕**右侧中央**平着游进来，在中间偏左处上拐，从**屏幕顶部**游出去。
    rightToTop: {
      points: [
        { x: 1.3, y: -0.5 },
        { x: 0.82, y: -0.5 },
        { x: 0.5, y: -0.12 },
        { x: 0.45, y: 0.3 }
      ],
      seconds: 5
    },

    // 同上，镜像：从屏幕**左侧中央**进来，从**屏幕顶部**出去。
    leftToTop: {
      points: [
        { x: -0.3, y: -0.5 },
        { x: 0.18, y: -0.5 },
        { x: 0.5, y: -0.12 },
        { x: 0.55, y: 0.3 }
      ],
      seconds: 5
    },

    // 左 1/4 起、拱过**屏幕正中**、到左 3/4 收的一个半圆（最后两个点只是把它送出画）。
    // 弦压在屏幕偏下的位置，所以这条弧是**从下面兜上来**的，不是贴在天花板上。
    arcLeft: {
      points: [
        { x: -0.25, y: -0.95 },
        { x: 0.25, y: -0.9 },
        { x: 0.5, y: -0.5 },
        { x: 0.75, y: -0.9 },
        { x: 1.25, y: -0.95 }
      ],
      seconds: 5.5
    },

    // 同上，镜像：右 1/4 起、过屏幕正中、到右 3/4 收。
    arcRight: {
      points: [
        { x: 1.25, y: -0.95 },
        { x: 0.75, y: -0.9 },
        { x: 0.5, y: -0.5 },
        { x: 0.25, y: -0.9 },
        { x: -0.25, y: -0.95 }
      ],
      seconds: 5.5
    },

    // ---------------------------------------------------------------------------------------------
    // 斜穿型
    // ---------------------------------------------------------------------------------------------

    // 从**右下角**斜着升到**左上角**，中途穿过屏幕正中。左下角是屏幕外，所以队列在画外等。
    riseRight: {
      points: [
        { x: 1.3, y: -1.35 },
        { x: 0.95, y: -1.05 },
        { x: 0.5, y: -0.5 },
        { x: 0.05, y: 0.05 },
        { x: -0.3, y: 0.4 }
      ],
      seconds: 5.5
    },

    // 同上，镜像：**左下角**到**右上角**。
    riseLeft: {
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

    // 左右两路**同时**从画外斜插到屏幕正中再合流向下——要的就是中间那一小段窗口。
    // 两条要放在同一个 \`at\` 上才有意义（见下面的刷怪块），单放一条只是普通的斜线。
    pincerLeft: {
      points: [
        { x: -0.3, y: -0.15 },
        { x: 0.2, y: -0.35 },
        { x: 0.5, y: -0.62 },
        { x: 0.52, y: -1.15 }
      ],
      seconds: 4
    },
    pincerRight: {
      points: [
        { x: 1.3, y: -0.15 },
        { x: 0.8, y: -0.35 },
        { x: 0.5, y: -0.62 },
        { x: 0.48, y: -1.15 }
      ],
      seconds: 4
    }
  },

  boss: {
    at: 2300,
    health: 140,
    // 攀附在巨大热液烟囱上的蟹：横向挥螯、喷矿物颗粒、堵住喷口制造一次猛烈爆发。
    name: '烟囱蟹王',
    colour: 0x6b2f2a
  },

  // 教学关：慢（30 m/s = 50 秒跑完）。
  scrollSpeed: 30,
  playerLeadLimit: 110,
  landmarks: [
    { depth: 1100, label: '黑烟囱群' },
    { depth: 700, label: '管虫丛' },
    { depth: 300, label: '热流区' },
  ],
  spawns: [
    // --- 0-250m：先教形状。追得到的气泡，和第一批随热流上来的矿物颗粒。 ---
    { at: 30, span: 200, count: 10, kind: 'bubble', arrange: 'spread', amplitude: 0.22, sizes: [0.4, 0.5, 0.35] },
    // 第一批颗粒是**从下面上来的**：这一关第一个新方向。
    { at: 120, span: 60, count: 4, kind: 'mineral', arrange: 'spread', x: 0.5, from: 'bottom' },
    // **射水鱼**第一位枪手的教学位：3 点血打得跑，是"会开枪的东西也可以被赶走"的第一课。
    // 放在 120m 矿物颗粒之后、金枪鱼之前，单独一条，让"水里有会开枪的东西"读得出来。
    { at: 170, kind: 'archer', x: 0.5 },
    { at: 150, kind: 'tuna', x: 0.9 },
    { at: 210, kind: 'tuna', x: 0.0 },
    { at: 260, kind: 'tuna', x: 0.2 },

    // --- 250-500m：第一个喷口。它单独出现，因为它是这一关的招牌机制。 ---
    // 喷口在泳道中间，两边各留一条能过的缝：所以"横向离开"是唯一的解法，而不是"绕远路"。
    { at: 320, kind: 'vent', x: 0.5 },
    { at: 340, span: 50, count: 3, kind: 'mineral', arrange: 'spread', x: 0.5, from: 'bottom' },
    // 第一串"鱼贯"：从右边进来、上下摆两次、从左边出去。单独出现，因为它是新形状。
    //
    // **它们从曲线的起点出发**：整串一起在起点（画外）待命，然后每隔 \`pathSpacingSeconds\` 走一条，
    // 所以看到的是"一群鱼游进来"，而不是"几条鱼凭空出现在曲线的这个位置"。
    // **这个数就是鱼群的松紧**：调小更密、调大更散；\`count\` 决定的是这一串有多长，不是有多密。
    { at: 400, kind: 'fish', count: 6, path: 'weave', x: 1, pathSpacingSeconds: 0.5 },
    // 最长的一串（10 条），走的是一条**从左下角升到右上角**的斜线：横跨整块玻璃，最像"一队鱼从你身边游过"。
    // 它和上面那串前后脚进场，两条不同形状的鱼队同时在场——"这里是有编队的"才读得出来。
    { at: 455, kind: 'fish', count: 10, path: 'riseLeft', x: 0.2, pathSpacingSeconds: 0.5 },
    { at: 430, kind: 'shrimp', x: 0.2, from: 'left', depth: 0.6 },
    { at: 470, kind: 'shrimp', x: 0.8, from: 'right', depth: 0.55 },

    // --- 500-800m：管虫丛。路被一丛丛管子切窄，而它们是活着的东西，会缩回去。 ---
    { at: 540, kind: 'tube', count: 4, arrange: 'barrier', gapAt: 0.3, gapWidth: 0.2 },
    { at: 560, kind: 'vent', x: 0.72 },
    { at: 600, kind: 'crab', x: 0.45 },
    { at: 640, kind: 'tube', count: 5, arrange: 'barrier', gapAt: 0.68, gapWidth: 0.2 },
    { at: 680, span: 60, count: 5, kind: 'mineral', arrange: 'spread', x: 0.4, from: 'bottom' },
    // 第三串：**从屏幕右侧中央进来、朝上拐、从顶边出去**。前两串都是横着过去的，这一串是唯一"往上游走"的，
    // 所以它读起来是"它们要走了"，而不是"它们要撞过来"。
    { at: 700, kind: 'fish', count: 7, path: 'rightToTop', x: 1, pathSpacingSeconds: 0.4 },
    { at: 720, kind: 'shrimp', count: 2, arrange: 'spread', span: 24, x: 0.25, from: 'left', depth: 0.5 },
    { at: 760, kind: 'vent', x: 0.28 },

    // --- 800-1100m：两个喷口 + 管虫，开始要求连续横移。 ---
    { at: 820, kind: 'tube', count: 5, arrange: 'barrier', gapAt: 0.5, gapWidth: 0.19 },
    { at: 870, kind: 'vent', x: 0.5 },
    // 第二串：换成**半圆**（左 1/4 起、拱过屏幕正中、到左 3/4 收），和 870 的喷口配着读——
    // 喷口逼你横向离开，而这条弧正好也在玻璃上划一道横线。
    { at: 890, kind: 'fish', count: 8, path: 'arcLeft', x: 0.25, pathSpacingSeconds: 0.5 },
    // **深海鱼（灯笼鱼）**：这一关一共 10 点血，比小鱼小虾硬得多，所以它出现在中段以后，而且单独放——
    // 它的触角是这一关唯一会发光的东西，混在别的敌人里就白瞎了。
    { at: 520, kind: 'angler', x: 0.28, from: 'left' },
    { at: 760, kind: 'angler', x: 0.72, from: 'right' },
    { at: 1010, kind: 'angler', x: 0.5 },
    // 靠近 BOSS 前再来一条，作为"要打 BOSS 了"的提示。
    { at: 1180, kind: 'angler', x: 0.35, from: 'left' },
    { at: 900, kind: 'crab', x: 0.75 },
    { at: 940, span: 80, count: 6, kind: 'mineral', arrange: 'spread', amplitude: 0.18, x: 0.5, from: 'bottom' },
    // 第二条射水鱼：中段复习位，和灯笼鱼同一段——一个用触角骗你，一个用子弹追你。
    { at: 960, kind: 'archer', x: 0.35 },
    { at: 990, kind: 'shrimp', count: 2, arrange: 'spread', span: 20, x: 0.7, from: 'right', depth: 0.45 },
    { at: 1030, kind: 'tube', count: 5, arrange: 'barrier', gapAt: 0.25, gapWidth: 0.19 },
    { at: 1055, kind: 'fish', count: 5, path: 'dive', x: 0.5, pathSpacingSeconds: 0.35 },
    { at: 1080, kind: 'vent', x: 0.66 },
    // **电鳗**：这一关唯一的"射手"。它枪打不死（0 血），只能躲——躲得漂亮（子弹擦边）有突变值拿。
    // 单独放在进 BOSS 前的空档里，让"水里出现了会放电的东西"读得出来；被它的闪电碰到会短暂反向，教学关只放一条。
    { at: 1120, kind: 'eel', x: 0.6 },

    // --- 1100-1300m：进 BOSS 前的最后一段。给一点食物，然后压力上来。 ---
    { at: 1160, span: 70, count: 7, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.45, 0.6, 0.5] },
    { at: 1220, kind: 'crab', count: 2, arrange: 'line' },
    // 进 BOSS 前的最后一道：**两路合围**。同一个 \`at\` 上左右各一串（\`pincerLeft\` / \`pincerRight\`），
    // 它们从画外斜插到屏幕正中再并流向底，中间只留一条很窄的时间窗口——BOSS 之前最后一次"读窗口"。
    { at: 1240, kind: 'fish', count: 4, path: 'pincerLeft', x: 0.0, pathSpacingSeconds: 0.3 },
    { at: 1240, kind: 'fish', count: 4, path: 'pincerRight', x: 1.0, pathSpacingSeconds: 0.3 },
    { at: 1250, kind: 'shrimp', count: 3, arrange: 'spread', span: 30, x: 0.5, from: 'left', depth: 0.6 },
  ],
}
`,Gl=`// =====================================================================================================
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
  // 沉船幽谷：昏暗，但舱灯与反光金属让它更好辨认。褐绿 + 一点暖灯色。
  palette: {
    deep: 0x04090d,
    shallow: 0x1d4a4a,
    bloom: 0xbfe4d8,
    tint: 0x6b4a2a,
    tintStrength: 0.2
  },
  scrollLength: 1100,

  boss: {
    at: 950,
    health: 220,
    // 藏在船头残骸里：用触手封锁通道，吸进附近的漂浮物再喷向玩家。触手被破坏后船体坍塌，战场改变。
    name: '寄居沉船章鱼',
    colour: 0x6b4a3a
  },

  scrollSpeed: 32,
  playerLeadLimit: 110,
  landmarks: [
    { depth: 820, label: '船首残骸' },
    { depth: 520, label: '货舱通道' },
    { depth: 240, label: '锚链' },
  ],
  spawns: [
    // --- 开场：这一关从第一秒就有侧向进场（玩家已经会玩了）。 ---
    { at: 20, span: 160, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.3, sizes: [0.35, 0.5] },
    { at: 40, kind: 'crab', count: 2, arrange: 'spread', span: 20, from: 'left', depth: 0.6 },
    { at: 90, kind: 'crate', x: 0.7, from: 'right', enterSpeed: 26 },

    // --- 货舱通道：木板、酒桶、船体板和网交替，缝比第一关窄。 ---
    { at: 150, kind: 'crate', count: 4, arrange: 'barrier', gapAt: 0.35, gapWidth: 0.19 },
    { at: 200, kind: 'net', count: 3, arrange: 'line' },
    { at: 240, kind: 'wall', count: 4, arrange: 'barrier', gapAt: 0.62, gapWidth: 0.19 },
    // **射水鱼**：沉船幽谷的第一位枪手——窄缝 + 子弹，躲弹的空间本身就是这一关的主题。
    { at: 280, kind: 'archer', x: 0.4 },

    // --- 灯笼鱼第一次出现：唯一一个"自己会发光"的敌人，而光是诱饵。 ---
    { at: 330, kind: 'angler', x: 0.4 },
    { at: 370, kind: 'crab', count: 3, arrange: 'spread', span: 24, x: 0.6, from: 'right', depth: 0.55 },
    { at: 410, kind: 'jelly', count: 3, arrange: 'line' },

    // --- 失控鱼雷：从船舱里射出来，直飞一段之后开始追。 ---
    { at: 450, kind: 'torpedo', x: 0.5, from: 'right', enterSpeed: 40 },
    { at: 490, kind: 'crate', count: 5, arrange: 'barrier', gapAt: 0.45, gapWidth: 0.19 },
    { at: 560, kind: 'torpedo', count: 2, arrange: 'spread', span: 30, x: 0.6, from: 'left', enterSpeed: 40 },

    // --- 锚链：珊瑚（藤壶/锈蚀结构）竖直排成链，中间夹着漂浮残骸。 ---
    { at: 600, kind: 'coral', count: 5, arrange: 'barrier', gapAt: 0.5, gapWidth: 0.19 },
    { at: 640, kind: 'crab', count: 2, arrange: 'spread', span: 30, x: 0.3, from: 'left', depth: 0.65 },
    { at: 680, kind: 'angler', count: 2, arrange: 'line' },
    { at: 720, kind: 'wall', count: 5, arrange: 'barrier', gapAt: 0.3, gapWidth: 0.19 },
    { at: 760, kind: 'torpedo', x: 0.25, from: 'right', enterSpeed: 40 },
    { at: 800, span: 60, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.25, sizes: [0.5, 0.7] },

    // --- 800-950m：船头残骸。两侧同时来东西，中间是窄缝。 ---
    { at: 840, kind: 'jelly', count: 2, arrange: 'spread', span: 24, from: 'left', depth: 0.5 },
    { at: 870, kind: 'crab', count: 3, arrange: 'line' },
    { at: 900, kind: 'net', count: 3, arrange: 'barrier', gapAt: 0.55, gapWidth: 0.2 },
  ],
}
`,Kl=`// =====================================================================================================
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
  // 发光水母林：中层海域，蓝紫 / 青 / 粉。
  palette: {
    deep: 0x0a0a24,
    shallow: 0x4a6fd0,
    bloom: 0xd8b8ff,
    tint: 0x8a4fd0,
    tintStrength: 0.3
  },
  scrollLength: 1400,

  boss: {
    at: 1200,
    health: 200,
    name: '冠冕水母',
    colour: 0xb98cff
  },

  scrollSpeed: 28,
  playerLeadLimit: 110,
  landmarks: [
    { depth: 1050, label: '水母树冠' },
    { depth: 650, label: '触须森林' },
    { depth: 250, label: '冠冕' },
  ],
  spawns: [
    // --- 开场：水母很多，但都很软。这一关的压力来自"电"，不来自追杀。 ---
    { at: 30, span: 180, count: 10, kind: 'bubble', arrange: 'spread', amplitude: 0.2, sizes: [0.4, 0.5, 0.35] },
    { at: 120, kind: 'zapper', x: 0.35 },
    { at: 180, kind: 'zapper', x: 0.68 },

    // --- 触须森林：竖直的水母列 + 之间夹着电击水母，路线要么穿过去、要么带电炸开。 ---
    { at: 300, kind: 'zapper', count: 4, arrange: 'column', span: 90, x: 0.3 },
    { at: 340, kind: 'zapper', count: 4, arrange: 'column', span: 90, x: 0.7 },
    // **海星**：水母林是弹幕的主场——导电水母教'别碰'，海星教'读方向'（五臂就是下一轮的走向）。
    { at: 410, kind: 'starfish', x: 0.3 },
    { at: 450, kind: 'zapper', count: 3, arrange: 'line' },
    { at: 500, kind: 'jelly', count: 4, arrange: 'line' },
    { at: 560, kind: 'zapper', count: 5, arrange: 'line' },

    // --- 中段：孢子鱼群和伪装者混进来，路线观察开始变难。 ---
    { at: 620, kind: 'fish', count: 4, arrange: 'spread', span: 30, from: 'left', depth: 0.6 },
    { at: 660, kind: 'shrimp', count: 3, arrange: 'spread', span: 30, x: 0.6, from: 'right', depth: 0.5 },
    { at: 720, kind: 'zapper', count: 3, arrange: 'spread', span: 40, x: 0.5 },
    { at: 830, kind: 'zapper', count: 5, arrange: 'line' },
    { at: 880, kind: 'jelly', count: 4, arrange: 'spread', span: 50, x: 0.5 },

    // --- 终段：一连串带电的窄缝，然后进 BOSS。 ---
    { at: 950, span: 60, count: 6, kind: 'bubble', arrange: 'spread', amplitude: 0.22, sizes: [0.45, 0.6] },
    { at: 1000, kind: 'zapper', count: 4, arrange: 'line' },
    { at: 1060, kind: 'zapper', count: 3, arrange: 'spread', span: 30, x: 0.35 },
    { at: 1120, kind: 'mineral', count: 4, arrange: 'spread', span: 40, x: 0.6, from: 'bottom' },
    // 第二只海星放在 BOSS 前：两只星形弹幕的旋转相位不同（每实例随机初相），合起来是一张会转的网。
    { at: 1150, kind: 'starfish', x: 0.7 },
  ],
}
`,ql=`// =====================================================================================================
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
  // 猎食者温跃层：水体折射与温差，开阔、偏冷绿。
  palette: {
    deep: 0x04202a,
    shallow: 0x2fa8b8,
    bloom: 0xd8ffe8,
    tint: 0x2f8f7a,
    tintStrength: 0.16
  },
  scrollLength: 1500,

  boss: {
    at: 1300,
    health: 240,
    name: '长尾鲨',
    colour: 0x3f5f7a
  },

  scrollSpeed: 34,
  playerLeadLimit: 120,
  landmarks: [
    { depth: 1150, label: '暖水层' },
    { depth: 750, label: '温跃层' },
    { depth: 300, label: '冷水层' },
  ],
  spawns: [
    // --- 开场：鱼群本身就是内容（沙丁鱼群不主动攻击，但受惊会集体转向）。 ---
    { at: 30, span: 200, count: 12, kind: 'bubble', arrange: 'spread', amplitude: 0.24, sizes: [0.4, 0.55, 0.35] },
    { at: 100, kind: 'fish', count: 4, arrange: 'line' },
    { at: 180, kind: 'fish', count: 6, arrange: 'spread', span: 50, x: 0.5 },
    { at: 300, kind: 'torpedo', x: 0.5, from: 'right', enterSpeed: 46 },
    { at: 360, kind: 'fish', count: 5, arrange: 'line' },
    // --- 猎食者登场。先给**海豚**：四个里它最小、最薄（3 点血）、食谱门槛最低，所以它教的是
    // "这一关的东西也可以很大、而且大的也能是食物"。先让玩家赢一次，再给他看赢不了的。 ---
    { at: 390, kind: 'dolphin', x: 0.78 },

    // --- 温跃层：上下同时来东西，逼玩家换高度。 ---
    { at: 480, kind: 'fish', count: 5, arrange: 'spread', span: 40, from: 'left', depth: 0.62 },
    { at: 520, kind: 'fish', count: 5, arrange: 'spread', span: 40, from: 'right', depth: 0.42 },
    { at: 580, kind: 'bombfish', count: 2, arrange: 'spread', span: 30, x: 0.5 },
    // 章鱼：从侧面**横着**进来（enterSpeed 比别的慢），因为它是四个里最懒的那个——前摇 0.9 秒、冷却 2.6 秒，
    // 它是"可以忽略一会儿"的猎食者，作用是让别的三个显得更快。
    { at: 610, kind: 'octopus', x: 0.3, from: 'left', enterSpeed: 34 },
    { at: 640, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.4, from: 'left', enterSpeed: 46 },
    { at: 700, kind: 'angler', count: 2, arrange: 'line' },
    { at: 760, kind: 'fish', count: 8, arrange: 'spread', span: 60, amplitude: 0.2, x: 0.5, from: 'bottom' },
    // **刺魨**：防御反击型——猎食者关里唯一'打它有代价'的东西，和冲锋的猎食者互为对照。
    { at: 790, kind: 'puffer', x: 0.6 },

    // --- 冷水层：猎食者密集，速度更快。 ---
    { at: 830, kind: 'crab', count: 3, arrange: 'line' },
    { at: 880, kind: 'torpedo', count: 3, arrange: 'spread', span: 50, x: 0.5, from: 'right', enterSpeed: 46 },
    // **招牌**：大白鲨。前摇只有 0.6 秒、冲刺 0.4 秒，是四个里最"已经决定了"的那个。
    // 放在这里而不是开场，是因为到这一步玩家已经见过鱼群、见过温跃层逼他换高度，知道"大"在这个游戏里是什么意思了。
    { at: 900, kind: 'shark', x: 0.55 },
    // **电鳗**：枪打不死的射手（0 血），只能躲或吞。冷水层入口放一条，和炸弹鱼错开——
    // 这一段已经有"躲快的、拆炸的"，再加"擦着闪电走"，三种风险手法在同一片水里。
    { at: 950, kind: 'eel', x: 0.3 },
    { at: 1000, kind: 'fish', count: 6, arrange: 'spread', span: 30, from: 'left', depth: 0.55 },
    { at: 1060, kind: 'bombfish', count: 3, arrange: 'spread', span: 40, x: 0.6 },
    { at: 1120, kind: 'angler', count: 3, arrange: 'spread', span: 40, x: 0.4 },
    // 第二条电鳗放在收尾段的对侧：座头鲸逼你横向走位时，另一边有一颗会放电的钉子。
    { at: 1160, kind: 'eel', x: 0.72 },
    // 座头鲸：一次只来一只。它是全场最慢（前摇 1.1 秒）也最厚（8 点血）的东西，
    // 放在收尾段是因为**慢的东西在一段快的东西后面才最吓人**——玩家刚躲完一串快攻，会明显感到屏幕被占住了。
    { at: 1080, kind: 'whale', x: 0.45 },
    { at: 1200, kind: 'fish', count: 10, arrange: 'line' },
    { at: 1260, kind: 'torpedo', count: 2, arrange: 'spread', span: 30, x: 0.7, from: 'bottom' },
    // 最后把海豚放回来两只：它现在是"已知的、吃得下的那种大东西"，用来让 BOSS 之前那口气不空。
    { at: 1290, kind: 'dolphin', count: 2, arrange: 'spread', span: 30, x: 0.5, from: 'right', enterSpeed: 40 },
  ],
}
`,Jl=`// =====================================================================================================
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
  // 风暴暗流：接近海面但正在暴风雨。明亮的铅灰蓝，闪电感。
  palette: {
    deep: 0x0a1420,
    shallow: 0x5f7f9f,
    bloom: 0xffffff,
    tint: 0x3a4a5f,
    tintStrength: 0.24
  },
  scrollLength: 1600,

  boss: {
    at: 1400,
    health: 280,
    name: '废网巨鲨',
    colour: 0x5a5f66
  },

  scrollSpeed: 36,
  playerLeadLimit: 130,
  landmarks: [
    { depth: 1250, label: '浪涌' },
    { depth: 800, label: '暴雨层' },
    { depth: 350, label: '废网' },
  ],
  spawns: [
    // --- 开场：渔网团和暗流一起摆，通道本身就是危险。 ---
    { at: 30, span: 200, count: 12, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.45, 0.6, 0.4] },
    { at: 110, kind: 'net', count: 4, arrange: 'line' },
    { at: 180, kind: 'fish', count: 5, arrange: 'spread', span: 40, x: 0.5, from: 'bottom' },
    { at: 300, kind: 'wall', count: 5, arrange: 'barrier', gapAt: 0.4, gapWidth: 0.19 },
    { at: 360, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'left', enterSpeed: 50 },

    // --- 暴雨层：从上往下穿透的冲击 + 高速穿刺的东西。 ---
    { at: 480, kind: 'mineral', count: 6, arrange: 'spread', span: 50, amplitude: 0.3, x: 0.5, from: 'bottom' },
    { at: 540, kind: 'shrimp', count: 3, arrange: 'spread', span: 40, x: 0.4, from: 'right', depth: 0.6 },
    { at: 600, kind: 'net', count: 5, arrange: 'barrier', gapAt: 0.55, gapWidth: 0.19 },
    { at: 660, kind: 'torpedo', count: 3, arrange: 'spread', span: 50, x: 0.6, from: 'right', enterSpeed: 50 },
    { at: 720, kind: 'crab', count: 3, arrange: 'line' },
    { at: 780, kind: 'fish', count: 8, arrange: 'spread', span: 60, amplitude: 0.24, x: 0.5, from: 'bottom' },
    // **手枪虾**：精英位——风暴关的混乱里一发电化弹，稀疏、快、重。只放一只。
    { at: 860, kind: 'pistol', x: 0.5 },

    // --- 废网区：网 + 木箱 + 钩（用珊瑚和木箱代替），路线被反复切断。 ---
    { at: 900, kind: 'coral', count: 5, arrange: 'barrier', gapAt: 0.35, gapWidth: 0.19 },
    { at: 960, kind: 'net', count: 4, arrange: 'line' },
    { at: 1020, kind: 'torpedo', count: 2, arrange: 'spread', span: 30, x: 0.3, from: 'left', enterSpeed: 50 },
    { at: 1080, kind: 'wall', count: 6, arrange: 'barrier', gapAt: 0.65, gapWidth: 0.18 },
    { at: 1150, kind: 'shrimp', count: 4, arrange: 'spread', span: 50, x: 0.5, from: 'left', depth: 0.5 },
    { at: 1220, kind: 'mineral', count: 8, arrange: 'spread', span: 60, amplitude: 0.28, x: 0.5, from: 'bottom' },
    { at: 1300, kind: 'crab', count: 4, arrange: 'line' },
    { at: 1360, kind: 'fish', count: 10, arrange: 'line' },
  ],
}
`,Yl=`// =====================================================================================================
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
  // 破晓海面：阳光穿透水层。暖金 + 浅青，是全场最亮的一关。
  palette: {
    deep: 0x10304a,
    shallow: 0x7fd0e8,
    bloom: 0xffe0a8,
    tint: 0xffb46b,
    tintStrength: 0.18
  },
  scrollLength: 1700,

  boss: {
    at: 1450,
    health: 320,
    name: '风暴之眼',
    colour: 0x8fb8d8
  },

  scrollSpeed: 34,
  playerLeadLimit: 130,
  landmarks: [
    { depth: 1350, label: '阳光层' },
    { depth: 900, label: '泡沫带' },
    { depth: 400, label: '浪峰' },
  ],
  spawns: [
    // --- 开场：光进来了，鱼群也多了。先给一段"看得清"的，泡沫随后才出现。 ---
    { at: 30, span: 200, count: 14, kind: 'bubble', arrange: 'spread', amplitude: 0.28, sizes: [0.45, 0.6, 0.4] },
    { at: 110, kind: 'fish', count: 5, arrange: 'line' },
    { at: 180, kind: 'fish', count: 6, arrange: 'spread', span: 50, x: 0.5, from: 'bottom' },

    // --- 泡沫带：视线开始不可信。泡沫和真泡泡一起漂，玩家要看清哪个是自己。 ---
    { at: 300, kind: 'foam', count: 5, arrange: 'spread', span: 40, x: 0.5 },
    { at: 340, kind: 'bubble', count: 6, arrange: 'spread', span: 30, x: 0.5, sizes: [0.5] },
    { at: 400, kind: 'foam', count: 8, arrange: 'line' },
    { at: 460, kind: 'torpedo', count: 2, arrange: 'spread', span: 40, x: 0.5, from: 'right', enterSpeed: 48 },

    // --- 雨滴冲击：从上面砸下来，把接近海面的气泡压回去。 ---
    { at: 580, span: 70, count: 6, kind: 'rain', arrange: 'spread', amplitude: 0.3, x: 0.5 },
    { at: 640, kind: 'foam', count: 6, arrange: 'spread', span: 40, x: 0.5 },
    { at: 700, kind: 'fish', count: 8, arrange: 'spread', span: 60, amplitude: 0.22, x: 0.5, from: 'bottom' },
    { at: 760, kind: 'rain', count: 8, arrange: 'line' },
    // **手枪虾**：破晓海面的精英——雨幕挡视线时一发大弹，是这一关最贵的失误。只放一只。
    { at: 820, kind: 'pistol', x: 0.35 },

    // --- 浪峰：泡沫 + 雨 + 追兵混在一起，能见度最低的一段。 ---
    { at: 880, kind: 'foam', count: 10, arrange: 'spread', span: 70, x: 0.5 },
    { at: 940, kind: 'rain', count: 10, arrange: 'spread', span: 40, amplitude: 0.3, x: 0.5 },
    { at: 1000, kind: 'angler', count: 2, arrange: 'line' },
    { at: 1060, kind: 'torpedo', count: 3, arrange: 'spread', span: 50, x: 0.5, from: 'left', enterSpeed: 48 },
    { at: 1120, kind: 'foam', count: 8, arrange: 'spread', span: 50, x: 0.4 },
    { at: 1180, kind: 'rain', count: 12, arrange: 'spread', span: 60, amplitude: 0.28, x: 0.5 },

    // --- 终段：最后一次补给，然后进风暴之眼。 ---
    { at: 1250, span: 70, count: 8, kind: 'bubble', arrange: 'spread', amplitude: 0.26, sizes: [0.55, 0.7] },
    { at: 1320, kind: 'foam', count: 10, arrange: 'line' },
    { at: 1380, kind: 'fish', count: 10, arrange: 'spread', span: 60, x: 0.5, from: 'bottom' },
  ],
}
`,Xl=`// =====================================================================================================
// 关卡配置（手工编辑）
// =====================================================================================================
//
// 这个文件是**关卡的唯一来源**：一个关卡 = 一段水域 + 一张刷怪表。改这里就能改关卡，不需要动代码。
// 加载时会逐项校验，任何一项写错都会**指名报错**（哪一个关卡、第几块、哪一项），而不是安静地不生效。
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
//                 技能泡   skill
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
//   ---- 从屏幕的哪一边进来（这一轮新加的） ----
//
//   from        top（默认）/ left / right / bottom。
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
//               往下方进场时，这个速度要盖过水流速度（scrollSpeed）才看得见它上来，默认值已经够用。
//
//   depth       只对 left / right 有意义，见上。默认取 spawning.entryDepth。
//
// -----------------------------------------------------------------------------------------------------
// 举几个例子
// -----------------------------------------------------------------------------------------------------
//
//   一小队鱼从左边游进来，分散在 20 米里，进场后各自停在 arrange 给的位置：
//     { at: 420, kind: 'fish', count: 3, arrange: 'spread', span: 20, from: 'left', depth: 0.7 }
//
//   一个从下面追上来的电鳗（eel 会夺走操作，从背后出现最有威胁）：
//     { at: 900, kind: 'eel', x: 0.4, from: 'bottom', enterSpeed: 55 }
//
//   一个被水冲进来的木箱，停在泳道 0.3 处：
//     { at: 700, kind: 'crate', x: 0.3, from: 'left', enterSpeed: 30 }
//
// =====================================================================================================

{
  // 开哪一关。改这里换关卡；关卡本身在下面的 levels 里。
  start: 'black-smokers',

  levels: [  ],
}
`;function Zl(e){return Yc.includes(e)}function Ql(e){return W.obstacles.health[e]??1}function $l(e){return W.obstacles.radius[e]??.05}function eu(e,t){let n=ru(t);return n===null||e<n?0:(e-n)*W.obstacles.ramDamagePerVolume}var tu={crate:`木箱`,coral:`珊瑚`,wall:`封路木箱`,net:`渔网`,tube:`管虫群`};function nu(e){return tu[e]??e}function ru(e){let t=W.obstacles.ramVolume[e];return t===void 0?W.obstacles.ramVolumeThreshold:t}function iu(e,t){return au(e)?t:0}function au(e){return e===`net`}function ou(e){return!au(e)}function su(e){if(!e.length)return!0;let t=W.obstacles.minGapFraction,n=[...e].sort((e,t)=>e.x-t.x);if(n[0].x-n[0].radius>t)return!0;let r=n[n.length-1];if(1-(r.x+r.radius)>t)return!0;for(let e=1;e<n.length;e++){let r=n[e-1],i=n[e];if(i.x-i.radius-(r.x+r.radius)>t)return!0}return!1}var cu=class{constructor(){K(this,`obstacles`,[]),K(this,`broken`,0),K(this,`nextId`,1)}reset(){this.obstacles=[],this.broken=0}spawn(e,t,n,r){let i=Ql(e),a={id:this.nextId++,kind:e,x:t,y:n,radiusFraction:$l(e),health:i,healthFraction:1,age:0,hitFlash:0,entry:r??null};return this.obstacles.push(a),a}damage(e,t){let n=this.obstacles.find(t=>t.id===e);return n?(n.health-=t,n.hitFlash=W.hitFlash.seconds,n.healthFraction=Math.max(0,n.health/Math.max(1e-4,Ql(n.kind))),n.health>0?{id:e,kind:n.kind,broke:!1}:(this.obstacles=this.obstacles.filter(t=>t.id!==e),this.broken++,{id:e,kind:n.kind,broke:!0})):null}update(e,t,n){for(let t of this.obstacles)if(t.age+=e,t.hitFlash>0&&(t.hitFlash=Math.max(0,t.hitFlash-e)),t.entry){let n=t.entry.speed*e,r=t.entry.targetX-t.x;Math.abs(r)<=n?(t.x=t.entry.targetX,t.entry=null):t.x+=Math.sign(r)*n}this.obstacles=this.obstacles.filter(e=>e.y>t-120&&e.y<n+160)}blocks(e,t,n){for(let r of this.obstacles){let i=n+(W.obstacles.radius[r.kind]??.05),a=r.x-e,o=r.y-t;if(a*a+o*o<=i*i)return!0}return!1}resolvePlayer(e,t,n,r,i,a,o){for(let s of this.obstacles){let c=n+(W.obstacles.radius[s.kind]??.05),l=s.x-e,u=s.y-t;if(l*l+u*u>c*c)continue;if(o){if(ru(s.kind)===null&&!o.breaksUnrammable)continue;return{hit:this.damage(s.id,o.damage),blocked:!1,hurt:!1,dragging:!1}}let d=iu(s.kind,a);if(d>0){let e=this.damage(s.id,d);return{hit:e,blocked:!1,hurt:!1,dragging:e?.broke!==!0}}let f=eu(r,s.kind);return f>0?{hit:this.damage(s.id,f),blocked:!1,hurt:!1,dragging:!1}:{hit:null,blocked:!i,hurt:!i&&ou(s.kind),dragging:!1}}return{hit:null,blocked:!1,hurt:!1,dragging:!1}}get count(){return this.obstacles.length}},lu=new Map,uu=new Map,du=0,fu=2,pu=2.399963;function mu(){if(lu.size!==0)for(let[e,t]of lu)du-(uu.get(e)??0)>fu&&(t.destroy(),lu.delete(e),uu.delete(e))}function hu(e,t,n){du+=1,mu();for(let r of t.obstacles){let t=n*r.radiusFraction,i=1-r.healthFraction,a=1-i*W.obstacles.damagedDarken,o=W.obstacles.art[r.kind],s=o?o.variants[(r.id%o.variants.length+o.variants.length)%o.variants.length]:void 0,c=s?Fl(s.image):null;if(o&&s&&c){let n=lu.get(r.id);if(!n){n=new M(c),n.eventMode=`none`,n.anchor.set(.5,1);let t=e.parent;t&&t.addChildAt(n,Math.max(0,t.getChildIndex(e))),lu.set(r.id,n)}uu.set(r.id,du);let i=t*2*s.scale/c.width;n.texture=c,n.visible=!0,n.x=r.x,n.y=r.y,n.alpha=o.alpha,n.tint=gu(16777215,a),n.scale.set(i,-i),n.rotation=o.swayDegrees===0?0:o.swayDegrees*Math.PI/180*Math.sin(r.age/o.swaySeconds*Math.PI*2+r.id*pu)}else if(r.kind===`crate`){let n=gu(W.obstacles.crateColor,a),i=gu(W.obstacles.crateRimColor,a);e.rect(r.x-t,r.y-t,t*2,t*2).fill({color:n,alpha:.9}),e.rect(r.x-t,r.y-t,t*2,t*2).stroke({color:i,alpha:.95,width:t*.16}),e.moveTo(r.x-t,r.y).lineTo(r.x+t,r.y),e.moveTo(r.x,r.y-t).lineTo(r.x,r.y+t),e.stroke({color:i,alpha:.6,width:t*.1})}else if(r.kind===`wall`){let n=gu(W.obstacles.wallColor,a),i=gu(W.obstacles.wallRimColor,a),o=t*2/3;for(let n=0;n<3;n++)e.rect(r.x-t,r.y-t+n*o,t*2,o);e.fill({color:n,alpha:.92});for(let n=1;n<3;n++)e.moveTo(r.x-t,r.y-t+n*o).lineTo(r.x+t,r.y-t+n*o);e.stroke({color:i,alpha:.8,width:t*.1}),e.rect(r.x-t,r.y-t,t*2,t*2).stroke({color:i,alpha:.95,width:t*.16})}else if(r.kind===`net`){let n=W.obstacles.netColor,o=gu(W.obstacles.netRimColor,a),s=W.obstacles.netMesh,c=Math.min(1,i*1.6),l=t*.9*c;e.rect(r.x-t,r.y-t,t*2,t*2).fill({color:o,alpha:.22});for(let n=0;n<s;n++){let i=n/(s-1)*2-1,a=Math.abs(i*t),o=l>0&&a<l?Math.sqrt(l*l-a*a):0;for(let n of[-1,1])e.moveTo(r.x+i*t,r.y+n*t),e.lineTo(r.x+i*t,r.y+n*o),e.moveTo(r.x+n*t,r.y+i*t),e.lineTo(r.x+n*o,r.y+i*t)}e.stroke({color:n,alpha:.85,width:t*.09}),e.rect(r.x-t,r.y-t,t*2,t*2).stroke({color:o,alpha:.75,width:t*.11})}else if(r.kind===`tube`){let n=gu(W.obstacles.tubeColor,a),i=gu(W.obstacles.tubeRimColor,a),o=.55+.45*Math.sin(r.age*1.6+r.id);e.roundRect(r.x-t*.9,r.y-t*.5,t*1.8,t*1,t*.3).fill({color:2760744,alpha:.9});for(let a=0;a<4;a++){let s=r.x-t*.6+a/3*t*1.2,c=Math.sin(r.age*1.2+a+r.id)*t*.12;e.moveTo(s,r.y+t*.4).lineTo(s+c,r.y+t*.5+t*1.1*o).stroke({color:n,alpha:.95,width:t*.22}),e.circle(s+c,r.y+t*.5+t*1.1*o,t*.2).fill({color:i,alpha:.95})}}else{let n=gu(W.obstacles.coralColor,a),i=gu(W.obstacles.coralRimColor,a);e.circle(r.x,r.y,t).fill({color:n,alpha:.85}),e.circle(r.x,r.y,t).stroke({color:i,alpha:.95,width:t*.16});for(let n=0;n<5;n++){let i=n/5*Math.PI*2+r.age*.2;e.moveTo(r.x+Math.cos(i)*t*.5,r.y+Math.sin(i)*t*.5),e.lineTo(r.x+Math.cos(i)*t*1.35,r.y+Math.sin(i)*t*1.35)}e.stroke({color:i,alpha:.7,width:t*.12})}if(i>.05){for(let n=0;n<4;n++){let a=n/4*Math.PI*2+r.id,o=t*(.55+.4*i);e.moveTo(r.x+Math.cos(a)*t*.25,r.y+Math.sin(a)*t*.25),e.lineTo(r.x+Math.cos(a)*o,r.y+Math.sin(a)*o)}e.stroke({color:1054752,alpha:.5*i,width:t*W.obstacles.crackWidthRatio})}}for(let r of t.obstacles){if(r.hitFlash<=0)continue;let t=W.hitFlash,i=Math.min(1,r.hitFlash/Math.max(.001,t.seconds)),a=n*r.radiusFraction*t.radiusScale;e.ellipse(r.x,r.y,a,a*.9).fill({color:t.colour,alpha:t.alpha*i})}}function gu(e,t){let n=Math.max(0,Math.min(255,Math.round((e>>16&255)*t))),r=Math.max(0,Math.min(255,Math.round((e>>8&255)*t))),i=Math.max(0,Math.min(255,Math.round((e&255)*t)));return n<<16|r<<8|i}var _u=Object.assign({"../config/levels/01-black-smokers.json5":Wl,"../config/levels/02-wreck-gorge.json5":Gl,"../config/levels/03-jelly-forest.json5":Kl,"../config/levels/04-thermocline.json5":ql,"../config/levels/05-storm-surge.json5":Jl,"../config/levels/06-dawn-surface.json5":Yl}),vu=Object.assign({"../config/levels.json5":Xl});function yu(){let e=[];for(let[t,n]of Object.entries(_u).sort(([e],[t])=>e<t?-1:+(e>t)))e.push([t.replace(`../config/`,``),bu(t,n)]);for(let[t,n]of Object.entries(vu))e.push([t.replace(`../config/`,``),bu(t,n)]);return e}function bu(e,t){try{return Lc.default.parse(t)}catch(t){q(e.replace(`../config/`,``),`is not valid JSON5 (${t.message}).`)}}var xu={one:(e,t,n,r)=>r===void 0?{at:e,x:n,kind:t}:{at:e,x:n,kind:t,size:r},spread:(e,t,n,r,i,a)=>{let o=[];for(let s=0;s<n;s++){let c={at:e+(n<=1?0:s/(n-1))*t,x:i(s),kind:r};a&&(c.size=a(s)),o.push(c)}return o},line:(e,t,n,r=.12,i=.88)=>{let a=[];for(let o=0;o<n;o++){let s=n<=1?.5:o/(n-1);a.push({at:e,x:r+s*(i-r),kind:t})}return a},column:(e,t,n,r,i)=>{let a=[];for(let o=0;o<n;o++)a.push({at:e+(n<=1?0:o/(n-1)*t),x:i,kind:r});return a},barrier:(e,t,n,r=.5,i=.24)=>{let a=(W.obstacles.radius[t]??.05)*2+W.obstacles.minGapFraction,o=Math.max(i,a)/2,s=r-o,c=r+o,l=[];for(let r=0;r<n;r++){let i=.1+(n<=1?.5:r/(n-1))*.8;i>s-1e-6&&i<c+1e-6||l.push({at:e,x:i,kind:t})}return l}},Su=(e,t=.5,n=6)=>r=>t+Math.sin(r/n*Math.PI*2)*e,Cu=e=>t=>e[t%e.length],wu=[`bubble`,...Object.keys(W.hazards.health).filter(e=>e!==`boss`),...Yc],Tu=[`single`,`line`,`column`,`spread`,`barrier`],Eu=e=>Yc.includes(e),Du=[`top`,`left`,`right`,`bottom`],Ou=.5,ku=[`path`,`pathSpacingSeconds`,`at`,`kind`,`count`,`arrange`,`x`,`xFrom`,`xTo`,`span`,`amplitude`,`wavelength`,`gapAt`,`gapWidth`,`sizes`,`from`,`enterSpeed`,`depth`],Au=[`id`,`name`,`scrollLength`,`scrollSpeed`,`playerLeadLimit`,`landmarks`,`boss`,`palette`,`paths`,`backdrop`,`backdrops`,`spawns`];function q(e,t){throw Error(`the level files are invalid: ${e} ${t}\nThe file is JSON5, so it allows // comments, trailing commas, unquoted keys and hex literals.`)}function J(e,t,n,r,i,a){let o=e[t];return o===void 0?r:((typeof o!=`number`||!Number.isFinite(o)||o<i||o>a)&&q(n,`"${t}" is ${JSON.stringify(o)}, but it should be a number between ${i} and ${a}.`),o)}function ju(e,t,n,r,i){return e[t]===void 0&&q(n,`"${t}" is required.`),J(e,t,n,NaN,r,i)}function Mu(e,t,n,r,i){let a=e[t];return a===void 0?(r===null&&q(n,`"${t}" is required; it should be one of ${i.join(` / `)}.`),r):((typeof a!=`string`||!i.includes(a))&&q(n,`"${t}" is ${JSON.stringify(a)}, but it should be one of ${i.join(` / `)}.`),a)}function Nu(e,t,n){let r=`levels["${t}"].spawns[${n}]`;(typeof e!=`object`||!e||Array.isArray(e))&&q(r,`must be an object.`);let i=e,a=Object.keys(i).filter(e=>!ku.includes(e));a.length&&q(r,`has keys that do nothing here: ${a.join(`, `)}. Known keys: ${ku.join(`, `)}.`);let o=ju(i,`at`,r,0,2**53-1),s=Mu(i,`kind`,r,null,wu),c=Math.round(J(i,`count`,r,1,1,200)),l=Mu(i,`arrange`,r,c<=1?`single`:`line`,Tu),u=Mu(i,`from`,r,`top`,Du),d=i.sizes,f=null;return d!==void 0&&((!Array.isArray(d)||!d.length||!d.every(e=>typeof e==`number`&&e>0))&&q(r,`"sizes" is ${JSON.stringify(d)}, but it should be a non-empty list of positive numbers.`),f=d),u!==`top`&&s===`bubble`&&q(r,`is a "${s}" arriving from the ${u}, but collectables come down with the current. Only creatures and obstacles can enter from a side.`),u===`bottom`&&Eu(s)&&q(r,`is a "${s}" arriving from the bottom, but scenery cannot swim up -- the current only carries things down.`),l===`barrier`&&!Eu(s)&&q(r,`arranges a "${s}" as a barrier, but only obstacles can be arranged into a row with a gap.`),{at:o,kind:s,count:c,arrange:l,x:J(i,`x`,r,.5,0,1),xFrom:J(i,`xFrom`,r,.12,0,1),xTo:J(i,`xTo`,r,.88,0,1),span:J(i,`span`,r,0,0,1e5),amplitude:J(i,`amplitude`,r,0,0,.5),wavelength:J(i,`wavelength`,r,6,.5,100),gapAt:J(i,`gapAt`,r,.5,0,1),gapWidth:J(i,`gapWidth`,r,.24,0,1),sizes:f,from:u,enterSpeed:J(i,`enterSpeed`,r,W.spawning.enterSpeedMps,1,500),depth:J(i,`depth`,r,W.spawning.entryDepth,0,1),...typeof i.path==`string`?{path:i.path}:{},pathSpacingSeconds:J(i,`pathSpacingSeconds`,r,Ou,.02,10)}}function Pu(e){let t=new Map,n=0;return e.forEach((e,r)=>t.set(e,e.kind===`fish`?n++:r)),t}function Fu(e,t=0){let n=e.from===`top`?{}:{from:e.from,enterSpeed:e.enterSpeed,depth:e.depth},r=e=>e.map(e=>({...e,...n,variety:t}));if(e.path){let t=Math.max(1,e.count),n=e.pathSpacingSeconds??Ou;return r(Array.from({length:t},(t,r)=>({...xu.one(e.at,e.kind,e.x,e.sizes?.[r%Math.max(1,e.sizes?.length??1)]),path:e.path,pathDelaySeconds:r*n})))}switch(e.arrange){case`single`:return r([xu.one(e.at,e.kind,e.x,e.sizes?.[0])]);case`line`:return r(xu.line(e.at,e.kind,e.count,e.xFrom,e.xTo));case`column`:return r(xu.column(e.at,e.span,e.count,e.kind,e.x));case`spread`:return r(xu.spread(e.at,e.span,e.count,e.kind,Su(e.amplitude,e.x,e.wavelength),e.sizes?Cu(e.sizes):void 0));case`barrier`:return r(xu.barrier(e.at,e.kind,e.count,e.gapAt,e.gapWidth))}}function Iu(e,t,n,r){let i=e[t];if(i===void 0)return r;let a=typeof i==`string`?Number.parseInt(i.replace(`#`,``),16):i;return(typeof a!=`number`||!Number.isFinite(a)||a<0||a>16777215)&&q(n+`.`+t,`should be a colour: 0xrrggbb or a "#rrggbb" string.`),a}function Lu(e,t){let n=Mu(e,`id`,t,null,[String(e.id)]),r=typeof e.name==`string`?e.name:n,i=Object.keys(e).filter(e=>!Au.includes(e));i.length&&q(`${t} (level "${n}")`,`has keys that do nothing here: ${i.join(`, `)}. Known keys: ${Au.join(`, `)}.`);let a=e.spawns;(!Array.isArray(a)||!a.length)&&q(`${t} (level "${n}")`,`"spawns" must be a non-empty list.`);let o=a.map((e,t)=>Nu(e,n,t)),s=Pu(o),c=o.flatMap(e=>Fu(e,s.get(e))).sort((e,t)=>e.at-t.at),l=Array.isArray(e.landmarks)?e.landmarks:void 0,u=ju(e,`scrollLength`,`${t} (level "${n}")`,1,1e6),d=e.palette,f=d&&typeof d==`object`&&!Array.isArray(d)?d:{},p={waterAlpha:J(f,`waterAlpha`,`${t}.palette`,1,0,1),deep:Iu(f,`deep`,`${t}.palette`,132880),shallow:Iu(f,`shallow`,`${t}.palette`,3051460),bloom:Iu(f,`bloom`,`${t}.palette`,12579071),tint:Iu(f,`tint`,`${t}.palette`,16777215),tintStrength:J(f,`tintStrength`,`${t}.palette`,0,0,1)},m=e.backdrop??e.backdrops,h=Array.isArray(m)?m:m===void 0?[]:[m],g=h.length===0?void 0:h.map((e,n)=>{let r=e&&typeof e==`object`&&!Array.isArray(e)?e:{},i=`${t}.backdrops[${n}]`;return typeof r.image!=`string`&&q(i+`.image`,`must be the file name of a picture.`),{image:r.image,speedFactor:J(r,`speedFactor`,i,.03,0,1),heightScreens:J(r,`heightScreens`,i,1.15,.2,6),alpha:J(r,`alpha`,i,.55,0,1),tint:Iu(r,`tint`,i,16777215)}}),_;if(e.paths!==void 0){let n=e.paths;(typeof n!=`object`||!n||Array.isArray(n))&&q(`${t}.paths`,`must be an object of path name to path.`),_={};for(let[e,r]of Object.entries(n)){let n=r&&typeof r==`object`&&!Array.isArray(r)?r:{},i=n.points;(!Array.isArray(i)||i.length<2)&&q(`${t}.paths.${e}.points`,`must be a list of at least two points, or there is no spline to follow.`);let a=i.map((n,r)=>{let i=n&&typeof n==`object`&&!Array.isArray(n)?n:{};return{x:ju(i,`x`,`${t}.paths.${e}.points[${r}]`,-20,20),y:ju(i,`y`,`${t}.paths.${e}.points[${r}]`,-8,8)}});_[e]={points:a,seconds:ju(n,`seconds`,`${t}.paths.${e}`,.1,600)}}}let v=e.boss;(typeof v!=`object`||!v||Array.isArray(v))&&q(`${t}.boss`,`is missing. Every level ends when its boss is defeated, so a level must name one.`);let y=v,b=ju(y,`at`,`${t}.boss`,0,1e6);b>=u&&q(`${t}.boss.at`,`is ${b}, but the level is only ${u} long and the scroll stops there -- the boss would never arrive and the level could never end. Put it below ${u}.`);let x={at:b,health:ju(y,`health`,`${t}.boss`,1,1e5),name:typeof y.name==`string`?y.name:`BOSS`,...y.colour===void 0?{}:{colour:ju(y,`colour`,`${t}.boss`,0,16777215)}};return{id:n,name:r,scrollLength:u,scrollSpeed:ju(e,`scrollSpeed`,`${t} (level "${n}")`,.001,1e4),...e.playerLeadLimit===void 0?{}:{playerLeadLimit:J(e,`playerLeadLimit`,`${t} (level "${n}")`,0,0,1e4)},...l?{landmarks:l}:{},boss:x,palette:p,..._?{paths:_}:{},...g?{backdrops:g}:{},entries:c,blocks:o}}function Ru(e){let t=[],n=[];for(let[r,i]of e){(typeof i!=`object`||!i||Array.isArray(i))&&q(r,`must be an object. A level file holds one level, or a list of them under "levels".`);let e=i,a=typeof e.id==`string`||Array.isArray(e.spawns)||e.scrollLength!==void 0,o=e.levels,s;if(a)s=[e];else if(Array.isArray(o)&&o.length>0)s=o.map((e,t)=>((typeof e!=`object`||!e||Array.isArray(e))&&q(`${r} levels[${t}]`,`must be an object.`),e));else if(Array.isArray(o))continue;else q(r,`is not a level file: it has no "id" (one level), and no non-empty "levels" list.`);let c=[];for(let[e,n]of s.entries()){let i=Lu(n,s.length===1?r:`${r} levels[${e}]`);c.push(i.id),t.push(i)}n.push({file:r,start:e.start,ids:c})}t.length===0&&q(`the level files`,`are all empty: there is nothing to play.`);let r=t.map(e=>e.id).filter((e,t,n)=>n.indexOf(e)!==t);r.length&&q(`the level files`,`each define a level called "${r[0]}". Ids must be unique across the files.`);let i=n.map(e=>e.start).find(e=>typeof e==`string`)??t[0].id;return t.some(e=>e.id===i)||q(`"start"`,`names "${i}", but there is no level with that id. Levels: ${t.map(e=>e.id).join(`, `)}.`),{start:i,levels:t}}var zu=Ru(yu()),Bu=zu.levels,Vu=zu.start??Bu[0].id,Y=Bu.find(e=>e.id===Vu)??Bu[0];function Hu(e){return Bu.findIndex(t=>t.id===e)}function Uu(e){let t=Bu.find(t=>t.id===e);return t?(Y=t,Wu=t.entries,Gu=null,!0):!1}var Wu=Y.entries,Gu=null;function Ku(){return Gu??Y.blocks}function qu(e){let t=e.map((e,t)=>Nu(e,Y.id,t)),n=Pu(t),r=t.flatMap(e=>Fu(e,n.get(e))).sort((e,t)=>e.at-t.at);return Xu({...Y,entries:r,blocks:t}),Wu=r,Gu=t,r.length}function Ju(e){return e.scrollLength/e.scrollSpeed}function Yu(e,t=12){let n=190/e.scrollSpeed,r=Math.min(t,Math.max(1,Math.round(e.scrollLength/190)));return Array.from({length:r},()=>n)}function Xu(e){let t=[];e.scrollLength>0||t.push(`scrollLength must be positive`),e.scrollSpeed>0||t.push(`scrollSpeed must be positive`);let n=e.scrollLength/e.scrollSpeed;n<10&&t.push(`only ${n.toFixed(1)}s of scroll; too short to be a level`),n>400&&t.push(`${n.toFixed(0)}s of scroll; too long for one level`),e.entries.length||t.push(`no entries; the level would be empty`);let r=e.entries.filter(t=>t.at<0||t.at>e.scrollLength);r.length&&t.push(`${r.length} entries outside the level's length`);let i=e.entries.filter(e=>e.x<0||e.x>1);i.length&&t.push(`${i.length} entries outside the play area`);let a=W.obstacles.minGapFraction,o=new Map;for(let t of e.entries){if(t.kind!==`crate`&&t.kind!==`coral`)continue;let e=W.obstacles.radius[t.kind]??.05,n=o.get(t.at)??[];n.push({x:t.x,radius:e}),o.set(t.at,n)}for(let[e,n]of o)su(n)||t.push(`obstacle row at ${e}m leaves no gap of ${a} or more; it would seal the lane and make being small mandatory`);if(t.length)throw Error(`Level "${e.id}" is unusable: ${t.join(`; `)}`)}for(let e of Bu)Xu(e);function Zu(e,t,n=900){let r=Math.min(e,n),i=r/361;return{scale:i,left:(e-r)/2,cy:t/2,width:e,height:t,laneWidthPx:r,laneWidthMeters:361,visibleDepthMeters:t/i}}function Qu(e,t){let n=Math.min(e/al.width,t/al.height);return Math.min(1.5,Math.max(.55,n))}var $u=`1.1.80`,ed=`ccb5b3b`;function td(){return`v${$u} · ${ed}`}var nd=class{constructor(){K(this,`y`,0),K(this,`viewport`,Zu(al.width,al.height))}setScroll(e){this.y=e}toScreenX(e){return this.viewport.left+e*this.viewport.scale}toScreenY(e){return this.viewport.cy-(e-this.y)*this.viewport.scale}toWorldY(e){return this.y+(this.viewport.cy-e)/this.viewport.scale}visibleWorldRange(e=12){let t=this.viewport.height/2/this.viewport.scale;return{min:this.y-t-e,max:this.y+t+e}}applyTo(e){let t=this.viewport.scale;e.updateTransform({x:this.toScreenX(0),y:this.toScreenY(0),scaleX:t,scaleY:-t})}};function X(e,t,n,r=`bold`,i=W.text.fontFamily){let a=new Ui({text:e,style:{fontFamily:i,fontSize:n,fill:t,fontWeight:r,letterSpacing:.5}});return a.resolution=2,a}var rd=.008,id=class{get backdropLoaded(){return this.backdrops.length>0&&this.backdrops.every(e=>e.isLoaded)}get backdropError(){return this.backdrops.map(e=>e.error).filter(Boolean).join(` | `)}constructor(){K(this,`root`,new j),K(this,`world`,new j),K(this,`gradient`,new z),K(this,`margins`,new z),K(this,`snow`,new z),K(this,`parallax`,new Ul),K(this,`backdrops`,[]),K(this,`backdropKey`,``),K(this,`lastCanvasWidth`,0),K(this,`lastCanvasHeight`,0),K(this,`lastLaneWidthMeters`,0),K(this,`maskShape`,new z),K(this,`snowPoints`,[]),K(this,`lastTopColour`,-1),K(this,`lastBottomColour`,-1),K(this,`lastGradientWidth`,-1),K(this,`lastGradientHeight`,-1),K(this,`lastWaterAlpha`,-1),this.snow.eventMode=`none`,this.gradient.eventMode=`none`,this.margins.eventMode=`none`,this.world.addChild(this.snow),this.world.addChild(this.parallax.root),this.world.mask=this.maskShape,this.root.addChild(this.gradient,this.margins,this.world)}seedSnow(e,t){let n=e*rd;this.snowPoints=[];for(let r=0;r<90;r++)this.snowPoints.push({x:n+Math.random()*(e-n),y:Math.random()*t.scrollLength,r:e*(6e-4+Math.random()*.0019),driftX:(Math.random()-.5)*e*7e-4,driftY:-(.05+Math.random()*.15)*(e/120)})}layout(e,t){this.parallax.layout(e.laneWidthMeters,e.visibleDepthMeters),this.lastCanvasWidth=e.width,this.lastCanvasHeight=e.height,this.lastLaneWidthMeters=e.laneWidthMeters;for(let t of this.backdrops)t.layout(e.width,e.height,e.laneWidthMeters);this.lastTopColour=-1,this.lastBottomColour=-1,this.lastGradientWidth=-1,this.lastGradientHeight=-1;let n=e.left,r=e.laneWidthPx;this.maskShape.clear(),this.maskShape.rect(n,-1e3,r,e.height+2e3).fill(16777215),this.seedSnow(e.laneWidthMeters,t)}drawBackdrop(e,t,n){let r=n.backdrops??[],i=r.map(e=>e.image).join(`|`);if(i!==this.backdropKey){for(let e of this.backdrops)e.root.destroy({children:!0});this.backdrops=[],this.backdropKey=i;for(let e of r){let t=new Hl(e);t.layout(this.lastCanvasWidth,this.lastCanvasHeight,this.lastLaneWidthMeters),this.root.addChildAt(t.root,0),this.backdrops.push(t)}}for(let n of this.backdrops)n.draw(e,t)}update(e,t,n,r,i){let a=e.viewport,{min:o,max:s}=e.visibleWorldRange(20);e.applyTo(this.world);let c=a.height/2/a.scale,l=i.scrollLength-r,u=cd(e.y+c,l,i),d=cd(e.y-c,l,i),f=a.width!==this.lastGradientWidth||a.height!==this.lastGradientHeight;if(u!==this.lastTopColour||d!==this.lastBottomColour||f||i.palette.waterAlpha!==this.lastWaterAlpha){this.lastWaterAlpha=i.palette.waterAlpha,this.lastTopColour=u,this.lastBottomColour=d,this.lastGradientWidth=a.width,this.lastGradientHeight=a.height;let e=new Fe({start:{x:0,y:0},end:{x:0,y:1},colorStops:[{offset:0,color:ad(u)},{offset:1,color:ad(d)}],textureSpace:`local`});this.gradient.clear(),this.gradient.rect(0,0,a.width,a.height).fill({fill:e,alpha:i.palette.waterAlpha})}this.margins.clear();let p=a.left;if(p>1){let e=a.left+a.laneWidthPx;sd(this.margins,0,p,a.height,!1),sd(this.margins,e,a.width-e,a.height,!0)}this.drawBackdrop(r,e.viewport.scale,i),this.parallax.draw(r,o,s),this.snow.clear();for(let e of this.snowPoints)e.x+=e.driftX*n,e.y+=e.driftY*n,e.y<o&&(e.y=s,e.x=a.laneWidthMeters*rd+Math.random()*(a.laneWidthMeters*.992)),this.snow.circle(e.x,e.y,e.r);this.snow.fill({color:14677759,alpha:.26})}};function ad(e){return`#${e.toString(16).padStart(6,`0`)}`}function od(e,t,n){return cd(e,t,n)}function sd(e,t,n,r,i){if(n<=.5)return;let a=new Fe({start:{x:+!!i,y:0},end:{x:+!i,y:0},colorStops:[{offset:0,color:`rgba(1,6,15,0.85)`},{offset:1,color:`rgba(1,6,15,0)`}],textureSpace:`local`});e.rect(t,0,n,r).fill({fill:a,alpha:1})}function cd(e,t,n){let r=n.palette,i={r:r.deep>>16&255,g:r.deep>>8&255,b:r.deep&255},a={r:r.shallow>>16&255,g:r.shallow>>8&255,b:r.shallow&255},o=Math.min(Math.max(e/Math.max(1,n.scrollLength),0),1)**1.15,s=i.r+(a.r-i.r)*o,c=i.g+(a.g-i.g)*o,l=i.b+(a.b-i.b)*o,u=Math.max(0,Math.min(1,1-t/55)),d=r.bloom>>16&255,f=r.bloom>>8&255,p=r.bloom&255;if(s+=(d-s)*u*.3,c+=(f-c)*u*.3,l+=(p-l)*u*.3,r.tintStrength>0){let e=r.tint>>16&255,t=r.tint>>8&255,n=r.tint&255;s+=(e-s)*r.tintStrength,c+=(t-c)*r.tintStrength,l+=(n-l)*r.tintStrength}let m=e=>Math.max(0,Math.min(255,Math.round(e)));return m(s)<<16|m(c)<<8|m(l)}var ld=class{constructor(){K(this,`root`,new j),K(this,`subline`,void 0),K(this,`resourceLabel`,void 0),K(this,`resourceGauge`,new z),K(this,`mutationLabel`,void 0),K(this,`mutationGauge`,new z),K(this,`debug`,void 0),K(this,`scoreLabel`,void 0),K(this,`bossName`,void 0),K(this,`bossBar`,new z),K(this,`progressGauge`,new z),K(this,`progressLabel`,void 0),K(this,`progressChart`,null),K(this,`shownBossFraction`,-1),K(this,`shownScore`,-1),K(this,`hudScale`,1),K(this,`canvasWidth`,0),K(this,`laneWidthPx`,0),K(this,`laneCentreX`,0),K(this,`debugTimer`,0),K(this,`levelDepthMeters`,0),K(this,`seedLabel`,``),K(this,`talentLabel`,``),K(this,`skillLabel`,``),this.subline=X(``,8373480,11),this.subline.anchor.set(.5,0),this.resourceLabel=X(``,8373480,11),this.resourceLabel.anchor.set(.5,0),this.resourceLabel.visible=!1,this.mutationLabel=X(``,W.mutation.gauge.labelColour,W.mutation.gauge.labelSize),this.mutationLabel.anchor.set(.5,0),this.mutationLabel.visible=!1,this.debug=X(``,8373480,11,`normal`,W.text.monoFontFamily),this.debug.alpha=.8,this.scoreLabel=X(``,W.hud.score.colour,W.hud.score.size),this.bossName=X(``,W.hud.bossBar.nameColour,W.hud.bossBar.nameSize),this.progressLabel=X(``,W.hud.progressChart.labelColour,W.hud.progressChart.labelSize),this.progressGauge.visible=!1,this.progressLabel.visible=!1,this.bossName.anchor.set(.5,1),this.bossName.visible=!1,this.bossBar.visible=!1,this.scoreLabel.alpha=W.hud.score.alpha,this.root.addChild(this.resourceGauge,this.subline,this.resourceLabel,this.mutationLabel,this.mutationGauge,this.scoreLabel,this.bossBar,this.bossName,this.progressGauge,this.progressLabel,this.debug)}layout(e){let t=Qu(e.width,e.height);this.hudScale=t,this.laneWidthPx=e.laneWidthPx,this.laneCentreX=e.left+e.laneWidthPx/2;let n=this.laneCentreX;this.subline.scale.set(t),this.subline.x=n,this.subline.y=22*t,this.resourceLabel.scale.set(t),this.resourceLabel.x=n,this.resourceLabel.y=this.subline.y+16*t,this.mutationLabel.scale.set(t),this.mutationLabel.x=n,this.debug.scale.set(t*.9),this.debug.x=Math.max(6,e.left+3*t),this.debug.y=116*t,this.scoreLabel.scale.set(t),this.scoreLabel.x=e.left+W.hud.score.x*t,this.scoreLabel.y=W.hud.score.y*t,this.canvasWidth=e.width,this.bossName.scale.set(t),this.bossName.x=e.width/2,this.bossName.y=W.hud.bossBar.y*t-W.hud.bossBar.nameOffset*t}updateRunReadouts(e){e.score!==this.shownScore&&(this.shownScore=e.score,this.scoreLabel.text=`分数 ${e.score}`);let t=e.boss;if(this.bossBar.visible=t!==null,this.bossName.visible=t!==null,!t)this.shownBossFraction=-1,this.bossBar.clear();else{let e=W.hud.bossBar,n=this.hudScale;this.bossName.text!==t.name&&(this.bossName.text=t.name);let r=Math.max(0,Math.min(1,t.fraction));if(r!==this.shownBossFraction){this.shownBossFraction=r;let t=this.canvasWidth*e.widthRatio,i=e.height*n,a=(this.canvasWidth-t)/2,o=e.y*n,s=this.bossBar;s.clear(),s.roundRect(a,o,t,i,i/2).fill({color:e.backColour,alpha:e.backAlpha});let c=t*r;c>1&&s.roundRect(a,o,c,i,i/2).fill({color:e.fillColour,alpha:1}),s.roundRect(a,o,t,i,i/2).stroke({color:e.borderColour,alpha:e.borderAlpha,width:1})}}let n=e.progress;this.progressGauge.visible=n!==null,this.progressLabel.visible=n!==null;let r=n!==null&&(this.progressChart===null||this.progressChart.total!==n.total||this.progressChart.cleared!==n.cleared||this.progressChart.current!==n.current),i=n===null!=(this.progressChart===null);(r||i)&&(this.progressChart=n,this.redrawProgress()),this.seedLabel=e.seed,this.talentLabel=e.talent??``,this.skillLabel=e.skill?`${e.skill.name} ×${e.skill.uses}`:``}redrawProgress(){let e=this.progressGauge;e.clear();let t=this.progressChart;if(!t)return;let n=W.hud.progressChart,r=this.hudScale,i=n.pipRadius*r,a=i*2+n.pipGap*r,o=n.y*r,s=this.canvasWidth-n.rightInset*r-(t.total-1)*a;for(let r=0;r<t.total;r++){let c=s+r*a,l=r<t.cleared,u=r===t.current;e.circle(c,o,i).fill({color:l?n.doneColour:n.pendingColour,alpha:l?n.doneAlpha:n.pendingAlpha}),u&&e.circle(c,o,i*1.7).stroke({color:n.currentColour,alpha:n.currentAlpha,width:Math.max(1,i*.4)})}this.progressLabel.scale.set(r),this.progressLabel.anchor.set(1,.5),this.progressLabel.x=this.canvasWidth-n.rightInset*r,this.progressLabel.y=o+i*2.6,this.progressLabel.text=`总进度 ${t.cleared}/${t.total}`,this.progressLabel.style.fill=n.labelColour}get bossBarVisible(){return this.bossBar.visible}get progressText(){return this.progressLabel.visible?this.progressLabel.text:`(hidden)`}get bossBarName(){return this.bossName.text}get scoreText(){return this.scoreLabel.text}get sublineText(){return this.subline.text}get debugText(){return this.debug.text}drawResourceGauge(e,t){let n=W.angry.gauge,r=this.hudScale,i=this.resourceGauge;i.clear();let a=this.laneWidthPx*n.widthRatio,o=n.height*r,s=this.laneCentreX-a/2,c=this.resourceLabel.y+this.resourceLabel.height+n.gap*r,l=n.radius*r;i.roundRect(s,c,a,o,l).fill({color:n.trackColour,alpha:n.trackAlpha}),i.roundRect(s,c,a,o,l).stroke({color:n.trackStroke,alpha:n.trackStrokeAlpha,width:1});let u=Math.min(1,Math.max(0,e))*a;u>.5&&i.roundRect(s,c,u,o,l).fill({color:t,alpha:n.fillAlpha});for(let e of W.angry.appearance){if(e.minRage<=0)continue;let t=s+Math.min(1,e.minRage/Math.max(1e-6,W.angry.rage.max))*a;i.moveTo(t,c).lineTo(t,c+o)}i.stroke({color:n.tickColour,alpha:n.tickAlpha,width:n.tickWidth*r})}get resourceGaugeVisible(){return this.resourceLabel.visible}drawMutationGauge(e){let t=W.mutation.gauge,n=this.hudScale,r=this.mutationGauge;r.clear(),this.mutationLabel.visible=!0,this.mutationLabel.text=`突变 ${e.level}`;let i=this.resourceLabel.y+this.resourceLabel.height+(W.angry.gauge.gap+W.angry.gauge.height+t.gap)*n;this.mutationLabel.y=i;let a=this.laneWidthPx*t.widthRatio,o=t.height*n,s=this.laneCentreX-a/2,c=i+this.mutationLabel.height+t.gap*.5*n,l=t.radius*n;r.roundRect(s,c,a,o,l).fill({color:t.trackColour,alpha:t.trackAlpha}),r.roundRect(s,c,a,o,l).stroke({color:t.trackStroke,alpha:t.trackStrokeAlpha,width:1});let u=Math.min(1,Math.max(0,e.fraction))*a;u>.5&&r.roundRect(s,c,u,o,l).fill({color:t.fillColour,alpha:t.fillAlpha}),e.pending>0&&r.roundRect(s,c,a,o,l).stroke({color:t.readyStroke,alpha:t.readyStrokeAlpha,width:Math.max(1.5,1.5*n)})}update(e){let{player:t,fps:n,nominalSeconds:r,elapsed:i,lateral:a,level:o,scrolled:s,stage:c}=e;this.updateRunReadouts(e);let l=[this.skillLabel,this.talentLabel].filter(Boolean).join(`   ·   `),u=c.grows?c.neededForNext===null?`${c.name} ${c.stage}阶 满`:`${c.name} ${c.stage}阶 ${c.absorbedInStage}/${c.neededForNext}`:`${c.name} 不成长`,d=c.route?`${c.route} · `:``;this.subline.text=l?`${d}${u}   ·   ${this.seedLabel}${this.seedLabel?`   ·   `:``}${l}`:this.seedLabel?`${d}${u}   ·   ${this.seedLabel}`:`${d}${u}`,c.resource?(this.resourceLabel.visible=!0,this.resourceLabel.text=`${c.resource.label} ${c.resource.text}`,this.resourceLabel.style.fill=c.resource.colour,this.drawResourceGauge(c.resource.fraction,c.resource.colour)):(this.resourceLabel.visible=!1,this.resourceLabel.text=``,this.resourceGauge.clear()),this.drawMutationGauge(c.mutation),this.subline.style.fill=8373480,this.levelDepthMeters=Math.max(0,o.scrollLength-s),++this.debugTimer%10==0&&(this.debug.text=[`build   ${td()}`,`fps     ${n.toFixed(0)}`,`depth   player ${t.depth(o.scrollLength).toFixed(1)} m   level ${this.levelDepthMeters.toFixed(0)} m to surface`,`vy      ${t.vy.toFixed(3)} screen/s`,`vx      ${t.vx.toFixed(3)} lane/s`,`x       ${(t.x*100).toFixed(1)}% of lane   screenY ${(t.screenY*100).toFixed(0)}%`,`time    ${i.toFixed(1)}s   level ${r.toFixed(0)}s`,`lane    ${e.world.laneWidthMeters.toFixed(1)} m   depth view ${e.world.visibleDepthMeters.toFixed(0)} m`,`lateral ${a.keyboardSpeed.toFixed(3)} lane/s keyboard  damp ${ol}`,`cross   ${a.crossingSeconds}s rest / ${a.boostCrossingSeconds}s with boost penalty`].join(`
`))}};async function ud(){let e=new fn;return await e.init({background:66828,antialias:!1,autoDensity:!0,resolution:Math.min(window.devicePixelRatio||1,2),preference:`webgl`,powerPreference:`high-performance`}),e}function dd(e){let t=W.consumption.tierVolume,n=1;for(let r=1;r<t.length;r++)e+1e-9>=t[r]&&(n=r+1);return n}function fd(e){return W.consumption.mass[e]??0}function pd(e){return W.consumption.edibleAtTier[e]??1/0}function md(e,t,n=0){return dd(t)+n>=pd(e)}function hd(e){return fd(e)*W.consumption.massEfficiency}function gd(e){let t=W.suction.radiusRatio+Math.max(0,e)*W.suction.radiusPerVolume;return Math.min(W.suction.maxRadiusRatio,t)}function _d(e,t){if(e<=0)return 1;if(t<=0)return W.suction.heavyFloor;let n=e/t;return n<=1?1:n>=W.suction.heavyRatio?W.suction.heavyFloor:1-(n-1)/(W.suction.heavyRatio-1)*(1-W.suction.heavyFloor)}function vd(e,t){return W.suction.pullPerSecond*_d(e,t)}var Z={minActive:2,maxActive:5,spawnEverySeconds:7,fishSpeedFactor:.34,fishTurnRate:.9,get insideMarginRatio(){return W.spawning.insideMarginRatio},fishBaitChance:.25,fishBaitSeconds:1.6,jellyBobAmplitude:.012,trashSpeedFactor:.12,get trashDrainPerSecond(){return W.hazards.trash.drainPerSecond},trashStruggleRelease:.55,get trashMinGripSeconds(){return W.hazards.trash.minGripSeconds},get crabArmDistanceMeters(){return W.hazards.crab.armDistanceMeters},get crabFuseSeconds(){return W.hazards.crab.fuseSeconds},get crabLaunchMps(){return W.hazards.crab.launchMps},get crabApexSeconds(){return W.hazards.crab.apexSeconds},get fishFeedToSplit(){return W.emergence.fishFeedToSplit},fishDigestSeconds:.9,get fishPerceptionBaseMeters(){return W.emergence.fishPerceptionBaseMeters},get fishPerceptionPerVolume(){return W.emergence.fishPerceptionPerVolume},get fishHardCap(){return W.emergence.fishHardCap},fishBiteMeters:34,get seekBiggestRangeMeters(){return W.emergence.seekBiggestRangeMeters},seekBiggestPullPerSecond:.35},Q={fish:{radius:.035,colour:10147839,spin:0},tuna:{radius:.045,colour:5211832,spin:0},dolphin:{radius:.055,colour:8366292,spin:0},octopus:{radius:.07,colour:14247482,spin:.1},shark:{radius:.07,colour:8688804,spin:0},whale:{radius:.085,colour:3951198,spin:0},jelly:{radius:.062,colour:13081599,spin:0},trash:{radius:.05,colour:11569754,spin:.6},crab:{radius:.045,colour:16751467,spin:0},urchin:{radius:.052,colour:4016762,spin:.2},bombfish:{radius:.048,colour:14240319,spin:0},boss:{radius:W.hazards.boss.radiusRatio,colour:W.hazards.boss.colour,spin:0},vent:{radius:W.hazards.vent.radiusRatio,colour:W.hazards.vent.plumeColour,spin:0},mineral:{radius:.018,colour:16756838,spin:2.4},shrimp:{radius:.033,colour:16767440,spin:0},angler:{radius:.045,colour:3099235,spin:0},torpedo:{radius:.036,colour:10135476,spin:0},zapper:{radius:.058,colour:W.hazards.zapper.bellColour,spin:0},foam:{radius:W.hazards.foam.radiusRatio,colour:W.hazards.foam.colour,spin:0},rain:{radius:.014,colour:W.hazards.rain.colour,spin:0},eel:{radius:.058,colour:13169226,spin:.3},archer:{radius:.038,colour:9425128,spin:0},pistol:{radius:.058,colour:16743787,spin:0},puffer:{radius:.05,colour:5925524,spin:0},starfish:{radius:.052,colour:16763299,spin:.35}};for(let e of Object.keys(Q)){let t=W.hazards.radius[e];typeof t==`number`&&t>0&&(Q[e].radius=t)}function yd(e){return W.hazards.health[e]??0}var bd=[`up`,`left`,`right`];function xd(e,t){let n=e.length;if(n===0)return{x:0,y:0};if(n===1)return e[0];let r=(n-1)*Math.min(1,Math.max(0,t)),i=Math.min(n-2,Math.floor(r)),a=r-i,o=e[Math.max(0,i-1)],s=e[i],c=e[i+1],l=e[Math.min(n-1,i+2)],u=a*a,d=u*a,f=(e,t,n,r)=>.5*(2*t+(n-e)*a+(2*e-5*t+4*n-r)*u+(-e+3*t-3*n+r)*d);return{x:f(o.x,s.x,c.x,l.x),y:f(o.y,s.y,c.y,l.y)}}function Sd(e,t,n,r){if(t.baitedUntil>r.elapsed){t.x+=Math.sign(t.x-r.playerX)*6*n,t.heading=Math.sign(t.x-r.playerX)||t.heading,t.y-=r.descentSpeed*.5*n;return}let i=e.perceptionRadius(r.playerVolume);if(Math.hypot(r.playerX-t.x,r.playerY-t.y)>i){let e=Math.sin(t.phase*1.3+t.seed)*5*n;t.x+=e,e!==0&&(t.heading=Math.sign(e)),t.y-=r.descentSpeed*.42*n;return}let a=r.playerX-t.x,o=Math.max(-1,Math.min(1,a/Math.max(1,r.laneWidth*.25)));t.x+=o*r.laneWidth*Z.fishSpeedFactor*n,o!==0&&(t.heading=Math.sign(o)),t.y-=r.descentSpeed*.55*n}function Cd(e,t,n,r){let i=Math.sin(t.phase*1.4+t.seed)*Z.jellyBobAmplitude*r.laneWidth;t.x+=(Math.cos(t.phase*.7)*.4+i*.02)*6*n,t.y-=r.descentSpeed*.3*n,t.squashed=Math.max(0,t.squashed-n*2.2)}function wd(e,t,n,r){t.gripping?(t.x=r.playerX,t.y=r.playerY):(t.y-=r.descentSpeed*Z.trashSpeedFactor*n,t.x+=Math.sin(t.phase*1.1+t.seed)*4*n)}function Td(e,t,n,r){t.y-=r.descentSpeed*.18*n;let i=t.y<r.playerY+Z.crabArmDistanceMeters;!t.armed&&i&&(t.armed=!0,t.fuse=Z.crabFuseSeconds),t.armed&&(t.fuse=Math.max(0,t.fuse-n))}function Ed(e,t,n,r){t.y-=r.descentSpeed*.26*n,t.x+=Math.sin(t.phase*.8+t.seed)*2.5*n}function Dd(e,t,n,r,i){e.y-=n.descentSpeed*r*t,e.x+=Math.sin(e.phase*.8+e.seed)*i*t}function Od(e,t,n,r){Dd(t,n,r,W.hazards.archer.driftFactor,2.5)}function kd(e,t,n,r){Dd(t,n,r,W.hazards.pistol.driftFactor,1.2)}function Ad(e,t,n,r){Dd(t,n,r,W.hazards.puffer.driftFactor,1.8),t.counterRest>0&&(t.counterRest=Math.max(0,t.counterRest-n))}function jd(e,t,n,r){Dd(t,n,r,W.hazards.starfish.driftFactor,1.5)}function Md(e,t,n,r){let i=W.hazards.bombfish,a=r.playerX-t.x,o=r.playerY-t.y,s=Math.hypot(a,o),c=i.seekSpeedFactor*r.laneWidth;s>.001&&(t.x+=a/s*c*n,t.y+=o/s*c*n),t.y-=r.descentSpeed*.15*n,t.blastFuse===null&&s<=i.armMeters&&(t.blastFuse=i.fuseSeconds)}function Nd(e,t,n,r){let i=W.hazards.boss,a=r.playerX+Math.sin(r.elapsed*(Math.PI*2/i.patrolPeriodSeconds))*i.patrolAmplitude*r.laneWidth-t.x,o=i.seekSpeedFactor*r.laneWidth*n;t.x+=Math.abs(a)<=o?a:Math.sign(a)*o;let s=Math.max(1,r.max-r.min),c=Math.max(i.holdMinMeters,Math.min(i.holdMeters,s*i.holdBandRatio)),l=s*.08,u=Math.min(Math.max(r.playerY+c,r.min+l),r.max-l);t.y+=(u-t.y)*Math.min(1,n*1.4)}function Pd(e,t,n,r){let i=W.hazards.vent;t.phase=(t.phase+n)%Math.max(.2,i.periodSeconds)}function Fd(e,t,n,r){let i=W.hazards.mineral;t.y+=r.laneWidth*i.riseSpeedFactor*n,t.x+=Math.sin(r.elapsed/Math.max(.2,i.wobblePeriodSeconds)*Math.PI*2+t.seed)*r.laneWidth*i.wobbleAmplitude*n,t.fed+=n,t.fed*r.laneWidth*i.riseSpeedFactor>i.lifeMeters&&(t.flee=`up`)}function Id(e,t,n,r){let i=W.hazards.shrimp;t.x+=t.seed%2<1?-r.laneWidth*i.driftSpeedFactor*n:r.laneWidth*i.driftSpeedFactor*n,t.y-=r.descentSpeed*.25*n}function Ld(e,t,n,r){let i=W.hazards.angler;t.chargeRest>0&&(t.chargeRest-=n);let a=Math.hypot(r.playerX-t.x,r.playerY-t.y);if(t.chargeRest<=0&&a<=i.lureMeters){t.chargeRest=i.cooldownSeconds;let e=a;t.charge={fromX:t.x,fromY:t.y,toX:r.playerX,toY:r.playerY,bow:(t.x<r.playerX?1:-1)*i.bowRatio*e,elapsed:0,grazed:!1,hitPlayer:!1}}t.y-=r.descentSpeed*i.driftFactor*n}function Rd(e,t,n,r){let i=W.hazards.torpedo,a=r.laneWidth*i.runSpeedFactor,o=r.laneWidth*i.seekSpeedFactor;if(t.fed<i.runMeters)t.fed+=a*n,t.y+=a*n;else if(t.digest<i.seekSeconds){t.digest+=n;let e=r.playerX-t.x,i=r.playerY-t.y,a=Math.hypot(e,i)||1;t.x+=e/a*o*n,t.y+=i/a*o*n}else t.y-=r.descentSpeed*.3*n}function zd(e,t,n,r){t.dischargeRest>0&&(t.dischargeRest-=n),t.discharge>0&&(t.discharge-=n),t.y-=r.descentSpeed*.28*n,t.x+=Math.sin(t.phase*.7+t.seed)*2.4*n}function Bd(e,t,n,r){t.foamLife-=n,t.foamLife<=0&&(t.flee=`up`),t.y-=r.descentSpeed*.6*n,t.x+=Math.sin(t.phase*.9+t.seed)*3.2*n}function Vd(e,t,n,r){t.y-=r.laneWidth*W.hazards.rain.fallSpeedFactor*n}function Hd(e,t,n,r){t.y-=r.descentSpeed*.3*n,t.x+=Math.sin(t.phase*2.6+t.seed)*r.laneWidth*.055*n,t.attackSince!==null&&(t.attackSince+=n,t.attackSince>=(W.hazardArt.eel?.attackSeconds??.45)&&(t.attackSince=null))}var Ud={fish:Sd,tuna:Sd,whale:Sd,dolphin:Sd,shark:Sd,octopus:Sd,jelly:Cd,trash:wd,crab:Td,urchin:Ed,bombfish:Md,boss:Nd,vent:Pd,mineral:Fd,shrimp:Id,angler:Ld,torpedo:Rd,zapper:zd,foam:Bd,rain:Vd,eel:Hd,archer:Od,pistol:kd,puffer:Ad,starfish:jd};function Wd(e,t,n,r){let i=n.laneWidth*t.radiusFraction;if(e.baitEnabled&&t.baitedUntil<=n.elapsed&&Math.random()<Z.fishBaitChance){t.baitedUntil=n.elapsed+Z.fishBaitSeconds,e.baits++,r.push({kind:`fish`,broke:!0});return}n.invulnerable||t.baitedUntil>n.elapsed||(r.push({kind:`fish`,damage:1,broke:!1}),t.y-=i*2)}function Gd(e,t,n,r){let i=n.laneWidth*t.radiusFraction;n.invulnerable||(r.push({kind:`jelly`,damage:W.hazards.jelly.contactDamage,slowSeconds:G.hazardSlowSeconds,slowFactor:G.hazardSlowFactor,broke:!1}),t.squashed=1,t.y-=i*1.5)}function Kd(e,t,n,r){t.gripping||(t.gripping=!0,e.grabs++,r.push({kind:`trash`,broke:!1}))}function qd(e,t,n,r){t.fired||!t.armed||t.fuse>0||(r.push({kind:`crab`,impulse:Z.crabLaunchMps,broke:!0}),t.fired=!0)}function Jd(e,t,n,r){let i=n.laneWidth*t.radiusFraction;n.invulnerable||(r.push({kind:t.kind,damage:1,broke:!1}),t.y-=i*2)}function Yd(e,t,n,r){let i=n.laneWidth*t.radiusFraction;n.invulnerable||(r.push({kind:`shrimp`,damage:W.hazards.shrimp.contactDamage,broke:!1}),t.y-=i*2)}function Xd(e,t,n,r){let i=n.laneWidth*t.radiusFraction,a=W.hazards.zapper,o=n.laneWidth*a.ringRadiusRatio,s=Math.hypot(n.playerX-t.x,n.playerY-t.y);s<=i+n.laneWidth*n.playerRadiusFraction&&t.discharge<=0&&t.dischargeRest<=0&&(t.discharge=a.ringSeconds,t.dischargeRest=a.ringCooldownSeconds),!(t.discharge<=0||s>o||n.invulnerable)&&(r.push({kind:`zapper`,damage:a.ringDamage,broke:!1}),r.push({kind:`zapper`,charge:W.hazards.charge.perRingHit,broke:!1}))}function Zd(e,t,n,r){let i=W.hazards.foam;r.push({kind:`foam`,damage:n.invulnerable?0:i.contactDamage,broke:!0}),t.flee=`up`}function Qd(e,t,n,r){if(n.invulnerable)return;let i=W.hazards.rain;r.push({kind:`rain`,damage:i.contactDamage,pushDown:i.pushMeters,broke:!0}),t.flee=`down`}function $d(e,t,n,r){let i=W.hazards.vent;t.phase>=i.activeSeconds||n.invulnerable||r.push({kind:`vent`,damage:i.contactDamage,broke:!1})}function ef(e,t,n,r){n.invulnerable||(r.push({kind:`mineral`,damage:1,broke:!0}),t.flee=`up`)}function tf(e,t,n,r){let i=n.laneWidth*t.radiusFraction;n.invulnerable||(r.push({kind:t.kind,damage:W.hazards.boss.contactDamage,broke:!1}),t.y-=i*2)}var nf={fish:Wd,tuna:Wd,whale:Wd,dolphin:Wd,shark:Wd,octopus:Wd,jelly:Gd,trash:Kd,crab:qd,urchin:Jd,bombfish:Jd,eel:Jd,angler:Jd,torpedo:Jd,boss:tf,shrimp:Yd,zapper:Xd,mineral:ef,foam:Zd,rain:Qd,archer:Jd,pistol:Jd,puffer:Jd,starfish:Jd,vent:$d};function rf(e,t,n,r){let i=r/Math.max(.05,fd(e.kind)),a=Math.hypot(t,n);if(a<.001){e.y+=i;return}e.x+=t/a*i,e.y+=n/a*i}var af=class{constructor(){K(this,`hazards`,[]),K(this,`baitEnabled`,!0),K(this,`grabs`,0),K(this,`charges`,0),K(this,`baits`,0),K(this,`grazes`,0),K(this,`eaten`,0),K(this,`nextId`,1),K(this,`spawnTimer`,0),K(this,`splits`,0),K(this,`bubblesEaten`,0),K(this,`fled`,0),K(this,`killed`,0),K(this,`damaged`,0),K(this,`hitEvents`,[]),K(this,`heavyHits`,[]),K(this,`autoSpawn`,!1)}spawnForTest(e,t,n){let r=this.spawnAt(e,t,n,{deterministic:!0});return this.hazards.push(r),r}reset(){this.hazards=[],this.hitEvents.length=0,this.heavyHits.length=0,this.spawnTimer=0,this.grabs=0,this.charges=0,this.baits=0,this.grazes=0,this.eaten=0,this.splits=0,this.bubblesEaten=0,this.fled=0,this.killed=0,this.damaged=0}takeHitEvents(){return this.hitEvents.splice(0,this.hitEvents.length)}takeHeavyHits(){return this.heavyHits.splice(0,this.heavyHits.length)}get dying(){return this.hazards.some(e=>cp(e))}tickDeaths(e){if(this.hazards.length===0)return;let t=!1;for(let n of this.hazards)n.deadSince!==void 0&&(n.deadSince+=e,cp(n)||(t=!0));t&&(this.hazards=this.hazards.filter(e=>e.deadSince===void 0||cp(e)))}hit(e,t,n,r=e.phase){if(e.maxHealth<=0||e.flee)return`immune`;if(e.health=Math.max(0,e.health-t),uf(e,r)&&(e.flashStarted=r,e.flashLastStarted=r),this.applyKnock(e,n),t>=W.hitFeedback.heavyDamage){let n=Math.min(1,t/Math.max(.01,W.hitFeedback.critDamage));e.heavyStarted=r,e.heavyStrength=n,this.heavyHits.push({x:e.x,y:e.y,strength:n})}return e.kind===`zapper`&&W.hazards.zapper.dischargesWhenHit&&e.dischargeRest<=0&&(e.discharge=W.hazards.zapper.ringSeconds,e.dischargeRest=W.hazards.zapper.ringCooldownSeconds),e.kind===`puffer`&&W.hazards.puffer.countersWhenHit&&e.counterRest<=0&&e.health>0&&(e.counter++,e.counterRest=W.hazards.puffer.counterCooldownSeconds),e.health>0?(this.damaged++,this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`hit`,colour:Q[e.kind].colour}),`damaged`):e.kind===`bombfish`?(e.blastFuse=0,this.fled++,this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`defeat`,colour:Q[e.kind].colour}),`fled`):e.kind===`boss`?(this.killed++,ap(e),this.hitEvents.push({x:n?.x??e.x,y:n?.y??e.y,radiusFraction:e.radiusFraction,kind:`defeat`,colour:Q[e.kind].colour}),`killed`):(e.charge=null,e.flee=bd[Math.floor(Math.random()*bd.length)],e.flee=bd[Math.floor(Math.random()*bd.length)],this.fled++,`fled`)}perceptionRadius(e){let t=Math.max(0,e-1);return Z.fishPerceptionBaseMeters+t*Z.fishPerceptionPerVolume}update(e,t){let n=[];if(t.eatenBubbleIds=[],t.splitCount=0,this.autoSpawn){this.spawnTimer-=e;let n=Math.min(Z.maxActive,Z.minActive+Math.floor(t.elapsed/25));this.spawnTimer<=0&&(this.spawnTimer=Z.spawnEverySeconds,this.hazards.length<n&&this.hazards.push(this.spawn(t)))}t.suction&&this.applySuction(e,t);for(let r of this.hazards){if(r.facingRest!==void 0&&r.facingRest>0&&(r.facingRest=Math.max(0,r.facingRest-e)),this.advance(r,e,t),this.updateShooting(r,e,t)){if(r.kind===`starfish`){let e=Math.max(1,Math.round(W.hazards.starfish.volleyCount)),t=[];for(let n=0;n<e;n++){let i=r.volleySpin+n/e*Math.PI*2;t.push({x:Math.cos(i),y:Math.sin(i)})}r.volleySpin+=W.hazards.starfish.volleySpinRadians,n.push({kind:r.kind,broke:!1,volley:{x:r.x,y:r.y,dirs:t}})}else n.push({kind:r.kind,broke:!1,shot:{x:r.x,y:r.y}});r.kind===`eel`&&(r.attackSince=0)}if(r.kind===`puffer`&&r.counter>0&&!r.flee&&!r.entry){r.counter=0;let e=Math.max(1,Math.round(W.hazards.puffer.spikeCount)),t=[];for(let n=0;n<e;n++){let i=n/e*Math.PI*2+r.seed/100*Math.PI*2;t.push({x:Math.cos(i),y:Math.sin(i)})}n.push({kind:r.kind,broke:!1,volley:{x:r.x,y:r.y,dirs:t}})}let i=this.updateAttack(r,e,t);i&&n.push({kind:r.kind,broke:!1,spray:i})}this.resolveFishFeeding(t),this.resolveSeeking(e,t);let r=t.laneWidth*t.playerRadiusFraction;for(let e of this.hazards){let i=t.laneWidth*e.radiusFraction,a=e.x-t.playerX,o=e.y-t.playerY,s=r+i;if(!(a*a+o*o<=s*s)){if(e.kind===`trash`&&e.gripping&&(e.gripping=!1),!t.invulnerable&&e.charge&&!e.charge.grazed&&!e.charge.hitPlayer&&e.charge.elapsed>=Cf(e.kind).telegraphSeconds){let r=s*W.graze.radiusMultiplier;if(a*a+o*o<=r*r){let r=wf(e.charge,Cf(e.kind));r.x*(t.playerX-e.x)+r.y*(t.playerY-e.y)<=0&&(e.charge.grazed=!0,this.grazes++,n.push({kind:e.kind,broke:!1,graze:{x:(e.x+t.playerX)/2,y:(e.y+t.playerY)/2}}))}}continue}if(e.charge&&(e.charge.hitPlayer=!0),t.canEat(e.kind)){this.eaten++,n.push({kind:e.kind,broke:!0,eaten:{id:e.id}});continue}e.flee||nf[e.kind](this,e,t,n)}for(let r of this.hazards)r.kind===`trash`&&r.gripping&&(r.gripSeconds+=e,n.push({kind:`trash`,drainPerSecond:!0,broke:!1}),t.struggling&&r.gripSeconds>=Z.trashMinGripSeconds&&(r.gripping=!1,r.gripSeconds=0,r.fired=!0,n.push({kind:`trash`,broke:!0})));let i=new Set;for(let r of this.hazards){if(r.blastFuse===null||(r.blastFuse-=e,r.blastFuse>0))continue;i.add(r.id);let a=W.hazards.bombfish,o=t.laneWidth*a.blastRadiusRatio,s=Math.hypot(t.playerX-r.x,t.playerY-r.y);n.push({kind:r.kind,broke:!0,blast:{x:r.x,y:r.y,radius:o},damage:s<=o?a.blastDamage:0})}let a=new Set(n.filter(e=>e.eaten).map(e=>e.eaten.id));return this.hazards=this.hazards.filter(e=>{if(a.has(e.id)||i.has(e.id))return!1;if(e.deadSince!==void 0)return cp(e);let n=e.y>t.min-80&&e.y<t.max+120;if(e.flee&&e.flee!==`up`){let n=t.laneWidth*e.radiusFraction*2;if(e.x<-n||e.x>t.laneWidth+n)return!1}let r=e.fired&&(e.kind===`trash`||e.kind===`crab`);return n&&!r}),n}applySuction(e,t){let n=t.suction;if(!n)return;let r=t.laneWidth*gd(t.playerVolume)*Math.max(0,n.radiusFactor);if(r<=0)return;let i=r*r;for(let r of this.hazards){if(r.flee)continue;let a=n.x-r.x,o=n.y-r.y,s=a*a+o*o;if(s>i||s<1e-6)continue;let c=Math.sqrt(s);if(r.kind===`trash`&&r.gripping||r.kind===`crab`&&r.armed)continue;let l=t.laneWidth*vd(fd(r.kind),t.playerVolume),u=Math.min(l*e,c);r.x+=a/c*u,r.y+=o/c*u}}resolveFishFeeding(e){let t=Z.fishBiteMeters,n=[];for(let r of this.hazards)if(r.kind===`fish`&&!r.flee&&(r.digest=Math.max(0,r.digest-1/60),!(r.digest>0))){for(let i of e.bubbles)if(!e.eatenBubbleIds.includes(i.id)&&!(Math.hypot(i.x-r.x,i.y-r.y)>t)){e.eatenBubbleIds.push(i.id),r.fed++,r.digest=Z.fishDigestSeconds,this.bubblesEaten++,r.fed>=Z.fishFeedToSplit&&this.hazards.length+n.length<Z.fishHardCap&&(r.fed=0,this.splits++,e.splitCount++,n.push({...r,id:this.nextId++,x:Math.max(0,Math.min(e.laneWidth,r.x+(Math.random()-.5)*e.laneWidth*.2)),y:r.y+14,radiusFraction:r.radiusFraction*.88,phase:Math.random()*Math.PI*2,seed:Math.random()*1e3,heading:0,variety:r.variety,baitedUntil:0,fed:0,digest:Z.fishDigestSeconds}));break}}this.hazards.push(...n)}resolveSeeking(e,t){let n=Z.seekBiggestRangeMeters,r=Z.seekBiggestPullPerSecond;for(let i of this.hazards){if(i.kind!==`jelly`&&i.kind!==`trash`||i.kind===`trash`&&i.gripping||i.flee)continue;let a=null;for(let e of t.bubbles)t.eatenBubbleIds.includes(e.id)||Math.hypot(e.x-i.x,e.y-i.y)>n||(!a||e.volume>a.volume)&&(a={x:e.x,y:e.y,volume:e.volume});if(!a)continue;let o=a.x-i.x,s=a.y-i.y,c=Math.hypot(o,s);if(c<.001)continue;let l=Math.min(c,r*e*t.laneWidth*.05);i.x+=o/c*l,i.y+=s/c*l}}spawnAt(e,t,n,r={}){let i=Q[e].radius,a=r.health??yd(e),o=+!r.deterministic;return{id:this.nextId++,kind:e,x:t,y:n,radiusFraction:i,phase:r.deterministic?0:Math.random()*Math.PI*2,seed:r.deterministic?0:Math.random()*1e3,heading:0,variety:r.variety??0,baitedUntil:0,squashed:0,gripping:!1,gripSeconds:0,fuse:e===`crab`?Z.crabFuseSeconds:0,fired:!1,armed:!1,fed:0,digest:0,entry:r.entry??null,health:a,maxHealth:a,flee:null,charge:null,blastFuse:null,knock:null,discharge:0,dischargeRest:0,foamLife:e===`foam`?W.hazards.foam.lifeSeconds:0,tint:null,chargeRest:o*Math.random()*(W.charges.chargers[e]?.cooldownSeconds??0),attackSince:null,attackRest:o*Math.random()*W.hazards.boss.attackEverySeconds,attacked:!1,shootTimer:o*(Math.random()/Math.max(.01,W.enemyBullets.shooters[e]?.perSecond??1)),counter:0,counterRest:0,volleySpin:o*Math.random()*Math.PI*2,path:r.path??null}}spawn(e){let t=[`fish`,`tuna`,`jelly`,`trash`,`crab`,`urchin`,`bombfish`,`eel`,`boss`,`vent`,`mineral`,`shrimp`,`angler`,`torpedo`,`zapper`,`foam`,`rain`,`dolphin`,`octopus`,`shark`,`whale`,`archer`,`pistol`,`puffer`,`starfish`],n=t[Math.floor(Math.random()*t.length)]??`fish`,r=Q[n].radius,i=e.laneWidth*r*1.4,a=Math.floor(Math.random()*8);return this.spawnAt(n,i+Math.random()*Math.max(.01,e.laneWidth-i*2),e.max+20+Math.random()*40,{variety:a})}applyKnock(e,t){let n=W.hitKnockback,r=n.meters*(e.kind===`boss`?Math.max(0,W.hazards.boss.knockbackScale):1);if(r<=0||n.seconds<=0)return;let i=0,a=1;if(t){let n=e.x-t.x,r=e.y-t.y,o=Math.hypot(n,r);o>.001&&(i=n/o,a=r/o)}e.knock={dirX:i,dirY:a,meters:r,seconds:n.seconds,elapsed:0}}advanceKnock(e,t){let n=e.knock;if(!n)return;let r=Math.max(0,1-n.elapsed/n.seconds),i=2*n.meters/n.seconds*r;e.x+=n.dirX*i*t,e.y+=n.dirY*i*t,n.elapsed+=t,n.elapsed>=n.seconds&&(e.knock=null)}advance(e,t,n){this.advanceKind(e,t,n),this.advanceKnock(e,t)}advanceKind(e,t,n){e.phase+=t;let r=n.descentSpeed;if(e.flee){if(e.flee===`dead`)return;let r=Math.max(1,n.max-n.min)*W.hazards.fleeScreensPerSecond*t;e.flee===`up`?e.y+=r:e.x+=e.flee===`right`?r:-r;return}if(e.entry){let i=n.laneWidth*Z.insideMarginRatio,a=!1;switch(e.entry.from){case`left`:e.x+=e.entry.speed*t,a=e.x>=i;break;case`right`:e.x-=e.entry.speed*t,a=e.x<=n.laneWidth-i;break;case`bottom`:e.y+=(r+e.entry.speed)*t,a=e.y>=n.playerY}if(!a)return;e.entry=null}if(e.charge){let n=Cf(e.kind);if(e.charge.elapsed+=t,e.charge.elapsed<n.telegraphSeconds){e.y-=r*t;return}let i=Math.min(1,(e.charge.elapsed-n.telegraphSeconds)/Math.max(.05,n.travelSeconds)),{fromX:a,fromY:o,toX:s,toY:c,bow:l}=e.charge,u=(a+s)/2,d=(o+c)/2,f=Math.hypot(s-a,c-o)||1,p=u+-(c-o)/f*l,m=d+(s-a)/f*l,h=1-i;e.x=h*h*a+2*h*i*p+i*i*s,e.y=h*h*o+2*h*i*m+i*i*c,i>=1&&(e.charge=null,e.chargeRest=n.cooldownSeconds);return}let i=e.path?void 0:W.charges.chargers[e.kind];if(i){e.chargeRest=Math.max(0,e.chargeRest-t);let r=Math.hypot(n.playerX-e.x,n.playerY-e.y);if(e.chargeRest<=0&&r<=i.triggerMeters){let t=e.x<n.playerX,r=Math.hypot(n.playerX-e.x,n.playerY-e.y);e.charge={fromX:e.x,fromY:e.y,toX:n.playerX,toY:n.playerY,bow:(t?1:-1)*i.bowRatio*r,elapsed:0,grazed:!1,hitPlayer:!1},e.heading=t?1:-1,this.charges++;return}}if(e.path){e.path.elapsed+=t;let r=Math.max(0,Math.min(1,e.path.elapsed/Math.max(.1,e.path.seconds))),i=xd(e.path.points,r),a={x:e.x,y:e.y};e.x=i.x*n.laneWidth,e.y=e.path.startY+i.y*(n.max-n.min),Math.abs(e.x-a.x)>.001&&(e.heading=Math.sign(e.x-a.x)),r>=1&&(e.flee=`up`);return}Ud[e.kind](this,e,t,n),e.path||(e.x=Math.max(0,Math.min(n.laneWidth,e.x)))}updateShooting(e,t,n){let r=W.enemyBullets.shooters[e.kind];if(!r||r.perSecond<=0||e.flee||e.entry||e.charge)return!1;let i=1/Math.max(.01,r.perSecond);return Math.hypot(n.playerX-e.x,n.playerY-e.y)>W.enemyBullets.rangeMeters?(e.shootTimer=Math.max(e.shootTimer,i),!1):(e.shootTimer-=t,e.shootTimer>0?!1:(e.shootTimer+=i,e.shootTimer<=0&&(e.shootTimer=i),!0))}updateAttack(e,t,n){if(e.kind!==`boss`||e.deadSince!==void 0||e.flee||e.entry)return null;let r=W.animations[W.hazardArt.boss?.attack??``];if(!r)return null;let i=W.hazards.boss;if(e.attackSince===null){if(e.attackRest-=t,e.attackRest>0)return null;e.attackSince=0,e.attacked=!1}if(e.attackSince+=t,e.attackSince>=_l(r))return e.attackSince=null,e.attackRest=Math.max(0,i.attackEverySeconds),null;if(e.attacked||vl(r,e.attackSince)<Math.max(0,i.attackSprayFrame-1))return null;e.attacked=!0;let a=n.laneWidth*e.radiusFraction,o=n.playerX>=e.x?1:-1,s=e.x+i.attackSprayFromX*a*o,c=e.y+i.attackSprayFromY*a,l=Math.max(0,Math.round(i.attackSprayCount)),u=Math.max(0,i.attackSpraySpread)*n.laneWidth,d=[];for(let e=0;e<l;e++){let t=l<=1?0:e/(l-1)-.5;d.push({x:Math.max(0,Math.min(n.laneWidth,n.playerX+t*u)),y:n.playerY})}return d.length>0?{fromX:s,fromY:c,targets:d,bow:i.attackSprayBowRatio}:null}};function of(e,t,n,r,i,a){let o=(e,t)=>Number.isFinite(e)?e:t,s=o(i.pulseMin,.6)+(o(i.pulseMax,1.2)-o(i.pulseMin,.6))*(.5+.5*Math.sin(o(a,0)*o(i.pulsePerSecond,1)*Math.PI*2)),{tipX:c,tipY:l,baseX:u,baseY:d}=jf(t,n,r,i,yl(e));If.length>=Ff&&If.shift(),If.push({x:t,y:n,r,tipX:c,tipY:l,angle:i.stemAngle,glowRadius:i.glowRadius}),i.stemWidth>0&&e.moveTo(u,d).lineTo(c,l).stroke({color:i.stemColour,width:Math.max(.5,r*i.stemWidth)}),Number.isFinite(c)&&Number.isFinite(l)&&e.circle(c,l,r*o(i.glowRadius,.8)).fill({color:i.glowColour,alpha:o(i.glowAlpha,.5)*s}),e.circle(c,l,r*o(i.bulbRadius,.2)).fill({color:i.bulbColour,alpha:Math.min(1,s)})}var sf=!1;function cf(e){return sf=e,sf}function lf(e,t){let n=W.hitFlash,r=Math.max(.001,n.seconds);if(sf||t<=0||e<0||e>=r)return 0;let i=e/r;if(i<n.riseFraction)return t*(i/Math.max(.001,n.riseFraction));let a=(i-n.riseFraction)/Math.max(.001,1-n.riseFraction);return t*(1-a)*(1-a)}function uf(e,t){return e.flashLastStarted===void 0||t-e.flashLastStarted>=W.hitFlash.cooldownSeconds}function df(e,t){if(e.heavyStarted===void 0)return 0;let n=Math.max(.001,W.hitFeedback.heavyOutlineSeconds),r=(t-e.heavyStarted)/n;return r<0||r>=1?0:(e.heavyStrength??0)*(1-r)*(1-r)}var ff=null;function pf(e){ff||(ff=new Mr);let t=Math.max(0,Math.min(1,e)),n=1-t;return ff.matrix=[n,0,0,0,t,0,n,0,0,t,0,0,n,0,t,0,0,0,1,0],ff}var mf=new Map,hf=new Map,gf=0,_f=new Map,vf=new Set;function yf(e){let t=W.animations[e];return!t||_f.has(e)||vf.has(e)?Promise.resolve():(vf.add(e),Pl(t).then(t=>{vf.delete(e),t.length>0&&_f.set(e,t)}))}function bf(e){return _f.get(e)||(yf(e),null)}function xf(){return Promise.all(Object.keys(W.animations).map(e=>yf(e)))}function Sf(e,t){let n=W.animations[e];if(n){let r=bf(e);return r?r[vl(n,t)]??r[r.length-1]:null}return Fl(e)}function Cf(e){let t=W.hazards[e],n=W.charges.chargers[e];return{telegraphSeconds:t?.telegraphSeconds??n?.telegraphSeconds??.75,travelSeconds:t?.travelSeconds??n?.travelSeconds??.55,cooldownSeconds:t?.cooldownSeconds??n?.cooldownSeconds??2.2}}function wf(e,t){let n=Math.min(1,(e.elapsed-t.telegraphSeconds)/Math.max(.05,t.travelSeconds)),{fromX:r,fromY:i,toX:a,toY:o,bow:s}=e,c=(r+a)/2,l=(i+o)/2,u=Math.hypot(a-r,o-i)||1,d=c+-(o-i)/u*s,f=l+(a-r)/u*s,p=1-n;return{x:2*p*(d-r)+2*n*(a-d),y:2*p*(f-i)+2*n*(o-f)}}function Tf(e,t,n,r){return e.charge!==null&&e.charge.elapsed<n?{state:t.charge??r,elapsed:e.charge.elapsed}:{state:r,elapsed:e.phase}}function Ef(e,t,n,r){return e.charge===null?{state:r,elapsed:e.phase}:{state:t.charge??r,elapsed:e.charge.elapsed}}var Df={angler:Ef};function Of(e,t,n,r=t.move??``){return e.deadSince===void 0?e.attackSince!==null&&t.attack!==void 0?{state:t.attack,elapsed:e.attackSince}:(Df[e.kind]??Tf)(e,t,n,r):{state:t.dead,elapsed:e.deadSince}}var kf=1;function Af(){if(mf.size===0)return;let e=gf;for(let[t,n]of mf)e-hf.get(t)>kf&&(n.destroy(),mf.delete(t),hf.delete(t))}function jf(e,t,n,r,i){let a=(e,t)=>typeof e==`number`&&Number.isFinite(e)?e:t,o=a(r.stemAngle,0)*Math.PI/180,s=Math.sin(o),c=Math.cos(o)*(i?1:-1),l=a(r.stemFrom,.3),u=a(r.stemLength,.8),d=e+s*n*l,f=t+c*n*l;return{baseX:d,baseY:f,tipX:d+s*n*u,tipY:f+c*n*u}}function Mf(e){return mf.get(e)??null}function Nf(e){let t=W.hitFlash.peakIntensity,n=e.hazards.map(e=>{let n=W.hazardArt[e.kind],r=t*(n?.spriteFlashScale??1),i=e.flashStarted;return{id:e.id,kind:e.kind,flash:i===void 0?0:lf(e.phase-i,r),outline:df(e,e.phase),restartable:uf(e,e.phase),onSprite:+!!n}});return{reduced:sf,peak:t,seconds:W.hitFlash.seconds,cooldownSeconds:W.hitFlash.cooldownSeconds,feedback:n}}function Pf(e){return{animations:Object.entries(W.animations).map(([e,t])=>({name:e,frames:_f.get(e)?.length??0,seconds:_l(t),loading:vf.has(e)})),dying:e.hazards.filter(e=>e.deadSince!==void 0).map(e=>{let t=W.hazardArt[e.kind],n=t?.dead?W.animations[t.dead]:void 0,r=n?vl(n,e.deadSince??0):0,i=mf.get(e.id);return{id:e.id,kind:e.kind,since:e.deadSince??0,deadline:e.deadDeadline??0,frame:r,texture:i?`${i.texture.width}x${i.texture.height}`:`no sprite`}})}}var Ff=8,If=[];function Lf(e,t,n,r,i){let a=t.flee?t.flee===`left`?-1:1:Math.sign(t.x-0)||1;e.ellipse(t.x,t.y,n*1.5,n*.75).fill({color:Q.fish.colour,alpha:.85}),e.moveTo(t.x-a*n*1.3,t.y).lineTo(t.x-a*n*2.2,t.y-n*.6).lineTo(t.x-a*n*2.2,t.y+n*.6).closePath().fill({color:Q.fish.colour,alpha:.6}),t.baitedUntil>i?e.circle(t.x+a*n*.5,t.y-n*.15,n*.16).fill({color:16777215,alpha:.9}):e.circle(t.x+a*n*.7,t.y-n*.1,n*.2).fill({color:529183,alpha:.9})}function Rf(e,t,n,r,i){let a=1+t.squashed*.5;e.ellipse(t.x,t.y,n*a,1/a*n).fill({color:Q.jelly.colour,alpha:.55}),e.ellipse(t.x,t.y,n*a,1/a*n).stroke({color:Q.jelly.colour,alpha:.95,width:Math.max(1,n*.12)});for(let r=-2;r<=2;r++){let i=t.x+r/2*n*.6,a=Math.sin(t.phase*2.4+r)*n*.35;e.moveTo(i,t.y-n*.8).lineTo(i+a,t.y-n*2.3).stroke({color:Q.jelly.colour,alpha:.5,width:Math.max(1,n*.1)})}}function zf(e,t,n,r,i){let a=Math.sin(t.phase*.9+t.seed)*.25;e.moveTo(t.x-n,t.y+n*(.6+a)).lineTo(t.x+n*.9,t.y+n*(.8-a)).lineTo(t.x+n*.7,t.y-n*.9).lineTo(t.x-n*.8,t.y-n*.7).closePath().fill({color:Q.trash.colour,alpha:.7}),e.moveTo(t.x-n*.6,t.y-n*.6).lineTo(t.x+n*.5,t.y-n*.5).stroke({color:7164466,alpha:.8,width:Math.max(1,n*.14)})}function Bf(e,t,n,r,i){if(t.fuse>0){let r=1-t.fuse/Z.crabFuseSeconds,i=t.y+Z.crabLaunchMps*Z.crabApexSeconds*r;e.moveTo(t.x,t.y).quadraticCurveTo(t.x,(t.y+i)/2+n*3,t.x,i).stroke({color:16766073,alpha:.15+r*.5,width:Math.max(1,n*.18)});for(let r=0;r<3;r++){let i=(t.phase*1.8+r*.33)%1;e.circle(t.x+Math.sin(r*2.1)*n*1.4,t.y-n*.5-i*n*2.2,n*(.16+i*.2)).fill({color:14271386,alpha:.3*(1-i)})}}e.ellipse(t.x,t.y,n*1.35,n*.95).fill({color:Q.crab.colour,alpha:.9});let a=t.fired?Math.sin(i*14)*.6:0;for(let r of[-1,1]){e.circle(t.x+r*n*1.35,t.y-n*.3,n*.4).stroke({color:Q.crab.colour,alpha:.9,width:Math.max(1,n*.16)});for(let i=-1;i<=1;i++)e.moveTo(t.x+r*n*.9,t.y+n*.5).lineTo(t.x+r*n*1.7,t.y+n*(1.1+i*.3)+a*n*.6).stroke({color:Q.crab.colour,alpha:.75,width:Math.max(1,n*.13)})}}function Vf(e,t,n,r,i){let a=t.phase*.35+t.seed;e.circle(t.x,t.y,n*.92).fill({color:Q.urchin.colour,alpha:.55});for(let r=0;r<11;r++){let i=r/11*Math.PI*2+a;e.moveTo(t.x+Math.cos(i)*n*.7,t.y+Math.sin(i)*n*.7).lineTo(t.x+Math.cos(i)*n*1.55,t.y+Math.sin(i)*n*1.55).stroke({color:Q.urchin.colour,alpha:.95,width:Math.max(1,n*.16)})}e.circle(t.x,t.y,n*.95).stroke({color:Q.urchin.colour,alpha:1,width:Math.max(1,n*.2)})}function Hf(e,t,n,r,i){let a=Math.sin(t.phase*1.6+t.seed)*n*.08;e.ellipse(t.x,t.y+a,n*1.05,n*.72).fill({color:Q.archer.colour,alpha:.6}),e.ellipse(t.x,t.y+a,n*1.05,n*.72).stroke({color:Q.archer.colour,alpha:.95,width:Math.max(1,n*.14)}),e.moveTo(t.x-n*1,t.y+a).lineTo(t.x-n*1.6,t.y+a-n*.45).lineTo(t.x-n*1.6,t.y+a+n*.45).closePath().fill({color:Q.archer.colour,alpha:.45}),e.moveTo(t.x-n*.3,t.y+a+n*.5).lineTo(t.x+n*.3,t.y+a+n*.5).lineTo(t.x+n*.16,t.y+a+n*1.15).lineTo(t.x-n*.16,t.y+a+n*1.15).closePath().fill({color:Q.archer.colour,alpha:.9})}function Uf(e,t,n,r,i){let a=.55+.45*Math.abs(Math.sin(t.phase*2.2+t.seed)),o=Math.sin(t.phase*1.3+t.seed)*n*.06;e.ellipse(t.x+n*.15,t.y+o,n*.68,n*.5).fill({color:Q.pistol.colour,alpha:.55}),e.ellipse(t.x+n*.15,t.y+o,n*.68,n*.5).stroke({color:Q.pistol.colour,alpha:.9,width:Math.max(1,n*.13)});let s=t.x-n*.75,c=t.y+o,l=n*.55*a;e.moveTo(s-n*.9,c).lineTo(s,c-l).lineTo(s+n*.55,c-n*.12).lineTo(s+n*.55,c+n*.12).lineTo(s,c+l).closePath().fill({color:Q.pistol.colour,alpha:.85}),e.moveTo(s-n*.9,c).lineTo(s+n*.55,c).stroke({color:Q.pistol.colour,alpha:.6,width:Math.max(1,n*.12)})}function Wf(e,t,n,r,i){let a=t.counterRest>0,o=a?n*.72:n*.95,s=a?n*.35:n*.75;e.circle(t.x,t.y,o).fill({color:Q.puffer.colour,alpha:a?.35:.55});for(let r=0;r<9;r++){let i=r/9*Math.PI*2+t.seed;e.moveTo(t.x+Math.cos(i)*o*.8,t.y+Math.sin(i)*o*.8).lineTo(t.x+Math.cos(i)*(o+s),t.y+Math.sin(i)*(o+s)).stroke({color:Q.puffer.colour,alpha:a?.4:.95,width:Math.max(1,n*.14)})}e.circle(t.x,t.y,o).stroke({color:Q.puffer.colour,alpha:a?.5:1,width:Math.max(1,n*.18)})}function Gf(e,t,n,r,i){let a=Math.max(3,Math.round(W.hazards.starfish.volleyCount)),o=t.volleySpin;for(let r=0;r<a;r++){let i=o+r/a*Math.PI*2,s=Math.cos(i),c=Math.sin(i);e.moveTo(t.x+s*n*.3,t.y+c*n*.3).lineTo(t.x+s*n*1.45-c*n*.28,t.y+c*n*1.45+s*n*.28).lineTo(t.x+s*n*1.45+c*n*.28,t.y+c*n*1.45-s*n*.28).closePath().fill({color:Q.starfish.colour,alpha:.75})}e.circle(t.x,t.y,n*.5).fill({color:Q.starfish.colour,alpha:.9}),e.circle(t.x,t.y,n*.5).stroke({color:16777215,alpha:.4,width:Math.max(1,n*.1)})}function Kf(e,t,n,r,i){let a=W.hazards.vent,o=t.phase<a.activeSeconds,s=t.phase>a.periodSeconds-a.warnSeconds;e.moveTo(t.x-n,t.y).lineTo(t.x-n*.35,t.y+n*2.2).lineTo(t.x+n*.35,t.y+n*2.2).lineTo(t.x+n,t.y).closePath().fill({color:a.plumeColour,alpha:1});let c=t.y+n*2.2,l=r*1.5;if(o||s){let r=o?1:.35;e.moveTo(t.x-n*.4,c).lineTo(t.x-n*1.25,c+l).lineTo(t.x+n*1.25,c+l).lineTo(t.x+n*.4,c).closePath().fill({color:a.plumeColour,alpha:.5*r}),e.moveTo(t.x-n*.25,c).lineTo(t.x-n*.9,c+l).lineTo(t.x+n*.9,c+l).lineTo(t.x+n*.25,c).closePath().fill({color:a.glowColour,alpha:.35*r})}if(o)for(let r of[-1,1])e.moveTo(t.x+r*n,c).lineTo(t.x+r*n*1.25,c+l).stroke({color:a.edgeColour,alpha:a.edgeAlpha,width:Math.max(1,n*.12)})}function qf(e,t,n,r,i){let a=W.hazards.foam;e.circle(t.x,t.y,n).fill({color:a.colour,alpha:a.alpha}),e.circle(t.x,t.y,n).stroke({color:a.rimColour,alpha:a.rimAlpha,width:Math.max(1,n*.1)});for(let[r,i,o]of[[.8,.6,.35],[-.7,.5,.28],[.2,-.9,.24]])e.circle(t.x+n*r,t.y+n*i,n*o).fill({color:a.colour,alpha:a.alpha*.8})}function Jf(e,t,n,r,i){let a=W.hazards.rain,o=r*a.lengthRatio;e.moveTo(t.x,t.y+o).lineTo(t.x,t.y).stroke({color:a.colour,alpha:.75,width:Math.max(1,n*1.2)}),e.circle(t.x,t.y,n).fill({color:a.colour,alpha:.95})}function Yf(e,t,n,r,i){let a=W.hazards.zapper,o=r*a.ringRadiusRatio;e.ellipse(t.x,t.y,n,n*.85).fill({color:a.bellColour,alpha:.85}),e.ellipse(t.x,t.y,n,n*.85).stroke({color:16777215,alpha:.5,width:Math.max(1,n*.12)});for(let r of[-.5,0,.5])e.moveTo(t.x+n*r,t.y-n*.5).lineTo(t.x+n*r*1.6+Math.sin(i*1.5+r*4)*n*.3,t.y-n*2.4).stroke({color:a.bellColour,alpha:.7,width:Math.max(1,n*.14)});if(t.discharge>0){let r=Math.max(0,Math.min(1,t.discharge/Math.max(.01,a.ringSeconds)));e.circle(t.x,t.y,o*(.4+.6*(1-r))).stroke({color:a.ringColour,alpha:a.ringAlpha*r,width:Math.max(1,n*.35*(.4+r))}),e.circle(t.x,t.y,o*.55).fill({color:a.ringColour,alpha:.12*r})}}function Xf(e,t,n,r,i){e.circle(t.x,t.y-n*1.6,n*1.6).fill({color:W.hazards.vent.edgeColour,alpha:.25}),e.circle(t.x,t.y,n).fill({color:Q.mineral.colour,alpha:1}),e.circle(t.x,t.y,n*1.9).stroke({color:W.hazards.vent.edgeColour,alpha:.5,width:Math.max(1,n*.35)})}function Zf(e,t,n,r,i){e.ellipse(t.x,t.y,n*1.5,n*.85).fill({color:Q.shrimp.colour,alpha:.95}),e.moveTo(t.x-n*1.4,t.y+n*.2).lineTo(t.x-n*2.3,t.y-n*.3).lineTo(t.x-n*2.4,t.y+n*.5).closePath().fill({color:Q.shrimp.colour,alpha:.8});for(let r of[-.35,.35])e.moveTo(t.x+n*1.2,t.y+n*r).lineTo(t.x+n*2.6,t.y+n*r*2.4).stroke({color:Q.shrimp.colour,alpha:.7,width:Math.max(1,n*.16)})}function Qf(e,t,n,r,i){let a=W.hazards.angler,o=t.x<r*.5?1:-1;e.ellipse(t.x,t.y,n*1.4,n*.95).fill({color:Q.angler.colour,alpha:1}),e.moveTo(t.x-o*n*1.2,t.y).lineTo(t.x-o*n*2.2,t.y-n*.6).lineTo(t.x-o*n*2.2,t.y+n*.6).closePath().fill({color:Q.angler.colour,alpha:.9});for(let r of[-.4,0,.4])e.moveTo(t.x+o*n*1.3,t.y+n*r).lineTo(t.x+o*n*1.7,t.y+n*r+n*.16).stroke({color:16777215,alpha:.7,width:Math.max(1,n*.12)});let s=1+.18*Math.sin(i*a.lurePulsePerSecond*Math.PI*2),c=t.x+o*n*a.lureOffsetRatio*2.4,l=t.y-n*1.5;e.moveTo(t.x+o*n*.8,t.y-n*.7).lineTo(c,l).stroke({color:a.lureColour,alpha:.55,width:Math.max(1,n*.1)}),e.circle(c,l,r*a.lureRadiusRatio*3*s).fill({color:a.lureColour,alpha:.16}),e.circle(c,l,r*a.lureRadiusRatio*s).fill({color:a.lureColour,alpha:.95})}function $f(e,t,n,r,i){let a=W.hazards.torpedo,o=t.fed>=a.runMeters,s=o?n*.5:0;if(e.roundRect(t.x-n*1.7,t.y-n*.55,n*3.4,n*1.1,n*.5).fill({color:Q.torpedo.colour,alpha:1}),e.moveTo(t.x+n*1.7,t.y-n*.55).lineTo(t.x+n*2.4,t.y).lineTo(t.x+n*1.7,t.y+n*.55).closePath().fill({color:13227230,alpha:1}),e.circle(t.x+n*1.9,t.y,n*.34).fill({color:o?16734810:14676991,alpha:1}),e.moveTo(t.x-n*1.7,t.y).lineTo(t.x-n*(o?3.4:2.6),t.y+s).stroke({color:o?16747098:11065599,alpha:.6,width:Math.max(1,n*.4)}),o)for(let r of[-1,1])e.moveTo(t.x-n*1.2,t.y+r*n*.5).lineTo(t.x-n*2.2,t.y+r*n*1.4).lineTo(t.x-n*.6,t.y+r*n*.6).closePath().fill({color:Q.torpedo.colour,alpha:.9})}function ep(e,t,n,r,i){let a=W.hazards.boss,o=t.tint??a.colour,s=lf(i-(t.flashStarted??i),1)*a.hitFlashStrength;e.ellipse(t.x,t.y,n*1.35,n*1.05).fill({color:s>0?a.hitFlashColour:o,alpha:s>0?.85:1});for(let r of[-.45,0,.45])e.moveTo(t.x-n*1.2,t.y+n*r*.8).lineTo(t.x+n*1.2,t.y+n*r*.8).stroke({color:a.armourColour,alpha:.75,width:Math.max(1,n*.16)});e.moveTo(t.x+n*1.2,t.y-n*.5).lineTo(t.x+n*1.75,t.y).lineTo(t.x+n*1.2,t.y+n*.5).closePath().fill({color:a.armourColour,alpha:.9}),e.circle(t.x+n*.55,t.y+n*.1,n*.24).fill({color:a.eyeColour,alpha:1}),e.circle(t.x,t.y,n*1.06).stroke({color:a.eyeColour,alpha:.5,width:Math.max(1,r*a.weakPointWidthRatio)})}function tp(e,t,n,r,i){if(t.blastFuse!==null){let r=Math.max(.01,W.hazards.bombfish.fuseSeconds),a=Math.max(0,Math.min(1,t.blastFuse/r)),o=.75+.25*Math.sin(i*22);e.circle(t.x,t.y,n*(1.3+1.6*(1-a))).stroke({color:Q.bombfish.colour,alpha:(.35+.5*(1-a))*o,width:Math.max(1,n*.22)})}e.ellipse(t.x,t.y,n*1.25,n*1.1).fill({color:Q.bombfish.colour,alpha:.9}),e.moveTo(t.x-n*1.1,t.y).lineTo(t.x-n*2.1,t.y-n*.55).lineTo(t.x-n*2.1,t.y+n*.55).closePath().fill({color:Q.bombfish.colour,alpha:.65}),e.moveTo(t.x,t.y+n*1).lineTo(t.x+n*.25,t.y+n*1.75).stroke({color:9075292,alpha:.9,width:Math.max(1,n*.16)}),e.circle(t.x+n*.25,t.y+n*1.85,n*.16).fill({color:15260080,alpha:.9}),e.circle(t.x+n*.75,t.y+n*.1,n*.18).fill({color:529183,alpha:.9})}function np(e,t,n,r,i){let a=.4+.6*Math.abs(Math.sin(t.phase*6)),o=n*1.6,s=e=>Math.sin(t.phase*2.2+t.seed+e*Math.PI*2.2)*n*.55,c=[];for(let e=0;e<=10;e++){let n=e/10;c.push(t.x-o+n*o*2,t.y+s(n))}e.poly(c),e.stroke({color:Q.eel.colour,alpha:.9,width:Math.max(1,n*.32)});let l=t.x+o,u=t.y+s(1);e.circle(l,u,n*.42).fill({color:Q.eel.colour,alpha:.95});for(let r=0;r<3;r++){let i=t.phase*3+r/3*Math.PI*2;e.moveTo(l,u).lineTo(l+Math.cos(i)*n*.85,u+Math.sin(i)*n*.85).stroke({color:Q.eel.colour,alpha:.5*a,width:Math.max(1,n*.1)})}}var rp={fish:Lf,tuna:Lf,whale:Lf,dolphin:Lf,shark:Lf,octopus:Lf,jelly:Rf,trash:zf,crab:Bf,urchin:Vf,bombfish:tp,eel:np,boss:ep,vent:Kf,mineral:Xf,shrimp:Zf,angler:Qf,torpedo:$f,zapper:Yf,foam:qf,rain:Jf,archer:Hf,pistol:Uf,puffer:Wf,starfish:Gf},ip=.4;function ap(e){let t=W.hazardArt[e.kind],n=t?.dead?W.animations[t.dead]:void 0;e.deadSince=0,e.deadDeadline=n?_l(n):ip,e.flee=`dead`,op(e)}function op(e){delete e.flashStarted,delete e.flashLastStarted,delete e.heavyStarted,delete e.heavyStrength}function sp(e){return e.flee!==null&&e.flee!==`dead`}function cp(e){return e.deadSince!==void 0&&e.deadSince<(e.deadDeadline??0)}function lp(e,t,n,r,i,a=`in-play`,o=NaN){gf+=1,a===`in-play`&&Af();for(let s of t.hazards){if(a===`leaving`?!sp(s):sp(s))continue;let t=n*s.radiusFraction,c=s.x,l=s.y,u=s.phase;if(s.charge){let n=W.charges,i=Cf(s.kind),{fromX:a,fromY:o,toX:c,toY:l,bow:u,elapsed:d}=s.charge,f=(a+c)/2,p=(o+l)/2,m=Math.hypot(c-a,l-o)||1,h=f+-(l-o)/m*u,g=p+(c-a)/m*u,_=d<i.telegraphSeconds,v=_?1:Math.min(1,(d-i.telegraphSeconds)/Math.max(.05,i.travelSeconds));e.moveTo(a,o);for(let t=1;t<=12;t++){let n=t/12*v,r=1-n;e.lineTo(r*r*a+2*r*n*h+n*n*c,r*r*o+2*r*n*g+n*n*l)}let y=.7+.3*Math.sin(r*18);e.stroke({color:_?n.telegraphColour:n.trailColour,alpha:(_?n.telegraphAlpha:n.trailAlpha)*(_?y:1),width:Math.max(1,t*.18)}),_&&e.circle(c,l,t*.7*y).stroke({color:n.telegraphColour,alpha:n.telegraphAlpha*.8,width:Math.max(1,t*.14)})}let d=W.hazardArt[s.kind];if(d){let n=s.deadSince!==void 0,r=d.variants,i=r&&r.length>0?r[(s.variety%r.length+r.length)%r.length]:void 0,a=i?.move??d.move??``,f=i?.scale??d.scale??1,p=Of(s,d,Cf(s.kind).telegraphSeconds,a),m=p.state,h=p.elapsed,g=m?Sf(m,h):null;if(g){let r=mf.get(s.id);if(!r){r=new M(g),r.anchor.set(.5),r.eventMode=`none`;let t=e.parent;t&&t.addChildAt(r,Math.max(0,t.getChildIndex(e))),mf.set(s.id,r)}hf.set(s.id,gf);let i=t*2*f;r.texture=g,r.visible=!0,r.x=c,r.y=l,r.alpha=d.alpha*(s.flee&&!n?W.hazards.fleeAlpha:1);let a=i/g.width,p=d.front??W.hazardFront,m=s.flee===`left`?`left`:s.flee===`right`?`right`:null,h=o<s.x,_=m?m===`left`:d.facesPlayer??!0?h:s.heading<=0,v=p===`left`===_?1:-1;s.facing===void 0?(s.facing=v,s.facingRest=0):v!==s.facing&&(s.facingRest??0)<=0&&(s.facing=v,s.facingRest=W.hazardFacing.cooldownSeconds);let y=s.facing,b=d.volleyAligned?1:y;r.scale.set(a*b,yl(r)?-Math.abs(a):Math.abs(a));let x=d.spin??0;r.rotation=d.volleyAligned?(s.volleySpin-(d.volleyBaseRadians??0))*(yl(r)?1:-1):x*(s.phase+(s.seed??0));let S=lf(u-(s.flashStarted??u),W.hitFlash.peakIntensity*(d.spriteFlashScale??1));r.filters=S>0?[pf(S)]:[];let C=df(s,u);if(C>0&&e.circle(c,l,t*W.hitFeedback.heavyOutlineRadiusScale).stroke({color:W.hitFeedback.heavyOutlineColour,alpha:W.hitFeedback.heavyOutlineAlpha*C,width:Math.max(1,t*W.hitFeedback.heavyOutlineWidthRatio*(.6+C))}),s.baitedUntil>u){let t=c-y*.35*i;e.circle(t,l,Math.max(1,i*.045)).fill({color:16777215,alpha:.92})}d.lure&&of(e,c,l,t,d.lure,u);continue}}i(s.kind)?(e.circle(c,l,t*1.5).fill({color:W.consumption.marker.edibleColor,alpha:W.consumption.marker.edibleAlpha*.28}),e.circle(c,l,t*1.35).stroke({color:W.consumption.marker.edibleColor,alpha:W.consumption.marker.edibleAlpha,width:Math.max(1,t*W.consumption.marker.widthRatio)})):W.consumption.marker.showBlocked&&e.circle(c,l,t*1.35).stroke({color:16739179,alpha:W.consumption.marker.blockedAlpha,width:Math.max(1,t*W.consumption.marker.widthRatio)}),rp[s.kind](e,s,t,n,u)}}var up=class{constructor(){K(this,`bullets`,[]),K(this,`fired`,0),K(this,`hits`,0),K(this,`cooldown`,0)}reset(){this.bullets=[],this.cooldown=0,this.fired=0,this.hits=0}update(e,t){let n=W.bullets,r=0,i=0,a=0,o=[],s=[];if(t.armed&&t.perSecond>0)for(this.cooldown-=e;this.cooldown<=0;)this.cooldown+=1/t.perSecond,this.spawn(t),a++;else this.cooldown=0;let c=t.laneWidth*n.radiusRatio*t.radiusMultiplier,l=n.lifeSeconds*t.lifeMultiplier;for(let n=this.bullets.length-1;n>=0;n--){let a=this.bullets[n];a.age+=e,a.y+=a.vy*e;let u=t.obstacles.blocks(a.x,a.y,c),d=u;if(u&&this.hits++,!d)for(let e of t.hazards.hazards){if(e.maxHealth<=0||e.flee)continue;let n=c+t.laneWidth*e.radiusFraction,l=e.x-a.x,u=e.y-a.y;if(l*l+u*u>n*n)continue;let f=t.hazards.hit(e,t.damage,{x:a.x,y:a.y});this.hits++,r++,s.push({x:e.x,y:e.y,amount:t.damage}),f===`fled`&&(i++,o.push({x:e.x,y:e.y,kind:e.kind,r:t.laneWidth*e.radiusFraction})),d=!0;break}(d||a.age>=l||a.y<t.min-60||a.y>t.max+120)&&this.bullets.splice(n,1)}return{hits:r,drivenOff:i,fired:a,driven:o,struck:s}}spawn(e){let t=W.bullets;for(let n of e.muzzles)this.bullets.push({x:n.x,y:n.y,vy:e.laneWidth*t.speedPerSecond*e.speedMultiplier,age:0}),this.fired++}};function dp(e,t,n,r=1,i=1){let a=W.bullets,o=n*a.radiusRatio*r;for(let n of t.bullets){let t=Math.max(.18,1-n.age/(a.lifeSeconds*i));e.circle(n.x,n.y,o).fill({color:a.colour,alpha:a.alpha*t}),e.circle(n.x,n.y,o).stroke({color:a.rimColour,alpha:a.rimAlpha*t,width:Math.max(1,o*.45)})}}var fp=class{constructor(){K(this,`bullets`,[]),K(this,`fired`,0),K(this,`hits`,0),K(this,`grazes`,0)}reset(){this.bullets.length=0,this.fired=0,this.hits=0,this.grazes=0}get count(){return this.bullets.length}fire(e,t,n,r,i,a){let o=W.enemyBullets.shooters[e];if(!o)return 0;let s=r-t,c=i-n;if(Math.hypot(s,c)<1e-6)return 0;let l=Math.atan2(c,s),u=o.speedPerSecond*a,d=Math.max(1,Math.round(o.spread));for(let r=0;r<d;r++){let i=l+(r-(d-1)/2)*o.spreadRadians;this.bullets.push({x:t,y:n,vx:Math.cos(i)*u,vy:Math.sin(i)*u,age:0,kind:e,shape:o.shape??`bolt`,radiusRatio:o.radiusRatio??W.enemyBullets.radiusRatio,grazed:!1}),this.fired++}return d}update(e,t){let n=W.enemyBullets,r=[],i=[];for(let a=this.bullets.length-1;a>=0;a--){let o=this.bullets[a];o.age+=e,o.x+=o.vx*e,o.y+=o.vy*e;let s=t.laneWidth*o.radiusRatio,c=!1;if(t.blocks(o.x,o.y,s))c=!0;else{let e=s+t.playerRadius,n=t.playerX-o.x,a=t.playerY-o.y;if(n*n+a*a<=e*e)r.push(o.kind),this.hits++,c=!0;else{let r=e*W.graze.radiusMultiplier;!t.invulnerable&&!o.grazed&&n*n+a*a<=r*r&&o.vx*n+o.vy*a<=0&&(o.grazed=!0,this.grazes++,i.push({x:o.x,y:o.y}))}}(c||o.age>=n.lifeSeconds||o.y<t.min-60||o.y>t.max+120||o.x<-t.laneWidth*.2||o.x>t.laneWidth*1.2)&&this.bullets.splice(a,1)}return{landed:r,grazedAt:i}}};function pp(e,t,n){let r=W.enemyBullets;for(let i of t.bullets){let t=n*i.radiusRatio,a=Math.hypot(i.vx,i.vy)||1,o=i.vx/a,s=i.vy/a;if(i.shape===`spike`){let n=t*3.4,a=t*.85,c=-s,l=o;e.moveTo(i.x+o*n,i.y+s*n).lineTo(i.x+c*a,i.y+l*a).lineTo(i.x-o*n*.6,i.y-s*n*.6).lineTo(i.x-c*a,i.y-l*a).closePath().fill({color:r.coreColour,alpha:1}),e.moveTo(i.x+o*n,i.y+s*n).lineTo(i.x+c*a,i.y+l*a).lineTo(i.x-o*n*.6,i.y-s*n*.6).lineTo(i.x-c*a,i.y-l*a).closePath().stroke({color:r.rimColour,alpha:r.rimAlpha,width:Math.max(1,t*.3)});continue}let c=Math.min(t*3.2,a*.02);e.moveTo(i.x-o*c,i.y-s*c).lineTo(i.x,i.y).stroke({color:r.rimColour,alpha:r.rimAlpha*.45,width:Math.max(1,t*.7)}),e.circle(i.x,i.y,t*1.35).fill({color:r.rimColour,alpha:r.rimAlpha*.35}),e.circle(i.x,i.y,t).fill({color:r.coreColour,alpha:1})}}var mp=new class{constructor(){K(this,`ctx`,null),K(this,`master`,null),K(this,`ambientGain`,null),K(this,`musicGain`,null),K(this,`filter`,null),K(this,`noise`,null),K(this,`noiseGain`,null),K(this,`lfo`,null),K(this,`lfoGain`,null),K(this,`enabled`,!0),K(this,`started`,!1),K(this,`volume`,.8),K(this,`lastPlayed`,new Map),K(this,`now`,0),K(this,`requested`,{cutoff:260,ambient:0,noise:.5,master:1}),K(this,`depthTrace`,[]),K(this,`silencedAtSurfaceCount`,0)}get requestedAmbientRef(){return this.requested.ambient}get requestedNoiseRef(){return this.requested.noise}get isRunning(){return this.started&&this.ctx?.state===`running`}get muted(){return!this.enabled}unlock(){if(!this.enabled)return!1;if(this.started&&this.ctx?.state===`running`)return!0;try{return this.ctx||this.build(),this.ctx?.resume(),this.started=!0,!0}catch{return this.enabled=!1,!1}}setMuted(e){this.enabled=!e,this.applyMaster(),e||this.unlock()}silenceAmbience(){if(!this.ctx||!this.ambientGain||!this.noiseGain)return;let e=this.ctx.currentTime;this.ambientGain.gain.setTargetAtTime(0,e,.25),this.noiseGain.gain.setTargetAtTime(0,e,.25),this.requested.ambient=0,this.requested.noise=0}setVolume(e){this.volume=Math.min(1,Math.max(0,e)),this.applyMaster(),this.volume>0&&this.unlock()}getVolume(){return this.volume}musicBus(){return!this.ctx||!this.master?null:{ctx:this.ctx,destination:this.master}}applyMaster(){let e=this.enabled?this.volume:0;this.master&&this.ctx&&this.master.gain.setTargetAtTime(e,this.ctx.currentTime,.05),this.requested.master=e}toggleMute(){return this.setMuted(!this.muted),this.muted}build(){let e=window.AudioContext??window.webkitAudioContext;if(!e)throw Error(`no AudioContext`);let t=new e;this.ctx=t,this.master=t.createGain(),this.master.gain.value=this.enabled?this.volume:0,this.requested.master=this.master.gain.value,this.master.connect(t.destination),this.filter=t.createBiquadFilter(),this.filter.type=`lowpass`,this.filter.frequency.value=260,this.filter.Q.value=.7,this.filter.connect(this.master),this.ambientGain=t.createGain(),this.ambientGain.gain.value=0,this.musicGain=t.createGain(),this.musicGain.gain.value=W.audio.musicVolume,this.musicGain.connect(this.filter),this.ambientGain.connect(this.musicGain);let n=Math.floor(t.sampleRate*2),r=t.createBuffer(1,n,t.sampleRate),i=r.getChannelData(0),a=0;for(let e=0;e<n;e++)a=a*.94+(Math.random()*2-1)*.06,i[e]=a*3.2;this.noise=t.createBufferSource(),this.noise.buffer=r,this.noise.loop=!0,this.noiseGain=t.createGain(),this.noiseGain.gain.value=.5,this.noise.connect(this.noiseGain),this.noiseGain.connect(this.ambientGain),this.noise.start(),this.lfo=t.createOscillator(),this.lfo.frequency.value=.08,this.lfoGain=t.createGain(),this.lfoGain.gain.value=.22,this.lfo.connect(this.lfoGain),this.lfoGain.connect(this.noiseGain.gain),this.lfo.start()}getMusicVolume(){return W.audio.musicVolume}setMusicVolume(e){let t=Math.max(0,Math.min(1,e));W.audio.musicVolume=t,this.musicGain&&this.ctx&&this.musicGain.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}setAmbient(e){if(!this.ctx||!this.filter||!this.ambientGain||!this.noiseGain)return;let t=Math.min(1,Math.max(0,e)),n=this.ctx.currentTime;this.filter.frequency.setTargetAtTime(300+t*1400,n,.4),this.ambientGain.gain.setTargetAtTime(t*.62,n,.5),this.noiseGain.gain.setTargetAtTime(t*.9,n,.5),this.requested.ambient=t*.62,this.requested.noise=t*.9}setDepth(e,t,n=!0){if(this.depthTrace.push({depth:+e.toFixed(1),audible:n}),this.depthTrace.length>24&&this.depthTrace.shift(),!n&&e<2&&this.silencedAtSurfaceCount++,!this.ctx||!this.filter||!this.ambientGain||!this.noiseGain)return;let r=Math.min(1,Math.max(0,1-e/Math.max(1,t))),i=this.ctx.currentTime,a=220+r*r*2400,o=n?.16+r*.5:0,s=n?.42+r*.5:0;this.filter.frequency.setTargetAtTime(a,i,.4),this.ambientGain.gain.setTargetAtTime(o,i,.5),this.noiseGain.gain.setTargetAtTime(s,i,.5),this.requested.cutoff=a,this.requested.ambient=o,this.requested.noise=s}play(e,t=.5){if(!this.ctx||!this.master||!this.enabled)return;let n=e===`absorb`?.045:e===`bulletHit`?.05:e===`bulletFire`?.04:.09,r=this.lastPlayed.get(e)??-1;if(this.now-r<n)return;this.lastPlayed.set(e,this.now);let i=this.ctx.currentTime,a=Math.min(1,Math.max(0,t));switch(e){case`absorb`:this.tone(420+a*520,.09,.16+a*.1,`sine`,i,1.9);break;case`hit`:this.tone(150,.18,.3,`triangle`,i,.55),this.burst(.09,700,.22,i);break;case`pop`:this.burst(.22,2600,.5,i),this.tone(660,.26,.34,`sine`,i,.35);break;case`surface`:this.burst(.5,4200,.42,i),this.tone(720,.5,.3,`sine`,i,2.4);break;case`skill`:this.tone(520,.22,.24,`square`,i,2.6),this.tone(780,.18,.16,`sine`,i,2.2);break;case`slow`:this.tone(300,.4,.26,`sawtooth`,i,.4);break;case`crab`:this.tone(240,.3,.3,`triangle`,i,3.4);break;case`fart`:this.tone(90,.34,.34,`sawtooth`,i,.62),this.tone(120,.3,.2,`square`,i,.5);break;case`bulletHit`:this.tone(1050,.045,.09+a*.07,`square`,i,1.5),this.burst(.028,3200,.05+a*.06,i);break;case`bulletFire`:let e=.96+Math.random()*.08;this.tone(430*e,.055,.06+a*.05,`triangle`,i,.55),this.burst(.022,1300*e,.03+a*.04,i)}}tick(e){this.now+=e}debugLevels(){return{...this.requested,music:W.audio.musicVolume}}tone(e,t,n,r,i,a){let o=this.ctx;if(!o||!this.master)return;let s=o.createOscillator();s.type=r,s.frequency.setValueAtTime(e,i),s.frequency.exponentialRampToValueAtTime(Math.max(40,e*a),i+t);let c=o.createGain();c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(n,i+.008),c.gain.exponentialRampToValueAtTime(1e-4,i+t),s.connect(c),c.connect(this.master),s.start(i),s.stop(i+t+.02)}burst(e,t,n,r){let i=this.ctx;if(!i||!this.master)return;let a=Math.max(1,Math.floor(i.sampleRate*e)),o=i.createBuffer(1,a,i.sampleRate),s=o.getChannelData(0);for(let e=0;e<a;e++)s[e]=(Math.random()*2-1)*(1-e/a)**2;let c=i.createBufferSource();c.buffer=o;let l=i.createBiquadFilter();l.type=`bandpass`,l.frequency.value=t,l.Q.value=.8;let u=i.createGain();u.gain.value=n,c.connect(l),l.connect(u),u.connect(this.master),c.start(r)}};function hp(){return{rage:0,safeSeconds:W.angry.rage.decayDelaySeconds,overloadLeft:0}}function gp(e){return e.overloadLeft>0}function _p(e){return e.overloadLeft>0?!1:(e.overloadLeft=W.angry.overload.seconds,!0)}function vp(e){e.overloadLeft=0}function yp(){return W.angry.rage.perHit}function bp(e,t){e.rage=Math.min(W.angry.rage.max,e.rage+Math.max(0,t)),e.safeSeconds=0,e.rage>=W.angry.rage.max&&_p(e)}function xp(e,t){let n=Math.min(e.rage,Math.max(0,t));return e.rage-=n,n}function Sp(e,t,n,r=1){return e.overloadLeft>0?(e.overloadLeft=Math.max(0,e.overloadLeft-t),e.overloadLeft===0?(e.rage=0,e.safeSeconds=0,{overloadExpired:!0}):(e.safeSeconds=0,{overloadExpired:!1})):n?(e.safeSeconds=0,{overloadExpired:!1}):(e.safeSeconds+=t,e.safeSeconds<W.angry.rage.decayDelaySeconds||(e.rage=Math.max(0,e.rage-W.angry.rage.decayPerSecond*r*t)),{overloadExpired:!1})}function Cp(e){let t=W.angry.appearance,n=0;for(let r=1;r<t.length;r++)e>=t[r].minRage&&(n=r);return n}function wp(e){return W.angry.appearance[Cp(e)]}function Tp(e){return wp(e).name}function Ep(e){return wp(e).hudColor}function Dp(){return W.angry.look}function Op(e){return Math.min(1,Math.max(0,e/Math.max(1e-6,W.angry.rage.max)))}function kp(e){let{slamDamageBase:t,slamRageScale:n}=W.angry.charge;return t*(1+n*Op(e))}function Ap(e){return e/G.hitPointVolume|0}function jp(e){return Ap(e)<=0}function Mp(e,t){return Math.min(G.volumeMax,e+t*G.absorbEfficiency)}function Np(e,t=0){let n=1-Math.min(1,Math.max(0,t));return Math.max(0,e-G.hitPointVolume*n)}function Pp(e){return G.bubbleLaneRatio*(.82+.18*e)}function Fp(e){return(e/G.bubbleLaneRatio)**2}function Ip(e){return Math.sqrt(Math.max(0,e))*G.bubbleLaneRatio}function Lp(e,t){let n=Ip(e),r=Pp(t),i=Math.max(1e-4,n/Math.max(1e-4,r))**+G.riseSpeedExponent;return Math.min(G.bubbleRiseMax,Math.max(G.bubbleRiseMin,i))}function Rp(e,t){return 1-Lp(e,t)}function zp(){return W.stages.speedMultiplier.length}function Bp(e){return e>=zp()?null:e===1?W.stages.absorbToStage2:e===2?W.stages.absorbToStage3:null}function Vp(e){let t=W.stages.speedMultiplier[Math.max(0,Math.min(zp()-1,e-1))]??1;return Math.max(W.stages.minSpeedMultiplier,t)}function Hp(){return{stage:1,absorbedInStage:0,neededForNext:Bp(1),speedMultiplier:Vp(1)}}function Up(e){let t=W.stages.appearance,n=t[Math.min(t.length-1,Math.max(0,e-1))];if(!n)throw Error(`stages.appearance has no entry for stage ${e}`);return n}function Wp(e){return Up(e).name}function Gp(e){return Up(e).radius}function Kp(e,t){return Pp(t)*Gp(e)}function qp(e){let t=Bp(e.stage);return t===null?(e.absorbedInStage=Math.min(e.absorbedInStage+1,9999),!1):(e.absorbedInStage+=1,e.absorbedInStage<t?!1:(e.stage+=1,e.absorbedInStage=0,e.neededForNext=Bp(e.stage),e.speedMultiplier=Vp(e.stage),!0))}function Jp(e){return e.stage<=1?!1:(--e.stage,e.absorbedInStage=0,e.neededForNext=Bp(e.stage),e.speedMultiplier=Vp(e.stage),!0)}function Yp(e,t,n){if(e.look===`rage`){let e=wp(n),t=Dp();return{radius:t.radius,inner:t.inner,innerAlpha:t.innerAlpha,rim:e.rim,rimAlpha:t.rimAlpha,rimWidthRatio:t.rimWidthRatio,glow:e.glow,glowOuterAlpha:t.glowOuterAlpha,glowInnerAlpha:t.glowInnerAlpha,glowOuterRadiusRatio:t.glowOuterRadiusRatio,glowInnerRadiusRatio:t.glowInnerRadiusRatio,innerRing:t.innerRing,innerRingAlpha:t.innerRingAlpha,innerRingWidthRatio:t.innerRingWidthRatio,sheen:e.sheen,sheenAlpha:t.sheenAlpha,specular:e.specular,specularAlpha:t.specularAlpha,hudColor:e.hudColor,name:e.name,shake:e.shake,swell:e.swell}}return{...Up(t),shake:0,swell:0}}function Xp(e,t){return e.swell<=0?1:1+e.swell*(.5+.5*Math.sin(t*Math.PI*4))}function Zp(e,t){return e.shake<=0?0:e.shake*(Math.sin(t*37)+.6*Math.sin(t*61))}var Qp={id:`base`,name:`小气泡`,tagline:`枪、成长、还有你的操作 —— 身份等到水里再定`,controls:[`skill`],look:`growthStage`,swallowsHazards:!1,firesBullets:!0,resource:null,hitsToPop:null,growsByAbsorbing:!0},$p=[{id:`devour`,name:`吞噬`,title:`食物链反转`,blurb:`吃掉一切，越大越强 —— 代价是越来越难躲`,controls:[`skill`,`suction`],look:`growthStage`,swallowsHazards:!0,resource:null},{id:`boil`,name:`沸腾`,title:`以怒为刃`,blurb:`越挨打越烫，把怒气撞出去 —— 怒气不看体积`,controls:[`skill`,`charge`,`burst`],look:`rage`,swallowsHazards:!1,resource:{label:`怒气`}},{id:`barrage`,name:`弹幕`,title:`火力压制`,blurb:`小泡泡又快又密，答案全在水里 —— 枪管立刻 +1`,controls:[`skill`],look:`growthStage`,swallowsHazards:!1,resource:null}];function em(e){return $p.find(t=>t.id===e)}function tm(e){return{...Qp,id:e.id,name:e.name,tagline:e.blurb,controls:e.controls,look:e.look,swallowsHazards:e.swallowsHazards,resource:e.resource}}function nm(){return Qp}function rm(e,t){return e.controls.includes(t)}function im(e,t){return e.controls.includes(t)}function am(e,t){e.push({kind:`banner`,text:t})}function om(e,t,n=.5){e.push({kind:`sound`,event:t,intensity:n})}function sm(e,t,n,r){e.push({kind:`scorePopup`,x:t,y:n,points:r})}function cm(e,t,n,r){e.push({kind:`damagePopup`,x:t,y:n,amount:r})}function lm(e,t,n){e.push({kind:`graze`,x:t,y:n})}function um(e,t,n,r){e.push({kind:`callout`,x:t,y:n,text:r})}function dm(e,t){e.push({kind:`skillSlot`,carried:t})}function fm(e,t,n,r){e.push({kind:`blast`,x:t,y:n,radius:r})}function pm(e){e.push({kind:`splash`})}function mm(e){e.push({kind:`results`})}var hm=[{id:`dash`,name:`冲刺`,blurb:`短时间大幅加速上升`,get uses(){return W.skills.dash.uses},get durationSeconds(){return W.skills.dash.durationSeconds}},{id:`decoy`,name:`诱饵泡`,blurb:`扔出假气泡，吸走附近所有的鱼`,get uses(){return W.skills.decoy.uses},get durationSeconds(){return W.skills.decoy.durationSeconds}},{id:`vortex`,name:`漩涡`,blurb:`把周围的气泡吸向你`,get uses(){return W.skills.vortex.uses},get durationSeconds(){return W.skills.vortex.durationSeconds}},{id:`stink`,name:`臭云`,blurb:`一片区域推开垃圾与水母，并解除减速`,get uses(){return W.skills.stink.uses},get durationSeconds(){return W.skills.stink.durationSeconds}},{id:`shell`,name:`硬壳`,blurb:`无敌并撞开一切`,get uses(){return W.skills.shell.uses},get durationSeconds(){return W.skills.shell.durationSeconds}},{id:`burst`,name:`爆散`,blurb:`以你为中心向外爆开`,get uses(){return W.skills.burst.uses},get durationSeconds(){return W.skills.burst.durationSeconds}}];function gm(e){let t=hm.find(t=>t.id===e);if(!t)throw Error(`unknown skill: ${e}`);return t}function _m(e){switch(e){case`dash`:return{id:e,ascentMultiplier:W.skills.dash.ascentMultiplier};case`decoy`:return{id:e,decoyRadius:W.skills.decoy.decoyRadiusMeters,decoySeconds:W.skills.decoy.decoySeconds};case`vortex`:return{id:e,vortexRadius:W.skills.vortex.vortexRadiusMeters,vortexSeconds:W.skills.vortex.durationSeconds};case`stink`:return{id:e,pushRadius:W.skills.stink.stinkRadiusMeters,pushKinds:[`trash`,`jelly`],clearsSlow:!0};case`shell`:return{id:e,invulnerableSeconds:W.skills.shell.invulnerableSeconds,pushRadius:W.skills.shell.shellRadiusMeters,pushKinds:[`fish`,`jelly`,`trash`,`crab`]};case`burst`:return{id:e,pushRadius:W.skills.burst.burstRadiusMeters,pushKinds:[`fish`,`jelly`,`trash`,`crab`]}}}function vm(e){if(!e.carried||e.carried.uses<=0)return null;let t=gm(e.carried.id),n=_m(t.id),r=e.laneWidth,i=e.player.x*r,a=0,o=null;if(t.durationSeconds>0&&(e.player.skillRemaining=t.durationSeconds,e.player.skillId=t.id),n.ascentMultiplier&&(e.player.skillAscentBonus=n.ascentMultiplier),n.invulnerableSeconds&&(a=Math.max(a,n.invulnerableSeconds)),n.clearsSlow){e.player.slowRemaining=0,e.player.slowFactor=1;for(let t of e.hazards.hazards)t.gripping=!1}if(n.pushRadius&&n.pushKinds){let t=n.pushRadius;for(let r of e.hazards.hazards){if(!n.pushKinds.includes(r.kind))continue;let a=r.x-i,o=r.y-e.player.y,s=Math.hypot(a,o);if(s>t)continue;if(s<.001){r.y+=t;continue}let c=(t-s)/t;r.x+=a/s*c*t*.6,r.y+=o/s*c*t*.6}}if(n.vortexRadius&&n.vortexSeconds){let t=n.vortexRadius;for(let r of e.bubbles){let a=i-r.x,o=e.player.y-r.y,s=Math.hypot(a,o);if(s>t||s<.001)continue;let c=Math.min(1,W.skills.vortex.vortexPullPerSecond*n.vortexSeconds/Math.max(1,s/t));r.x+=a*c*.35,r.y+=o*c*.35}}if(n.decoyRadius&&n.decoySeconds){let t=n.decoyRadius,r=e.player.y+t*.35;for(let a of e.hazards.hazards)a.kind===`fish`&&(Math.hypot(a.x-i,a.y-e.player.y)>t||(a.baitedUntil=e.elapsed+n.decoySeconds,a.y=Math.min(a.y,r)));o={x:i,y:r,until:e.elapsed+n.decoySeconds}}return--e.carried.uses,om(e.events,`skill`),{invulnerableSeconds:a,decoy:o,usesLeft:e.carried.uses}}var ym=[{id:`fish-fart`,name:`鱼屁泡`,blurb:`被鱼碰到会自动放屁，把周围的鱼冲开`,upside:`碰到鱼时震开周围的小鱼`,downside:`屁本身是气泡，会喂鱼让它们分裂`},{id:`soda`,name:`汽水泡`,blurb:`上升更快、横向更飘——更快，也更难控`,upside:`上升速度 +25%`,downside:`横向惯性更大，尾迹气泡也在喂鱼`},{id:`silt`,name:`深海淤泥泡`,blurb:`出生就更结实，但块头大也更容易被盯上`,upside:`出生体积 ×1.3，受击缩小减少 40%`,downside:`体积大更容易被鱼和水母优先锁定`}];function bm(e){switch(e.id){case`soda`:return{talent:e,ascentMultiplier:W.talents.soda.ascentMultiplier,steerMultiplier:W.talents.soda.steerPenalty,startVolume:1,shrinkResistance:0};case`silt`:return{talent:e,ascentMultiplier:1,steerMultiplier:1,startVolume:W.talents.silt.startVolume,shrinkResistance:W.talents.silt.shrinkResistance};default:return{talent:e,ascentMultiplier:1,steerMultiplier:1,startVolume:1,shrinkResistance:0}}}function xm(e=Math.random){return ym[Math.floor(e()*ym.length)]??ym[0]}function Sm(e){return+(e===`fish`)}function Cm(){return W.talents[`fish-fart`].baitCount}var wm=[{id:`enemy`,label:`敌人`},{id:`environment`,label:`环境`},{id:`bubble`,label:`气泡与路线`},{id:`skill`,label:`技能`},{id:`talent`,label:`天赋`}],Tm=e=>`${Math.round(e*100)}%`,$=(e,t=2)=>e.toFixed(t),Em=[{kind:`fish`,tagline:`追着你跑，还会吃气泡分裂`,notes:[`感知半径随你的体积增长——你越大，越远的鱼会来追你。`,`这是唯一能让数量指数增长的规则：一条鱼吃够气泡就分裂成两条。`,`所以"天赋的反噬"是真的：你的保命手段同时在喂它们。`]},{kind:`jelly`,tagline:`碰到就减速 + 掉血，而且它会蓄势冲锋`,notes:[`碰到它既**减速**又**掉血**：只有减速的话，碰到水母比碰到鱼更划算，而一只又慢又躲不开的漂浮物绝不能是这样。`,`惩罚是关于"气泡在哪"的，所以减速画在气泡身上，不在状态栏里。`,`它的冲锋从**自己当前的位置**起跳，弧线是它"从侧面扫过来"的全部来源——不再先走到某个位置再跳。`,`它优先追最大的气泡——强者先被针对。`]},{kind:`trash`,tagline:`吸住你并持续拖血`,notes:[`主动操作（挣扎）达到最短时间后可以挣脱，挣脱时它自己破掉。`,`它盯上的也是最大的那个气泡。`]},{kind:`crab`,tagline:`预兆后把你向上弹射`,notes:[`唯一可能有利的危险物：它把你往上送。预兆弧线是它公平的全部依据，所以它进入距离才开始布防。`,`被弹飞后它自己四脚朝天挣扎，然后消失。`]},{kind:`bombfish`,tagline:`追着你过来的定时炸弹：打爆它，炸弹就在原地炸`,notes:[`在外面它会朝你的气泡靠近，进入距离就点燃引信、开始倒计时（头上会套一圈越来越紧的环，那就是倒计时）。`,`**打爆它不等于拆弹**：血打空它就在**原地**炸开，所以远距离打爆是唯一安全的拆法，贴脸打爆等于自爆。`,`吞得动它的时候贴脸吃下，体积、分数与突变经验立即到账——吞是即时的，没有库存，也没有为你暂停的引信。`]},{kind:`boss`,tagline:`每关的终点：不打掉它，这一关就不会结束`,notes:[`它**不随水流走**：它一直悬在你上方横向游弋，所以你跑不掉，只能打——或者死。`,`它的血量、名字和颜色是**关卡**给的（每关一只，各不相同），怎么动和怎么开枪是共享机制。`,`打它是在**倒计时**：它的血量就是这一关的进度条（屏幕顶部那条）。`]},{kind:`urchin`,tagline:`会放尖刺的硬壳：打得跑，但要十几发`,notes:[`它现在会**朝你发射尖刺**——比其它敌人的子弹都快，所以它的威胁是"远处也得躲"，不是"别碰"。`,`血量给到 15：这是全游戏最厚的一只，打跑它的代价是时间，而时间是这局里最贵的东西。`,`吃下去就一直放血直到它离开：它的账单按时间算，所以带着它压缩是最糟的选择（压缩期间受伤翻倍）。`,`质量给得比水母还重，弹药也硬——否则没有人会有理由碰它。`]},{kind:`eel`,tagline:`被电到的那几秒，左右是反的`,notes:[`全游戏唯一夺走操作的机制，所以它必须看得见：被电时气泡外面套一圈锯齿状的电光。`,`只反横向。纵向也反过来会让人以为是关卡坏了，而不是气泡被电了。`,`**两条路都会电到你**：吞下去（每 2.4 秒一下，节奏固定），或者被它射出来的电箭打中（一下 0.5 秒，取决于你躲不躲得开）。所以它开火时身上那片电弧不只是动画，那是你要付的代价。`,`它游一条明显的 S 形——这是"可以提前读出来"的全部依据。`]},{kind:`angler`,tagline:`深海鱼：触角发光，看准了才冲锋`,notes:[`它的发光触角是这一关唯一的光源——**那个亮点在告诉你它在哪里**，也在告诉你它看得见你。`,`血量比小鱼小虾厚得多（见上面的血量），所以不要指望随手几发就赶走它：它是要被"处理"的敌人，不是路过的杂兵。`,`冲锋走的是和别的冲锋者一样的固定曲线：它从**当前所在位置**起跳、弧线是"从侧面扫过来"的全部来源，所以看到征兆就往弧线的外侧走。`]},{kind:`torpedo`,tagline:`直线冲刺，被打中就当场炸开`,notes:[`它的路径是直的，所以躲它靠的是**提前横移**，而不是等它靠近。`,`打爆它在原地炸——距离太近等于自己踩上去。`]},{kind:`zapper`,tagline:`被打中会放电，电环会连累近处的水母`,notes:[`打它是要付代价的：那圈电是你开火换来的。`,`它周围的同类会被一起带进电环里——所以它既可能是麻烦，也可能是机会。`]},{kind:`foam`,tagline:`打不掉的泡沫：可以穿过，但会挡视线`,notes:[`它不吃子弹，绕开就行——**在这里花时间是唯一真正的损失**。`]},{kind:`rain`,tagline:`从上往下压的水流：把你按回去`,notes:[`它不造成接触伤害，但会**持续把你往下压**——上升的节奏被打断就是它的作用。`]},{kind:`archer`,tagline:`射水鱼：会开枪的日常款——打得跑`,notes:[`它是**电鳗的对照**：电鳗打不死（0 血），它是几发就跑（3 血）——"会开枪的东西也可以被赶走"是它的第一课。`,`慢节奏、中速直线弹，第一发永远瞄的是**开火那一刻的你**，之后不再修正，所以看得懂也躲得开。`,`随水流漂着下坠，一路扫过你的泳道：它不追你，它的弹幕替它追。`]},{kind:`pistol`,tagline:`手枪虾：一发电化弹，半管血`,notes:[`**全表最快、最大、最重的一发**：约 2.6 倍弹径，命中一次扣 **2 个命中点**——这一发不是被打一下，是被打两下。`,`射速极慢（约 3 秒一发）：稀疏、快、狠，看到它抬螯就该挪了。`,`10 点血的精英，值得你花火力——但它的弹比你的快，隔着泳道对射是它赢。`]},{kind:`puffer`,tagline:`刺魨：打它一下，吃它一圈刺`,notes:[`它**从不主动开火**——它的刺什么时候出，取决于你什么时候打它：每受一次击，向四周炸一圈 9 根刺。`,`反击有 **1.2 秒冷却**（冷却期间它瘪下去、刺也暗了）：打一发、吃一圈、在窗口里再打——射击它是**节奏**，不是反射。`,`6 点血：硬，但不是硬到不值得。贴太近打它，刺圈几乎必中；隔着一个刺圈的宽度打，它就只是个会还嘴的肉靶。`]},{kind:`starfish`,tagline:`海星：不瞄人的旋转星形弹幕`,notes:[`每轮 5 向齐射、每轮整体转 36°（两轮补满整星）——**它的五条臂就是下一轮的方向**，站在臂与臂的缝里就永远有活路。`,`它不瞄人：弹幕是固定角度的星形，所以"读它"替代了"躲它"——站着不动是死，一直动就永远有缝。`,`每 2.5 秒一轮，4 点血：读懂它的人几发就能让它闭嘴。`]},{kind:`shrimp`,tagline:`盲虾：随水流漂，不会追你`,notes:[`它没有感官，所以不会因为你变大而过来——**第一关里唯一可以放心忽略的活物**。`,`它仍然是会动的食物：吃下去算体积，但**不提供任何额外收益**，所以饿了就吃，不饿就让开。`,`数量多、体型小，是"随手吃两口"的来源；真正要躲的东西从来不是它。`]},{kind:`dolphin`,tagline:`海豚：四个猎食者里唯一可以吃的那一个`,notes:[`**只有 3 点血，和一条小鱼一样薄**，第 3 档就能吞下去——所以它不是威胁，是这一关先发给你的一次胜利。`,`它也是四个里最快的（前摇 0.55 秒、冷却 1.8 秒）：追得紧，但追上了也不致命。`,`一关全是啃不动的东西，玩家记住的就只有"躲"。它是这一关的第一课：**这里的东西可以很大，而大的也可以是食物**。`]},{kind:`octopus`,tagline:`章鱼：这一关最懒的那个猎食者`,notes:[`前摇 0.9 秒、冷却 2.6 秒，是四个里最容易看穿的——**它的作用是让另外三个显得快**。`,`体型和大白鲨一样（radius 0.07），但它是软体：怒火爆发推得动它、清不掉，喷出去的分量也按软体算。`,`它是唯一"可以忽略一会儿"的东西——而"哪个可以忽略"本身也是这一关要你做的判断。`]},{kind:`shark`,tagline:`大白鲨：前摇 0.6 秒、冲刺 0.4 秒，这一关的招牌`,notes:[`它是四个里最"已经决定了"的那个：从摆架势到撞上来只有 1 秒。**这 1 秒就是它全部的公平性。**`,`6 点血、第 4 档才吞得下——遇到它就得先决定是打还是绕，因为它不给你第三个选项。`,`它排在 900m 才登场：到那时玩家已经见过鱼群、也被温跃层逼着换过高度，知道"大"在这个游戏里是什么意思了。`]},{kind:`whale`,tagline:`座头鲸：全场最大、最厚、也最慢的一个`,notes:[`**8 点血、画出来 154px 宽**，是游戏里最大的东西。但它前摇 1.1 秒——大到这个程度，慢就是它给你的礼貌。`,`它一次只来一只。屏幕被占住就是它的机制，所以它放在收尾段：刚躲完一串快的东西，慢的才最压人。`,`第 4 档才吞得下，而吃下去值 0.6 质量——全场最重的一口。`]}];function Dm(e,t,n){let r=W.consumption.edibleAtTier[e]??0,i=W.consumption.mass[e]??0,a=[],o=W.charges.chargers[e];if(o){let e=o.approach===`side`?`从侧面横扫过来`:`按一条固定曲线撞过来`;a.push(`冲锋：进入 ${$(o.triggerMeters,0)}m 蓄势 ${$(o.telegraphSeconds,2)}s，${e}`)}if(e===`bombfish`){let e=W.hazards.bombfish;a.push(`追踪：${$(e.seekSpeedFactor,2)} 泳道/秒朝你靠近 · 进入 ${$(e.armMeters,0)}m 点燃引信 ${$(e.fuseSeconds,1)}s · 爆炸半径 ${$(e.blastRadiusRatio*100,0)}% 泳道`),a.push(`打爆它 = 原地爆炸（远距离打爆才安全）`)}let s=W.enemyBullets.shooters[e];if(s){let e=`${$(s.speedPerSecond,2)} 泳道/秒`;a.push(s.spread>1?`开火：每秒 ${$(s.perSecond,2)} 组扇形 ${s.spread} 发 · ${e}`:`开火：每秒 ${$(s.perSecond,2)} 发 · ${e}`)}return{id:`enemy:${e}`,category:`enemy`,name:Om[e],tagline:t,facts:[{label:`可吞`,value:`第 ${r} 档 · 体积 ≥ ${$(W.consumption.tierVolume[r-1]??0,1)}`},{label:`质量`,value:$(i)},{label:`打跑`,value:(W.hazards.health[e]??0)>0?`${W.hazards.health[e]} 发小泡泡（打空就跑，不会死）`:`打不跑：子弹直接穿过去`},...a.length?[{label:`攻击方式`,value:a.join(`；`)}]:[]],notes:n,icon:{kind:`hazard`,hazard:e}}}var Om={fish:`小鱼`,tuna:`金枪鱼`,whale:`座头鲸`,dolphin:`海豚`,shark:`大白鲨`,octopus:`章鱼`,jelly:`水母`,trash:`垃圾袋`,crab:`螃蟹`,bombfish:`炸弹鱼`,urchin:`海胆`,eel:`电鳗`,boss:`BOSS`,vent:`热液喷口`,mineral:`矿物颗粒`,shrimp:`盲眼虾`,angler:`灯笼鱼`,torpedo:`失控鱼雷`,zapper:`电击水母`,foam:`碎浪泡沫`,rain:`雨滴冲击`,archer:`射水鱼`,pistol:`手枪虾`,puffer:`刺魨`,starfish:`海星`},km=[{id:`env:bubble`,category:`environment`,name:`收集物（气泡）`,tagline:`你的食物，也是你要躲的东西`,facts:[{label:`体积`,value:`按半径的平方算，所以大泡泡一颗顶好几颗`},{label:`上升`,value:`越大升得越快（浮力随体积、阻力随截面积）`},{label:`吸食`,value:`玩家半径 ≥ 它的 92% 才能吃`}],notes:[`它相对你的屏幕速度 = 你的上升速度 - 它自己的上升速度，所以往下飘的是能吃的，往上跑的是吃不动的——这条不需要任何 UI。`,`大泡泡比你还快，会跑到视野下方去；在那里回收等于一直删掉最大的那些。`],icon:{kind:`glyph`,glyph:`collectable`}},{id:`env:crate`,category:`environment`,name:tu.crate,tagline:`可以直接撞碎，也可以绕`,facts:[{label:`耐久`,value:`${$(W.obstacles.health.crate??0,1)} 点`},{label:`撞碎`,value:`体积 ≥ ${$(W.obstacles.ramVolumeThreshold,1)} 才撞得动`}],notes:[`够大就一头穿过去：这是大体积的奖励。`,`撞不碎的时候，被挡住并挨一下。`],icon:{kind:`obstacle`,obstacle:`crate`}},{id:`env:coral`,category:`environment`,name:tu.coral,tagline:`撞不碎，只能绕——或者变小穿过去`,facts:[{label:`耐久`,value:`${$(W.obstacles.health.coral??0,1)} 点`},{label:`最小缺口`,value:`${Tm(W.obstacles.minGapFraction)} 泳道宽`}],notes:[`珊瑚硬得多，所以它逼你变小或走缝，而木箱奖励你变大。两种答案放在一起，选择才是真的。`,`每一排都保证留出"玩家最小时也能通过"的缺口——这不是体贴，而是让"变小"成为选择而不是必需。`],icon:{kind:`obstacle`,obstacle:`coral`}},{id:`env:mutation`,category:`environment`,name:`突变`,tagline:`攒满突变值，冻结三选一`,facts:[{label:`来源`,value:`随时间 ${$(W.mutation.autoPerSecond,1)}/秒  ·  打跑/吞噬 ${W.mutation.gain.drivenOff}  ·  子弹擦边 ${W.mutation.gain.bulletGraze}  ·  贴脸 ${W.mutation.gain.pointBlank}  ·  拆弹 ${W.mutation.gain.defuse}  ·  擦边 ${W.mutation.gain.graze}  ·  BOSS ${W.mutation.gain.boss}`},{label:`首级`,value:`${W.mutation.first} 点，每级 ×${W.mutation.growth}`},{label:`持续`,value:`跨关保留，死亡清零`}],notes:[`擦边是**过点判定**：冲锋的怪不再朝你过来、又还在接触半径 2 倍的圈内才算——冲着脸来的全程不判，躲开它、它擦身而过的那一帧到账。`,`碰到过你的冲锋永不判擦边（挨过一下的冲锋什么也不欠你）；一次冲锋只算一次。`,`擦边的瞬间整个世界慢放半秒——后怕节拍：怪已经过去了，世界慢下来让你看清刚才发生了什么。`,`三条小技巧同构：子弹擦边（电鳗的闪电擦身、小字「擦」）、贴脸（接触圈内枪毙、小字「贴脸」）、拆弹（爆炸半径外打死炸弹鱼、小字「拆弹」）——都不慢动作。`,`三种来源刻意拉开速率：挂机最慢、战斗居中、玩命最快——想快，就把脸凑过去。`,`枪管、射速和技能都在这里出：地图上不再有任何可拾取的道具，一切成长都走突变。`],icon:{kind:`glyph`,glyph:`stages`}}],Am={skill:`技能`,suction:`吸附`,spit:`喷吐`,compress:`消化`,charge:`蓄力冲撞`,burst:`怒气爆破`},jm={tagline:`每局的开局形态：枪、成长、你的操作`,glyph:`player`,notes:[`它有技能钮（技能是突变给的道具，不是气泡的能力）、有枪、会因吸收而成长，体积就是血量——这是所有形态共享的地基。`,`它没有吸附、不能吞危险物、没有怒气：这些是路线的事，而路线是第一次升级时的三选一，在水里选。`,`血量按体积算：一次受击固定扣一点，吃得越多越能挨，也越难躲——"要不要继续吃"从第一颗泡泡起就是真取舍。`]},Mm={devour:{glyph:`suction`,notes:[`选它的那一刻：吸附按钮出现（技能钮的按住形态），贴脸碰到吞得动的危险物直接吃下——体积、分数、突变经验立即到账，外加短暂无敌。`,`吸附只负责拉近，不负责吃：把吃不了的螃蟹吸过来，等于加速把危险物拉到脸上。两重代价合起来，"什么时候按住"才是决定。`,`专属卡：吸取范围、吞噬无敌、大胃口（比体积说的话多吃一档）。本局另外两条路线的卡永不再出。`]},boil:{glyph:`boil`,notes:[`选它的那一刻：怒气槽出现（空槽起步），蓄力冲撞与爆破按钮到位，配色换成怒气阶段——气泡的颜色从此在说"我有多烫"。`,`怒气只从"挨打但没破"来；冲撞的破坏力只看怒气不看体积，所以残血反打是可行的。满怒不是终点，是一段倒计时（失控）。`,`专属卡：怒气积攒、爆破半径、余温（怒气衰减更慢）。本局另外两条路线的卡永不再出。`]},barrage:{glyph:`stages`,notes:[`选它的那一刻：枪管 +1 立刻到账。没有新按钮——这条路线的动词就是基础气泡已有的那把枪，只是更深。`,`专属卡：弹速、大弹丸（判定和画面同一个数）、射程。它们只在这条路线的池里出现。`,`通用枪卡（枪管/射速/伤害）人人可抽：枪是每个形态的基础武器，这条路线赢在把它堆得更狠。`]}};function Nm(e){let t=[{label:`按钮`,value:tm(e).controls.map(e=>Am[e]).join(` · `)}],n=W.mutation.pool;return e.id===`devour`?t.push({label:`可吞档位`,value:`体积档位 ≥ ${W.consumption.edibleAtTier.fish} 起能吃鱼；大胃口每张 +1 档`},{label:`吃下到账`,value:`质量 ×${$(W.consumption.massEfficiency)} · 无敌 ${$(W.consumption.eatInvulnerableSeconds,2)}s`},{label:`专属卡`,value:`吸取范围 +${Math.round(n.suctionPerPick*100)}% · 吞噬无敌 +${$(n.eatInvulnSecondsPerPick,1)}s · 大胃口 +${n.appetiteTiersPerPick} 档`}):e.id===`boil`?t.push({label:`怒气`,value:`受伤 +${W.angry.rage.perHit} · 安全 ${$(W.angry.rage.decayDelaySeconds,1)}s 后每秒 -${W.angry.rage.decayPerSecond}`},{label:`失控`,value:`满怒 ${$(W.angry.overload.seconds,1)}s 倒计时，不放掉扣 ${W.angry.overload.punishHits} 点但不破`},{label:`专属卡`,value:`怒气积攒 +${Math.round(n.ragePerPick*100)}% · 爆破半径 +${Math.round(n.burstRadiusPerPick*100)}% · 余温 -${Math.round(n.rageDecayReductionPerPick*100)}% 衰减`}):t.push({label:`立刻到账`,value:`枪管 +1（上限 ${W.bullets.maxStreams} 排）`},{label:`专属卡`,value:`弹速 +${Math.round(n.bulletSpeedPerPick*100)}% · 大弹丸 +${Math.round(n.bulletRadiusPerPick*100)}% · 射程 +${Math.round(n.bulletRangePerPick*100)}%`},{label:`通用枪卡`,value:`枪管 / 射速 / 伤害：所有形态都能抽到`}),t}function Pm(){return[{label:`按钮`,value:Qp.controls.map(e=>Am[e]).join(` · `)},{label:`吞噬`,value:`没有：碰到敌人不会被吞掉，而是挨打——吃是路线的事`},{label:`颜色`,value:`随成长阶段：${W.stages.appearance.map(e=>e.name).join(` → `)}`},{label:`成长`,value:`吸收 ${W.stages.absorbToStage2} / ${W.stages.absorbToStage3} 颗晋升 · 速度 ${W.stages.speedMultiplier.map(e=>`×${$(e)}`).join(` → `)}`},{label:`开局体积`,value:$(W.volume.start,1)},{label:`上限`,value:$(W.volume.max,1)},{label:`一次受击`,value:`-${$(W.volume.hitCost,1)}（固定值，与当前体积无关）`},{label:`无敌时间`,value:`${$(W.hazards.invulnerableSeconds,1)}s`}]}function Fm(){let e=[{id:`bubble:${Qp.id}`,category:`bubble`,type:Qp.id,name:Qp.name,tagline:jm.tagline,facts:Pm(),notes:jm.notes,icon:{kind:`glyph`,glyph:jm.glyph}}];for(let t of $p){let n=Mm[t.id];if(!n)throw Error(`codex: no prose for route "${t.id}" -- add it to ROUTE_PROSE`);e.push({id:`bubble:${t.id}`,category:`bubble`,type:t.id,name:`路线 · ${t.name}`,tagline:`${t.title}——${t.blurb}`,facts:Nm(t),notes:n.notes,icon:{kind:`glyph`,glyph:n.glyph}})}return e}function Im(e){let t=hm.find(t=>t.id===e);if(!t)throw Error(`codex: unknown skill ${e}`);let n=_m(e),r=[{label:`次数`,value:`${t.uses} 次`},{label:`持续`,value:t.durationSeconds>0?`${$(t.durationSeconds,1)}s`:`瞬间`}];return n.ascentMultiplier&&r.push({label:`上升`,value:`×${$(n.ascentMultiplier)}`}),n.vortexRadius&&r.push({label:`半径`,value:`${n.vortexRadius} m`}),n.decoyRadius&&r.push({label:`半径`,value:`${n.decoyRadius} m`}),n.pushRadius&&r.push({label:`推开半径`,value:`${n.pushRadius} m`}),n.invulnerableSeconds&&r.push({label:`无敌`,value:`${$(n.invulnerableSeconds,1)}s`}),n.clearsSlow&&r.push({label:`附带`,value:`解除减速与抓取`}),{id:`skill:${e}`,category:`skill`,name:t.name,tagline:t.blurb,facts:r,notes:Lm[e],icon:{kind:`glyph`,glyph:e}}}var Lm={dash:[`最通用的一条：逃出包围、抢进度、或者单纯从一条追上来的鱼手里跑掉。`],decoy:[`唯一能"清场"的技能：它不是杀死鱼，而是让它们转向。`,`用来换一口气，不是用来解决问题——鱼还在。`],vortex:[`快速变大的捷径。注意变大本身就招灾：鱼从更远处就会来追你。`],stink:[`专治"被拖拽"和"被减速"这两个拿走你控制权的麻烦。`,`它只推垃圾与水母，所以它和诱饵泡不重复。`],shell:[`危机保命键：无敌并撞开一切，但不删除任何东西。`,`一个会删除危险的壳会是严格更好的爆散，而爆散才是该稀缺的那个。`],burst:[`终局爆发的答案：以你为中心向外推开一切。`,`同样是推开而不是清掉——直接删除实体，会让终局的密度变得没有意义。`]};function Rm(e){let t=ym.find(t=>t.id===e);if(!t)throw Error(`codex: unknown talent ${e}`);return{id:`talent:${e}`,category:`talent`,name:t.name,tagline:t.blurb,facts:[{label:`收益`,value:t.upside},{label:`反噬`,value:t.downside}],notes:zm[e],icon:{kind:`glyph`,glyph:e}}}var zm={"fish-fart":[`它是反射不是技能：被打到才触发，所以没法主动用。`,`冷却就是它和"护盾"的区别——没有冷却的话，走进鱼群里就永远不会死。`],soda:[`上升 ×${$(W.talents.soda.ascentMultiplier)}，横向操控 ×${$(W.talents.soda.steerPenalty)}。`,`更快，也更难控——这是同一个设计里的两个方向，不是一笔好交易。`],silt:[`出生体积 ×${$(W.talents.silt.startVolume,1)}，受击缩小减免 ${Tm(W.talents.silt.shrinkResistance)}。`,`一开始就更结实，但块头大也更容易被优先锁定。`]};function Bm(){return[...Em.map(e=>Dm(e.kind,e.tagline,e.notes)),...km,...Fm(),...hm.map(e=>Im(e.id)),...ym.map(e=>Rm(e.id))]}function Vm(e){return Bm().filter(t=>t.category===e)}function Hm(e,t){return Math.max(1,Math.ceil(Vm(e).length/Math.max(1,t)))}function Um(e,t,n){let r=Vm(e),i=Math.max(0,t)*Math.max(1,n);return r.slice(i,i+Math.max(1,n))}function Wm(e){switch(e.icon.kind){case`hazard`:return Q[e.icon.hazard].colour;case`obstacle`:return e.icon.obstacle===`crate`?W.obstacles.crateColor:W.obstacles.coralColor}switch(e.category){case`skill`:return W.codex.skillColour;case`talent`:return W.codex.talentColour;case`environment`:return W.codex.collectableColour;default:return e.type===`boil`?W.angry.appearance[0]?.hudColor??W.codex.collectableColour:W.stages.appearance[0]?.hudColor??W.codex.collectableColour}}function Gm(e){return{build:{version:$u,hash:ed,dirty:!1,label:td()},codex:{open:e.phase===`codex`,category:e.codex.state.category,page:e.codex.state.page,pages:e.codex.state.pages,total:e.codex.state.total,visible:e.codex.state.visible,entries:Object.fromEntries(wm.map(e=>[e.id,Vm(e.id).length])),entryIds:Bm().map(e=>e.id),gameHazards:Object.keys(Q),gameSkills:hm.map(e=>e.id),gameTalents:ym.map(e=>e.id),gameRoutes:[Qp.id,...$p.map(e=>e.id)]},frames:e.frameCount,elapsed:e.elapsed,intro:e.phaseTimer,lastDelta:e.lastDelta,nominalSeconds:e.nominalSeconds,level:{id:Y.id,name:Y.name,scrollLength:Y.scrollLength,scrollSpeed:Y.scrollSpeed,scrolled:+e.scrolled.toFixed(2),entriesEmitted:e.timelineEmitted,entriesTotal:Wu.length,blocks:Ku().length,arrivals:{...e.spawnedBySide},installed:Wu!==Y.entries,ladder:e.progress.entries(),cleared:[...e.progress.cleared],selected:e.progress.selected,secondsPerScreen:Yu(Y).map(e=>+e.toFixed(1))},playerVx:+e.player.vx.toFixed(4),playerVy:+e.player.vy.toFixed(2),bannerAlpha:e.finishBanner.alpha,bannerSeen:e.bannerSeen,lateral:e.lateral,laneWidthMeters:e.camera.viewport.laneWidthMeters,visibleDepthMeters:e.camera.viewport.visibleDepthMeters,gameSeconds:e.elapsed,hazards:{active:e.hazards.hazards.length,leaving:e.hazards.hazards.filter(e=>e.flee).length,charges:e.hazards.charges,byKind:e.hazards.hazards.reduce((e,t)=>(e[t.kind]=(e[t.kind]??0)+1,e),{}),comedyBeats:e.comedyBeats,lastBeat:e.lastComedyBeat,grabs:e.hazards.grabs,baits:e.hazards.baits,eaten:e.hazards.eaten,fled:e.hazards.fled,damaged:e.hazards.damaged},suction:{held:e.suctionUp,radiusFraction:gd(e.player.volume),moveFactor:e.player.suctionMoveFactor},bullets:{inFlight:e.bullets.bullets.length,fired:e.bullets.fired,hits:e.bullets.hits,armed:e.bubbleType.firesBullets,gunStreams:e.gunStreams},misfire:{remaining:+e.player.misfireSeconds.toFixed(3),inverted:e.player.misfiring},obstacles:{active:e.obstacles.count,byKind:e.obstacles.obstacles.reduce((e,t)=>(e[t.kind]=(e[t.kind]??0)+1,e),{}),broken:e.obstacles.broken,ramThreshold:W.obstacles.ramVolumeThreshold,minGap:W.obstacles.minGapFraction},trashDrain:+e.trashDrain.toFixed(3),maxGripSeconds:+e.hazards.hazards.reduce((e,t)=>Math.max(e,t.gripSeconds),0).toFixed(2),slow:{remaining:+e.player.slowRemaining.toFixed(3),factor:e.player.slowFactor,impulseVy:+e.player.impulseVy.toFixed(2)},talent:{id:e.talentEffects.talent.id,name:e.talentEffects.talent.name,ascentMultiplier:e.talentEffects.ascentMultiplier,steerMultiplier:e.talentEffects.steerMultiplier,startVolume:e.talentEffects.startVolume,shrinkResistance:e.talentEffects.shrinkResistance},skill:e.skill?{id:e.skill.id,uses:e.skill.uses}:null,skillActivations:e.skillActivations,farts:e.farts,emergence:{fishSplits:e.hazards.splits,bubblesEatenByFish:e.hazards.bubblesEaten,fishCount:e.hazards.hazards.filter(e=>e.kind===`fish`).length,perceptionRadiusMeters:+e.hazards.perceptionRadius(e.player.volume).toFixed(1)},events:{seen:e.eventsSeen,fired:[...e.eventsFired],last:e.lastEvent},audio:{muted:e.audioMuted,running:mp.isRunning},ending:{surfaced:e.surfaced,splash:+e.splash.toFixed(3),bestClimbed:Math.round(e.bestClimbed),bestVolume:+e.bestVolume.toFixed(2),bestScore:e.bestScore},score:{value:e.score.value,best:e.bestScore,byEvent:{...e.score.ledger},popups:e.popups.count},mutation:{value:+e.xp.value.toFixed(1),need:e.xp.need,level:e.xp.level,pending:e.xp.pending,grazes:e.hazards.grazes,ledger:{...e.xp.ledger}},damagePopups:e.damagePopups.count,enemyBullets:{inFlight:e.enemyBullets.count,fired:e.enemyBullets.fired,hits:e.enemyBullets.hits},activeSkill:e.player.skillId?{id:e.player.skillId,remaining:+e.player.skillRemaining.toFixed(2)}:null,stage:{stage:e.stage.stage,name:Wp(e.stage.stage),absorbedInStage:e.stage.absorbedInStage,grows:e.bubbleType.growsByAbsorbing,neededForNext:e.stage.neededForNext,speedMultiplier:e.stage.speedMultiplier,appearance:Yp(e.bubbleType,e.stage.stage,e.rage.rage),radiusFraction:Kp(e.stage.stage,e.player.volume)},bubbleType:{id:e.bubbleType.id,name:e.bubbleType.name,controls:[...e.bubbleType.controls],hasSuction:rm(e.bubbleType,`suction`),hasCharge:rm(e.bubbleType,`charge`),hasBurst:rm(e.bubbleType,`burst`),swallowsHazards:e.bubbleType.swallowsHazards,hitsToPop:e.bubbleType.hitsToPop},route:e.route,rage:{value:+e.rage.rage.toFixed(2),fraction:+Op(e.rage.rage).toFixed(3),safeSeconds:+e.rage.safeSeconds.toFixed(2),charging:e.charging,aiming:{x:+e.chargeAim.x.toFixed(2),y:+e.chargeAim.y.toFixed(2)},stageName:Tp(e.rage.rage),slamSeconds:+e.slamSeconds.toFixed(3),onSlam:e.onSlam,slams:e.slams,bursts:e.bursts,burstRadiusMeters:+(e.camera.viewport.laneWidthMeters*e.burstRadiusRatio).toFixed(1),waveAlive:e.burst!==null,lastBurstKills:e.burst?.kills??0,lastBurstPushes:e.burst?.pushes??0,overloaded:e.overloaded,overloadLeft:+e.rage.overloadLeft.toFixed(2)},phase:e.phase,volume:e.player.volume,hitsSurvived:e.bubbleType.hitsToPop??Ap(e.player.volume),invulnerable:e.invulnerable,bubbles:e.field.bubbles.length,lastEaten:e.lastEaten,stats:{...e.stats},report:{fps:+e.fps.toFixed(1),lastDeltaMs:+(e.lastDelta*1e3).toFixed(2),frames:e.frameCount,bubbles:e.field.bubbles.length,specks:e.field.specks.length,hazards:e.hazards.hazards.length}}}var Km=class e{constructor(){K(this,`screenY`,.5),K(this,`x`,dl),K(this,`y`,0),K(this,`vx`,0),K(this,`vy`,0),K(this,`volume`,1),K(this,`debugUpdates`,0),K(this,`debugLastDt`,0),K(this,`debugSteerMultiplier`,1),K(this,`tuning`,G),K(this,`slowRemaining`,0),K(this,`slowFactor`,1),K(this,`impulseVy`,0),K(this,`impulseVx`,0),K(this,`ascentBonus`,1),K(this,`steerScale`,1),K(this,`shrinkResistance`,0),K(this,`stageSpeedMultiplier`,1),K(this,`suctionMoveFactor`,1),K(this,`skillRemaining`,0),K(this,`skillId`,null),K(this,`skillAscentBonus`,1),K(this,`misfireSeconds`,0)}reset(){this.screenY=.5,this.y=0,this.x=dl,this.vx=0,this.vy=0,this.volume=1,this.slowRemaining=0,this.slowFactor=1,this.impulseVy=0,this.impulseVx=0,this.ascentBonus=1,this.steerScale=1,this.shrinkResistance=0,this.skillRemaining=0,this.skillId=null,this.skillAscentBonus=1,this.misfireSeconds=0}depth(e){return e-this.y}screenOffsetMetres(e){return(this.screenY-.5)*e}worldYFor(e,t){return e+this.screenOffsetMetres(t)}syncToCamera(e,t){this.y=this.worldYFor(e,t)}clampToScreen(t,n){if(n<=0)return;let r=(this.y-t)/n+.5;this.screenY=Math.min(Math.max(r,e.SCREEN_Y_MIN),e.SCREEN_Y_MAX),this.y=this.worldYFor(t,n)}get slowMultiplier(){return this.slowRemaining>0?this.slowFactor:1}get misfiring(){return this.misfireSeconds>0}applyMisfire(e){e<=0||(this.misfireSeconds=Math.max(this.misfireSeconds,e))}applySlow(e,t){e<=0||(this.slowRemaining=Math.max(this.slowRemaining,e),this.slowFactor=this.slowRemaining>0?Math.min(this.slowFactor===1?t:this.slowFactor,t):t)}update(t,n,r){if(this.debugUpdates++,this.debugLastDt=n,this.slowRemaining>0&&(this.slowRemaining=Math.max(0,this.slowRemaining-n),this.slowRemaining===0&&(this.slowFactor=1)),this.impulseVy!==0||this.impulseVx!==0){let e=Math.exp(-n/G.hazardLaunchDecaySeconds);this.impulseVy*=e,this.impulseVx*=e,Math.abs(this.impulseVy)<1e-4&&(this.impulseVy=0),Math.abs(this.impulseVx)<.005&&(this.impulseVx=0)}this.skillRemaining>0&&(this.skillRemaining=Math.max(0,this.skillRemaining-n),this.skillRemaining===0&&(this.skillId=null,this.skillAscentBonus=1)),this.misfireSeconds>0&&(this.misfireSeconds=Math.max(0,this.misfireSeconds-n));let i=Math.max(0,this.steerScale)*Math.max(0,this.stageSpeedMultiplier)*Math.max(0,this.suctionMoveFactor);this.debugSteerMultiplier=i;let a=this.misfireSeconds>0?-t.axisX:t.axisX;a===0?(this.vx-=this.vx*Math.min(r.damping*n,1),Math.abs(this.vx)<r.stopSpeed&&(this.vx=0)):this.vx=a*r.keyboardSpeed*i,this.x+=this.vx*n;let o=r.keyboardSpeed*G.verticalSpeedScale*i;this.vy=t.axisY*o*this.slowMultiplier,this.screenY+=this.vy*n;let s=t.consumeDrag(),c=W.movement.drag.sensitivity*(W.movement.drag.penaltiesApply?i*this.slowMultiplier:1),l=this.misfireSeconds>0?-s.x:s.x;this.x+=l*c,this.screenY+=s.y*c,this.screenY+=this.impulseVy*n,this.x+=this.impulseVx*n,this.x=Math.min(Math.max(this.x,.006),.994),this.screenY=Math.min(Math.max(this.screenY,e.SCREEN_Y_MIN),e.SCREEN_Y_MAX)}};K(Km,`SCREEN_Y_MIN`,.12),K(Km,`SCREEN_Y_MAX`,.94);var qm=`tgba.progress.v1`;function Jm(){return{cleared:[],selected:Vu}}function Ym(){let e=Jm(),t=null;try{t=localStorage.getItem(qm)}catch{return e}if(!t)return e;try{let n=JSON.parse(t);if(!n||typeof n!=`object`)return e;let r=new Set(Bu.map(e=>e.id));return{cleared:Array.isArray(n.cleared)?n.cleared.filter(e=>typeof e==`string`&&r.has(e)):[],selected:typeof n.selected==`string`&&r.has(n.selected)?n.selected:e.selected}}catch{return e}}function Xm(e){try{localStorage.setItem(qm,JSON.stringify(e))}catch{}}function Zm(e,t){if(e<=0)return!0;let n=Bu[e-1];return n?t.cleared.includes(n.id):!1}function Qm(e){return Bu.filter((t,n)=>Zm(n,e)).map(e=>e.id)}var $m=class{constructor(){K(this,`state`,void 0),K(this,`onChange`,()=>{}),this.state=Ym(),Uu(this.state.selected)}get selected(){return this.state.selected}get cleared(){return this.state.cleared}entries(){return Bu.map((e,t)=>({id:e.id,name:e.name,locked:!Zm(t,this.state),selected:e.id===this.state.selected}))}canPlay(e){let t=Hu(e);return t>=0&&Zm(t,this.state)}select(e){return this.canPlay(e)?(this.state={...this.state,selected:e},Uu(e),Xm(this.state),this.onChange(),!0):!1}clear(e){if(this.state.cleared.includes(e)||Hu(e)<0)return null;let t=Qm(this.state);this.state={...this.state,cleared:[...this.state.cleared,e]},Xm(this.state);let n=Qm(this.state).find(e=>!t.includes(e));return this.onChange(),n??null}reset(){this.state=Jm(),Uu(this.state.selected),Xm(this.state),this.onChange()}},eh=class e{constructor(){K(this,`bubbles`,[]),K(this,`specks`,[]),K(this,`targetBubbles`,32),K(this,`targetSpecks`,130),K(this,`timelineCursor`,0),K(this,`pending`,[]),K(this,`emittedCount`,0),K(this,`playerVolume`,1),K(this,`scrollSpeed`,25),K(this,`nextId`,1)}reset(){this.bubbles=[],this.specks=[],this.timelineCursor=0,this.pending=[],this.emittedCount=0}addTestBubble(e){let t={...e,id:this.nextId++};return this.bubbles.push(t),t}placeTimeline(e,t,n){for(;this.timelineCursor<e.length;){let r=e[this.timelineCursor];if(!r||r.at>t)break;this.timelineCursor++,this.pending.push({entry:r,worldY:n})}}takePending(){let e=this.pending;return this.pending=[],this.emittedCount+=e.length,e}get timelineExhausted(){return this.timelineCursor>0&&this.pending.length===0}get debugTimeline(){return{cursor:this.timelineCursor,pending:this.pending.length,emitted:this.emittedCount}}update(e,t,n,r,i,a,o=null,s=1){this.scrollSpeed=Math.max(.001,a),this.playerVolume=i,o&&this.applySuction(e,t,o.x,o.y,i,s),this.advance(e),this.advanceParallax(e,this.scrollSpeed),this.recycle(n,r),this.topUpSpecks(t,n,r)}applySuction(e,t,n,r,i,a){let o=t*gd(i)*Math.max(0,a);if(o<=0)return;let s=o*o;for(let a of this.bubbles){let o=n-a.x,c=r-a.y,l=o*o+c*c;if(l>s||l<1e-6)continue;let u=Math.sqrt(l),d=t*vd(a.volume,i),f=Math.min(d*e,u);a.x+=o/u*f,a.y+=c/u*f}}solveBubbleVelocity(e,t){return Rp(e,t)*this.scrollSpeed}get cruiseAscentSpeed(){return this.scrollSpeed}advance(e){for(let t of this.bubbles)t.held||(t.vy=this.solveBubbleVelocity(t.volume,this.playerVolume),t.y-=t.vy*e,t.phase+=e*(1.6-t.wobble)*2);for(let t of this.specks)t.phase+=e*.4}advanceParallax(e,t){for(let n of this.specks)n.drift!==0&&(n.y-=n.drift*t*e)}recycle(t,n){let r=n-t;this.bubbles=this.bubbles.filter(i=>i.y>t-r*e.CULL_BELOW_FRACTION&&i.y<n+r*e.CULL_ABOVE_FRACTION),this.specks=this.specks.filter(e=>e.y>t-r*.05&&e.y<n+r*.05)}topUpSpecks(e,t,n){for(;this.specks.length<this.targetSpecks;)this.specks.push(this.spawnSpeck(e,t,n,4))}bubbleFromEntry(e,t,n){let r=e.size??.5,i=n*r,a=Fp(i);return{id:this.nextId++,x:i+e.x*Math.max(.01,t-i*2),y:e.at,vy:Rp(a,this.playerVolume)*this.scrollSpeed,radius:i,volume:a,phase:Math.random()*Math.PI*2,wobble:Math.max(G.bubbleWobbleMin,Math.min(G.bubbleWobbleMax,.3/Math.max(.2,r)))}}spawnSpeck(t,n,r,i){let a=Math.random()<e.NEAR_SPECK_FRACTION;return{x:Math.random()*t,y:n+Math.random()*(r-n+i),r:a?t*(.0022+Math.random()*.0036):t*(4e-4+Math.random()*.0011),phase:Math.random()*Math.PI*2,drift:a?1.5+Math.random()*2.5:-.15-Math.random()*.2}}};K(eh,`CULL_ABOVE_FRACTION`,.3),K(eh,`CULL_BELOW_FRACTION`,.35),K(eh,`NEAR_SPECK_FRACTION`,.4);var th=class{constructor(){K(this,`counts`,{drivenOff:0,absorb:0,eaten:0,boss:0}),K(this,`total`,0)}get value(){return this.total}get ledger(){return this.counts}award(e,t=1){if(t<=0)return 0;let n=(W.score[e]??0)*t;return n<=0?0:(this.total+=n,this.counts[e]+=t,n)}reset(){this.total=0,this.counts={drivenOff:0,absorb:0,eaten:0,boss:0}}},nh=class{constructor(){K(this,`counts`,{drivenOff:0,eaten:0,graze:0,bulletGraze:0,pointBlank:0,defuse:0,boss:0}),K(this,`towards`,0),K(this,`taken`,0),K(this,`picked`,0),K(this,`banked`,0)}get value(){return this.towards}get level(){return this.picked}get pending(){return this.banked}get need(){let{first:e,growth:t}=W.mutation;return Math.round(e*t**this.taken)}get fraction(){return Math.min(1,this.towards/Math.max(1e-6,this.need))}get ledger(){return this.counts}tick(e){let t=W.mutation.autoPerSecond;t<=0||this.add(t*e)}gain(e,t=1){if(t<=0)return 0;let n=(W.mutation.gain[e]??0)*t;return n<=0?0:(this.counts[e]+=t,this.add(n),n)}consume(){this.banked>0&&(this.banked--,this.picked++)}reset(){this.counts={drivenOff:0,eaten:0,graze:0,bulletGraze:0,pointBlank:0,defuse:0,boss:0},this.towards=0,this.taken=0,this.picked=0,this.banked=0}add(e){for(this.towards+=e;this.towards>=this.need&&this.banked<4;)this.towards-=this.need,this.taken++,this.banked++}debugAddForTest(e){this.add(e)}};function rh(e,t,n,r){let i=0,a=0,o=0;for(;a<n&&o<600;)i+=e*t*ul,i-=i*Math.min(ol*ul,1),i>r&&(i=r),a+=i*ul,o+=ul;return o}function ih(e,t,n){let r=0,i=0;for(;i<n;)r+=e*t*ul,r-=r*Math.min(ol*ul,1),i+=ul;return r}function ah(e,t,n,r){for(let i=0;i<90;i++){let i=(n+r)/2;e(i)>t?n=i:r=i}return(n+r)/2}var oh=new Map;function sh(e){let t=oh.get(e);if(t)return t;let n=ah(t=>rh(t,1,e,1/0),cl,1,1e6),r=Math.ceil(ih(n,1,6)*1.08),i={accel:n,speedCap:r,damping:ol,boostSteerFactor:+ah(t=>rh(n,t,e,r),ll,.01,1).toFixed(4),stopSpeed:n/(1/ul)/4,crossingSeconds:cl,boostCrossingSeconds:ll,cruiseTopSpeed:ih(n,1,6),keyboardSpeed:1/sl,laneWidth:e};return oh.set(e,i),i}function ch(e,t,n){let r=e.filter(e=>e.kind===`zapper`&&!e.flee),i=r.map(e=>({h:e,d:Math.hypot(e.x-t.x,e.y-t.y)})).filter(e=>e.d<=n.rangeMeters).sort((e,t)=>e.d-t.d)[0],a=new Set;if(!i)return a;a.add(i.h.id);let o=[i.h];for(;o.length&&a.size<n.maxTargets;){let e=o.shift();for(let t of r)if(!a.has(t.id)&&!(Math.hypot(t.x-e.x,t.y-e.y)>n.jumpMeters)&&(a.add(t.id),o.push(t),a.size>=n.maxTargets))break}return a}function lh(e,t,n,r,i){let a=e.from??`top`,o=e.x*r,s=t;if(a===`left`||a===`right`){let t=r*W.spawning.offscreenMarginRatio;o=a===`left`?-t:r+t,s=n.min+(e.depth??W.spawning.entryDepth)*(n.max-n.min)}else a===`bottom`&&(s=n.min-r*W.spawning.bottomMarginRatio);let c=a===`top`?null:{from:a,speed:e.enterSpeed??W.spawning.enterSpeedMps},l={kind:e.kind,from:a,x:+o.toFixed(1),worldY:+s.toFixed(1),visibleTop:+n.max.toFixed(1),visibleBottom:+n.min.toFixed(1)};if(e.kind===`bubble`)return i.field.bubbles.push(i.field.bubbleFromEntry({...e,at:s},r,i.playerRadiusFraction)),l;if(Zl(e.kind))return i.obstacles.spawn(e.kind,o,s,a===`left`||a===`right`?{speed:e.enterSpeed??W.spawning.enterSpeedMps,targetX:e.x*r}:void 0),l;let u=e.path?Y.paths?.[e.path]:void 0,d=u?{points:u.points,seconds:u.seconds,elapsed:-(e.pathDelaySeconds??0),startX:o,startY:s}:null,f={};c&&(f.entry=c),d&&(f.path=d),e.variety!==void 0&&(f.variety=e.variety);let p=c?o:Math.max(0,Math.min(r,o));return i.hazards.hazards.push(i.hazards.spawnAt(e.kind,p,s,f)),l}var uh=[`鱼群来了`,`气泡潮`,`爆发`],dh=1.5,fh=class{constructor(){K(this,`events`,[]),K(this,`phase`,`menu`),K(this,`phaseTimer`,0),K(this,`player`,new Km),K(this,`elapsedTotal`,0),K(this,`progress`,new $m),K(this,`field`,new eh),K(this,`scrolled`,0),K(this,`timelineEmitted`,0),K(this,`spawnLog`,[]),K(this,`spawnedBySide`,{top:0,left:0,right:0,bottom:0}),K(this,`elapsed`,0),K(this,`nominalSeconds`,0),K(this,`lateral`,sh(1)),K(this,`bubbleType`,nm()),K(this,`route`,null),K(this,`routeCardPending`,!1),K(this,`rage`,hp()),K(this,`chargeAim`,{x:0,y:0}),K(this,`charging`,!1),K(this,`slamSeconds`,0),K(this,`slams`,0),K(this,`burst`,null),K(this,`bursts`,0),K(this,`stage`,Hp()),K(this,`invulnerable`,0),K(this,`stats`,{absorbed:0,hits:0,maxVolume:1,ended:0,overloads:0,newRecord:!1}),K(this,`lastEaten`,0),K(this,`obstacles`,new cu),K(this,`bullets`,new up),K(this,`enemyBullets`,new fp),K(this,`gunStreams`,1),K(this,`rateTier`,1),K(this,`xp`,new nh),K(this,`mutations`,{}),K(this,`bulletDamageMultiplier`,1),K(this,`invulnBonusSeconds`,0),K(this,`rageGainMultiplier`,1),K(this,`suctionBonus`,1),K(this,`eatInvulnBonusSeconds`,0),K(this,`eatTierBonus`,0),K(this,`bulletSpeedMultiplier`,1),K(this,`bulletRadiusMultiplier`,1),K(this,`bulletLifeMultiplier`,1),K(this,`burstRadiusMultiplier`,1),K(this,`rageDecayMultiplier`,1),K(this,`bossSpawned`,!1),K(this,`infiniteHealth`,!1),K(this,`pendingLevel`,null),K(this,`ascendMetres`,0),K(this,`runComplete`,!1),K(this,`levelsClearedInRun`,0),K(this,`charge`,0),K(this,`chargeBurst`,0),K(this,`chargeBurstRadius`,0),K(this,`trashDrain`,0),K(this,`comedyBeats`,0),K(this,`lastComedyBeat`,null),K(this,`hazards`,new af),K(this,`talentEffects`,bm(xm())),K(this,`skill`,null),K(this,`decoy`,null),K(this,`skillActivations`,0),K(this,`fartReadyAt`,0),K(this,`farts`,0),K(this,`eventsFired`,new Set),K(this,`eventsSeen`,0),K(this,`lastEvent`,null),K(this,`bestClimbed`,0),K(this,`bestVolume`,0),K(this,`bestScore`,0),K(this,`score`,new th),K(this,`surfaced`,!1)}get onSlam(){return this.slamSeconds>0&&this.bubbleType.look===`rage`}get overloaded(){return this.bubbleType.look===`rage`&&gp(this.rage)}suctionUp(e){return im(this.bubbleType,`suction`)?e.sucking:!1}burstRadiusRatio(){let e=W.angry.burst,t=Op(this.rage.rage);return(e.radiusBaseRatio+(e.radiusMaxRatio-e.radiusBaseRatio)*t)*this.burstRadiusMultiplier}canSwallow(e){return this.bubbleType.swallowsHazards&&md(e,this.player.volume,this.eatTierBonus)}pickRoute(e){let t=em(e);return!t||this.route!==null?this.route:(this.route=t.id,this.bubbleType=tm(t),this.routeCardPending=!0,t.id===`barrage`&&(this.gunStreams=Math.min(W.bullets.maxStreams,this.gunStreams+1)),this.route)}get suctionRadiusFactor(){return this.suctionBonus}banner(e){am(this.events,e)}sound(e,t=.5){om(this.events,e,t)}scorePopup(e,t,n){sm(this.events,e,t,n)}damagePopup(e,t,n){cm(this.events,e,t,n)}skillSlot(e){dm(this.events,e)}takeHit(){if(!this.infiniteHealth){if(this.stats.hits++,this.sound(`hit`),this.invulnerable=G.invulnerableSeconds+this.invulnBonusSeconds,this.bubbleType.hitsToPop!==null)this.player.volume=0;else for(let e=0;e<1;e++)this.player.volume=Np(this.player.volume,this.player.shrinkResistance);if(jp(this.player.volume)||this.player.volume<=0){this.startBurst();return}this.bubbleType.look===`rage`&&bp(this.rage,yp()*this.rageGainMultiplier)}}updateBullets(e,t,n,r){let i=t*Kp(this.stage.stage,this.player.volume),a=[],o=this.gunStreams;for(let e=0;e<o;e++){let n=(e-(o-1)/2)*W.bullets.upgradeSpreadRatio*t;a.push({x:this.player.x*t+n,y:this.player.y+i})}let s=this.bullets.update(e,{min:n,max:r,laneWidth:t,muzzles:a,armed:this.phase===`playing`&&this.bubbleType.firesBullets,perSecond:W.bullets.rateTiers[Math.min(this.rateTier,W.bullets.rateTiers.length)-1]??0,damage:W.bullets.damage*this.bulletDamageMultiplier,speedMultiplier:this.bulletSpeedMultiplier,radiusMultiplier:this.bulletRadiusMultiplier,lifeMultiplier:this.bulletLifeMultiplier,hazards:this.hazards,obstacles:this.obstacles});if(s.fired>0&&this.sound(`bulletFire`,W.audio.bulletFireVolume),s.hits>0){let e=W.audio.bulletHitVolume;this.sound(`bulletHit`,s.drivenOff>0?Math.min(1,e*1.4):e)}if(s.drivenOff>0){let e=this.score.award(`drivenOff`,s.drivenOff);for(let t of s.driven)this.scorePopup(t.x,t.y,e/s.drivenOff);this.xp.gain(`drivenOff`,s.drivenOff);let n=this.player.x*t,r=t*Kp(this.stage.stage,this.player.volume);for(let e of s.driven){let i=Math.hypot(e.x-n,e.y-this.player.y);i<=(r+e.r)*W.mutation.pointBlankRadius&&(this.xp.gain(`pointBlank`),um(this.events,e.x,e.y,`贴脸`)),e.kind===`bombfish`&&i>t*W.hazards.bombfish.blastRadiusRatio&&(this.xp.gain(`defuse`),um(this.events,e.x,e.y,`拆弹`))}}for(let e of s.struck)this.damagePopup(e.x,e.y,e.amount)}updateEnemyBullets(e,t,n,r,i){let a=t*Kp(this.stage.stage,this.player.volume),o=this.phase===`playing`;if(o)for(let e of i)this.sound(`hit`,.25),this.enemyBullets.fire(e.kind,e.x,e.y,this.player.x*t,this.player.y,t);let{landed:s,grazedAt:c}=this.enemyBullets.update(e,{min:n,max:r,laneWidth:t,playerX:this.player.x*t,playerY:this.player.y,playerRadius:a,invulnerable:this.invulnerable>0,blocks:(e,t,n)=>this.obstacles.blocks(e,t,n)});if(o&&s.length>0)for(let e of s){let t=Math.max(1,W.enemyBullets.shooters[e]?.damage??1);for(let e=0;e<t;e++)if(this.takeHit(),this.phase!==`playing`)return;e===`eel`&&this.player.applyMisfire(W.hazards.eel.boltShockSeconds)}if(o)for(let e of c)this.xp.gain(`bulletGraze`),um(this.events,e.x,e.y,`擦`)}updateRage(e){if(this.bubbleType.look!==`rage`)return;this.slamSeconds>0&&(this.slamSeconds=Math.max(0,this.slamSeconds-e)),this.burst&&(this.burst.seconds+=e,this.burst.seconds>=W.angry.burst.waveSeconds&&(this.burst=null)),this.overloaded&&this.player.applySlow(e*2,W.angry.overload.steerFactor);let t=this.hazards.hazards.some(e=>e.gripping),n=gp(this.rage),{overloadExpired:r}=Sp(this.rage,e,this.invulnerable>0||t,this.rageDecayMultiplier);!n&&gp(this.rage)&&(this.banner(`失控  ·  ${W.angry.overload.seconds.toFixed(1)} 秒内把怒气放掉`),this.sound(`slow`)),r&&this.punishOverload()}updateCharge(e){if(!im(this.bubbleType,`charge`))return;let t=e.charging;if(!e.consumeChargeRelease()&&t){e.axisX!==0||e.axisY!==0?this.chargeAim={x:e.axisX,y:e.axisY}:e.dragAimX!==0||e.dragAimY!==0?this.chargeAim={x:e.dragAimX,y:e.dragAimY}:!this.charging&&this.chargeAim.x===0&&this.chargeAim.y===0&&(this.chargeAim={x:W.angry.charge.defaultAimX,y:W.angry.charge.defaultAimY}),this.charging=!0;return}if(!this.charging)return;this.charging=!1;let n=this.chargeAim,r=Math.hypot(n.x,n.y),i=r>1e-6?{x:n.x/r,y:n.y/r}:{x:0,y:1};this.player.impulseVy=Math.max(this.player.impulseVy,i.y*W.angry.charge.launchScreenSpeed),this.player.impulseVx+=i.x*W.angry.charge.launchLateralSpeed,this.slamSeconds=Math.max(this.slamSeconds,W.angry.charge.slamSeconds),this.sound(`crab`)}updateConductiveCharge(e,t){let n=W.hazards.charge;if(this.phase!==`playing`){this.chargeBurst=Math.max(0,this.chargeBurst-e);return}let r=!1;for(let e of this.hazards.hazards)if(!(e.kind!==`zapper`||e.flee)&&Math.hypot(e.x-this.player.x*t,e.y-this.player.y)<=n.nearMeters){r=!0;break}if(this.charge=r?Math.min(n.max,this.charge+n.perSecondNearZapper*e):Math.max(0,this.charge-n.decayPerSecond*e),this.chargeBurst=Math.max(0,this.chargeBurst-e),this.charge<n.chainAt)return;let i=this.player.x*t,a=this.player.y,o=ch(this.hazards.hazards,{x:i,y:a},{rangeMeters:n.chainRangeMeters,jumpMeters:n.chainJumpMeters,maxTargets:n.chainMaxTargets});if(o.size!==0){this.chargeBurstRadius=n.chainJumpMeters*.5,this.chargeBurst=n.burstSeconds,this.charge=0,this.sound(`surface`);for(let e of this.hazards.hazards)o.has(e.id)&&(this.hazards.hit(e,n.chainDamage,{x:i,y:a}),this.scorePopup(e.x,e.y,this.score.award(`drivenOff`)),this.xp.gain(`drivenOff`));n.chainSelfDamage>0&&this.takeHit(),this.banner(`连锁放电  ·  ${o.size} 只`)}}resolveHazards(e,t,n,r,i,a){let o=this.suctionUp(a)?{x:this.player.x*r,y:this.player.y,radiusFactor:this.suctionRadiusFactor}:null,s={min:t,max:n,laneWidth:r,playerX:this.player.x*r,playerY:this.player.y,playerRadiusFraction:Kp(this.stage.stage,this.player.volume),descentSpeed:Y.scrollSpeed,elapsed:this.elapsed,invulnerable:this.invulnerable>0,struggling:a.steering,playerVolume:this.player.volume,canEat:e=>this.canSwallow(e),suction:o,bubbles:this.field.bubbles,eatenBubbleIds:[],splitCount:0},c=this.hazards.update(e,s);if(this.updateEnemyBullets(e,r,t,n,c.filter(e=>e.shot).map(e=>({kind:e.kind,x:e.shot.x,y:e.shot.y}))),this.phase===`playing`){for(let e of c)if(e.volley)for(let t of e.volley.dirs)this.enemyBullets.fire(e.kind,e.volley.x,e.volley.y,e.volley.x+t.x*100,e.volley.y+t.y*100,r)}for(let e of c){if(!e.spray)continue;let{fromX:t,fromY:n,targets:r,bow:a}=e.spray;for(let[e,o]of r.entries()){let r=this.makeHazard(i,`mineral`,t,n);r.charge={fromX:t,fromY:n,toX:o.x,toY:o.y,bow:(e%2==0?1:-1)*a*Math.hypot(o.x-t,o.y-n),elapsed:0,grazed:!1,hitPlayer:!1},this.hazards.hazards.push(r)}}if(s.eatenBubbleIds.length){let e=new Set(s.eatenBubbleIds);this.field.bubbles=this.field.bubbles.filter(t=>!e.has(t.id))}for(let t of c){if(t.graze){this.xp.gain(`graze`),lm(this.events,t.graze.x,t.graze.y),this.sound(`skill`);continue}if(t.pushDown&&(this.player.y=Math.max(0,this.player.y-t.pushDown)),t.charge&&(this.charge=Math.min(W.hazards.charge.max,this.charge+t.charge)),t.blast&&(fm(this.events,t.blast.x,t.blast.y,t.blast.radius),this.sound(`pop`),this.lastComedyBeat={what:t.kind,at:this.elapsed},(t.damage??0)>0&&(this.takeHit(),this.phase!==`playing`)))return;if(t.eaten){this.player.volume=Mp(this.player.volume,hd(t.kind)),this.stats.absorbed++,this.scorePopup(this.player.x*r,this.player.y,this.score.award(`eaten`)),this.xp.gain(`eaten`),this.invulnerable=Math.max(this.invulnerable,W.consumption.eatInvulnerableSeconds+this.eatInvulnBonusSeconds),this.sound(`pop`);continue}if(t.damage){for(let e=0;e<t.damage;e++)this.takeHit();this.talentEffects.talent.id===`fish-fart`&&this.releaseFart(i)}if(t.slowSeconds&&t.slowFactor&&(this.player.applySlow(t.slowSeconds,t.slowFactor),this.sound(`slow`)),t.impulse){let e=t.impulse/Math.max(1,i.visibleDepthMeters)*W.hazards.crab.launchScreenBonus;this.player.impulseVy=Math.max(this.player.impulseVy,e),this.lastComedyBeat={what:`crab`,at:this.elapsed},this.sound(`crab`)}if(t.drainPerSecond)for(this.trashDrain+=Z.trashDrainPerSecond*e;this.trashDrain>=1;)--this.trashDrain,this.takeHit();t.broke&&(this.comedyBeats++,this.lastComedyBeat={what:t.kind,at:this.elapsed})}}resolveContacts(e,t){let n=t.laneWidth,r=this.player.x*n,i=n*Kp(this.stage.stage,this.player.volume),a=0,o=this.obstacles.resolvePlayer(r,this.player.y,i*(this.onSlam?1+W.angry.slamRadiusBonus:1)*(this.overloaded?1+W.angry.overload.radiusBonus:1),this.player.volume,this.invulnerable>0,e,this.onSlam?{damage:kp(this.rage.rage),breaksUnrammable:W.angry.charge.slamBreaksUnrammable}:this.overloaded?{damage:W.angry.overload.ramDamage,breaksUnrammable:W.angry.charge.slamBreaksUnrammable}:void 0);if(o.hit?.broke&&(this.lastComedyBeat={what:`crab`,at:this.elapsed},this.sound(`hit`),this.overloaded&&Ql(o.hit.kind)>=W.angry.overload.releaseHealth&&(vp(this.rage),this.banner(`怒气释放  ·  撞碎了${nu(o.hit.kind)}`))),o.hit&&this.onSlam){let e=o.hit.broke?W.angry.charge.rageCostPerBreak:W.angry.charge.rageCostPerHit;this.bubbleType.look===`rage`&&xp(this.rage,e),this.slams++}o.blocked&&(o.hurt&&this.takeHit(),this.player.impulseVy=-Math.max(this.player.impulseVy,.25)),o.dragging&&this.player.applySlow(W.obstacles.netDragSeconds,W.obstacles.netDrag),(o.hit||o.blocked)&&(this.invulnerable=Math.max(this.invulnerable,W.obstacles.collideInvulnerableSeconds));for(let e=this.field.bubbles.length-1;e>=0;e--){let t=this.field.bubbles[e];if(!t)continue;let o=n*t.radius,s=i+o,c=t.x-r,l=t.y-this.player.y;if(!(c*c+l*l>s*s)){if(i>=o*.92){if(this.bubbleType.growsByAbsorbing)this.player.volume=Mp(this.player.volume,t.volume),qp(this.stage)&&(this.player.stageSpeedMultiplier=this.stage.speedMultiplier,this.invulnerable=Math.max(this.invulnerable,W.stages.growInvulnerableSeconds),this.banner(`${Wp(this.stage.stage)}  ·  ${this.stage.stage} 阶段  ·  速度 ×${this.stage.speedMultiplier.toFixed(2)}`),this.sound(`skill`));else{let e=this.score.award(`absorb`);e>0&&this.scorePopup(t.x,t.y,e)}this.stats.absorbed++,a++,this.sound(`absorb`,Math.min(1,o/Math.max(1e-6,i))),this.field.bubbles.splice(e,1)}else this.invulnerable<=0&&(this.takeHit(),this.field.bubbles.splice(e,1))}}this.player.volume>this.stats.maxVolume&&(this.stats.maxVolume=this.player.volume),this.lastEaten=a}punishOverload(){if(this.infiniteHealth)return;let e=this.player.volume,t=0;for(let e=0;e<W.angry.overload.punishHits&&!(Ap(this.player.volume)<=1);e++)this.player.volume=Np(this.player.volume,this.player.shrinkResistance),t++;this.stats.overloads++,this.banner(`怒气失控  ·  体积 ${e.toFixed(2)} → ${this.player.volume.toFixed(2)}`),this.sound(`pop`)}startBurst(){this.phase=`burst`,this.phaseTimer=dh,this.stats.ended++,this.recordBest(),this.sound(`pop`),this.banner(`破裂  ·  深度 ${Math.round(this.player.depth(Y.scrollLength))}m  ·  吸收 ${this.stats.absorbed}  ·  最大体积 ${this.stats.maxVolume.toFixed(1)}×`)}useBurst(e){if(!im(this.bubbleType,`burst`))return;let t=W.angry.burst,n=e.laneWidth,r=n*this.burstRadiusRatio(),i=this.player.x*n,a=this.player.y,o=0,s=0,c=[];for(let e of this.hazards.hazards){let n=e.x-i,l=e.y-a;if(n*n+l*l>r*r){c.push(e);continue}if(t.hazardMode[e.kind]===`destroy`){o++;continue}rf(e,n,l,t.knockbackMeters*t.pushImpact),s++,c.push(e)}this.hazards.hazards=c;for(let e of this.obstacles.obstacles){let n=e.x-i,o=e.y-a;n*n+o*o<=r*r&&this.obstacles.damage(e.id,t.obstacleDamage)}xp(this.rage,this.rage.rage),vp(this.rage),this.burst={radius:r,seconds:0,kills:o,pushes:s},this.bursts++,this.sound(`crab`)}releaseFart(e){if(this.elapsed<this.fartReadyAt)return;this.fartReadyAt=this.elapsed+W.talents[`fish-fart`].cooldownSeconds,this.farts++;let t=e.laneWidth,n=this.player.x*t,r=W.talents[`fish-fart`].radiusMeters;for(let e of this.hazards.hazards){if(Sm(e.kind)<=0)continue;let t=e.x-n,i=e.y-this.player.y,a=Math.hypot(t,i);if(a>r)continue;if(a<.001){e.y+=r*.7;continue}let o=(r-a)/r;e.x+=t/a*o*r*.8,e.y+=i/a*o*r*.8}let i=Cm();for(let e=0;e<i;e++){let t=e/i*Math.PI*2+this.elapsed,a=.03;this.field.addTestBubble({x:n+Math.cos(t)*r*.3,y:this.player.y+Math.sin(t)*r*.3,vy:0,radius:a,volume:Fp(a),phase:t,wobble:G.bubbleWobbleMin})}this.lastComedyBeat={what:`fish`,at:this.elapsed},this.sound(`fart`)}recordBest(){let e=this.player.y;e>this.bestClimbed?(this.bestClimbed=e,this.bestVolume=Math.max(this.bestVolume,this.stats.maxVolume),this.stats.newRecord=!0):this.stats.newRecord=!1,this.bestVolume=Math.max(this.bestVolume,this.stats.maxVolume),this.bestScore=Math.max(this.bestScore,this.score.value)}grantSkill(e){let t=this.skill?gm(this.skill.id):null,n=gm(e);return this.skill={id:e,name:n.name,uses:n.uses},this.skillSlot(!0),t}rollTalent(){this.talentEffects=bm(xm()),this.player.ascentBonus=this.talentEffects.ascentMultiplier,this.player.steerScale=this.talentEffects.steerMultiplier,this.player.shrinkResistance=this.talentEffects.shrinkResistance,this.player.volume=this.talentEffects.startVolume,this.stats.maxVolume=this.talentEffects.startVolume}fireEvent(e,t){this.eventsSeen++,this.lastEvent={label:t,at:this.elapsed},this.banner(`${t}  ·  ${uh[e]??``}`.trim()),this.sound(`skill`)}fireDepthEvents(){let e=this.player.depth(Y.scrollLength);for(let[t,n]of(Y.landmarks??[]).entries())this.eventsFired.has(t)||e>n.depth||(this.eventsFired.add(t),this.fireEvent(t,n.label))}makeHazard(e,t,n,r,i=null,a,o){let s=e.laneWidth,c=i?n:Math.max(0,Math.min(s,n)),l={};return a!==void 0&&(l.health=a),i!==null&&(l.entry=i),o!==void 0&&(l.path=o),this.hazards.spawnAt(t,c,r,l)}emitTimelineEntry(e,t,n,r){let i=lh(e,t,{min:r.min,max:r.max},n,{field:this.field,obstacles:this.obstacles,hazards:this.hazards,playerRadiusFraction:Kp(this.stage.stage,this.player.volume)});this.spawnLog.push(i),this.spawnLog.length>12&&this.spawnLog.shift(),this.spawnedBySide[i.from]++}},ph=class{constructor(e){K(this,`style`,void 0),K(this,`root`,new j),K(this,`live`,[]),K(this,`pool`,[]),K(this,`scale`,1),this.style=e,this.root.eventMode=`none`}layout(e){this.scale=Qu(e.width,e.height)}get count(){return this.live.length}get lastText(){return this.live[this.live.length-1]?.label.text??null}add(e,t,n,r){if(n<=0)return;let i=this.style;if(i.max<=0)return;this.live.length>=i.max&&this.retire(0);let a=this.pool.pop()??X(``,i.colour,i.size,i.weight);a.style.fontSize=i.size,a.style.fill=i.colour,a.style.fontWeight=i.weight,a.anchor.set(i.anchorX,i.anchorY),a.text=`${i.prefix}${n}`,a.visible=!0,a.alpha=i.alpha,this.root.addChild(a),this.live.push({label:a,x:r.toScreenX(e),y:r.toScreenY(t),age:0})}say(e,t,n,r){let i=this.style;if(i.max<=0)return;this.live.length>=i.max&&this.retire(0);let a=this.pool.pop()??X(``,i.colour,i.size,i.weight);a.style.fontSize=i.size,a.style.fill=i.colour,a.style.fontWeight=i.weight,a.anchor.set(i.anchorX,i.anchorY),a.text=n,a.visible=!0,a.alpha=i.alpha,this.root.addChild(a),this.live.push({label:a,x:r.toScreenX(e),y:r.toScreenY(t),age:0})}update(e){let t=this.style,n=t.risePx*this.scale;for(let r=this.live.length-1;r>=0;r--){let i=this.live[r];if(i.age+=e,i.age>=t.lifeSeconds){this.retire(r);continue}let a=i.age/t.lifeSeconds;i.label.scale.set(this.scale),i.label.x=i.x,i.label.y=i.y-n*a**t.riseEase;let o=a<=t.fadeFrom?0:(a-t.fadeFrom)/(1-t.fadeFrom);i.label.alpha=t.alpha*(1-o**t.fadeEase)}}clear(){for(;this.live.length;)this.retire(this.live.length-1)}retire(e){let t=this.live[e];t&&(this.live.splice(e,1),t.label.visible=!1,this.root.removeChild(t.label),this.pool.push(t.label))}},mh=class{constructor(){K(this,`root`,new j),K(this,`backdrop`,hh()),K(this,`primary`,hh()),K(this,`secondary`,hh()),K(this,`title`,gh(`冒泡大作战`,15399423,34)),K(this,`subtitle`,gh(`BUBBLE BATTLE`,9426160,13)),K(this,`levelLine`,gh(``,12577279,15)),K(this,`levelRow`,new z),K(this,`tagline`,gh(Qp.tagline,9426160,W.menu.taglineSize)),K(this,`primaryLabel`,gh(``,W.menu.primaryTextColour,W.menu.primaryTextSize)),K(this,`secondaryLabel`,gh(``,W.menu.secondaryTextColour,W.menu.secondaryTextSize)),K(this,`hint`,gh(`WASD / 方向键移动   ·   右侧按钮：技能（捡到才有）—— 路线等到水里再选`,8369876,12)),K(this,`versionLine`,gh(``,5996444,11)),K(this,`onStart`,()=>{}),K(this,`onCodex`,()=>{}),K(this,`onPickLevel`,()=>{}),K(this,`primaryRect`,{x:0,y:0,w:0,h:0}),K(this,`secondaryRect`,{x:0,y:0,w:0,h:0}),K(this,`levels`,[]),K(this,`levelRects`,[]),K(this,`levelLabels`,[]),K(this,`selectedLevelId`,``),K(this,`levelNote`,``),K(this,`levelNoteHighlight`,!1),K(this,`pressed`,null),K(this,`time`,0),K(this,`scale`,1),this.root.eventMode=`none`;for(let e of[this.backdrop,this.primary,this.secondary,this.levelRow,this.primaryLabel,this.secondaryLabel])e.eventMode=`none`;this.primaryLabel.text=`开始游戏`,this.secondaryLabel.text=`图鉴`,this.root.addChild(this.backdrop,this.title,this.subtitle,this.levelRow,...this.levelLabels,this.levelLine,this.tagline,this.primary,this.primaryLabel,this.secondary,this.secondaryLabel,this.hint,this.versionLine)}layout(e){let t=W.menu,n=Qu(e.width,e.height);this.scale=n;let r=e.left,i=e.laneWidthPx,a=r+i/2;this.primaryLabel.style.fill=t.primaryTextColour,this.primaryLabel.style.fontSize=t.primaryTextSize,this.secondaryLabel.style.fill=t.secondaryTextColour,this.secondaryLabel.style.fontSize=t.secondaryTextSize,this.backdrop.clear(),this.backdrop.rect(0,0,e.width,e.height).fill({color:199191,alpha:1});let o=Math.min(i*t.buttonWidthRatio,t.buttonMaxWidth*n),s=t.buttonHeight*n,c=e.height*.55;this.primaryRect={x:a-o/2,y:c,w:o,h:s},this.secondaryRect={x:a-o/2,y:c+s+t.buttonGap*n,w:o,h:s},this.tagline.style.fontSize=t.taglineSize,this.tagline.scale.set(n),this.tagline.anchor.set(.5,.5),this.tagline.x=a,this.tagline.y=c-t.taglineGap*n-t.taglineSize*n;let l=t.levelRowHeight*n,u=Math.max(1,Math.min(this.levels.length,Math.floor(1/Math.max(.05,t.levelMinWidthRatio)))),d=Math.max(1,Math.ceil(this.levels.length/u)),f=t.levelTextSize*n,p=this.tagline.y-t.taglineSize*n/2-t.levelRowGap*n*2-f,m=d*l+(d-1)*t.levelRowGap*n,h=p-t.levelRowGap*n-m;this.subtitle.scale.set(n),this.subtitle.anchor.set(.5,.5),this.subtitle.x=a,this.subtitle.y=h-t.levelRowTopGap*n,this.title.scale.set(n),this.title.anchor.set(.5,.5),this.title.x=a,this.title.y=Math.max(36*n,this.subtitle.y-30*n),this.title.y>this.subtitle.y-30*n&&(this.subtitle.y=this.title.y+30*n),this.subtitle.y>h-t.levelRowTopGap*n&&(h=this.subtitle.y+t.levelRowTopGap*n);let g=l+t.levelRowGap*n,_=Math.min(o,u*o*t.levelMaxWidthRatio);this.levelRects=this.levels.map((e,n)=>{let r=Math.floor(n/u),i=Math.min(u,this.levels.length-r*u),s=Math.min(_,i*o*t.levelMaxWidthRatio),c=s/i,d=n-r*u;return{x:a-s/2+d*c,y:h+r*g,w:c,h:l}}),this.placeLevelLabels(),this.levelLine.scale.set(n),this.levelLine.anchor.set(.5,.5),this.levelLine.text=this.levelNote,this.levelLine.style.fill=this.levelNoteHighlight?t.levelUnlockColour:t.levelNoteColour,this.levelLine.x=a,this.levelLine.y=p;for(let[e,t]of[[this.primaryRect,this.primaryLabel],[this.secondaryRect,this.secondaryLabel]])t.scale.set(n),t.anchor.set(.5,.5),t.x=e.x+e.w/2,t.y=e.y+e.h/2;this.hint.scale.set(n),this.hint.anchor.set(.5,.5),this.hint.x=a,this.hint.y=this.secondaryRect.y+s+30*n,this.versionLine.scale.set(n),this.versionLine.anchor.set(.5,1),this.versionLine.text=td(),this.versionLine.x=a,this.versionLine.y=e.height-14*n,this.draw(n)}placeLevelLabels(){for(let[e,t]of this.levelLabels.entries()){let n=this.levelRects[e];n&&(t.style.fontSize=W.menu.levelTextSize,t.scale.set(this.scale),t.anchor.set(.5,.5),t.x=n.x+n.w/2,t.y=n.y+n.h/2)}}update(e){this.time+=e,this.draw(this.scale)}draw(e){let t=W.menu,n=.5+.5*Math.sin(this.time*2),r=t.buttonRadius*e,i=Math.max(1,1.4*e);this.primary.clear(),this.primary.roundRect(this.primaryRect.x,this.primaryRect.y,this.primaryRect.w,this.primaryRect.h,r).fill({color:this.pressed===`start`?t.primaryPressedFill:t.primaryFill,alpha:this.pressed===`start`?1:.88+n*.1}).stroke({color:t.buttonStroke,alpha:t.buttonStrokeAlpha,width:i}),this.secondary.clear(),this.secondary.roundRect(this.secondaryRect.x,this.secondaryRect.y,this.secondaryRect.w,this.secondaryRect.h,r).fill({color:this.pressed===`codex`?t.secondaryPressedFill:t.secondaryFill,alpha:.92}).stroke({color:t.secondaryStroke,alpha:t.secondaryStrokeAlpha*(this.pressed===`codex`?1:.8+n*.2),width:i}),this.levelRow.clear();for(let[n,r]of this.levelRects.entries()){let i=this.levels[n];if(!i)continue;let a=t.buttonRadius*e,o=i.selected?t.levelSelectedFill:i.locked?t.levelLockedFill:t.levelIdleFill,s=i.selected?t.levelSelectedStroke:i.locked?t.levelLockedStroke:t.levelIdleStroke;this.levelRow.roundRect(r.x,r.y,r.w,r.h,a).fill({color:o,alpha:i.locked?.6:.95}).stroke({color:s,alpha:i.selected?1:.7,width:Math.max(1,1.2*e)})}for(let[e,n]of this.levelLabels.entries()){let r=this.levels[e];if(!r)continue;let i=r.selected?t.levelSelectedTextColour:r.locked?t.levelLockedTextColour:t.levelIdleTextColour;n.style.fill!==i&&(n.style.fill=i)}}inRect(e,t,n){return t>=e.x&&t<=e.x+e.w&&n>=e.y&&n<=e.y+e.h}setLevels(e){this.levels=e;for(let e of this.levelLabels)this.root.removeChild(e),e.destroy();this.levelLabels.length=0;for(let t of e){let e=gh(t.name,W.menu.levelIdleTextColour,W.menu.levelTextSize);e.eventMode=`none`,this.levelLabels.push(e),this.root.addChild(e)}e.some(e=>e.id===this.selectedLevelId)||(this.selectedLevelId=e.find(e=>!e.locked)?.id??``),this.placeLevelLabels(),this.draw(this.scale)}setLevelNote(e,t=!1){this.levelNote=e,this.levelNoteHighlight=t,this.draw(this.scale)}get selectedLevelIdValue(){return this.selectedLevelId}handlePointerDown(e,t){if(this.inRect(this.primaryRect,e,t))this.pressed=`start`;else if(this.inRect(this.secondaryRect,e,t))this.pressed=`codex`;else{let n=this.levelRects.findIndex(n=>this.inRect(n,e,t)),r=n>=0?this.levels[n]:void 0;this.pressed=r&&!r.locked?`level:${r.id}`:null}return!0}handlePointerMove(e,t){if(this.pressed===`start`&&!this.inRect(this.primaryRect,e,t)&&(this.pressed=null),this.pressed===`codex`&&!this.inRect(this.secondaryRect,e,t)&&(this.pressed=null),this.pressed?.startsWith(`level:`)){let n=this.levelRects.findIndex(n=>this.inRect(n,e,t)),r=n>=0?this.levels[n]:void 0;(!r||`level:${r.id}`!==this.pressed)&&(this.pressed=null)}return!0}handlePointerUp(e,t){let n=this.pressed;if(this.pressed=null,n===`start`&&this.inRect(this.primaryRect,e,t))return this.onStart(),!0;if(n===`codex`&&this.inRect(this.secondaryRect,e,t))return this.onCodex(),!0;if(n?.startsWith(`level:`)){let n=this.levelRects.findIndex(n=>this.inRect(n,e,t)),r=n>=0?this.levels[n]:void 0;r&&!r.locked&&this.onPickLevel(r.id)}return!0}get geometry(){return{button:{...this.primaryRect},codex:{...this.secondaryRect},levels:this.levels.map((e,t)=>({id:e.id,label:e.name,locked:e.locked,selected:e.selected,rect:{...this.levelRects[t]??{x:0,y:0,w:0,h:0}}})),levelNote:this.levelLine.text,tagline:this.tagline.text,hint:this.hint.text}}get versionText(){return this.versionLine.text}};function hh(){let e=new z;return e.eventMode=`none`,e}function gh(e,t,n){let r=new Ui({text:e,style:{fontFamily:W.text.fontFamily,fontSize:n,fill:t,fontWeight:`bold`,letterSpacing:.5}});return r.resolution=2,r}var _h=class{constructor(){K(this,`root`,new j),K(this,`backdrop`,new z),K(this,`chrome`,new z),K(this,`icons`,new z),K(this,`title`,void 0),K(this,`pageLabel`,void 0),K(this,`tabLabels`,[]),K(this,`buttonLabels`,[]),K(this,`cardTexts`,[]),K(this,`category`,`enemy`),K(this,`page`,0),K(this,`scale`,1),K(this,`tabs`,[]),K(this,`cards`,[]),K(this,`buttons`,[]),K(this,`grid`,{left:0,top:0,cellW:0,cellH:0,gap:0}),K(this,`size`,{width:0,height:0}),K(this,`preview`,null),K(this,`previewLabel`,X(``,W.codex.titleColour,W.codex.titleSize)),K(this,`laidOut`,!1),K(this,`onBack`,()=>{}),this.root.eventMode=`none`;for(let e of[this.backdrop,this.chrome,this.icons])e.eventMode=`none`;let e=W.codex;this.title=X(`图鉴 / BESTIARY`,e.titleColour,e.titleSize),this.pageLabel=X(``,e.pageTextColour,e.pageTextSize),this.root.addChild(this.backdrop,this.chrome,this.icons,this.title,this.pageLabel),this.previewLabel.eventMode=`none`,this.previewLabel.visible=!1,this.root.addChild(this.previewLabel);for(let t of wm){let n=X(t.label,e.tabTextColour,e.tabTextSize);this.tabLabels.push(n),this.root.addChild(n)}for(let t of[`◀ 上一页`,`返回`,`下一页 ▶`]){let n=X(t,e.buttonTextColour,e.buttonTextSize);this.buttonLabels.push(n),this.root.addChild(n)}}get perPage(){return Math.max(1,W.codex.columns*W.codex.rows)}get state(){return{category:this.category,page:this.page,pages:Hm(this.category,this.perPage),total:Vm(this.category).length,visible:this.cards.map(e=>e.entry.id)}}get geometry(){return{tabs:this.tabs.map(e=>({id:e.id,rect:{...e.rect}})),buttons:this.buttons.map(e=>({id:e.id,rect:{...e.rect}})),cards:this.cards.map(e=>({id:e.entry.id,rect:{...e.rect}}))}}get texts(){return this.cardTexts.map(e=>e.text)}show(e=`enemy`){this.category=e,this.page=0,this.laidOut&&this.redraw()}refresh(){this.laidOut&&this.redraw()}layout(e){let t=W.codex,n=Qu(e.width,e.height);this.scale=n,this.size={width:e.width,height:e.height},this.laidOut=!0;let r=e.left+t.margin*n,i=e.laneWidthPx-t.margin*2*n,a=e.left+e.laneWidthPx/2;this.backdrop.clear(),this.backdrop.rect(0,0,e.width,e.height).fill({color:199191,alpha:1}),this.title.style.fontSize=t.titleSize,this.title.scale.set(n),this.title.anchor.set(.5,0),this.title.x=a,this.title.y=t.titleY*n;let o=t.tabGap*n,s=(i-o*(wm.length-1))/wm.length,c=(t.titleY+t.titleSize+16)*n;this.tabs=wm.map((e,i)=>({id:e.id,rect:{x:r+i*(s+o),y:c,w:s,h:t.tabHeight*n}}));for(let[e,r]of this.tabs.entries()){let i=this.tabLabels[e];i.style.fontSize=t.tabTextSize,i.scale.set(n),i.anchor.set(.5,.5),i.x=r.rect.x+r.rect.w/2,i.y=r.rect.y+r.rect.h/2}this.pageLabel.style.fontSize=t.pageTextSize,this.pageLabel.scale.set(n),this.pageLabel.anchor.set(.5,0),this.pageLabel.x=a,this.pageLabel.y=c+t.tabHeight*n+10*n;let l=t.gap*n;this.grid={left:r,top:(t.headerHeight+t.titleY)*n,cellW:(i-l*(t.columns-1))/t.columns,cellH:(e.height-(t.footerHeight+t.margin)*n-(t.headerHeight+t.titleY)*n-l*(t.rows-1))/t.rows,gap:l};let u=t.buttonHeight*n,d=e.height-(t.footerHeight-8)*n,f=i/3;this.buttons=[{id:`prev`,rect:{x:r,y:d,w:f-l,h:u}},{id:`back`,rect:{x:r+f,y:d,w:f-l*2,h:u}},{id:`next`,rect:{x:r+f*2,y:d,w:f-l,h:u}}];for(let[e,r]of this.buttons.entries()){let i=this.buttonLabels[e];i.style.fontSize=t.buttonTextSize,i.scale.set(n),i.anchor.set(.5,.5),i.x=r.rect.x+r.rect.w/2,i.y=r.rect.y+r.rect.h/2}this.redraw()}rebuildCards(){let e=W.codex,t=Um(this.category,this.page,this.perPage);this.cards=t.map((t,n)=>{let r=n%e.columns,i=Math.floor(n/e.columns);return{entry:t,iconId:-(n+1),rect:{x:this.grid.left+r*(this.grid.cellW+this.grid.gap),y:this.grid.top+i*(this.grid.cellH+this.grid.gap),w:this.grid.cellW,h:this.grid.cellH}}})}nextPageForTest(){let e=Hm(this.category,this.perPage);this.page=Math.min(e-1,this.page+1),this.redraw()}get previewForTest(){return this.preview!==null}cardRectForTest(e){return this.cards.find(t=>t.entry.id===e)?.rect??null}handlePointerDown(e,t){if(this.preview!==null)return this.preview=null,this.redraw(),!0;for(let n of this.tabs)if(Sh(n.rect,e,t))return this.show(n.id),!0;for(let[n,r]of this.cards.entries())if(Sh(r.rect,e,t))return this.preview=n,this.redraw(),!0;for(let[n,r]of this.buttons.entries()){if(!Sh(r.rect,e,t))continue;let n=Hm(this.category,this.perPage);if(r.id===`back`)return this.onBack(),!0;let i=r.id===`next`?Math.min(n-1,this.page+1):Math.max(0,this.page-1);return i!==this.page&&(this.page=i,this.redraw()),!0}return this.cards,Sh({x:0,y:0,w:this.size.width,h:this.size.height},e,t)}setPageVisible(e){this.title.visible=e,this.pageLabel.visible=e;for(let t of this.tabLabels)t.visible=e;for(let t of this.buttonLabels)t.visible=e;for(let t of this.cardTexts)t.visible=e}redraw(){let e=W.codex,t=this.scale,n=this.chrome;if(n.clear(),this.icons.clear(),this.preview!==null){let r=this.cards[this.preview];if(!r)this.preview=null;else{this.setPageVisible(!1);let i=Math.min(this.size.width,this.size.height)*.62;n.rect(0,0,this.size.width,this.size.height).fill({color:e.previewScrimColour,alpha:e.previewScrimAlpha});let a=this.size.width/2,o=this.size.height/2-i*.05;this.drawIconInto(r,i,a,o),this.previewLabel.text=r.entry.name,this.previewLabel.style.fill=e.titleColour,this.previewLabel.style.fontSize=e.titleSize,this.previewLabel.scale.set(t),this.previewLabel.anchor.set(.5,0),this.previewLabel.x=a,this.previewLabel.y=o+i/2+20*t,this.previewLabel.visible=!0;return}}this.setPageVisible(!0),this.previewLabel.visible=!1,this.rebuildCards(),this.title.style.fill=e.titleColour,this.pageLabel.style.fill=e.pageTextColour;for(let r of this.tabs){let i=r.id===this.category;n.roundRect(r.rect.x,r.rect.y,r.rect.w,r.rect.h,e.buttonRadius*t).fill({color:i?e.activeTabFill:e.tabFill,alpha:1}),n.roundRect(r.rect.x,r.rect.y,r.rect.w,r.rect.h,e.buttonRadius*t).stroke({color:i?e.activeTabStroke:e.tabStroke,alpha:i?.95:.6,width:Math.max(1,1.4*t)})}for(let[t,n]of this.tabs.entries())this.tabLabels[t].style.fill=n.id===this.category?e.activeTabTextColour:e.tabTextColour;let r=Hm(this.category,this.perPage),i=wm.find(e=>e.id===this.category)?.label??``;this.pageLabel.text=`${i}  ·  ${Vm(this.category).length} 条  ·  第 ${this.page+1} / ${r} 页`;for(let r of this.cards)n.roundRect(r.rect.x,r.rect.y,r.rect.w,r.rect.h,e.cardRadius*t).fill({color:e.cardFill,alpha:e.cardFillAlpha}),n.roundRect(r.rect.x,r.rect.y,r.rect.w,r.rect.h,e.cardRadius*t).stroke({color:e.cardStroke,alpha:e.cardStrokeAlpha,width:Math.max(1,1.2*t)}),this.drawIcon(r,t);for(let[i,a]of this.buttons.entries()){let o=a.id===`back`||(a.id===`prev`?this.page>0:this.page<r-1);n.roundRect(a.rect.x,a.rect.y,a.rect.w,a.rect.h,e.buttonRadius*t).fill({color:e.buttonFill,alpha:o?1:.4}),n.roundRect(a.rect.x,a.rect.y,a.rect.w,a.rect.h,e.buttonRadius*t).stroke({color:e.buttonStroke,alpha:o?.9:.35,width:Math.max(1,1.4*t)}),this.buttonLabels[i].alpha=o?1:.35}this.rebuildCardTexts()}rebuildCardTexts(){for(let e of this.cardTexts)this.root.removeChild(e),e.destroy();this.cardTexts.length=0;let e=W.codex,t=this.scale;for(let n of this.cards){let r=e.cardPad*t,i=e.iconSize*t,a=n.rect.x+r+i+8*t,o=n.rect.w-r*2-i-8*t,s=X(n.entry.name,e.nameColour,e.nameSize);s.scale.set(t),s.x=a,s.y=n.rect.y+r,bh(s,o/t,e.nameSize+4),this.pushText(s);let c=X(n.entry.tagline,e.taglineColour,e.taglineSize);c.scale.set(t),c.x=a,c.y=s.y+(e.nameSize+5)*t,bh(c,o/t,e.taglineSize+3),this.pushText(c);let l=n.rect.y+r+i+6*t,u=e.factLabelWidth*t,d=n.rect.x+r;for(let i of n.entry.facts){let a=X(i.label,e.factLabelColour,e.factSize);a.scale.set(t),a.x=d,a.y=l,this.pushText(a);let o=X(i.value,e.factValueColour,e.factSize);o.scale.set(t),o.x=d+u,o.y=l,bh(o,(n.rect.w-r*2-u)/t,e.factLeading),this.pushText(o),l+=e.factLeading*t*xh(o)}l+=4*t;let f=(n.rect.w-r*2-e.noteBulletIndent*t)/t;for(let i of n.entry.notes){if(l>n.rect.y+n.rect.h-e.noteLeading*t)break;let a=X(`·`,e.noteColour,e.noteSize);a.scale.set(t),a.x=n.rect.x+r,a.y=l,this.pushText(a);let o=X(i,e.noteColour,e.noteSize);o.scale.set(t),o.x=n.rect.x+r+e.noteBulletIndent*t,o.y=l,bh(o,f,e.noteLeading),this.pushText(o),l+=e.noteLeading*t*xh(o)}}}pushText(e){this.cardTexts.push(e),this.root.addChild(e)}drawIcon(e,t){let n=W.codex,r=n.iconSize*t,i=n.cardPad*t;this.drawIconInto(e,r,e.rect.x+i+r/2,e.rect.y+i+r/2)}drawIconInto(e,t,n,r){let i=this.icons,a=Wm(e.entry),o=e.entry.icon;if(o.kind===`hazard`){let a=o.hazard,s=t/(Q[a].radius*vh),c=new af,l=c.spawnAt(a,n,r,{deterministic:!0});l.id=e.iconId,l.phase=yh,l.fuse=0,l.foamLife=0,c.hazards=[l],lp(i,c,s,yh,()=>!1,`in-play`);return}if(o.kind===`obstacle`){let a=W.obstacles.radius[o.obstacle]??.08,s=t/(a*vh),c=new cu;c.obstacles=[{id:e.iconId,kind:o.obstacle,x:n,y:r,radiusFraction:a,health:W.obstacles.health[o.obstacle]??1,healthFraction:1,age:yh,hitFlash:0,entry:null}],hu(i,c,s);return}this.drawGlyph(i,o.glyph,n,r,t,a)}drawGlyph(e,t,n,r,i,a){let o=i*.3,s=Math.max(1,o*.18);switch(t){case`player`:e.circle(n,r,o).fill({color:a,alpha:.18}),e.circle(n,r,o).stroke({color:a,alpha:.95,width:s}),e.circle(n-o*.32,r+o*.34,o*.2).fill({color:16777215,alpha:.8});break;case`boil`:{let t=[];for(let e=0;e<32;e++){let i=e/32*Math.PI*2,a=Math.max(0,-Math.sin(i)),s=Math.exp(-((i-Math.PI*1.5)**2)*40),c=1-a*.28-s*.24;t.push(n+Math.cos(i)*o*c,r+Math.sin(i)*o*c)}t.push(t[0],t[1]),e.poly(t),e.fill({color:a,alpha:.18}),e.poly(t),e.stroke({color:a,alpha:.95,width:s});break}case`rageGauge`:{let t=o*2.1,i=o*.5,c=n-t/2,l=r-i/2;e.roundRect(c,l,t,i,i/2).stroke({color:a,alpha:.8,width:s*.7}),e.roundRect(c,l,t*.62,i,i/2).fill({color:a,alpha:.85});for(let n=1;n<W.angry.appearance.length;n++){let r=c+W.angry.appearance[n].minRage/Math.max(1e-6,W.angry.rage.max)*t;e.moveTo(r,l-i*.35).lineTo(r,l+i*1.35)}e.stroke({color:16777215,alpha:.35,width:s*.4});break}case`charge`:e.circle(n,r,o*.42).fill({color:a,alpha:.9});for(let t=0;t<4;t++){let i=t/4*Math.PI*2+Math.PI/4;e.moveTo(n+Math.cos(i)*o*.6,r+Math.sin(i)*o*.6),e.lineTo(n+Math.cos(i)*o*1.3,r+Math.sin(i)*o*1.3)}e.stroke({color:a,alpha:.95,width:s});break;case`rageBurst`:for(let t=0;t<3;t++)e.circle(n,r,o*(.45+t*.42)).stroke({color:a,alpha:.9-t*.26,width:s*(1-t*.2)});e.circle(n,r,o*.2).fill({color:W.angry.burst.waveColour,alpha:.95});break;case`overload`:{e.circle(n,r,o*.78).fill({color:a,alpha:.22}),e.circle(n,r,o*.78).stroke({color:a,alpha:.9,width:s});let t=o*1.25,i=-Math.PI/2;for(let a=0;a<=24;a++){let o=i+a/24*Math.PI*1.55,s=n+Math.cos(o)*t,c=r+Math.sin(o)*t;a===0?e.moveTo(s,c):e.lineTo(s,c)}e.stroke({color:W.angry.appearance[W.angry.appearance.length-1].rim,alpha:.95,width:s}),e.moveTo(n-o*.25,r-o*.5).lineTo(n+o*.1,r).lineTo(n-o*.15,r+o*.5),e.stroke({color:16777215,alpha:.75,width:s*.6});break}case`stages`:for(let t=0;t<3;t++){let i=W.stages.appearance[Math.min(t,W.stages.appearance.length-1)];e.circle(n,r,o*(1-t*.3)).stroke({color:i?.hudColor??a,alpha:.95,width:s})}break;case`suction`:for(let t=0;t<3;t++){let i=t/3*Math.PI*2-Math.PI/2;e.moveTo(n+Math.cos(i)*o*1.2,r+Math.sin(i)*o*1.2).lineTo(n+Math.cos(i)*o*.4,r+Math.sin(i)*o*.4)}e.stroke({color:a,alpha:.95,width:s});break;case`collectable`:e.circle(n,r,o).fill({color:a,alpha:.3}),e.circle(n,r,o).stroke({color:a,alpha:.85,width:s*.7}),e.circle(n-o*.3,r+o*.3,o*.62).fill({color:15400191,alpha:.18});break;case`dash`:for(let t=0;t<2;t++){let i=r+o*(.45-t*.7);e.moveTo(n-o*.9,i).lineTo(n,i-o*.5).lineTo(n+o*.9,i)}e.stroke({color:a,alpha:.95,width:s});break;case`decoy`:e.circle(n,r,o*.7).fill({color:a,alpha:.45}),e.circle(n,r,o*1.2).stroke({color:a,alpha:.75,width:s*.7});break;case`vortex`:for(let t=0;t<2;t++)e.circle(n,r,o*(1.1-t*.42)).stroke({color:a,alpha:.35+t*.45,width:s*.8});for(let t=0;t<2;t++){let i=t*Math.PI+.5;e.moveTo(n+Math.cos(i)*o*1.1,r+Math.sin(i)*o*1.1).lineTo(n+Math.cos(i+.7)*o*.28,r+Math.sin(i+.7)*o*.28)}e.stroke({color:a,alpha:.9,width:s*.7});break;case`stink`:for(let[t,i,s]of[[-.6,.1,.55],[.5,.25,.45],[0,-.5,.5]])e.circle(n+o*t,r+o*i,o*s).fill({color:a,alpha:.42});break;case`shell`:e.circle(n,r,o).stroke({color:a,alpha:.95,width:s*1.6}),e.circle(n,r,o*.55).fill({color:a,alpha:.3});break;case`burst`:for(let t=0;t<6;t++){let i=t/6*Math.PI*2;e.moveTo(n+Math.cos(i)*o*.4,r+Math.sin(i)*o*.4).lineTo(n+Math.cos(i)*o*1.3,r+Math.sin(i)*o*1.3)}e.stroke({color:a,alpha:.95,width:s});break;case`fish-fart`:e.circle(n-o*.2,r,o*.8).fill({color:a,alpha:.4}),e.circle(n+o*.85,r+o*.6,o*.28).fill({color:a,alpha:.85}),e.circle(n+o*1.15,r-o*.4,o*.2).fill({color:a,alpha:.85});break;case`soda`:for(let t=0;t<3;t++)e.circle(n-o*.7+t*o*.7,r+o*(.4-t*.35),o*(.32-t*.05)).stroke({color:a,alpha:.9,width:s*.6});break;case`silt`:e.circle(n,r,o).fill({color:a,alpha:.45}),e.circle(n,r,o).stroke({color:a,alpha:.9,width:s});for(let[t,i]of[[-.35,-.2],[.3,.1],[0,.4]])e.circle(n+o*t,r+o*i,o*.12).fill({color:a,alpha:.9});break;default:e.rect(n-o,r-o,o*2,o*2).stroke({color:16739179,alpha:.9,width:s})}}},vh=3.4,yh=1.7;function bh(e,t,n){e.style.wordWrap=!0,e.style.wordWrapWidth=t,e.style.breakWords=!0,e.style.lineHeight=n}function xh(e){let t=wi.measureText(e.text,e.style,void 0,!0);return Math.max(1,t.lines.length)}function Sh(e,t,n){return t>=e.x&&t<=e.x+e.w&&n>=e.y&&n<=e.y+e.h}var Ch=class{constructor(){K(this,`root`,new j),K(this,`open`,!1),K(this,`onPick`,()=>{}),K(this,`scrim`,new z),K(this,`panelBg`,new z),K(this,`title`,void 0),K(this,`hint`,void 0),K(this,`choices`,[]),K(this,`cards`,[]),K(this,`panelRect`,{x:0,y:0,w:0,h:0}),K(this,`scale`,1),K(this,`canvasWidth`,0),K(this,`canvasHeight`,0),this.root.eventMode=`none`,this.root.visible=!1,this.title=wh(`突变 · 三选一`,10482431,22),this.title.anchor.set(.5,0),this.hint=wh(`点一张卡，或按 1 / 2 / 3`,8366280,12),this.hint.anchor.set(.5,1),this.root.addChild(this.scrim,this.panelBg,this.title,this.hint)}openWith(e,t=`突变 · 三选一`){this.choices=e,this.title.text=t,this.open=!0,this.root.visible=!0;for(let e of this.cards)this.root.removeChild(e.bg,e.name,e.blurb);this.cards=e.map(()=>{let e=new z;e.eventMode=`none`;let t=wh(``,15399423,17);t.anchor.set(.5,1);let n=wh(``,10475760,12);return n.anchor.set(.5,0),this.root.addChild(e,t,n),{bg:e,name:t,blurb:n,x:0,y:0,w:0,h:0,pressed:!1}}),this.layoutCards()}close(){this.open=!1,this.root.visible=!1,this.choices=[]}choiceAt(e){return this.choices[e]??null}layout(e){let t=Qu(e.width,e.height);this.scale=t,this.canvasWidth=e.width,this.canvasHeight=e.height;let n=Math.min(e.laneWidthPx*.9,460*t),r=Math.min(e.height*.62,420*t);this.panelRect.x=(e.width-n)/2,this.panelRect.y=(e.height-r)/2,this.panelRect.w=n,this.panelRect.h=r,this.title.scale.set(t),this.title.x=e.width/2,this.title.y=this.panelRect.y+22*t,this.hint.scale.set(t),this.hint.x=e.width/2,this.hint.y=this.panelRect.y+r-14*t,this.layoutCards()}layoutCards(){let e=this.scale,t=this.panelRect;this.scrim.clear(),this.scrim.rect(0,0,this.canvasWidth,this.canvasHeight).fill({color:132621,alpha:.86}),this.panelBg.clear(),this.panelBg.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:924719,alpha:.97}).stroke({color:7194600,alpha:.5,width:1.5*e});let n=24*e,r=t.w-n*2,i=Math.min(92*e,(t.h-130*e)/Math.max(1,this.cards.length)-8*e),a=t.y+66*e;for(let[o,s]of this.cards.entries()){let c={x:t.x+n,y:a+o*(i+10*e),w:r,h:i};s.x=c.x,s.y=c.y,s.w=c.w,s.h=c.h;let l=this.choices[o];s.name.text=`${o+1} · ${l.name}`,s.name.scale.set(e),s.name.x=c.x+c.w/2,s.name.y=c.y+c.h*.62,s.blurb.text=l.blurb,s.blurb.scale.set(e),s.blurb.x=c.x+c.w/2,s.blurb.y=c.y+c.h*.68,this.drawCard(s)}}drawCard(e){let t=this.scale;e.bg.clear(),e.bg.roundRect(e.x,e.y,e.w,e.h,12*t).fill({color:e.pressed?1919590:1452351,alpha:.96}).stroke({color:e.pressed?10482431:6269132,alpha:.8,width:1.4*t})}inRect(e,t,n){return e>=n.x&&e<=n.x+n.w&&t>=n.y&&t<=n.y+n.h}handlePointerDown(e,t,n){if(!this.open)return!1;for(let e of this.cards)this.inRect(t,n,e)&&(e.pressed=!0);return this.redraw(),!0}handlePointerMove(e,t,n){if(!this.open)return!1;for(let e of this.cards)e.pressed&&!this.inRect(t,n,e)&&(e.pressed=!1);return this.redraw(),!0}handlePointerUp(e,t,n){if(!this.open)return!1;for(let e of this.cards){let r=e.pressed;e.pressed=!1,r&&this.inRect(t,n,e)&&this.onPick(this.cards.indexOf(e))}return this.redraw(),!0}redraw(){for(let e of this.cards)this.drawCard(e)}};function wh(e,t,n){let r=new Ui({text:e,style:{fontFamily:W.text.fontFamily,fontSize:n,fill:t,fontWeight:`bold`,letterSpacing:.5}});return r.resolution=2,r}var Th=[{id:`gun`,name:`枪管 +1`,blurb:`小泡泡同时发射 ${W.bullets.maxStreams} 排（上限内可叠加）`,routes:`all`,available:e=>e.gunStreams<W.bullets.maxStreams,apply:e=>{e.gunStreams=Math.min(W.bullets.maxStreams,e.gunStreams+1)}},{id:`rate`,name:`射速 +1 档`,blurb:`最高第 ${W.bullets.rateTiers.length} 档`,routes:`all`,available:e=>e.rateTier<W.bullets.rateTiers.length,apply:e=>{e.rateTier=Math.min(W.bullets.rateTiers.length,e.rateTier+1)}},{id:`damage`,name:`子弹伤害 +15%`,blurb:`每发打掉的血更多，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.damage=(e.mutations.damage??0)+1}},{id:`steer`,name:`转向 +10%`,blurb:`横向操控更灵敏，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.steer=(e.mutations.steer??0)+1}},{id:`ascent`,name:`升速 +10%`,blurb:`向上游得更快，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.ascent=(e.mutations.ascent??0)+1}},{id:`armor`,name:`减伤 +8%`,blurb:`每次受伤掉得更少，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.armor=(e.mutations.armor??0)+1}},{id:`heal`,name:`修复体积`,blurb:`立刻恢复 ${W.mutation.pool.healVolume} 体积（一次性）`,routes:`all`,available:e=>e.player.volume<W.volume.max-.01,apply:e=>{e.player.volume=Math.min(W.volume.max,e.player.volume+W.mutation.pool.healVolume)}},{id:`invuln`,name:`受击无敌 +0.2 秒`,blurb:`挨打后的闪烁更久，可叠加`,routes:`all`,available:()=>!0,apply:e=>{e.mutations.invuln=(e.mutations.invuln??0)+1}},{id:`rage`,name:`怒气积攒 +15%`,blurb:`挨打和释放的怒气更多，可叠加`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.rage=(e.mutations.rage??0)+1}},{id:`suction`,name:`吸取范围 +15%`,blurb:`吸附场罩得更宽，可叠加`,routes:`devour`,available:()=>!0,apply:e=>{e.mutations.suction=(e.mutations.suction??0)+1}},{id:`eatInvuln`,name:`吞噬无敌 +0.3 秒`,blurb:`吞下生物后的无敌更长，可叠加`,routes:`devour`,available:()=>!0,apply:e=>{e.mutations.eatInvuln=(e.mutations.eatInvuln??0)+1}},{id:`appetite`,name:`大胃口 +1 档`,blurb:`比体积说的话多吃一档，可叠加——食欲也能爬食物链`,routes:`devour`,available:()=>!0,apply:e=>{e.mutations.appetite=(e.mutations.appetite??0)+1}},{id:`burstRadius`,name:`爆破半径 +15%`,blurb:`怒气爆破罩得更宽，可叠加`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.burstRadius=(e.mutations.burstRadius??0)+1}},{id:`simmer`,name:`余温 -25% 衰减`,blurb:`挨打攒的热散得更慢，可叠加——怒气留得更久`,routes:`boil`,available:()=>!0,apply:e=>{e.mutations.simmer=(e.mutations.simmer??0)+1}},{id:`bulletSpeed`,name:`弹速 +25%`,blurb:`小泡泡飞得更快，可叠加`,routes:`barrage`,available:()=>!0,apply:e=>{e.mutations.bulletSpeed=(e.mutations.bulletSpeed??0)+1}},{id:`bulletRadius`,name:`大弹丸 +30%`,blurb:`小泡泡变大，判定跟着变大，可叠加`,routes:`barrage`,available:()=>!0,apply:e=>{e.mutations.bulletRadius=(e.mutations.bulletRadius??0)+1}},{id:`bulletRange`,name:`射程 +40%`,blurb:`小泡泡飞得更远，可叠加——寿命就是射程`,routes:`barrage`,available:()=>!0,apply:e=>{e.mutations.bulletRange=(e.mutations.bulletRange??0)+1}},...hm.map(e=>({id:`skill:${e.id}`,name:`技能 · ${e.name}`,blurb:e.blurb,routes:`all`,available:t=>t.skill?.id!==e.id,apply:t=>{t.grantSkill(e.id)}}))],Eh=$p.map(e=>({id:`route:${e.id}`,name:`${e.name} · ${e.title}`,blurb:e.blurb,routes:`all`,available:e=>e.route===null,apply:t=>{t.pickRoute(e.id)}}));function Dh(e,t=3){if(e.route===null)return Eh;let n=Th.filter(t=>(t.routes===`all`||t.routes===e.route)&&t.available(e)),r=[];if(e.routeCardPending){e.routeCardPending=!1;let t=n.filter(t=>t.routes===e.route);t.length>0&&r.push(t[Math.floor(Math.random()*t.length)])}for(;r.length<t&&r.length<n.length;){let e=n[Math.floor(Math.random()*n.length)];for(;r.includes(e);)e=n[Math.floor(Math.random()*n.length)];r.push(e)}return r}function Oh(e){let t=W.mutation.pool,n=t=>e.mutations[t]??0;e.bulletDamageMultiplier=1+t.damagePerPick*n(`damage`),e.invulnBonusSeconds=t.invulnSecondsPerPick*n(`invuln`),e.rageGainMultiplier=1+t.ragePerPick*n(`rage`),e.suctionBonus=1+t.suctionPerPick*n(`suction`),e.eatInvulnBonusSeconds=t.eatInvulnSecondsPerPick*n(`eatInvuln`),e.eatTierBonus=t.appetiteTiersPerPick*n(`appetite`),e.burstRadiusMultiplier=1+t.burstRadiusPerPick*n(`burstRadius`),e.rageDecayMultiplier=Math.max(.05,1-t.rageDecayReductionPerPick*n(`simmer`)),e.bulletSpeedMultiplier=1+t.bulletSpeedPerPick*n(`bulletSpeed`),e.bulletRadiusMultiplier=1+t.bulletRadiusPerPick*n(`bulletRadius`),e.bulletLifeMultiplier=1+t.bulletRangePerPick*n(`bulletRange`),e.player.steerScale=e.talentEffects.steerMultiplier*(1+t.steerPerPick)**n(`steer`),e.player.ascentBonus=e.talentEffects.ascentMultiplier*(1+t.ascentPerPick)**n(`ascent`),e.player.shrinkResistance=Math.min(.9,e.talentEffects.shrinkResistance+t.armorPerPick*n(`armor`))}var kh=class{constructor(){K(this,`root`,new j),K(this,`gear`,new z),K(this,`scrim`,new z),K(this,`panel`,new j),K(this,`panelBg`,new z),K(this,`title`,void 0),K(this,`volumeLabel`,void 0),K(this,`accessLabel`,void 0),K(this,`flashButton`,void 0),K(this,`cheatLabel`,void 0),K(this,`cheatButton`,void 0),K(this,`sliderTrack`,new z),K(this,`sliderFill`,new z),K(this,`sliderKnob`,new z),K(this,`closeButton`,void 0),K(this,`restartButton`,void 0),K(this,`exitButton`,void 0),K(this,`saveButton`,void 0),K(this,`cancelButton`,void 0),K(this,`open`,!1),K(this,`onVolume`,()=>{}),K(this,`onOpen`,()=>{}),K(this,`onClose`,()=>{}),K(this,`onRestart`,()=>{}),K(this,`onInfiniteHealth`,()=>{}),K(this,`onReducedFlash`,()=>{}),K(this,`onExit`,()=>{}),K(this,`gearCircle`,{x:0,y:0,radius:0}),K(this,`panelRect`,{x:0,y:0,w:0,h:0}),K(this,`slider`,{x:0,y:0,w:0,h:0}),K(this,`volume`,.8),K(this,`infiniteHealth`,!1),K(this,`reducedFlash`,!1),K(this,`sliderPointer`,null),K(this,`scale`,1),K(this,`canvasWidth`,0),K(this,`canvasHeight`,0),this.root.eventMode=`none`,this.gear.eventMode=`none`,this.panel.eventMode=`none`,this.panelBg.eventMode=`none`,this.sliderTrack.eventMode=`none`,this.sliderFill.eventMode=`none`,this.sliderKnob.eventMode=`none`,this.title=jh(`设置 / SETTINGS`,15399423,22),this.volumeLabel=jh(``,12577279,15),this.closeButton=this.mkButton(`×`,()=>this.setOpen(!1)),this.accessLabel=jh(`显示 / DISPLAY`,9426687,13),this.flashButton=this.mkButton(`降低闪烁：关`,()=>this.setReducedFlash(!this.reducedFlash)),this.cheatLabel=jh(`作弊 / CHEATS`,16757867,13),this.cheatButton=this.mkButton(`无限血量：关`,()=>this.setInfiniteHealth(!this.infiniteHealth)),this.restartButton=this.mkButton(`重开本关`,()=>this.onRestart()),this.exitButton=this.mkButton(`退出到主菜单`,()=>this.onExit()),this.saveButton=this.mkButton(`保存`,()=>this.setOpen(!1)),this.cancelButton=this.mkButton(`取消`,()=>this.setOpen(!1)),this.panel.addChild(this.panelBg,this.title,this.volumeLabel,this.sliderTrack,this.sliderFill,this.sliderKnob,this.accessLabel,this.cheatLabel),this.panel.addChild(this.closeButton.bg,this.closeButton.label,this.flashButton.bg,this.flashButton.label,this.cheatButton.bg,this.cheatButton.label,this.restartButton.bg,this.restartButton.label,this.exitButton.bg,this.exitButton.label,this.saveButton.bg,this.saveButton.label,this.cancelButton.bg,this.cancelButton.label),this.root.addChild(this.scrim,this.gear,this.panel),this.setOpen(!1)}mkButton(e,t){let n=new z;n.eventMode=`none`;let r=jh(e,15399423,16);r.anchor.set(.5),r.eventMode=`none`;let i={label:r,bg:n,x:0,y:0,w:0,h:0,pressed:!1};return i.onPress=t,i}buttons(){return[this.closeButton,this.flashButton,this.cheatButton,this.restartButton,this.exitButton,this.saveButton,this.cancelButton]}onPressOf(e){return e.onPress}get isOpen(){return this.open}setOpen(e){let t=this.open;this.open=e,this.panel.visible=e,this.scrim.visible=e,this.gear.visible=!e,this.sliderPointer=null;for(let e of this.buttons())e.pressed=!1;this.redraw(),e&&!t&&this.onOpen(),!e&&t&&this.onClose()}setInfiniteHealth(e,t=!0){this.infiniteHealth=e,this.cheatButton.label.text=e?`无限血量：开`:`无限血量：关`,this.cheatButton.label.style.fill=e?16766073:15399423,this.redraw(),t&&this.onInfiniteHealth(e)}get infiniteHealthOn(){return this.infiniteHealth}setReducedFlash(e,t=!0){this.reducedFlash=e,this.flashButton.label.text=e?`降低闪烁：开`:`降低闪烁：关`,this.flashButton.label.style.fill=e?16766073:15399423,this.redraw(),t&&this.onReducedFlash(e)}get reducedFlashOn(){return this.reducedFlash}setVolume(e){this.volume=Math.min(1,Math.max(0,e)),this.redraw()}layout(e){let t=Qu(e.width,e.height);this.scale=t,this.canvasWidth=e.width,this.canvasHeight=e.height;let n=e.left+e.laneWidthPx,r=27*t;this.gearCircle={x:n-r-14*t,y:r+14*t,radius:r};let i=Math.min(e.laneWidthPx*.86,420*t),a=Math.min(e.height*.66,470*t);this.panelRect={x:(e.width-i)/2,y:(e.height-a)/2,w:i,h:a},this.title.scale.set(t),this.title.anchor.set(.5,0),this.title.x=this.panelRect.x+i/2,this.title.y=this.panelRect.y+20*t;let o={volumeLabel:78,slider:112,accessLabel:156,accessRow:177,cheatsLabel:227,cheatsRow:248,rowHeight:42,rowGap:10};this.volumeLabel.scale.set(t),this.volumeLabel.anchor.set(0,.5),this.volumeLabel.x=this.panelRect.x+24*t,this.volumeLabel.y=this.panelRect.y+o.volumeLabel*t;let s=i-48*t;this.slider={x:this.panelRect.x+24*t,y:this.panelRect.y+o.slider*t,w:s,h:14*t};let c=34*t;this.place(this.closeButton,this.panelRect.x+i-c-12*t,this.panelRect.y+12*t,c,c,t),this.accessLabel.scale.set(t),this.accessLabel.anchor.set(0,.5),this.accessLabel.x=this.panelRect.x+24*t,this.accessLabel.y=this.panelRect.y+o.accessLabel*t;let l=o.rowHeight*t,u=i-48*t,d=this.panelRect.x+24*t;this.place(this.flashButton,d,this.panelRect.y+o.accessRow*t,u,l,t),this.cheatLabel.scale.set(t),this.cheatLabel.anchor.set(0,.5),this.cheatLabel.x=this.panelRect.x+24*t,this.cheatLabel.y=this.panelRect.y+o.cheatsLabel*t,this.place(this.cheatButton,d,this.panelRect.y+o.cheatsRow*t,u,l,t),this.place(this.restartButton,d,this.panelRect.y+o.cheatsRow*t+l+o.rowGap*t,u,l,t),this.place(this.exitButton,d,this.panelRect.y+o.cheatsRow*t+(l+o.rowGap*t)*2,u,l,t);let f=12*t,p=(u-f)/2,m=this.panelRect.y+a-l-24*t;this.place(this.saveButton,d,m,p,l,t),this.place(this.cancelButton,d+p+f,m,p,l,t),this.buildStatic(),this.redraw()}place(e,t,n,r,i,a){e.x=t,e.y=n,e.w=r,e.h=i,e.label.scale.set(a),e.label.x=t+r/2,e.label.y=n+i/2}update(){}redraw(){let e=this.scale;if(!this.open)return;let t=this.slider,n=t.x+t.w*this.volume;this.sliderFill.clear(),this.volume>.001&&this.sliderFill.roundRect(t.x,t.y-t.h/2,t.w*this.volume,t.h,t.h/2).fill({color:7332863,alpha:.85}),this.sliderKnob.clear(),this.sliderKnob.circle(n,t.y,12*e).fill({color:16777215,alpha:.96}),this.sliderKnob.circle(n,t.y,12*e).stroke({color:7332863,alpha:.9,width:2*e}),this.volumeLabel.text=`音量 / VOLUME   ${Math.round(this.volume*100)}`;for(let t of this.buttons()){let n=t===this.saveButton,r=t===this.exitButton;if(t===this.cheatButton){t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:this.infiniteHealth?4863e3:1452351,alpha:.95}).stroke({color:this.infiniteHealth?16757867:6269132,alpha:.8,width:1.2*e});continue}if(t===this.flashButton){t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:this.reducedFlash?1325135:1452351,alpha:.95}).stroke({color:this.reducedFlash?7332863:6269132,alpha:.8,width:1.2*e});continue}t.bg.clear(),t.bg.roundRect(t.x,t.y,t.w,t.h,10*e).fill({color:t.pressed?2771563:r?3350572:n?1915992:1452351,alpha:.95}).stroke({color:t.pressed?10478847:r?14191258:6269132,alpha:.7,width:1.2*e})}}buildStatic(){let e=this.scale,t=this.panelRect;this.scrim.clear(),this.scrim.rect(0,0,this.canvasWidth,this.canvasHeight).fill({color:132621,alpha:.82}),this.panelBg.clear(),this.panelBg.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:924719,alpha:.97}).stroke({color:7194600,alpha:.5,width:1.5*e});let n=this.slider;this.sliderTrack.clear(),this.sliderTrack.roundRect(n.x,n.y-n.h/2,n.w,n.h,n.h/2).fill({color:529183,alpha:.95}).stroke({color:4030376,alpha:.6,width:1}),this.drawGear()}drawGear(){let e=this.scale,t=this.gear;t.clear();let{x:n,y:r,radius:i}=this.gearCircle;t.circle(n,r,i).fill({color:1188408,alpha:.72}),t.circle(n,r,i).stroke({color:7194600,alpha:.75,width:1.6*e});for(let e=0;e<8;e++){let a=e/8*Math.PI*2,o=i*.42,s=i*.72,c=Math.PI/8*.42;t.poly([n+Math.cos(a-c)*o,r+Math.sin(a-c)*o,n+Math.cos(a-c*.7)*s,r+Math.sin(a-c*.7)*s,n+Math.cos(a+c*.7)*s,r+Math.sin(a+c*.7)*s,n+Math.cos(a+c)*o,r+Math.sin(a+c)*o]).fill({color:12577279,alpha:.92})}t.circle(n,r,i*.34).fill({color:661030,alpha:.9}),t.circle(n,r,i*.34).stroke({color:12577279,alpha:.7,width:1.4*e})}draw(e){this.scale=e,this.redraw()}inRect(e,t,n,r=0){return e>=n.x-r&&e<=n.x+n.w+r&&t>=n.y-r&&t<=n.y+n.h+r}inCircle(e,t,n){let r=e-n.x,i=t-n.y;return r*r+i*i<=n.radius*n.radius*1.35*1.35}handlePointerDown(e,t,n){if(!this.open)return this.inCircle(t,n,this.gearCircle)?(this.setOpen(!0),!0):!1;for(let e of this.buttons())this.inRect(t,n,e)&&(e.pressed=!0);return this.inRect(t,n,{x:this.slider.x-14,y:this.slider.y-20,w:this.slider.w+28,h:40})&&(this.sliderPointer=e,this.moveSlider(t)),this.draw(1),!0}handlePointerMove(e,t,n){if(!this.open)return!1;for(let e of this.buttons())e.pressed&&!this.inRect(t,n,e)&&(e.pressed=!1);return this.sliderPointer===e&&this.moveSlider(t),this.draw(1),!0}handlePointerUp(e,t,n){if(!this.open)return!1;this.sliderPointer===e&&(this.sliderPointer=null);for(let e of this.buttons()){let r=e.pressed;e.pressed=!1,r&&this.inRect(t,n,e)&&this.onPressOf(e)()}return this.draw(1),!0}moveSlider(e){let t=(e-this.slider.x)/Math.max(1,this.slider.w);this.volume=Math.min(1,Math.max(0,t)),this.onVolume(this.volume),this.draw(1)}get geometry(){return{gear:{...this.gearCircle},panel:{...this.panelRect},slider:{...this.slider},buttons:{close:Ah(this.closeButton),restart:Ah(this.restartButton),exit:Ah(this.exitButton),save:Ah(this.saveButton),cancel:Ah(this.cancelButton)}}}get sliderValue(){return this.volume}};function Ah(e){return{x:e.x,y:e.y,w:e.w,h:e.h}}function jh(e,t,n){let r=new Ui({text:e,style:{fontFamily:W.text.fontFamily,fontSize:n,fill:t,fontWeight:`bold`,letterSpacing:.5}});return r.resolution=2,r}var Mh=class{constructor(){K(this,`ctx`,null),K(this,`bus`,null),K(this,`filter`,null),K(this,`track`,null),K(this,`volume`,.5),K(this,`stepClock`,0),K(this,`stepIndex`,0),K(this,`playing`,!1)}attach(e,t){this.ctx!==e&&(this.stop(),this.ctx=e,this.bus=e.createGain(),this.bus.gain.value=0,this.filter=e.createBiquadFilter(),this.filter.type=`lowpass`,this.filter.frequency.value=900,this.filter.connect(this.bus),this.bus.connect(t))}setTrack(e){e!==this.track&&(this.track=e,this.stepClock=0,this.stepIndex=0,this.playing=e!==null&&this.ctx!==null,this.filter&&this.ctx&&this.filter.frequency.setTargetAtTime(e?.cutoffHz??900,this.ctx.currentTime,.4),this.fadeTo(this.playing?this.volume:0))}setVolume(e){this.volume=Math.max(0,Math.min(1,e)),this.playing&&this.fadeTo(this.volume)}playSting(e,t){let n=this.ctx;if(!n||!this.filter||e.length===0)return 0;let r=this.track?.rootHz??110;return e.forEach((e,i)=>{this.blipAt(r*2**(e/12),t*1.8,.2,`triangle`,0,n.currentTime+i*t)}),e.length*t}stop(){this.playing=!1,this.fadeTo(0)}get isPlaying(){return this.playing}get debugTrack(){return this.track?{rootHz:this.track.rootHz,stepPerMinute:this.track.stepPerMinute,chords:this.track.chords.length}:null}update(e){if(!this.playing||!this.track||!this.ctx||!this.filter)return;let t=60/Math.max(1,this.track.stepPerMinute);this.stepClock+=e;let n=0;for(;this.stepClock>=t&&n<4;)this.stepClock-=t,this.playStep(this.stepIndex,t),this.stepIndex++,n++}playStep(e,t){let n=this.track,r=this.ctx;if(!n||!r||!this.filter)return;let i=n.chords[Math.floor(e/Math.max(1,n.stepsPerChord))%n.chords.length];if(!i||!i.length)return;let a=i[n.pattern[e%n.pattern.length]%i.length]??i[0];if(this.blip(this.frequency(n.rootHz,a),t,n.arpGain,n.wave,0),e%Math.max(1,n.stepsPerChord)===0){let e=t*n.stepsPerChord;this.blip(this.frequency(n.rootHz,i[0]),e,n.padGain,n.padWave,n.detuneCents);let r=i[Math.min(2,i.length-1)]??i[0];this.blip(this.frequency(n.rootHz,r),e,n.padGain*.7,n.padWave,-n.detuneCents)}}frequency(e,t){return e*2**(t/12)}blip(e,t,n,r,i){this.blipAt(e,t,n,r,i,this.ctx?.currentTime??0)}blipAt(e,t,n,r,i,a){let o=this.ctx;if(!o||!this.filter||n<=1e-4)return;let s=o.createOscillator();s.type=r,s.frequency.value=e,s.detune.value=i;let c=o.createGain(),l=Math.max(a,o.currentTime),u=Math.min(.08,t*.2);c.gain.setValueAtTime(0,l),c.gain.linearRampToValueAtTime(n,l+u),c.gain.exponentialRampToValueAtTime(1e-4,l+Math.max(u+.05,t)),s.connect(c),c.connect(this.filter),s.start(l),s.stop(l+Math.max(u+.1,t)+.02)}fadeTo(e){this.bus&&this.ctx&&this.bus.gain.setTargetAtTime(e,this.ctx.currentTime,.35)}},Nh=class{constructor(){K(this,`graphics`,new z),K(this,`particles`,[]),this.graphics.eventMode=`none`}emit(e){let t=W.particles;if(e.kind===`hit`){this.burst(e,t.hitCount,t.hitSpeed,t.hitLife,t.hitSize,e.colour);return}let n=t.defeatCount;for(let r=0;r<n;r++){let i=r/n*Math.PI*2+Math.random()*t.defeatJitter;this.push(e.x+Math.cos(i)*e.radius,e.y+Math.sin(i)*e.radius,Math.cos(i)*t.defeatSpeed,Math.sin(i)*t.defeatSpeed,t.defeatLife*(.7+Math.random()*.6),t.defeatSize*(.6+Math.random()*.9),t.defeatColour)}}burst(e,t,n,r,i,a){for(let o=0;o<t;o++){let t=Math.random()*Math.PI*2,o=n*(.35+Math.random()*.8);this.push(e.x,e.y,Math.cos(t)*o,Math.sin(t)*o,r*(.6+Math.random()*.8),i*(.5+Math.random()*1),a)}}push(e,t,n,r,i,a,o){this.particles.length>=W.particles.maxParticles&&this.particles.shift(),this.particles.push({x:e,y:t,vx:n,vy:r,age:0,life:i,size:a,colour:o})}update(e){let t=W.particles.drag**(e*60);for(let n=this.particles.length-1;n>=0;n--){let r=this.particles[n];if(r.age+=e,r.age>=r.life){this.particles.splice(n,1);continue}r.x+=r.vx*e,r.y+=r.vy*e,r.y-=W.particles.descentSpeed*e,r.vx*=t,r.vy*=t}}draw(){let e=this.graphics;e.clear();for(let t of this.particles){let n=1-t.age/t.life;e.circle(t.x,t.y,Math.max(.2,t.size*n)).fill({color:t.colour,alpha:n})}}get count(){return this.particles.length}},Ph=class{constructor(){K(this,`root`,new j),K(this,`textures`,[]),K(this,`riders`,new Map),K(this,`loading`,!1),K(this,`ready`,!1),this.root.eventMode=`none`}ensureTextures(){if(this.ready||this.loading)return;let e=W.chargeTrail;e.image&&(this.loading=!0,Nl(e.image).then(t=>{if(this.loading=!1,!t)return;let n=Math.floor(t.width/Math.max(1,e.columns)),r=Math.floor(t.height/Math.max(1,e.rows));if(!(n<=0||r<=0)){for(let i=0;i<e.columns*e.rows;i++){let a=i%e.columns,o=Math.floor(i/e.columns);this.textures.push(new T({source:t.source,frame:new s(a*n,o*r,n,r)}))}this.ready=this.textures.length>0}}))}ride(e,t,n,r,i,a=0,o=0){let s=W.chargeTrail;if(this.ensureTextures(),!this.ready)return;let c=this.riders.get(e);if(!c){let t=Math.max(1,Math.round(s.count)),n=[];for(let e=0;e<t;e++){let t=new M(this.textures[e%this.textures.length]);t.anchor.set(.5),t.eventMode=`none`,this.root.addChild(t),n.push(t)}c={sprites:n,clock:0,seen:!0,jitter:n.map(()=>(Math.random()-.5)*s.jitter),sizeMul:n.map((e,t)=>1+(Math.random()-.5)*s.scaleVariance-t*s.sizeFalloff)},this.riders.set(e,c)}c.seen=!0,c.clock+=r;let l=Math.max(.01,s.frameSeconds),u=i*s.sizeRatio,d=Math.atan2(-o,-a),f=yl(this.root);for(let[e,r]of c.sprites.entries()){let i=this.textures[Math.floor(c.clock/l)%this.textures.length];r.texture=i;let a=u*c.sizeMul[e],o=a*s.behindFactor*(1+e*s.spread),p=d+c.jitter[e];r.visible=!0,r.x=t+Math.cos(p)*o,r.y=n-Math.sin(p)*o,r.alpha=s.alpha;let m=a/Math.max(1,i.width);r.scale.set(m,f?-Math.abs(m):Math.abs(m))}}sweep(){for(let[e,t]of this.riders){if(t.seen){t.seen=!1;continue}for(let e of t.sprites)e.visible=!1,this.root.removeChild(e),e.destroy();this.riders.delete(e)}}riderForTest(e){let t=this.riders.get(e)?.sprites[0];return t?{x:t.x,y:t.y,width:t.width}:null}get state(){return{live:this.riders.size,frames:this.textures.length}}};function Fh(e,t,n){return new Ui({text:e,style:{fill:t,fontSize:n,fontFamily:W.text.fontFamily,align:`center`}})}function Ih(e){return(e/1048576).toFixed(2)}var Lh=class{constructor(){K(this,`root`,new j),K(this,`backdrop`,new z),K(this,`bar`,new z),K(this,`title`,void 0),K(this,`percent`,void 0),K(this,`stats`,void 0),K(this,`canvasWidth`,0),K(this,`canvasHeight`,0),K(this,`scale`,1),K(this,`progress`,0),K(this,`lines`,[]),K(this,`speed`,0),K(this,`samples`,[]),this.root.eventMode=`none`,this.root.visible=!1;for(let e of[this.backdrop,this.bar])e.eventMode=`none`;this.title=Fh(W.loading.label,W.loading.titleColour,W.loading.titleSize),this.title.anchor.set(.5,0),this.title.eventMode=`none`,this.percent=Fh(``,W.loading.textColour,W.loading.textSize),this.percent.anchor.set(.5,0),this.percent.eventMode=`none`,this.stats=Fh(``,W.loading.textColour,W.loading.textSize),this.stats.anchor.set(.5,0),this.stats.eventMode=`none`,this.root.addChild(this.backdrop,this.bar,this.title,this.percent,this.stats)}begin(){this.progress=0,this.speed=0,this.samples.length=0,this.lines=[],this.title.text=W.loading.label,this.redraw()}layout(e,t){this.canvasWidth=e,this.canvasHeight=t,this.scale=Qu(e,t),this.title.style.fontSize=W.loading.titleSize,this.percent.style.fontSize=W.loading.textSize,this.stats.style.fontSize=W.loading.textSize,this.stats.style.lineHeight=W.loading.lineHeight,this.redraw()}update(e){let t=W.loading;for(this.samples.push({seconds:e.seconds,bytes:e.bytesDone});this.samples.length>2&&e.seconds-this.samples[0].seconds>t.speedWindowSeconds;)this.samples.shift();let n=this.samples[0],r=this.samples[this.samples.length-1],i=r.seconds-n.seconds;this.speed=i>=.25?(r.bytes-n.bytes)/i:e.seconds>=.05?e.bytesDone/e.seconds:0,this.progress=e.bytesTotal>0?Math.min(1,e.bytesDone/e.bytesTotal):e.total>0?e.done/e.total:1,this.lines=e.bytesTotal>0?[`已下载  ${Ih(e.bytesDone)} MB / ${Ih(e.bytesTotal)} MB`,`速度  ${Ih(this.speed)} MB/s`]:[`文件  ${e.done} / ${e.total}`],this.redraw()}redraw(){let e=this.scale,t=W.loading,n=this.canvasWidth,r=this.canvasHeight;if(n<=0||r<=0)return;this.backdrop.clear(),this.backdrop.rect(0,0,n,r).fill({color:t.scrimColour,alpha:t.scrimAlpha});let i=Math.min(n*.7,t.maxWidth*e),a=t.barHeight*e,o=t.titleSize*e,s=t.textSize*e,c=this.lines.length*t.lineHeight*e,l=o+t.gapTitle*e+a+t.gapBar*e+s+t.gapStats*e+c,u=r/2-l/2,d=(n-i)/2,f=u+o+t.gapTitle*e;this.bar.clear(),this.bar.roundRect(d,f,i,a,a/2).fill({color:t.trackColour,alpha:1}),this.progress>0&&this.bar.roundRect(d,f,Math.max(a,i*this.progress),a,a/2).fill({color:t.barColour,alpha:1}),this.title.scale.set(e),this.title.x=n/2,this.title.y=u,this.percent.text=`${Math.round(this.progress*100)}%`,this.percent.scale.set(e),this.percent.x=n/2,this.percent.y=f+a+t.gapBar*e,this.stats.text=this.lines.join(`
`),this.stats.scale.set(e),this.stats.x=n/2,this.stats.y=this.percent.y+s+t.gapStats*e}};function Rh(e,t,n){return new Ui({text:e,style:{fill:t,fontSize:n,fontFamily:W.text.fontFamily,align:`center`,wordWrap:!0,breakWords:!0}})}var zh=class{constructor(){K(this,`root`,new j),K(this,`scrim`,new z),K(this,`panel`,new z),K(this,`title`,void 0),K(this,`score`,void 0),K(this,`lines`,void 0),K(this,`buttonBg`,new z),K(this,`buttonLabel`,void 0),K(this,`onMenu`,()=>{}),K(this,`open`,!1),K(this,`rect`,{x:0,y:0,w:0,h:0}),K(this,`button`,{x:0,y:0,w:0,h:0}),K(this,`pressed`,!1),K(this,`scale`,1),K(this,`canvasWidth`,0),K(this,`canvasHeight`,0),this.root.eventMode=`none`,this.root.visible=!1;for(let e of[this.scrim,this.panel,this.buttonBg])e.eventMode=`none`;this.title=Rh(`下潜结束 · RUN COMPLETE`,15399423,22),this.title.style.wordWrap=!1,this.title.anchor.set(.5),this.title.eventMode=`none`,this.score=Rh(``,W.summary.scoreColour,W.summary.scoreSize),this.score.anchor.set(.5),this.score.style.wordWrap=!1,this.score.eventMode=`none`,this.lines=Rh(``,W.summary.lineColour,W.summary.lineSize),this.lines.anchor.set(.5,0),this.lines.eventMode=`none`,this.buttonLabel=Rh(W.summary.buttonLabel,15399423,17),this.buttonLabel.anchor.set(.5),this.buttonLabel.eventMode=`none`,this.root.addChild(this.scrim,this.panel,this.title,this.score,this.lines,this.buttonBg,this.buttonLabel)}get isOpen(){return this.open}show(e){this.open=!0,this.root.visible=!0,this.score.text=`${e.score}`;let t=Math.floor(e.seconds/60),n=Math.floor(e.seconds%60);this.lines.text=[`通关 ${e.levels} / ${e.total} 关`,`用时 ${t}:${String(n).padStart(2,`0`)}`,e.score>=e.best&&e.score>0?`★ 新纪录（上次最佳 ${e.best}）`:`最佳得分 ${e.best}`,td()].join(`
`),this.redraw()}hide(){this.open=!1,this.root.visible=!1,this.pressed=!1}layout(e,t){this.canvasWidth=e,this.canvasHeight=t;let n=Qu(e,t);this.scale=n;let r=Math.min(e*.86,W.summary.maxWidth*n),i=Math.min(t*.62,W.summary.maxHeight*n);this.rect={x:(e-r)/2,y:(t-i)/2,w:r,h:i},this.title.scale.set(n),this.title.x=this.rect.x+r/2,this.title.y=this.rect.y+34*n,this.score.style.fontSize=W.summary.scoreSize,this.score.scale.set(n),this.score.x=this.rect.x+r/2,this.score.y=this.rect.y+112*n,this.lines.style.fontSize=W.summary.lineSize,this.lines.style.wordWrapWidth=(r-48*n)/n,this.lines.scale.set(n),this.lines.x=this.rect.x+r/2,this.lines.y=this.rect.y+162*n;let a=r-48*n,o=46*n;this.button={x:this.rect.x+24*n,y:this.rect.y+i-o-26*n,w:a,h:o},this.buttonLabel.scale.set(n),this.buttonLabel.x=this.button.x+a/2,this.buttonLabel.y=this.button.y+o/2,this.redraw()}handlePointerDown(e,t){if(!this.open)return!1;let n=this.button;return e<n.x||e>n.x+n.w||t<n.y||t>n.y+n.h||(this.pressed=!0,this.redraw(),!0)}handlePointerUp(e,t){if(!this.open)return!1;let n=this.button,r=e>=n.x&&e<=n.x+n.w&&t>=n.y&&t<=n.y+n.h,i=this.pressed;return this.pressed=!1,this.redraw(),i&&r&&this.onMenu(),!0}redraw(){if(!this.open)return;let e=this.scale,t=this.rect;this.scrim.clear(),this.scrim.rect(0,0,this.canvasWidth,this.canvasHeight).fill({color:W.summary.scrimColour,alpha:W.summary.scrimAlpha}),this.panel.clear(),this.panel.roundRect(t.x,t.y,t.w,t.h,18*e).fill({color:W.summary.panelColour,alpha:.97}).stroke({color:W.summary.panelRimColour,alpha:.6,width:1.5*e});let n=this.button;this.buttonBg.clear(),this.buttonBg.roundRect(n.x,n.y,n.w,n.h,10*e).fill({color:this.pressed?2771563:W.summary.buttonColour,alpha:.95}).stroke({color:6269132,alpha:.7,width:1.2*e})}},Bh={left:[`KeyA`,`ArrowLeft`],right:[`KeyD`,`ArrowRight`],up:[`KeyW`,`ArrowUp`],down:[`KeyS`,`ArrowDown`],skill:[`KeyJ`,`Enter`],spit:[`KeyK`],compress:[`KeyL`],charge:[`Space`],burst:[`KeyK`],mute:[`KeyM`]},Vh=[`Digit1`,`Digit2`,`Digit3`],Hh=class{constructor(){K(this,`down`,new Set),K(this,`disposers`,[]),K(this,`axisX`,0),K(this,`axisY`,0),K(this,`dragFracX`,0),K(this,`dragFracY`,0),K(this,`dragHeld`,!1),K(this,`dragAimX`,0),K(this,`dragAimY`,0),K(this,`suctionHeld`,!1),K(this,`spitPressed`,!1),K(this,`compressKeyHeld`,!1),K(this,`compressTouchHeld`,!1),K(this,`chargeKeyHeld`,!1),K(this,`chargeTouchHeld`,!1),K(this,`chargeReleased`,!1),K(this,`burstPressed`,!1),K(this,`skillPressed`,!1),K(this,`skillKeyWasDown`,!1),K(this,`muteKeyWasDown`,!1),K(this,`spitKeyWasDown`,!1),K(this,`burstKeyWasDown`,!1),K(this,`levelupKeyWasDown`,[!1,!1,!1]),K(this,`levelupChoice`,null),K(this,`mutePressed`,!1)}addDrag(e,t){this.dragFracX+=e,this.dragFracY+=t}setDragAim(e,t){this.dragAimX=e,this.dragAimY=t}consumeDrag(){let e={x:this.dragFracX,y:this.dragFracY};return this.dragFracX=0,this.dragFracY=0,e}releaseDrag(){this.dragFracX=0,this.dragFracY=0,this.dragHeld=!1,this.dragAimX=0,this.dragAimY=0}get debugPendingDrag(){return{x:this.dragFracX,y:this.dragFracY}}get compressing(){return this.compressKeyHeld||this.compressTouchHeld}get charging(){return this.chargeKeyHeld||this.chargeTouchHeld}pressBurst(){this.burstPressed=!0}consumeBurst(){return this.burstPressed?(this.burstPressed=!1,!0):!1}pressChargeRelease(){this.chargeReleased=!0}consumeChargeRelease(){return this.chargeReleased?(this.chargeReleased=!1,!0):!1}setChargeHeld(e){this.chargeTouchHeld&&!e&&(this.chargeReleased=!0),this.chargeTouchHeld=e}get steering(){return this.axisX!==0||this.axisY!==0||this.dragHeld}get sucking(){return this.suctionHeld}attach(e){let t=e=>{let t=e;t.repeat||(this.down.add(t.code),(t.code===`Space`||t.code.startsWith(`Arrow`))&&t.preventDefault())},n=e=>{this.down.delete(e.code)},r=()=>this.down.clear();e.addEventListener(`keydown`,t),e.addEventListener(`keyup`,n),window.addEventListener(`blur`,r),this.disposers=[()=>e.removeEventListener(`keydown`,t),()=>e.removeEventListener(`keyup`,n),()=>window.removeEventListener(`blur`,r)]}update(){let e=e=>e.some(e=>this.down.has(e)),t=+!!e(Bh.right)-!!e(Bh.left),n=+!!e(Bh.up)-!!e(Bh.down);this.axisX=t,this.axisY=n;let r=e(Bh.skill);r&&!this.skillKeyWasDown&&(this.skillPressed=!0),this.skillKeyWasDown=r;let i=e(Bh.mute);i&&!this.muteKeyWasDown&&(this.mutePressed=!0),this.muteKeyWasDown=i;let a=e(Bh.spit);a&&!this.spitKeyWasDown&&(this.spitPressed=!0),this.spitKeyWasDown=a,this.compressKeyHeld=e(Bh.compress);let o=e(Bh.charge);this.chargeKeyHeld&&!o&&(this.chargeReleased=!0),this.chargeKeyHeld=o;let s=e(Bh.burst);s&&!this.burstKeyWasDown&&(this.burstPressed=!0),this.burstKeyWasDown=s;for(let[e,t]of Vh.entries())this.down.has(t)&&!this.levelupKeyWasDown[e]&&(this.levelupChoice=e);this.levelupKeyWasDown=Vh.map(e=>this.down.has(e))}consumeLevelUpChoice(){let e=this.levelupChoice;return this.levelupChoice=null,e}consumeMute(){return this.mutePressed?(this.mutePressed=!1,!0):!1}pressSkill(){this.skillPressed=!0}pressSpit(){this.spitPressed=!0}setCompressHeld(e){this.compressTouchHeld=e}consumeSpit(){return this.spitPressed?(this.spitPressed=!1,!0):!1}clearSteering(){this.releaseDrag(),this.axisX=0,this.axisY=0,this.suctionHeld=!1,this.compressTouchHeld=!1,this.compressKeyHeld=!1,this.chargeTouchHeld=!1,this.chargeKeyHeld=!1}consumeSkill(){return this.skillPressed?(this.skillPressed=!1,!0):!1}detach(){for(let e of this.disposers)e();this.disposers=[],this.down.clear()}};function Uh(){return W.suction.fieldColor}var Wh=.8,Gh=class{get compressPulse(){return performance.now()/1e3*2.4*Math.PI*2}has(e){return this.controls.includes(e)}setControls(e){this.controls=e,this.update()}constructor(e){K(this,`input`,void 0),K(this,`root`,new j),K(this,`surface`,new z),K(this,`buttonGfx`,new z),K(this,`dragPointer`,null),K(this,`dragX`,0),K(this,`dragY`,0),K(this,`dragAnchorX`,0),K(this,`dragAnchorY`,0),K(this,`laneWidthPx`,0),K(this,`canvasHeightPx`,0),K(this,`suctionPointer`,null),K(this,`compressPointer`,null),K(this,`chargePointer`,null),K(this,`skillButton`,{x:0,y:0,radius:0}),K(this,`scale`,1),K(this,`hasSkill`,!1),K(this,`skillFlash`,0),K(this,`spitFlash`,0),K(this,`spitButton`,{x:0,y:0,radius:0}),K(this,`compressButton`,{x:0,y:0,radius:0}),K(this,`chargeButton`,{x:0,y:0,radius:0}),K(this,`chargeHold`,0),K(this,`burstButton`,{x:0,y:0,radius:0}),K(this,`burstFlash`,0),K(this,`controls`,nm().controls),this.input=e,this.root.eventMode=`none`,this.root.addChild(this.surface,this.buttonGfx),this.surface.eventMode=`none`,this.buttonGfx.eventMode=`none`}onPointerDown(e,t,n){if(this.has(`skill`)&&this.isInSkillButton(t,n)){this.input.pressSkill(),this.skillFlash=1,this.has(`suction`)&&this.suctionPointer===null?(this.suctionPointer=e,this.input.suctionHeld=!0):this.has(`charge`)&&this.chargePointer===null&&(this.chargePointer=e,this.input.setChargeHeld(!0)),this.update();return}if(this.has(`spit`)&&this.isInSpitButton(t,n)){this.input.pressSpit(),this.spitFlash=1,this.update();return}if(this.has(`burst`)&&this.isInBurstButton(t,n)){this.input.pressBurst(),this.burstFlash=1,this.update();return}if(this.has(`compress`)&&this.isInCompressButton(t,n)){this.compressPointer===null&&(this.compressPointer=e,this.input.setCompressHeld(!0)),this.update();return}this.dragPointer===null&&(this.dragPointer=e,this.dragX=t,this.dragY=n,this.dragAnchorX=t,this.dragAnchorY=n,this.input.dragHeld=!0,this.input.setDragAim(0,0))}onPointerMove(e,t,n){if(this.dragPointer!==e)return;let r=t-this.dragX,i=-(n-this.dragY);this.dragX=t,this.dragY=n,this.laneWidthPx>0&&this.canvasHeightPx>0&&this.input.addDrag(r/this.laneWidthPx,i/this.canvasHeightPx),this.input.setDragAim(t-this.dragAnchorX,-(n-this.dragAnchorY))}onPointerUp(e){this.suctionPointer===e&&(this.suctionPointer=null,this.input.suctionHeld=!1,this.update()),this.compressPointer===e&&(this.compressPointer=null,this.input.setCompressHeld(!1),this.update()),this.chargePointer===e&&(this.chargePointer=null,this.chargeHold=0,this.input.setChargeHeld(!1),this.update()),this.dragPointer===e&&(this.dragPointer=null,this.input.releaseDrag())}releaseAll(){this.dragPointer=null,this.suctionPointer=null,this.compressPointer=null,this.chargePointer=null,this.chargeHold=0,this.input.releaseDrag(),this.input.suctionHeld=!1,this.input.setCompressHeld(!1),this.input.setChargeHeld(!1),this.update()}setHasSkill(e){this.hasSkill!==e&&(this.hasSkill=e,this.update())}isInSkillButton(e,t){let n=e-this.skillButton.x,r=t-this.skillButton.y,i=this.skillButton.radius*1.35;return n*n+r*r<=i*i}isInSpitButton(e,t){let n=e-this.spitButton.x,r=t-this.spitButton.y,i=this.spitButton.radius*1.35;return n*n+r*r<=i*i}isInCompressButton(e,t){let n=e-this.compressButton.x,r=t-this.compressButton.y,i=this.compressButton.radius*1.2;return n*n+r*r<=i*i}isInBurstButton(e,t){let n=e-this.burstButton.x,r=t-this.burstButton.y,i=this.burstButton.radius*1.35;return n*n+r*r<=i*i}drawBurstButton(){let e=this.buttonGfx,t=this.burstButton;if(t.radius<=0)return;let n=W.angry.appearance[W.angry.appearance.length-1];if(this.burstFlash=Math.max(0,this.burstFlash-.05),this.burstFlash>0){let n=1.15+(1-this.burstFlash)*.7;e.circle(t.x,t.y,t.radius*n).stroke({color:W.angry.burst.waveColour,alpha:.5*this.burstFlash,width:Math.max(1,2.4*this.scale)})}e.circle(t.x,t.y,t.radius).fill({color:2757656,alpha:.72}),e.circle(t.x,t.y,t.radius).stroke({color:n.rim,alpha:.85,width:2});for(let n=0;n<3;n++)e.circle(t.x,t.y,t.radius*(.32+n*.24)).stroke({color:W.angry.burst.waveColour,alpha:.7-n*.18,width:Math.max(1,1.6*this.scale)});e.circle(t.x,t.y,t.radius*.18).fill({color:W.angry.burst.waveColour,alpha:.9})}layout(e,t,n,r){let i=Qu(n,r);this.scale=i,this.laneWidthPx=t,this.canvasHeightPx=r,this.surface.clear(),this.surface.rect(0,0,n,r).fill({color:16777215,alpha:.001});let a=W.touch,o=Math.min(a.buttonRadius*i,t*a.buttonMaxRadiusRatio),s=e+t-a.rightInset*i-o,c=a.buttonGap*i,l=r-a.bottomInset*i,u=e=>{let t={x:s,y:l-e,radius:e};return l=t.y-e-c,t};this.skillButton=u(o),this.chargeButton={...this.skillButton},this.spitButton=u(o),this.burstButton={...this.spitButton},this.compressButton=u(o*Wh),this.update()}update(){this.buttonGfx.clear(),this.has(`skill`)&&this.drawSkillButton(),this.has(`spit`)&&this.drawSpitButton(),this.has(`burst`)&&this.drawBurstButton(),this.has(`compress`)&&this.drawCompressButton()}drawCompressButton(){let e=this.buttonGfx,t=this.compressButton;if(t.radius<=0)return;let n=this.compressPointer!==null,r=10354648;if(n){let n=.5+.5*Math.sin(this.compressPulse);e.circle(t.x,t.y,t.radius*(1.3+.14*n)).fill({color:r,alpha:.12+.14*n}),e.circle(t.x,t.y,t.radius*(1.3+.14*n)).stroke({color:r,alpha:.8,width:Math.max(1,2*this.scale)})}e.circle(t.x,t.y,t.radius).fill({color:n?1586220:1780260,alpha:.66}),e.circle(t.x,t.y,t.radius).stroke({color:r,alpha:n?.95:.5,width:2});for(let r=0;r<4;r++){let i=r/4*Math.PI*2+Math.PI/4,a=t.radius*.8,o=t.radius*(n?.34:.52);e.moveTo(t.x+Math.cos(i)*a,t.y+Math.sin(i)*a),e.lineTo(t.x+Math.cos(i)*o,t.y+Math.sin(i)*o)}e.stroke({color:r,alpha:n?.95:.6,width:Math.max(1,1.8*this.scale)}),e.circle(t.x,t.y,t.radius*(n?.14:.22)).fill({color:14221296,alpha:.85})}drawSpitButton(){let e=this.buttonGfx,t=this.spitButton;if(!(t.radius<=0)){this.spitFlash=Math.max(0,this.spitFlash-.06),this.spitFlash>0&&e.circle(t.x,t.y,t.radius*(1.25+this.spitFlash*.35)).fill({color:16766073,alpha:.32*this.spitFlash}),e.circle(t.x,t.y,t.radius).fill({color:2761752,alpha:.72}),e.circle(t.x,t.y,t.radius).stroke({color:16766073,alpha:.85,width:2});for(let n=0;n<3;n++){let r=n/3*Math.PI*2-Math.PI/2,i=t.radius*.34,a=t.radius*.74;e.moveTo(t.x+Math.cos(r)*i,t.y+Math.sin(r)*i),e.lineTo(t.x+Math.cos(r)*a,t.y+Math.sin(r)*a)}e.stroke({color:16766073,alpha:.9,width:Math.max(1,2*this.scale)}),e.circle(t.x,t.y,t.radius*.2).fill({color:16773328,alpha:.9})}}drawSkillButton(){let e=this.buttonGfx,t=this.skillButton,n=this.has(`suction`)&&this.suctionPointer!==null,r=this.has(`charge`)&&this.chargePointer!==null,i=r?W.angry.appearance[W.angry.appearance.length-1].rim:Uh();if(this.skillFlash=Math.max(0,this.skillFlash-.05),this.skillFlash>0&&e.circle(t.x,t.y,t.radius*(1.2+this.skillFlash*.3)).fill({color:13081599,alpha:.3*this.skillFlash}),n&&(e.circle(t.x,t.y,t.radius*1.45).fill({color:Uh(),alpha:.18}),e.circle(t.x,t.y,t.radius*1.45).stroke({color:Uh(),alpha:.8,width:Math.max(1,2*this.scale)})),r?(this.chargeHold=Math.min(1,this.chargeHold+.035),e.circle(t.x,t.y,t.radius*(1.25+.2*this.chargeHold)).fill({color:i,alpha:.14+.2*this.chargeHold})):this.chargeHold=0,e.circle(t.x,t.y,t.radius).fill({color:n?1785687:r?3807764:1911364,alpha:.75}),e.circle(t.x,t.y,t.radius).stroke({color:n||r||this.has(`charge`)?i:13081599,alpha:this.hasSkill||n||r?.9:.45,width:2}),this.has(`charge`)){for(let n=0;n<4;n++){let i=n/4*Math.PI*2+Math.PI/4,a=t.radius*.42,o=t.radius*(r?.95:.78);e.moveTo(t.x+Math.cos(i)*a,t.y+Math.sin(i)*a),e.lineTo(t.x+Math.cos(i)*o,t.y+Math.sin(i)*o)}e.stroke({color:i,alpha:r?.95:.6,width:Math.max(1,2*this.scale)}),e.circle(t.x,t.y,t.radius*(.16+.2*this.chargeHold)).fill({color:16769232,alpha:.9})}else{for(let n=0;n<3;n++){let r=n/3*Math.PI*2-Math.PI/2,i=t.radius*.86,a=t.radius*.62;e.moveTo(t.x+Math.cos(r)*i,t.y+Math.sin(r)*i),e.lineTo(t.x+Math.cos(r)*a,t.y+Math.sin(r)*a)}e.stroke({color:Uh(),alpha:n?.95:.5,width:Math.max(1,1.6*this.scale)})}if(!this.hasSkill)return;let a=t.radius;e.moveTo(t.x,t.y-a*.5).lineTo(t.x+a*.16,t.y-a*.16).lineTo(t.x+a*.5,t.y).lineTo(t.x+a*.16,t.y+a*.16).lineTo(t.x,t.y+a*.5).lineTo(t.x-a*.16,t.y+a*.16).lineTo(t.x-a*.5,t.y).lineTo(t.x-a*.16,t.y-a*.16).closePath().fill({color:15259391,alpha:.95})}get debugState(){return{steering:this.dragPointer!==null,dragPointers:this.dragPointer===null?0:1,pendingX:this.input.debugPendingDrag.x,pendingY:this.input.debugPendingDrag.y,aimX:this.input.dragAimX,aimY:this.input.dragAimY,pointerAt:this.dragPointer===null?null:{x:this.dragX,y:this.dragY},hasSkill:this.hasSkill,sucking:this.input.suctionHeld,compressing:this.input.compressing,compressPointer:this.compressPointer}}get skillGeometry(){return{...this.skillButton}}get spitGeometry(){return{...this.spitButton}}get compressGeometry(){return{...this.compressButton}}get chargeGeometry(){return{...this.chargeButton}}get burstGeometry(){return{...this.burstButton}}get controlIds(){return this.controls}get layers(){return{surface:this.surface,button:this.buttonGfx}}};function Kh(e){let t=1;for(let n=e.parent;n;n=n.parent)t*=n.scale.y;return t<0}var qh=[`鱼屁泡`,`汽水泡`,`深海淤泥泡`],Jh=1.6,Yh=-.18,Xh=.25,Zh=class{get onSlam(){return this.run.slamSeconds>0&&this.run.bubbleType.look===`rage`}get overloaded(){return this.run.bubbleType.look===`rage`&&gp(this.run.rage)}constructor(e){K(this,`app`,void 0),K(this,`run`,new fh),K(this,`input`,new Hh),K(this,`camera`,new nd),K(this,`scene`,new id),K(this,`hud`,new ld),K(this,`touch`,new Gh(this.input)),K(this,`finishBanner`,X(`击败 BOSS  ·  通关`,15399423,W.hud.resultsCard.size)),K(this,`settings`,new kh),K(this,`music`,new Mh),K(this,`summary`,new zh),K(this,`menu`,new mh),K(this,`codex`,new _h),K(this,`pickups`,new z),K(this,`leaving`,new z),K(this,`bubble`,new z),K(this,`loading`,new Lh),K(this,`hitParticles`,new Nh),K(this,`chargeTrail`,new Ph),K(this,`pendingStart`,!1),K(this,`burstWave`,new z),K(this,`particles`,new z),K(this,`flash`,new z),K(this,`endTrace`,[]),K(this,`seedLabel`,qh[0]),K(this,`fps`,60),K(this,`accumulator`,0),K(this,`frameCount`,0),K(this,`lastDelta`,0),K(this,`bannerSeen`,!1),K(this,`explosions`,[]),K(this,`shake`,{seconds:0,total:0,pixels:0}),K(this,`phaseBeforePause`,`playing`),K(this,`runBanner`,X(``,14220287,20)),K(this,`pointerLog`,[]),K(this,`pointerPositions`,new Map),K(this,`talentLabel`,``),K(this,`bossView`,null),K(this,`progressView`,null),K(this,`audioMuted`,!1),K(this,`popups`,new ph(W.score.popups)),K(this,`damagePopups`,new ph(W.damagePopups)),K(this,`grazePopups`,new ph(W.grazePopups)),K(this,`callouts`,new ph(W.mutation.callouts)),K(this,`levelup`,new Ch),K(this,`grazeSlow`,0),K(this,`splash`,0),K(this,`bubbleSprite`,null),K(this,`bulletSprites`,[]),K(this,`bubbleSpriteFor`,``),K(this,`trackedBubbleId`,null),this.app=e,this.run.nominalSeconds=Ju(Y),this.scene.world.addChild(this.pickups,this.leaving,this.burstWave,this.bubble,this.particles),this.scene.world.addChild(this.hitParticles.graphics),this.scene.world.addChild(this.chargeTrail.root),this.flash.visible=!1,this.app.stage.addChild(this.scene.root,this.popups.root,this.damagePopups.root,this.grazePopups.root,this.callouts.root,this.flash,this.hud.root,this.touch.root),this.finishBanner.anchor.set(.5),this.finishBanner.alpha=0,this.app.stage.addChild(this.finishBanner),this.runBanner.anchor.set(.5),this.runBanner.alpha=0,this.app.stage.addChild(this.runBanner),this.app.stage.addChild(this.loading.root,this.settings.root,this.levelup.root,this.menu.root,this.codex.root,this.summary.root),this.levelup.onPick=e=>this.pickMutation(e),this.summary.onMenu=()=>this.exitToMenu(),this.settings.setVolume(mp.getVolume()),this.settings.setOpen(!1),this.settings.root.visible=!1,this.settings.onVolume=e=>mp.setVolume(e),this.settings.onOpen=()=>this.openSettings(),this.settings.onClose=()=>this.closeSettings(),this.settings.onRestart=()=>this.restartLevel(),this.settings.onInfiniteHealth=e=>{this.run.infiniteHealth=e},this.settings.onReducedFlash=e=>{cf(e)},this.settings.onExit=()=>this.exitToMenu(),this.menu.onStart=()=>{this.beginWithLoading()},this.menu.onCodex=()=>this.enterCodex(),this.menu.onPickLevel=e=>{this.run.progress.select(e)?this.refreshLevelMenu():this.menu.setLevelNote(`这一关还没解锁`,!1)},this.codex.onBack=()=>this.exitCodex(),this.refreshLevelMenu(),this.input.attach(window);let t=this.app.stage;t.eventMode=`static`,t.hitArea={contains:()=>!0},t.on(`pointerdown`,e=>this.handlePointerDown(e.pointerId,e.global.x,e.global.y)),t.on(`globalpointermove`,e=>this.handlePointerMove(e.pointerId,e.global.x,e.global.y)),t.on(`pointerup`,e=>this.handlePointerUp(e.pointerId)),t.on(`pointerupoutside`,e=>this.handlePointerUp(e.pointerId)),t.on(`pointercancel`,e=>this.handlePointerUp(e.pointerId)),this.rollSeed(),this.run.player.reset(),this.run.scrolled=0,this.camera.setScroll(0),this.run.player.syncToCamera(this.camera.y,this.camera.viewport.visibleDepthMeters),mp.silenceAmbience(),this.layout(),window.__GB={tuning:G,player:this.run.player,camera:this.camera,input:this.input,scene:this.scene,hud:this.hud,game:this,mechRef:W,layout:{computeViewport:Zu,designScale:Qu}},this.app.ticker.add(e=>this.frame(e.deltaMS/1e3))}get lateralSnapshot(){return this.run.lateral}handleResize(){this.layout()}get touchState(){return this.touch.debugState}logPointer(e,t,n,r){this.pointerLog.push({t:+this.run.elapsed.toFixed(2),kind:e,id:t,x:Math.round(n),y:Math.round(r)}),this.pointerLog.length>60&&this.pointerLog.shift()}handlePointerDown(e,t,n){if(mp.unlock(),this.logPointer(`down`,e,t,n),this.pointerPositions.set(e,{x:t,y:n}),this.run.phase===`menu`){this.menu.handlePointerDown(t,n);return}if(this.run.phase===`codex`){this.codex.handlePointerDown(t,n);return}this.run.phase!==`loading`&&(this.summary.handlePointerDown(t,n)||this.settings.handlePointerDown(e,t,n)||this.levelup.handlePointerDown(e,t,n)||this.run.phase!==`paused`&&this.touch.onPointerDown(e,t,n))}handlePointerMove(e,t,n){if(this.logPointer(`move`,e,t,n),this.pointerPositions.set(e,{x:t,y:n}),this.run.phase===`menu`){this.menu.handlePointerMove(t,n);return}this.run.phase!==`codex`&&this.run.phase!==`loading`&&(this.settings.handlePointerMove(e,t,n)||this.levelup.handlePointerMove(e,t,n)||this.run.phase!==`paused`&&this.touch.onPointerMove(e,t,n))}handlePointerUp(e){this.logPointer(`up`,e,-1,-1);let t=this.pointerPositions.get(e)??{x:-1,y:-1};if(this.pointerPositions.delete(e),this.run.phase===`menu`){this.menu.handlePointerUp(t.x,t.y);return}this.run.phase!==`codex`&&this.run.phase!==`loading`&&(this.summary.handlePointerUp(t.x,t.y)||this.settings.handlePointerUp(e,t.x,t.y)||this.levelup.handlePointerUp(e,t.x,t.y)||this.run.phase!==`paused`&&this.touch.onPointerUp(e))}get pointerTrace(){return this.pointerLog}get touchGeometry(){return this.touch.skillGeometry}get canvasSize(){return{width:this.app.renderer.screen.width,height:this.app.renderer.screen.height}}get touchRef(){return this.touch}get enemyBulletsRef(){return this.run.enemyBullets}get rateTierRef(){return this.run.rateTier}get bannerTextRef(){return this.runBanner.text}hazardArtSpriteRef(e){return Mf(e)}codexLureProbeRef(){return If.slice(-3)}get codexStateRef(){return this.codex.state}codexCardRectRef(e){return this.codex.cardRectForTest(e)}get codexPreviewRef(){return this.codex.previewForTest}handlePointerDownRef(e,t,n){this.handlePointerDown(e,t,n)}codexNextPageRef(){this.codex.nextPageForTest()}openCodexRef(){this.debugOpenCodexForTest()}async probeAssetsLoad(e){let t=await Nl(e);return t?`loaded `+t.width+`x`+t.height:`no texture for `+e}chargeTrailRiderRef(e){return this.chargeTrail.riderForTest(e)}get chargeTrailRef(){return this.chargeTrail.state}get hitParticlesRef(){return this.hitParticles.count}get bulletSpritesRef(){return this.bulletSprites}get bubbleSpriteRef2(){return this.bubbleSprite}get bubbleRef(){return this.bubble}get bubbleSpriteRef(){return!!this.bubbleSprite?.visible}get backdropLoadedRef(){return this.scene.backdropLoaded}get backdropErrorRef(){return this.scene.backdropError}get parallaxRef(){return this.scene.parallax}get summaryRef(){return this.summary}get musicRef(){return this.music}get chargeRef(){return this.run.charge}get gunStreamsRef(){return this.run.gunStreams}get scorePopupsRef(){return this.popups}get damagePopupsRef(){return this.damagePopups}get hudRef(){return this.hud}get levelRef(){return Y}get settingsRef(){return this.settings}canEatHazardForTest(e){return this.run.canSwallow(e)}get suctionUp(){return im(this.run.bubbleType,`suction`)?this.input.sucking:!1}suctionReachForTest(){return this.camera.viewport.laneWidthMeters*gd(this.run.player.volume)*this.run.suctionRadiusFactor}get codexRef(){return this.codex}debugOpenCodexForTest(){this.enterCodex()}debugSpawnObstacleOnPlayer(e,t=0){let n=this.camera.viewport.laneWidthMeters;this.run.obstacles.spawn(e,this.run.player.x*n,this.run.player.y+t)}demoteStageForTest(){return Jp(this.run.stage),this.run.player.stageSpeedMultiplier=this.run.stage.speedMultiplier,this.run.stage.stage}get menuRef(){return this.menu}debugStartRunWithRoute(e){return this.enterFromMenu(),this.run.pickRoute(e),this.applyFormToTouch(),this.run.route}debugRouteIds(){return $p.map(e=>e.id)}debugGrantMutationPoints(e){return this.run.xp.debugAddForTest(e),this.run.xp.pending}get levelupRef(){return this.levelup}useBurstForTest(){this.run.useBurst(this.worldView())}debugProgress(){return{cleared:[...this.run.progress.cleared],selected:this.run.progress.selected,ladder:this.run.progress.entries()}}debugClearLevel(e){let t=this.run.progress.clear(e);return this.refreshLevelMenu(),t}debugSelectLevel(e){return this.run.progress.select(e)?(this.refreshLevelMenu(),!0):!1}debugResetProgress(){this.run.progress.reset(),this.refreshLevelMenu()}debugInstallSpawnBlocks(e){let t=qu(e);return this.startRun(),t}debugGrantRageForTest(e){return bp(this.run.rage,e),this.run.rage.rage}get playerScreenPx(){let e=this.scene.world,t=this.camera.viewport,n=t.laneWidthMeters*Kp(this.run.stage.stage,this.run.player.volume);return{x:e.x+this.run.player.x*t.laneWidthMeters*e.scale.x,y:e.y+this.run.player.y*e.scale.y,radiusPx:n*e.scale.x}}get endTraceRef(){return this.endTrace}get spawnLogRef(){return this.run.spawnLog}waterColourAt(e,t){return od(e,t,Y)}debugSkipToLevelEnd(){this.run.scrolled=Y.scrollLength,this.run.timelineEmitted=Wu.length,this.run.field.placeTimeline(Wu,this.run.scrolled,this.camera.visibleWorldRange(0).max),this.run.field.takePending(),this.run.hazards.hazards=[],this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,this.camera.viewport.visibleDepthMeters)}onPointerDownForTest(e,t){this.touch.onPointerDown(1,e,t)}onPointerUpForTest(){this.touch.onPointerUp(1)}debugSpawnHazardOnPlayer(e){let t=this.camera.viewport.laneWidthMeters,n=this.run.hazards.spawnForTest(e,this.run.player.x*t,this.run.player.y);n.fuse=0,n.armed=!0}get audioRef(){return mp}get hazardsRef(){return this.run.hazards}bossAnimationRef(){return Pf(this.run.hazards)}hitFeedbackRef(){return Nf(this.run.hazards)}debugResetStats(){this.run.stats={absorbed:0,hits:0,maxVolume:this.run.stats.maxVolume,ended:this.run.stats.ended,overloads:this.run.stats.overloads,newRecord:!1},this.run.player.volume=G.volumeMax,this.run.player.slowRemaining=0,this.run.player.slowFactor=1,this.run.player.impulseVy=0,this.run.invulnerable=0,this.run.trashDrain=0,this.run.comedyBeats=0,this.run.lastComedyBeat=null,this.run.hazards.reset(),this.run.player.skillRemaining=0,this.run.player.skillId=null,this.run.player.skillAscentBonus=1,this.run.skillActivations=0,this.run.decoy=null}debugSetBaitEnabled(e){return this.run.hazards.baitEnabled=e,this.run.hazards.baitEnabled}debugSetSteadyCruise(){this.touch.releaseAll(),this.input.clearSteering()}debugSetTalent(e){let t=ym.find(t=>t.id===e);if(!t)throw Error(`unknown talent: ${e}`);return this.run.talentEffects=bm(t),this.run.player.ascentBonus=this.run.talentEffects.ascentMultiplier,this.run.player.steerScale=this.run.talentEffects.steerMultiplier,this.run.player.shrinkResistance=this.run.talentEffects.shrinkResistance,this.run.player.volume=this.run.talentEffects.startVolume,this.talentLabel=t.name,t.id}debugGrantSkill(e){let t=hm.find(t=>t.id===e);if(!t)throw Error(`unknown skill: ${e}`);return this.run.grantSkill(t.id),!0}debugReleaseFart(){return this.run.fartReadyAt=0,this.run.releaseFart(this.worldView()),this.run.farts}rollSeed(){this.seedLabel=qh[Math.floor(Math.random()*qh.length)]??qh[0]}layout(){let e=this.app.renderer.screen.width,t=this.app.renderer.screen.height;this.camera.viewport=Zu(e,t);let n=this.camera.viewport;this.run.lateral=sh(n.laneWidthMeters),this.scene.layout(n,Y),this.hud.layout(n),this.popups.layout(n),this.damagePopups.layout(n),this.grazePopups.layout(n),this.callouts.layout(n),this.touch.layout(n.left,n.laneWidthPx,e,t),this.settings.layout(n),this.levelup.layout(n),this.menu.layout(n),this.codex.layout(n),this.loading.layout(e,t),this.finishBanner.scale.set(n.scale),this.finishBanner.x=e/2,this.finishBanner.y=t*W.hud.resultsCard.yRatio,this.summary.layout(e,t),this.finishBanner.style.wordWrap=!0,this.finishBanner.style.breakWords=!0,this.finishBanner.style.wordWrapWidth=e*W.hud.resultsCard.widthRatio/n.scale;let r=Qu(e,t);this.runBanner.scale.set(r),this.runBanner.x=e/2,this.runBanner.y=56*r,this.runBanner.style.align=`center`,this.runBanner.style.wordWrap=!0,this.runBanner.style.breakWords=!0,this.runBanner.style.wordWrapWidth=e*.92/r,this.flash.clear(),this.flash.rect(0,0,e,t).fill({color:16777215,alpha:1})}frame(e){let t=Math.min(e,.05);this.frameCount++,this.lastDelta=e,this.fps+=((e>0?1/e:60)-this.fps)*.1,this.grazeSlow>0&&this.run.phase!==`paused`&&this.run.phase!==`levelup`&&this.run.phase!==`menu`&&this.run.phase!==`codex`&&(this.grazeSlow=Math.max(0,this.grazeSlow-t));let n=t*this.grazeTimeScale();this.accumulator+=n;let r=1/120,i=0;for(;this.accumulator>=r&&i<8;)this.step(r),this.applyRunEvents(),this.accumulator-=r,i++;this.render(n)}grazeTimeScale(){if(this.grazeSlow<=0)return 1;let e=W.graze,t=e.slowSeconds+e.recoverSeconds-this.grazeSlow;if(t<e.slowSeconds)return e.slowFactor;let n=Math.min(1,(t-e.slowSeconds)/Math.max(.01,e.recoverSeconds));return e.slowFactor+(1-e.slowFactor)*n}worldView(){let e=this.camera.visibleWorldRange(0);return{laneWidth:this.camera.viewport.laneWidthMeters,visibleDepthMeters:this.camera.viewport.visibleDepthMeters,min:e.min,max:e.max}}step(e){let t=this.worldView();if(this.input.update(),this.run.phase!==`menu`&&this.input.consumeMute()&&(this.audioMuted=mp.toggleMute()),this.run.phase===`levelup`){let e=this.input.consumeLevelUpChoice();e!==null&&this.pickMutation(e);return}if(this.run.phase===`paused`||this.run.phase===`menu`||this.run.phase===`codex`)return;this.run.invulnerable>0&&(this.run.invulnerable=Math.max(0,this.run.invulnerable-e)),this.updateTransientOverlays(e),this.run.hazards.tickDeaths(e);let n=this.camera.viewport,{min:r,max:i}=this.camera.visibleWorldRange(20);if(this.run.phase===`playing`||this.run.phase===`burst`){if(this.run.scrolled=Math.min(Y.scrollLength,this.run.scrolled+Y.scrollSpeed*e),this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,n.visibleDepthMeters),this.run.phase===`playing`){this.run.field.placeTimeline(Wu,this.run.scrolled,this.camera.visibleWorldRange(0).max);for(let e of this.run.field.takePending())this.run.emitTimelineEntry(e.entry,e.worldY,t.laneWidth,t),this.run.timelineEmitted++}}else this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,n.visibleDepthMeters);let a=this.suctionUp?{x:this.run.player.x*n.laneWidthMeters,y:this.run.player.y}:null;switch(this.run.player.suctionMoveFactor=a?W.suction.moveSpeedFactor:1,this.run.field.update(e,n.laneWidthMeters,r,i,this.run.player.volume,Y.scrollSpeed,a,this.run.suctionRadiusFactor),this.run.phase){case`intro`:{this.run.phaseTimer-=e,this.run.elapsed+=e;let t=Math.min(1,Math.max(0,1-this.run.phaseTimer/Jh)),n=1-(1-t)*(1-t);this.run.player.screenY=Yh+.43*n,this.run.phaseTimer<=0&&(this.run.player.screenY=Xh,this.run.phase=`playing`);return}case`cleared`:if(this.run.phaseTimer-=e,this.run.phaseTimer>0||this.run.hazards.dying)return;this.run.phase=`ascend`,this.run.ascendMetres=0;return;case`ascend`:{let t=this.camera.viewport.visibleDepthMeters;if(this.run.player.screenY=Math.min(1.4,this.run.player.screenY+W.audio.ascendScreensPerSecond*e),this.run.ascendMetres+=t*W.audio.ascendScreensPerSecond*e,this.run.player.screenY<1.15)return;this.finishLevelAndContinue();return}case`summary`:case`burst`:if(this.run.phaseTimer-=e,this.run.phaseTimer>0||this.run.phase===`summary`)return;if(this.run.pendingLevel){let e=this.run.pendingLevel;this.run.pendingLevel=null,this.enterLevel(e,!0);return}this.startRun();return;case`playing`:this.run.elapsedTotal+=e,this.run.xp.tick(e);for(let e of this.run.hazards.takeHitEvents())this.hitParticles.emit({x:e.x,y:e.y,radius:e.radiusFraction*this.camera.viewport.laneWidthMeters,kind:e.kind,colour:e.colour});for(let e of this.run.hazards.takeHeavyHits()){let t=W.hitFeedback;if(t.heavyShakePixels<=0||t.heavyShakeSeconds<=0)continue;let n=t.heavyShakePixels*e.strength*Qu(this.app.screen.width,this.app.screen.height);this.shake.seconds>t.heavyShakeSeconds&&this.shake.pixels>n||(this.shake={seconds:t.heavyShakeSeconds,total:t.heavyShakeSeconds,pixels:n})}this.hitParticles.update(e);for(let t of this.run.hazards.hazards){if(!t.charge)continue;let n=Cf(t.kind).telegraphSeconds;if(t.charge.elapsed<n)continue;let r=t.charge.toX-t.charge.fromX,i=t.charge.toY-t.charge.fromY,a=Math.hypot(r,i)||1;this.chargeTrail.ride(t.id,t.x,t.y,e,this.camera.viewport.laneWidthMeters,r/a,i/a)}this.chargeTrail.sweep()}this.run.updateBullets(e,n.laneWidthMeters,r,i),this.run.obstacles.update(e,r,i),this.run.elapsed+=e,mp.tick(e),mp.setAmbient(W.audio.ambientVolume),this.run.updateCharge(this.input),this.run.updateRage(e),this.input.consumeBurst()&&this.run.useBurst(t),this.run.player.update(this.input,e,this.run.lateral),this.run.player.syncToCamera(this.camera.y,n.visibleDepthMeters),this.run.player.clampToScreen(this.camera.y,n.visibleDepthMeters),this.run.resolveHazards(e,r,i,t.laneWidth,t,this.input),this.run.fireDepthEvents(),this.run.resolveContacts(e,t),this.input.consumeSkill()&&this.useSkill(),this.music.update(e),this.updateBoss(),this.progressView={total:Bu.length,cleared:this.run.levelsClearedInRun,current:Hu(Y.id)},this.run.updateConductiveCharge(e,n.laneWidthMeters),this.run.phase===`playing`&&this.run.xp.pending>0&&this.openLevelUp(),this.endTrace.push({scrolled:+this.run.scrolled.toFixed(1),hazards:this.run.hazards.hazards.length,bubbles:this.run.field.bubbles.length,emitted:this.run.timelineEmitted,total:Wu.length,phase:this.run.phase}),this.endTrace.length>8&&this.endTrace.shift()}useSkill(){let e=vm({player:this.run.player,hazards:this.run.hazards,bubbles:this.run.field.bubbles,carried:this.run.skill,laneWidth:this.camera.viewport.laneWidthMeters,elapsed:this.run.elapsed,events:this.run.events});return e?(this.run.invulnerable=Math.max(this.run.invulnerable,e.invulnerableSeconds),e.decoy&&(this.run.decoy=e.decoy),e.usesLeft<=0&&(this.run.skill=null,this.skillSlot(!1)),this.run.skillActivations++,!0):!1}openLevelUp(){this.run.phase=`levelup`,this.touch.releaseAll(),this.input.consumeLevelUpChoice(),this.levelup.openWith(Dh(this.run),this.run.route===null?`选择你的路线`:`突变 · 三选一`)}pickMutation(e){if(this.run.phase!==`levelup`||!this.levelup.open)return;let t=this.levelup.choiceAt(e);if(t){if(t.apply(this.run),Oh(this.run),t.id.startsWith(`route:`)&&this.applyFormToTouch(),this.run.xp.consume(),this.levelup.close(),am(this.run.events,`突变  ·  ${t.name}`),this.run.xp.pending>0){this.levelup.openWith(Dh(this.run),this.run.route===null?`选择你的路线`:`突变 · 三选一`);return}this.run.phase=`playing`,this.run.invulnerable=Math.max(this.run.invulnerable,W.mutation.resumeInvulnerableSeconds)}}async beginWithLoading(){this.pendingStart=!0,this.run.phase=`loading`,this.menu.root.visible=!1,this.touch.releaseAll(),this.loading.begin(),await Rl(Ml(),e=>this.loading.update(e)),await xf(),this.pendingStart&&(this.pendingStart=!1,this.enterFromMenu())}startRun(e=!1){this.run.player.reset(),this.run.player.screenY=Yh,this.run.stage=Hp(),this.run.player.stageSpeedMultiplier=this.run.stage.speedMultiplier,this.run.bullets.reset(),this.run.enemyBullets.reset(),e||(this.run.gunStreams=1,this.run.rateTier=1),this.summary.hide(),this.finishBanner.alpha=0,this.finishBanner.text=``,this.bossView=null,this.startLevelMusic(),e||(this.run.levelsClearedInRun=Hu(Y.id)),this.progressView=this.run.runComplete?null:{total:Bu.length,cleared:this.run.levelsClearedInRun,current:Hu(Y.id)},this.run.bossSpawned=!1,e||(this.run.pendingLevel=null),e||(this.run.score.reset(),this.run.runComplete=!1),this.popups.clear(),this.damagePopups.clear(),this.run.rage=hp(),this.run.charging=!1,this.run.slamSeconds=0,this.run.slams=0,this.run.obstacles.reset(),this.run.field.reset(),this.run.hazards.reset(),this.run.scrolled=0,this.run.timelineEmitted=0,this.endTrace.length=0,this.run.spawnLog.length=0,this.run.spawnedBySide={top:0,left:0,right:0,bottom:0},this.run.trashDrain=0,this.run.comedyBeats=0,this.run.lastComedyBeat=null,e||(this.run.skill=null,this.run.skillActivations=0,this.run.decoy=null,this.run.xp.reset(),this.run.mutations={},this.run.route=null,this.run.routeCardPending=!1,this.run.bubbleType=nm(),this.applyFormToTouch()),this.run.fartReadyAt=0,this.run.farts=0,this.run.eventsFired=new Set,this.run.eventsSeen=0,this.run.lastEvent=null,this.splash=0,this.run.surfaced=!1,this.skillSlot(this.run.skill!==null),this.run.elapsed=0,this.run.phase=`intro`,this.run.phaseTimer=Jh,this.run.invulnerable=0,this.run.stats={absorbed:0,hits:0,maxVolume:this.run.talentEffects.startVolume,ended:this.run.stats.ended,overloads:this.run.stats.overloads,newRecord:!1},this.rollSeed(),this.run.rollTalent(),Oh(this.run),this.talentLabel=this.run.talentEffects.talent.name}openSettings(){this.run.phase!==`paused`&&this.run.phase!==`menu`&&this.run.phase!==`codex`&&(this.phaseBeforePause=this.run.phase,this.run.phase=`paused`,this.touch.releaseAll(),this.settings.setVolume(mp.getVolume()),this.settings.setOpen(!0))}closeSettings(){this.run.phase===`paused`&&(this.settings.setOpen(!1),this.run.phase=this.phaseBeforePause)}restartLevel(){this.closeSettings(),this.startRun()}enterLevel(e,t){if(!Uu(e))return;let n=Hu(e);this.run.levelsClearedInRun=Math.max(this.run.levelsClearedInRun,n),this.startRun(t),this.banner(`第 ${n+1} 关  ·  ${Y.name}  ·  分数继承 ${this.run.score.value}`)}exitToMenu(){this.music.stop(),Uu(this.run.progress.selected),this.summary.hide(),this.settings.setOpen(!1),this.run.phase=`menu`,this.touch.releaseAll(),mp.silenceAmbience(),this.shake={seconds:0,total:0,pixels:0},this.splash=0,this.flash.alpha=0,this.flash.visible=!1,this.finishBanner.alpha=0,this.finishBanner.text=``,this.runBanner.alpha=0,this.explosions=[],this.app.stage.position.set(0,0),this.menu.root.visible=!0}refreshLevelMenu(){this.menu.setLevels(this.run.progress.entries());let e=this.run.progress.entries().find(e=>e.locked);if(e){let t=Bu[Hu(e.id)-1];this.menu.setLevelNote(t?`通关「${t.name}」后解锁「${e.name}」`:``,!1)}else this.menu.setLevelNote(``)}startLevelMusic(){let e=mp.musicBus();e&&this.music.attach(e.ctx,e.destination);let t=W.audio.music.tracks[Y.id];this.music.setVolume(mp.getVolume()*W.audio.music.volume),this.music.setTrack(t??null)}enterFromMenu(){this.menu.root.visible=!1,this.startRun()}applyFormToTouch(){this.touch.setControls(this.run.bubbleType.controls),this.touch.layout(this.camera.viewport.left,this.camera.viewport.laneWidthPx,this.app.renderer.screen.width,this.app.renderer.screen.height)}enterCodex(){this.run.phase=`codex`,this.codex.show(),Rl(Ml(),()=>{}).then(()=>xf()).then(()=>{this.run.phase===`codex`&&this.codex.refresh()})}exitCodex(){this.run.phase=`menu`,this.menu.root.visible=!0}updateBoss(){let e=Y.boss;if(!this.run.bossSpawned&&this.run.scrolled>=e.at){this.run.bossSpawned=!0;let t=this.camera.viewport.laneWidthMeters,n=this.camera.viewport.visibleDepthMeters,r=this.run.makeHazard(this.worldView(),`boss`,this.run.player.x*t,this.camera.y+n*.42,null,e.health);r.tint=e.colour??null,this.run.hazards.hazards.push(r),this.sound(`surface`),this.banner(`${e.name}  ·  击败它才能离开这一关`)}let t=this.run.hazards.hazards.find(e=>e.kind===`boss`);this.bossView=t&&!t.flee?{name:e.name,fraction:t.health/Math.max(1,t.maxHealth)}:null,this.run.phase===`playing`&&this.run.hazards.killed>0&&this.defeatBoss()}defeatBoss(){this.run.phase=`cleared`;let e=this.music.playSting(W.audio.clearSting.notes,W.audio.clearSting.gapSeconds);this.run.phaseTimer=e+W.audio.clearHoldSeconds,this.run.stats.ended++,this.scorePopup(this.run.player.x*this.camera.viewport.laneWidthMeters,this.run.player.y,this.run.score.award(`boss`)),this.run.xp.gain(`boss`),this.run.recordBest(),this.sound(`surface`),pm(this.run.events),mm(this.run.events);let t=`击败了 ${Y.boss.name}  ·  吸收 ${this.run.stats.absorbed}  ·  最大体积 ${this.run.stats.maxVolume.toFixed(1)}×  ·  ${this.run.elapsed.toFixed(1)}s`,n=this.run.progress.clear(Y.id);if(n){let e=Bu.find(e=>e.id===n);this.banner(`${t}\n新关卡解锁：${e?.name??n}`),this.refreshLevelMenu()}else this.banner(t);let r=Hu(Y.id),i=Bu[r+1];this.run.levelsClearedInRun=r+1,i?this.run.pendingLevel=i.id:this.run.runComplete=!0}finishLevelAndContinue(){if(this.run.pendingLevel){let e=this.run.pendingLevel;this.run.pendingLevel=null,this.enterLevel(e,!0);return}this.run.runComplete=!0,this.run.phase=`summary`,this.music.stop(),this.summary.show({score:this.run.score.value,levels:this.run.levelsClearedInRun,total:Bu.length,seconds:this.run.elapsedTotal,best:this.run.bestScore})}updateTransientOverlays(e){this.shake.seconds>0&&(this.shake.seconds=Math.max(0,this.shake.seconds-e)),this.splash>0&&(this.splash=Math.max(0,this.splash-e*1.5));for(let t=this.explosions.length-1;t>=0;t--){let n=this.explosions[t];n.age+=e,n.age>=W.explosions.seconds&&this.explosions.splice(t,1)}this.run.phase===`burst`&&this.run.runComplete===!1&&this.run.pendingLevel===null?(this.finishBanner.alpha=Math.min(1,this.finishBanner.alpha),this.finishBanner.text=this.run.surfaced?`击败 ${Y.boss.name}  ·  通关\n得分 ${this.run.score.value}  ·  吸收 ${this.run.stats.absorbed}  ·  最大 ${this.run.stats.maxVolume.toFixed(1)}×  ·  ${this.run.elapsed.toFixed(1)}s\n${this.run.stats.newRecord?`★ 新纪录`:`最好 ${Math.round(this.run.bestClimbed)}m`}  ·  最佳得分 ${this.run.bestScore}`:`破裂  ·  深度 ${Math.round(this.run.player.depth(Y.scrollLength))}m\n得分 ${this.run.score.value}  ·  吸收 ${this.run.stats.absorbed}  ·  爬升 ${Math.round(this.run.player.y)}m\n${this.run.stats.newRecord?`★ 新纪录`:`最好 ${Math.round(this.run.bestClimbed)}m`}  ·  最佳得分 ${this.run.bestScore}`):this.finishBanner.alpha>0&&(this.finishBanner.alpha=Math.max(0,this.finishBanner.alpha-e*1.8),this.finishBanner.alpha<=.01&&(this.finishBanner.alpha=0,this.finishBanner.text=``)),this.runBanner.alpha=Math.max(0,this.runBanner.alpha-e*.28)}banner(e){am(this.run.events,e)}sound(e,t=.5){om(this.run.events,e,t)}scorePopup(e,t,n){sm(this.run.events,e,t,n)}skillSlot(e){dm(this.run.events,e)}applyRunEvents(){for(let e of this.run.events)switch(e.kind){case`banner`:this.runBanner.text=e.text,this.runBanner.alpha=1,this.bannerSeen=!0;break;case`sound`:mp.play(e.event,e.intensity);break;case`scorePopup`:this.popups.add(e.x,e.y,e.points,this.camera);break;case`damagePopup`:this.damagePopups.add(e.x,e.y,e.amount,this.camera);break;case`graze`:this.grazePopups.say(e.x,e.y,W.grazePopups.prefix,this.camera),this.grazeSlow=W.graze.slowSeconds+W.graze.recoverSeconds;break;case`callout`:this.callouts.say(e.x,e.y,e.text,this.camera);break;case`skillSlot`:this.touch.setHasSkill(e.carried);break;case`blast`:{this.explosions.push({x:e.x,y:e.y,radius:e.radius,age:0});let t=W.hazards.bombfish;if(t.blastShakePixels>0&&t.blastShakeSeconds>0){let e=this.app.renderer.screen;this.shake={seconds:t.blastShakeSeconds,total:t.blastShakeSeconds,pixels:t.blastShakePixels*Qu(e.width,e.height)}}break}case`splash`:this.splash=1;break;case`results`:this.finishBanner.alpha=1}this.run.events.length=0}render(e){if(this.shake.seconds>0){let e=this.shake.seconds/Math.max(.001,this.shake.total),t=this.shake.pixels*e;this.app.stage.position.set(Math.sin(this.run.elapsed*61)*t,Math.cos(this.run.elapsed*47)*t)}else(this.app.stage.x!==0||this.app.stage.y!==0)&&this.app.stage.position.set(0,0);this.scene.update(this.camera,this.run.player,e,this.run.scrolled,Y);let t=this.run.phase===`menu`||this.run.phase===`codex`||this.run.phase===`loading`,n=this.run.phase===`menu`;this.hud.root.visible=!t,this.scene.root.visible=!t,this.touch.root.visible=!t&&!this.settings.isOpen&&this.run.phase!==`levelup`,this.flash.visible=this.flash.visible&&!t,t||(this.popups.update(e),this.damagePopups.update(e),this.grazePopups.update(e),this.callouts.update(e),this.hud.update({score:this.run.score.value,boss:this.bossView,progress:this.progressView,seed:this.seedLabel,talent:this.talentLabel,skill:this.run.skill?{name:this.run.skill.name,uses:this.run.skill.uses}:null,player:this.run.player,fps:this.fps,nominalSeconds:this.run.nominalSeconds,elapsed:this.run.elapsed,lateral:this.run.lateral,scrolled:this.run.scrolled,level:Y,world:{laneWidthMeters:this.camera.viewport.laneWidthMeters,visibleDepthMeters:this.camera.viewport.visibleDepthMeters},stage:{stage:this.run.stage.stage,name:Wp(this.run.stage.stage),absorbedInStage:this.run.stage.absorbedInStage,grows:this.run.bubbleType.growsByAbsorbing,route:this.run.route,neededForNext:this.run.stage.neededForNext,mutation:{fraction:this.run.xp.fraction,level:this.run.xp.level,pending:this.run.xp.pending},resource:this.run.bubbleType.resource?{label:this.run.bubbleType.resource.label,text:this.overloaded?`${Math.round(this.run.rage.rage)}  ${Tp(this.run.rage.rage)}  ${this.run.rage.overloadLeft.toFixed(1)}s`:`${Math.round(this.run.rage.rage)}  ${Tp(this.run.rage.rage)}`,colour:Ep(this.run.rage.rage),fraction:Op(this.run.rage.rage)}:null}}),this.touch.update(),this.drawPickups(),this.drawBubble()),this.settings.root.visible=!t,this.settings.update(),this.popups.root.visible=!t,this.damagePopups.root.visible=!t,this.grazePopups.root.visible=!t,this.callouts.root.visible=!t,t&&(this.popups.clear(),this.damagePopups.clear(),this.grazePopups.clear(),this.callouts.clear()),this.levelup.root.visible=this.run.phase===`levelup`,this.menu.root.visible=n,n&&this.menu.update(e),this.codex.root.visible=this.run.phase===`codex`,this.loading.root.visible=this.run.phase===`loading`,this.splash>0?(this.flash.alpha=Math.min(1,this.splash*1.6),this.flash.visible=this.flash.alpha>.01):this.flash.visible&&(this.flash.visible=!1)}drawPickups(){let e=this.camera.viewport.laneWidthMeters,t=this.pickups;t.clear();for(let n of this.run.field.bubbles){let r=e*n.radius,i=Math.sin(n.phase)*r*n.wobble,a=n.x+i,o=e*Kp(this.run.stage.stage,this.run.player.volume)>=r*.92,s=o?11465471:16766073;t.circle(a,n.y,r).fill({color:s,alpha:o?.3:.34}),t.circle(a-r*.3,n.y+r*.3,r*.68).fill({color:15400191,alpha:.16}),t.circle(a,n.y,r).stroke({color:s,alpha:o?.6:.95,width:r*(o?.09:.16)})}for(let e of this.run.field.specks)e.drift>0&&t.circle(e.x,e.y,e.r);t.fill({color:15400191,alpha:.34});for(let e of this.run.field.specks)e.drift<=0&&t.circle(e.x,e.y,e.r);t.fill({color:14677759,alpha:.18}),lp(t,this.run.hazards,e,this.run.elapsed,e=>this.run.canSwallow(e),`in-play`,this.run.player.x*e),this.leaving.alpha=W.hazards.fleeAlpha;let n=this.leaving;if(n.clear(),lp(n,this.run.hazards,e,this.run.elapsed,e=>this.run.canSwallow(e),`leaving`,this.run.player.x*e),hu(t,this.run.obstacles,e),this.suctionUp){let n=this.run.player.x*e,r=this.run.player.y,i=e*gd(this.run.player.volume);t.circle(n,r,i).fill({color:W.suction.fieldColor,alpha:W.suction.fieldAlpha*.35}),t.circle(n,r,i).stroke({color:W.suction.fieldColor,alpha:W.suction.fieldAlpha,width:Math.max(1,e*W.suction.fieldWidthRatio)});for(let a=0;a<2;a++){let o=((this.run.elapsed*.9+a*.5)%1+1)%1,s=i*(1-o*.75);t.circle(n,r,s).stroke({color:W.suction.fieldColor,alpha:W.suction.fieldAlpha*.8*o,width:Math.max(1,e*W.suction.fieldWidthRatio*.6)})}}let r=this.syncBulletSprites(t,e);if(this.hitParticles.draw(),r||dp(t,this.run.bullets,e,this.run.bulletRadiusMultiplier,this.run.bulletLifeMultiplier),pp(t,this.run.enemyBullets,e),this.run.decoy&&this.run.decoy.until>this.run.elapsed){let n=e*.052;t.circle(this.run.decoy.x,this.run.decoy.y,n).fill({color:13238248,alpha:.4}),t.circle(this.run.decoy.x,this.run.decoy.y,n).stroke({color:10354648,alpha:.95,width:n*.16}),t.circle(this.run.decoy.x,this.run.decoy.y,n*1.5).stroke({color:10354648,alpha:.3,width:n*.08})}else this.run.decoy&&(this.run.decoy=null);let i=W.explosions;for(let e of this.explosions){let n=Math.min(1,e.age/i.seconds),r=1-n,a=(e,t)=>e+(t-e)*n;t.circle(e.x,e.y,e.radius*a(i.strokeStartRatio,i.strokeEndRatio)).stroke({color:i.strokeColour,alpha:i.strokeAlpha*r,width:Math.max(1,e.radius*i.strokeWidthRatio*r)}),t.circle(e.x,e.y,e.radius*a(i.coreStartRatio,i.coreEndRatio)).fill({color:i.coreColour,alpha:i.coreAlpha*r})}let a=W.hazards.charge;if(this.run.charge>0&&this.run.phase===`playing`){let n=e*Kp(this.run.stage.stage,this.run.player.volume),r=Math.min(1,this.run.charge/Math.max(1,a.max)),i=this.run.charge>=a.chainAt,o=i?.7+.3*Math.sin(this.run.elapsed*26):1;t.circle(this.run.player.x*e,this.run.player.y,n*1.16).stroke({color:a.bubbleRingColour,alpha:(i?.85:.4)*r*o,width:Math.max(1,e*a.bubbleRingWidthRatio*(i?1.6:1))})}if(this.run.chargeBurst>0){let n=Math.max(0,this.run.chargeBurst/Math.max(.01,a.burstSeconds));t.circle(this.run.player.x*e,this.run.player.y,this.run.chargeBurstRadius*(1.6-.6*n)).stroke({color:a.burstColour,alpha:a.burstAlpha*n,width:Math.max(1,e*.03*n)})}}drawBubble(){let e=this.camera.viewport,t=this.run.phase===`burst`?1-Math.max(0,this.run.phaseTimer)/dh:0,n=1+t*1.8,r=this.run.phase===`burst`?Math.max(0,1-t*1.15):1,i=e.laneWidthMeters*Kp(this.run.stage.stage,this.run.player.volume)*1*n*(this.overloaded?1+W.angry.overload.radiusBonus:1),a=Yp(this.run.bubbleType,this.run.stage.stage,this.run.rage.rage),o=this.run.player.x*e.laneWidthMeters+Zp(a,this.run.elapsed)*e.laneWidthMeters,s=i*Xp(a,this.run.elapsed);this.drawBurstWave(o,this.run.player.y,a.rim);let c=this.run.invulnerable>0?.45+.55*Math.abs(Math.sin(this.run.invulnerable*22)):1;this.paintBubble(o,this.run.player.y,s,r*c)}bulgedEllipse(e,t,n,r,i){let a=this.bubble,o=[];for(let a=0;a<48;a++){let s=a/48*Math.PI*2,c=i(s);o.push(e+Math.cos(s)*n*c,t+Math.sin(s)*r*c)}return o.push(o[0],o[1]),a.poly(o),a}drawBurstWave(e,t,n){let r=this.burstWave;if(r.clear(),!this.run.burst)return;let i=W.angry.burst,a=Math.min(1,this.run.burst.seconds/i.waveSeconds),o=this.run.burst.radius*(.35+.65*a),s=1-a;r.circle(e,t,o).stroke({color:i.waveColour,alpha:.85*s,width:Math.max(1,o*i.waveWidthRatio)}),r.circle(e,t,o*.82).stroke({color:n,alpha:.5*s,width:Math.max(1,o*i.waveWidthRatio*.5)})}syncBulletSprites(e,t){let n=W.bullets;if(!n.image){for(let e of this.bulletSprites)e.visible=!1;return!1}let r=Fl(n.image);if(!r)return!1;let i=t*W.bullets.radiusRatio*2*n.imageScale/r.width;if(!Number.isFinite(i)||i<=0)return!0;let a=this.run.bullets.bullets;for(let[t,o]of a.entries()){let a=this.bulletSprites[t];a||(a=new M(r),a.anchor.set(.5),a.eventMode=`none`,e.parent?.addChildAt(a,e.parent.getChildIndex(e)),this.bulletSprites[t]=a),a.visible=!0,a.x=o.x,a.y=o.y,a.alpha=n.imageAlpha,a.tint=n.imageTint,a.scale.set(i,-Math.abs(i))}for(let e=a.length;e<this.bulletSprites.length;e++)this.bulletSprites[e].visible=!1;return!0}syncBubbleSprite(e,t,n,r){let i=W.playerBubble;if(!i.image)return this.bubbleSprite&&(this.bubbleSprite.visible=!1),!1;if(this.bubbleSpriteFor!==i.image){this.bubbleSpriteFor=i.image,this.bubbleSprite?.destroy(),this.bubbleSprite=null;let e=Fl(i.image);if(e){let t=new M(e);t.anchor.set(.5),t.eventMode=`none`,this.bubble.parent?.addChildAt(t,this.bubble.parent.getChildIndex(this.bubble)),this.bubbleSprite=t}}let a=this.bubbleSprite;if(!a)return!1;a.visible=r>.01,a.x=e,a.y=t,a.alpha=i.imageAlpha*r,a.tint=i.imageTint;let o=n*2*i.imageScale;if(a.texture.width<=0)return!1;let s=o/a.texture.width;if(!Number.isFinite(s)||s<=0)return!1;let c=Kh(a)?-1:1;return a.scale.set(s,s*c),a.rotation=i.imageRotation*Math.PI/180,!0}paintBubble(e,t,n,r){let i=this.bubble,a=this.particles;if(this.syncBubbleSprite(e,t,n,r)&&!W.playerBubble.keepDetails||(i.clear(),a.clear(),r<=.01))return;let o=Math.hypot(this.run.player.vx*100,this.run.player.vy),s=1+Math.min(o/600,.16),c=Yp(this.run.bubbleType,this.run.stage.stage,this.run.rage.rage);if(i.circle(e,t,n*c.glowOuterRadiusRatio).fill({color:c.glow,alpha:c.glowOuterAlpha*r}),i.circle(e,t,n*c.glowInnerRadiusRatio).fill({color:c.glow,alpha:c.glowInnerAlpha*r}),this.run.player.slowRemaining>0){let a=Math.min(1,this.run.player.slowRemaining/.4);i.circle(e,t,n*1.75).stroke({color:13081599,alpha:.75*r*a,width:n*.16}),i.circle(e,t,n*1.75).fill({color:13081599,alpha:.07*r*a})}if(this.run.player.misfiring){let a=W.hazards.eel.shockColor,o=.45+.55*Math.abs(Math.sin(this.run.elapsed*34)),s=[];for(let r=0;r<22;r++){let i=r/22*Math.PI*2,a=r%2==0?1.34:1.2;s.push(e+Math.cos(i)*n*a,t+Math.sin(i)*n*a)}s.push(s[0],s[1]),i.poly(s),i.stroke({color:a,alpha:o*r,width:n*W.hazards.eel.shockWidthRatio});for(let s=0;s<3;s++){let c=this.run.elapsed*5+s/3*Math.PI*2;i.moveTo(e+Math.cos(c)*n*1.3,t+Math.sin(c)*n*1.3).lineTo(e+Math.cos(c+.35)*n*1.75,t+Math.sin(c+.35)*n*1.75).stroke({color:a,alpha:.7*o*r,width:n*W.hazards.eel.shockWidthRatio*.6})}}let l=c.rim,u=c.rimAlpha*r,d=this.bulgedEllipse(e,t,n/s,n*s,()=>1);d.fill({color:c.inner,alpha:c.innerAlpha*r}),d.stroke({color:l,alpha:u,width:n*c.rimWidthRatio}),c.innerRing&&i.ellipse(e,t,n/s,n*s).stroke({color:l,alpha:c.innerRingAlpha*r,width:n*c.innerRingWidthRatio}),i.circle(e-n*.16,t+n*.14,n*.72).fill({color:c.sheen,alpha:c.sheenAlpha*r}),i.circle(e-n*.36,t+n*.38,n*.21).fill({color:c.specular,alpha:c.specularAlpha*r}),i.circle(e+n*.24,t-n*.3,n*.1).fill({color:c.specular,alpha:c.specularAlpha*.5*r});for(let r=0;r<3;r++){let i=this.run.elapsed*(.9+r*.23)+r*2.1,o=Math.sin(i)*n*.9,s=i*14%(n*3.4)+n*.9;a.circle(e+o,t-n-s,Math.max(.06,n*(.06+r*.02)))}a.fill({color:15269631,alpha:.24*r})}get diagnostics(){return Gm({player:this.run.player,field:this.run.field,hazards:this.run.hazards,obstacles:this.run.obstacles,bullets:this.run.bullets,enemyBullets:this.run.enemyBullets,score:this.run.score,xp:this.run.xp,progress:this.run.progress,stats:this.run.stats,stage:this.run.stage,bubbleType:this.run.bubbleType,route:this.run.route,gunStreams:this.run.gunStreams,lateral:this.run.lateral,rage:this.run.rage,talentEffects:this.run.talentEffects,phase:this.run.phase,phaseTimer:this.run.phaseTimer,scrolled:this.run.scrolled,elapsed:this.run.elapsed,timelineEmitted:this.run.timelineEmitted,spawnedBySide:this.run.spawnedBySide,skill:this.run.skill,skillActivations:this.run.skillActivations,invulnerable:this.run.invulnerable,burst:this.run.burst,bursts:this.run.bursts,chargeAim:this.run.chargeAim,charging:this.run.charging,comedyBeats:this.run.comedyBeats,lastComedyBeat:this.run.lastComedyBeat,lastEaten:this.run.lastEaten,lastEvent:this.run.lastEvent,farts:this.run.farts,slams:this.run.slams,slamSeconds:this.run.slamSeconds,trashDrain:this.run.trashDrain,eventsSeen:this.run.eventsSeen,eventsFired:this.run.eventsFired,bannerSeen:this.bannerSeen,surfaced:this.run.surfaced,bestClimbed:this.run.bestClimbed,bestScore:this.run.bestScore,bestVolume:this.run.bestVolume,nominalSeconds:this.run.nominalSeconds,overloaded:this.overloaded,onSlam:this.onSlam,suctionUp:this.suctionUp,burstRadiusRatio:this.run.burstRadiusRatio(),camera:this.camera,popups:this.popups,damagePopups:this.damagePopups,finishBanner:this.finishBanner,codex:this.codex,splash:this.splash,audioMuted:this.audioMuted,fps:this.fps,frameCount:this.frameCount,lastDelta:this.lastDelta})}teleportToSurface(){this.teleportToDistance(Y.scrollLength-.2)}teleportToDistance(e){this.run.scrolled=Math.max(0,Math.min(Y.scrollLength,e)),this.camera.setScroll(this.run.scrolled),this.run.player.syncToCamera(this.camera.y,this.camera.viewport.visibleDepthMeters),this.run.player.vy=0}spawnBubbleOnPlayer(e){let t=this.camera.viewport.laneWidthMeters,n=t*Kp(this.run.stage.stage,this.run.player.volume)*e/t;this.run.field.addTestBubble({x:this.run.player.x*t,y:this.run.player.y,vy:0,radius:n,volume:Fp(n),phase:0,wobble:G.bubbleWobbleMin,held:!0})}spawnFallingBubbleOnPlayer(e){let t=this.camera.viewport.laneWidthMeters,n=t*Kp(this.run.stage.stage,this.run.player.volume)*e/t,r=Fp(n),i=this.run.player.vy>0?this.run.player.vy:1.7,a=Rp(r,this.run.player.volume)*i;this.run.field.addTestBubble({x:this.run.player.x*t,y:this.run.player.y,vy:a,radius:n,volume:r,phase:0,wobble:G.bubbleWobbleMin,held:!0})}debugForceHit(){this.run.invulnerable=0,this.run.takeHit()}get obstaclesRef(){return this.run.obstacles}get fieldRef(){return this.run.field}debugSwallowForTest(e){let t=this.run.player.volume;this.run.player.volume=Mp(this.run.player.volume,hd(e));let n=this.run.player.volume-t;return this.run.stats.absorbed++,this.scorePopup(this.run.player.x*this.camera.viewport.laneWidthMeters,this.run.player.y,this.run.score.award(`eaten`)),this.run.xp.gain(`eaten`),n}debugSolveCollectableVelocity(e,t){return this.run.field.solveBubbleVelocity(e,t)}debugSolveCollectableVelocityAtRef(e,t,n){return Rp(e,t)*n}debugTrackBubble(){let e=this.run.field.bubbles.find(e=>this.camera.toScreenY(e.y)>0&&this.camera.toScreenY(e.y)<this.camera.viewport.height);return this.trackedBubbleId=e?e.id:null,this.trackedBubbleId}debugMotion(){let e=this.camera,t=this.run.field.bubbles.reduce((e,t)=>!e||Math.abs(t.y-this.run.player.y)<Math.abs(e.y-this.run.player.y)?t:e,null),n=this.run.field.specks.find(e=>e.drift<=0)??null,r=this.run.field.specks.find(e=>e.drift>0)??null,i=this.trackedBubbleId===null?null:this.run.field.bubbles.find(e=>e.id===this.trackedBubbleId)??null;return{playerScreenY:+e.toScreenY(this.run.player.y).toFixed(2),playerScreenYRatio:+(e.toScreenY(this.run.player.y)/e.viewport.height).toFixed(4),cameraY:+e.y.toFixed(2),depth:+this.run.player.depth(Y.scrollLength).toFixed(2),nearestBubbleScreenY:t?+e.toScreenY(t.y).toFixed(2):null,nearestBubbleWorldY:t?+t.y.toFixed(2):null,nearestBubbleScreenSpeedPxPerS:t?+(t.vy*e.viewport.scale).toFixed(2):null,nearestBubbleFallMps:t?+t.vy.toFixed(3):null,trackedBubbleSizeRatio:i?+(i.radius/Math.max(1e-6,Kp(this.run.stage.stage,this.run.player.volume))).toFixed(3):null,trackedBubbleRiseRatio:i?+Lp(i.volume,this.run.player.volume).toFixed(3):null,trackedBubbleRelativeFallMps:i?+i.vy.toFixed(3):null,trackedBubbleScreenSpeedPxPerS:i?+(i.vy*e.viewport.scale).toFixed(3):null,scrollSpeedMps:Y.scrollSpeed,fieldScrollSpeedMps:+this.run.field.cruiseAscentSpeed.toFixed(3),collectables:this.run.field.bubbles.map(t=>({sizeRatio:+(t.radius/Math.max(1e-6,Kp(this.run.stage.stage,this.run.player.volume))).toFixed(3),wobble:+t.wobble.toFixed(3),relativeFallMps:+t.vy.toFixed(3),screenSpeedPxPerS:+(t.vy*e.viewport.scale).toFixed(1)})).sort((e,t)=>e.sizeRatio-t.sizeRatio),trackedBubbleId:i?i.id:null,trackedBubbleScreenY:i?+e.toScreenY(i.y).toFixed(2):null,speckScreenY:n?+e.toScreenY(n.y).toFixed(2):null,speckWorldY:n?+n.y.toFixed(2):null,nearSpeckScreenY:r?+e.toScreenY(r.y).toFixed(2):null,nearSpeckDrift:r?+r.drift.toFixed(2):null,farSpeckDrift:n?+n.drift.toFixed(2):null,ascentSpeed:+this.run.player.vy.toFixed(3)}}};async function Qh(){let e=document.getElementById(`app`)??document.body,t=e.getBoundingClientRect(),n=Math.max(1,Math.round(t.width||window.innerWidth)),r=Math.max(1,Math.round(t.height||window.innerHeight)),i=await ud();i.renderer.resize(n,r),i.canvas.style.position=`absolute`,i.canvas.style.inset=`0`,i.canvas.style.width=`100%`,i.canvas.style.height=`100%`,e.appendChild(i.canvas);let a=new Zh(i),o=0,s=0,c=()=>{let t=e.getBoundingClientRect(),n=Math.max(1,Math.round(t.width||window.innerWidth)),r=Math.max(1,Math.round(t.height||window.innerHeight));(n!==o||r!==s)&&(o=n,s=r,i.renderer.resize(n,r),a.handleResize())};new ResizeObserver(c).observe(e),window.addEventListener(`orientationchange`,()=>window.setTimeout(c,120)),window.visualViewport?.addEventListener(`resize`,c),c();let l=()=>({window:`${window.innerWidth}x${window.innerHeight}`,dpr:window.devicePixelRatio,visualViewport:window.visualViewport?`${Math.round(window.visualViewport.width)}x${Math.round(window.visualViewport.height)}`:`n/a`,mount:(()=>{let t=e.getBoundingClientRect();return`${Math.round(t.width)}x${Math.round(t.height)}`})(),canvasCss:`${i.canvas.clientWidth}x${i.canvas.clientHeight}`,canvasBuffer:`${i.canvas.width}x${i.canvas.height}`,screen:`${i.renderer.screen.width}x${i.renderer.screen.height}`,rendererRaw:`${i.renderer.width}x${i.renderer.height}`,resolution:i.renderer.resolution}),u=window.__GB;u.frame=l,console.info(`[bubble] boot`,l())}Qh();export{Or as n,kr as t};