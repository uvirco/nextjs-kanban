import { auth } from "@/auth";

export default async function ProfileHeader() {
  const session = await auth();

  const userName = session?.user?.name ? session.user.name : "Default Name";
  const userImage = session?.user?.image
    ? session.user.image
    : "default-image-url.jpg";
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-5 mb-10">
      <div className="shrink-0 grow-0 w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-xl font-semibold overflow-hidden">
        {userImage && userImage !== "default-image-url.jpg" ? (
          <img src={userImage} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{userName}</h1>
        <p className="text-zinc-400 text-sm">{session?.user?.email}</p>
      </div>
    </div>
  );
}
