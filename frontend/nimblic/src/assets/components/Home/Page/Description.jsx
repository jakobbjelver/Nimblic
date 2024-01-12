import { ShieldCheckIcon, ChatBubbleOvalLeftEllipsisIcon, CursorArrowRaysIcon, SparklesIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Commitment to Data Privacy',
    description:
      "Your data's privacy is our top priority. We ensure secure processing with server-side caching, and immediate deletion post-analysis. Analyze with peace of mind.",
    icon: ShieldCheckIcon,
  },
  {
    name: 'AI Chat Assistant',
    description:
      'Got questions? Our AI chat assistant is here to provide in-depth answers and assist with complex data queries, making your analysis journey smoother.',
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
  {
    name: 'Sleek, Modern, User-Friendly',
    description:
      'Experience data analysis like never before. Our state-of-the-art web interface is designed for efficiency, ease of use, and a visually engaging experience.',
    icon: CursorArrowRaysIcon,
  },
  {
    name: 'Data Compatibility',
    description:
      'From CSV to JSON, our platform supports a wide range of common file types and data formats, meaning you can focus on analyzing your data, without worrying about compatibility.',
    icon: SparklesIcon,
  },
]

function Description() {
  return (
    <div className="py-16 sm:py-24" id="description" >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto w-fit max-w-4xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-secondary">Use without worries</h2>
          <div>
            <h3 className="mt-2 md:text-4xl font-bold tracking-tight text-3xl font-nunito group">
              Everything you need to discover your data
              <a href="#description" className="md:text-3xl text-xl ml-2 opacity-0 group-hover:opacity-100 text-neutral-content/80 no-underline hover:text-neutral-content/90">#</a>
            </h3>
          </div>
          <p className="mt-6 text-lg leading-8 ">
            Nimblic  is designed to bring the power of advanced data analysis to your fingertips in a way that's easy to understand and use. We prioritize both ease of use and in-depth analysis, making our platform a go-to choice for your initial look at your dataset.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature, index) => (
              <div key={feature.name} className="relative pl-16">
                <dt className={`font-semibold leading-7 ${index == 1 ? 'text-neutral-content/50' : ''}`}>
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <feature.icon className="h-6 w-6 text-white/80" aria-hidden="true" />
                  </div>
                  {feature.name}
                  {index == 1 && <span className="ml-2 badge badge-md badge-outline badge-primary"><p className="text-sans font-semibold text-xs">COMING SOON</p></span>}
                </dt>
                <dd className={`mt-2 text-base leading-7 ${index == 1 ? 'text-neutral-content/50' : ''}`}>{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Description