import React from 'react';
import PageHero from '../c4/PageHero';
import { getAllCaseStudies } from './caseStudyData';

export default function PortfolioHero() {
  const count = getAllCaseStudies().length;
  const isSingle = count <= 1;

  return (
    <PageHero
      label="Selected Work"
      titleLines={
        isSingle
          ? ['Crafted with', 'precision & purpose']
          : ['Projects built with', 'precision & purpose']
      }
      description={
        isSingle
          ? 'Real work, real results. Every project we take on is built to perform — here\'s the proof.'
          : 'A curated selection of work across brand platforms, web applications, and digital experiences — each one designed to perform.'
      }
    />
  );
}