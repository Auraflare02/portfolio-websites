const {createClient}=window.supabase;
const SUPABASE_URL='https://hfvxgfmefxqdicavxjkq.supabase.co';
const SUPABASE_KEY='sb_publishable_uNsaL7O4l0ybny3dVyZFZw__rDkSWfS';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s);
const loginCard=$('#loginCard'),dashboard=$('#dashboard'),loginStatus=$('#loginStatus'),logout=$('#logout'),list=$('#list'),empty=$('#empty'),count=$('#count');
async function refresh(){const {data,error}=await supabase.from('hater_submissions').select('id,message,status,created_at').order('created_at',{ascending:false});if(error){loginStatus.textContent=error.message;return}count.textContent=data.length;empty.classList.toggle('hidden',data.length!==0);list.innerHTML=data.map(row=>`<article class="item"><div class="meta"><span>${new Date(row.created_at).toLocaleString()}</span><span>${row.status}</span></div><div class="text">${escapeHtml(row.message)}</div><div class="actions"><button class="approve" data-id="${row.id}" data-status="approved">APPROVE</button><button class="reject" data-id="${row.id}" data-status="rejected">REJECT</button><button class="delete" data-id="${row.id}">DELETE</button></div></article>`).join('')}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function boot(){const {data:{session}}=await supabase.auth.getSession();if(session){loginCard.classList.add('hidden');dashboard.classList.remove('hidden');logout.classList.remove('hidden');await refresh()}}
$('#login').onclick=async()=>{loginStatus.textContent='Signing in…';const {error}=await supabase.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});loginStatus.textContent=error?error.message:'';if(!error){loginCard.classList.add('hidden');dashboard.classList.remove('hidden');logout.classList.remove('hidden');await refresh()}};
$('#refresh').onclick=refresh;
logout.onclick=async()=>{await supabase.auth.signOut();location.reload()};
list.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.id;if(b.classList.contains('delete')){if(!confirm('Delete this submission?'))return;const {error}=await supabase.from('hater_submissions').delete().eq('id',id);if(error)alert(error.message);else refresh()}else{const {error}=await supabase.from('hater_submissions').update({status:b.dataset.status}).eq('id',id);if(error)alert(error.message);else refresh()}};
supabase.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')location.reload()});boot();
