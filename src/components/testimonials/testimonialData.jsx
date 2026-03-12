/**
 * Testimonials
 *
 * Placeholder entries below preserve the slider layout on the home page
 * and services page. Replace each with a real, verified testimonial as
 * they are collected. The `placeholder` flag can be used by components
 * to apply a visual indicator (e.g. subtle opacity or a "sample" badge).
 *
 * Schema: { id, quote, name, role, location, source, featured, placeholder? }
 */
export const TESTIMONIALS = [
  {
    id: 1,
    quote: 'The finished product exceeded every expectation. Thoughtful architecture, clean design, and a process that respected our time from start to finish. We would work with this studio again without hesitation.',
    name: 'Client Name',
    role: 'Role, Company',
    location: 'Location',
    source: 'Source',
    featured: true,
    placeholder: true,
  },
  {
    id: 2,
    quote: 'We came in with a rough idea and left with something far better than we imagined. The quality of the build, the speed of delivery, and the clarity of communication made the entire experience seamless.',
    name: 'Client Name',
    role: 'Role, Company',
    location: 'Location',
    source: 'Source',
    featured: true,
    placeholder: true,
  },
  {
    id: 3,
    quote: 'What set this apart was the level of care. Every detail was considered, every question was answered before we thought to ask it, and the final product speaks for itself. Premium work at every stage.',
    name: 'Client Name',
    role: 'Role, Company',
    location: 'Location',
    source: 'Source',
    featured: true,
    placeholder: true,
  },
];

export function getFeaturedTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured);
}

export function getAllTestimonials() {
  return TESTIMONIALS;
}