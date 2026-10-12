export const HeroBanner = () => (
  <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white shadow-lg sm:p-10 md:flex-row">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
        Des Burgers Savoureux, Livrés chez vous !
      </h1>
      <p className="mt-3 text-lg text-red-100">
        Commandez en quelques clics et faites-vous livrer directement à domicile.
      </p>
    </div>
  </div>
);