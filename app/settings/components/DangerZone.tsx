"use client";

type Props = {

  onLogout: ()=>void;

  onDeleteAccount: ()=>void;

};

export default function DangerZone({

  onLogout,

  onDeleteAccount,

}:Props){

return(

<div className="rounded-3xl border border-red-800 bg-red-950/30 p-6">

<h2 className="mb-6 text-2xl font-bold text-red-400">

🚨 Danger Zone

</h2>

<div className="space-y-4">

<button

onClick={onLogout}

className="w-full rounded-xl bg-zinc-800 px-5 py-3 text-left transition hover:bg-zinc-700"

>

🚪 Logout

</button>

<button

onClick={onDeleteAccount}

className="w-full rounded-xl bg-red-600 px-5 py-3 text-left transition hover:bg-red-700"

>

🗑 Delete Account

</button>

</div>

</div>

);

}