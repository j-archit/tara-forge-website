export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  accent: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "I got a One Piece figurine printed by TaraForge3D and it turned out amazing. Even with the distance between Delhi and Bangalore, everything went super smoothly. Great communication, professional work, and excellent print quality—he even performed some manual cleanup. Handled and shipped safely without any hassle. Highly recommended! 🙌",
    author: "u/ypiyush22",
    role: "Redditor",
    accent: "from-brand-gold/20"
  },
  {
    id: 2,
    quote: "We commissioned a batch of custom bagtags for our club's trip to the Chess World Cup 2025. TaraForge3D delivered high-quality, durable prints with great contrast and sharp details. The perfectly executed small-batch run was exactly what we needed for the event.",
    author: "Bangalore Chess Club",
    role: "Community Partner",
    accent: "from-blue-500/20"
  }
];
