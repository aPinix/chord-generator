import { ChordDesigner } from '@/components/chord-designer';
import { APP_DESCRIPTION } from '@/config/variables.config';

export default function Home() {
  return (
    <>
      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h1 className="mb-4 font-bold text-4xl tracking-tight sm:text-5xl">
            Design custom guitar chords with ease.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            {APP_DESCRIPTION} Perfect for musicians, teachers, and anyone
            learning to play guitar.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <ChordDesigner />
      </section>
    </>
  );
}
