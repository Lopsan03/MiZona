import React from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
}

const stats = [
  { value: '9 de cada 10', label: 'delitos no se denuncian' },
  { value: '+70%', label: 'se siente inseguro al caminar' },
  { value: '0 datos personales', label: 'requeridos para reportar' },
];

const pillars = [
  {
    title: '100% Anonimo',
    body: 'No guardamos tu nombre, telefono ni IP. Eres un hash en la red.',
  },
  {
    title: 'Inmutable',
    body: 'Nadie puede borrar un reporte. Ni por soborno ni por amenaza.',
  },
  {
    title: 'Comunitario',
    body: 'Las zonas rojas se actualizan por personas reales, no algoritmos de gobierno.',
  },
  {
    title: 'Predictivo',
    body: 'Detecta patrones y evita rutas antes de que el incidente ocurra.',
  },
];

const steps = [
  {
    title: '01. Testigo',
    body: 'Si ves o sufres un delito, abre Mi Zona. No te pediremos login ni datos personales.',
  },
  {
    title: '02. Reporte con un Tap',
    body: 'Elige el tipo de delito y ubicacion. El sistema genera una firma criptografica unica.',
  },
  {
    title: '03. Red de Alerta',
    body: 'Tu reporte aparece al instante en el mapa de todos. La comunidad ahora esta prevenida.',
  },
];

const blockchainPillars = [
  {
    title: 'Firma Unica',
    body: 'Sello digital que garantiza la integridad del reporte.',
  },
  {
    title: 'Privacidad Privada',
    body: 'Los datos nunca tocan una base centralizada.',
  },
  {
    title: 'Validacion Social',
    body: 'La red valida reportes cercanos eliminando el spam.',
  },
];

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#0b1220] text-slate-100">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.28),transparent_35%),linear-gradient(160deg,#020617_0%,#0f172a_55%,#111827_100%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full border border-emerald-300/20" />
        <div className="absolute -right-24 bottom-16 h-96 w-96 rounded-full border border-sky-300/20" />

        <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-20 pt-8 sm:px-8 md:px-10">
          <div className="mb-14 flex items-center justify-between">
            <div className="rounded-full border border-slate-300/20 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-emerald-200">
              MI ZONA
            </div>
            <button
              onClick={onEnterApp}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.14em] text-white transition hover:bg-white/20"
            >
              ENTRAR AL MAPA
            </button>
          </div>

          <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-sky-200">ALERTA CIUDADANA EN TIEMPO REAL</p>
              <h1 className="font-hero text-4xl uppercase leading-[1.02] text-white sm:text-6xl md:text-7xl">
                La calle que vas a tomar... ya fue reportada?
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Mi Zona es un mapa en tiempo real donde la gente reporta asaltos de forma anonima. Para que llegues a casa.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={onEnterApp}
                  className="rounded-2xl bg-emerald-400 px-6 py-3 font-black tracking-wide text-slate-900 transition hover:bg-emerald-300"
                >
                  PROTEGER MI RUTA
                </button>
                <a href="#realidad" className="rounded-2xl border border-white/20 px-6 py-3 font-bold tracking-wide text-white transition hover:bg-white/10">
                  VER REALIDAD
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/15 bg-white/8 p-5 backdrop-blur-md">
                  <p className="font-hero text-3xl uppercase text-emerald-300">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section id="realidad" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:px-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-rose-200">REALIDAD</p>
        <h2 className="font-hero mt-2 text-4xl uppercase leading-none text-white sm:text-5xl">Estamos caminando a ciegas.</h2>
        <div className="mt-8 space-y-4 text-slate-200">
          <p>En Mexico, la mayoria de lo que pasa... nunca se cuenta.</p>
          <p>9 de cada 10 delitos no se denuncian. No porque no importen. Sino porque reportarlos puede ser peligroso.</p>
          <p>Mas del 70% de las personas se sienten inseguras.</p>
          <p>Pero el problema no es solo el miedo... Es no saber donde esta el peligro.</p>
          <p>Y cuando alguien lo dice... muchas veces es demasiado tarde.</p>
          <p>La mayoria no confia en las autoridades para resolverlo.</p>
          <p className="font-bold text-white">Entonces la pregunta es: Quien nos cuida?</p>
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-sky-500/20">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 md:px-10">
          <p className="text-sm font-bold tracking-[0.25em] text-emerald-200">RESPUESTA</p>
          <h3 className="font-hero mt-2 text-5xl uppercase text-white sm:text-6xl">Nosotros.</h3>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:px-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-sky-200">LA APP</p>
        <h2 className="font-hero mt-2 text-4xl uppercase text-white sm:text-5xl">Tu ciudad, en tiempo real.</h2>
        <p className="mt-4 max-w-3xl text-slate-200">
          Cambiamos el mapa del miedo por el mapa de la prevencion ciudadana. Una app donde el reporte es tu escudo.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {pillars.map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/15 bg-white/5 p-6">
              <h3 className="font-hero text-2xl uppercase text-emerald-300">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:px-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-200">DEMO</p>
        <p className="mt-2 text-sm text-amber-100">Facil, rapido, seguro.</p>
        <h2 className="font-hero mt-2 text-4xl uppercase text-white sm:text-5xl">Como retomar el control en 3 clics.</h2>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="rounded-3xl border border-amber-200/20 bg-amber-100/5 p-6">
              <h3 className="font-hero text-2xl uppercase text-amber-300">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:px-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-teal-200">TECNOLOGIA</p>
        <h2 className="font-hero mt-2 text-4xl uppercase text-white sm:text-5xl">Blockchain: Tu verdad es intocable.</h2>
        <p className="mt-4 max-w-3xl text-slate-200">
          Usamos tecnologia de grado bancario para la seguridad de tu colonia. Blockchain no es criptomonedas, es honestidad digital.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {blockchainPillars.map((item) => (
            <article key={item.title} className="rounded-3xl border border-teal-200/20 bg-teal-100/5 p-6">
              <h3 className="font-hero text-2xl uppercase text-teal-300">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-200">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:px-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-rose-200">IMPACTO SOCIAL</p>
        <h2 className="font-hero mt-2 text-4xl uppercase text-white sm:text-5xl">No es una app. Es un movimiento.</h2>
        <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-200">
          Estamos construyendo la infraestructura de paz mas grande de Mexico. Cada reporte es una calle que recuperamos. Cada usuario es una luz en la oscuridad.
        </p>
      </section>

      <section className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-20 sm:px-8 md:px-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-200">CTA FINAL</p>
          <h2 className="font-hero text-4xl uppercase text-white sm:text-5xl">Listo para volver a salir?</h2>
          <p className="max-w-3xl text-slate-200">
            Unete a las miles de personas que estan iluminando el mapa de Mexico. Descarga Mi Zona y protege a los tuyos.
          </p>
          <div>
            <button
              onClick={onEnterApp}
              className="rounded-2xl bg-emerald-400 px-7 py-3 text-sm font-black tracking-[0.15em] text-slate-900 transition hover:bg-emerald-300"
            >
              ABRIR MI ZONA
            </button>
          </div>
          <p className="pt-8 text-xs text-slate-400">© 2026 Mi Zona - Anonimato para protegerte. Blockchain para confiar.</p>
        </div>
      </section>
    </div>
  );
}