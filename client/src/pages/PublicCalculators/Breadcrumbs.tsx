import { Link, Typography } from '@mui/material';
import { Fragment } from 'react';

import Row from '@/components/shared/layout/containers/Row';
import { BreadcrumbItem } from '@/pages/PublicCalculators/buildCalculatorSchemas';
import { getProseStyle } from '@/pages/PublicCalculators/styles';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <Row component="nav" aria-label="breadcrumb" spacing={0.75} flexWrap="wrap" sx={getProseStyle()}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;

      return (
        <Fragment key={item.path}>
          {isLast ? (
            <Typography variant="caption" color="text.secondary" aria-current="page">
              {item.label}
            </Typography>
          ) : (
            <Link href={item.path} variant="caption" underline="hover" color="text.secondary">
              {item.label}
            </Link>
          )}
          {!isLast && (
            <Typography variant="caption" color="text.disabled" aria-hidden="true">
              ›
            </Typography>
          )}
        </Fragment>
      );
    })}
  </Row>
);

export default Breadcrumbs;
