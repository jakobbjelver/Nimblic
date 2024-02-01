import React from 'react';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

const stats = [
    { id: 1, name: 'Types of analyses', value: 50, title: 'Diversity', suffix: '+' },
    { id: 2, name: 'Average processing time', value: 13, title: 'Faster than ever', suffix: 's' },
    { id: 3, name: 'Transparency for learning and trust', value: 100, title: 'Open Source', suffix: '%' },
];

export default function Stats() {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true, // Trigger animation only once
    });

    return (
        <div ref={ref} className="md:py-0 py-16 bg-transparent flex flex-col items-center justify-center h-fit w-screen">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 absolute">
                <dl className="stats stats-vertical lg:stats-horizontal shadow bg-base-100/20">
                    {stats.map((stat) => (
                        <div key={stat.id} className="stat min-w-max max-w-4xl w-72">
                            <div className="stat-title xl:text-2xl md:text-xl">{stat.title}</div>
                            <div className="stat-value xl:text-7xl text-5xl text-neutral-content/90">
                                {inView ? <CountUp end={stat.value} duration={1} /> : '0'}{stat.suffix}
                            </div>
                            <div className="stat-desc text-lg">{stat.name}</div>
                        </div>
                    ))}
                </dl>
            </div>
            <div className="left-1/2 -z-10 blur-3xl" aria-hidden="true">
                <div
                    className="aspect-[1155/278] w-[72.1875rem] bg-gradient-to-tr from-primary to-info opacity-30"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
        </div>
    );
}

