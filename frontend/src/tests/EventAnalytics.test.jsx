import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventAnalytics from '../components/analytics/EventAnalytics';
import userEvent from '@testing-library/user-event';

describe('EventAnalytics', () => {
    //Component rendering test//
  it('renders analytics dashboard', () => {
    render(
      <EventAnalytics
        registrations={[
          {
            eventType: 'Workshop',
            eventDate: '2026-08-20',
            department: 'Software Engineering',
          },
        ]}
      />
    );

    expect(screen.getByText('Event Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Registrations')).toBeInTheDocument();
    expect(screen.getByText('Registrations by Event Type')).toBeInTheDocument();
  });
});
//This tests your analytics calculation.//
it('shows correct total registrations', () => {
  render(
    <EventAnalytics
      registrations={[
        {
          eventType: 'Workshop',
          eventDate: '2026-08-20',
          department: 'SE',
        },
        {
          eventType: 'Seminar',
          eventDate: '2026-08-21',
          department: 'CS',
        },
        {
          eventType: 'Workshop',
          eventDate: '2026-08-22',
          department: 'SE',
        },
      ]}
    />
  );

  expect(screen.getByText('3')).toBeInTheDocument();
});
//Date filter interaction test//
it('filters registrations by date range', () => {
  const registrations = [
    {
      eventType: 'Workshop',
      eventDate: '2026-08-20',
      department: 'SE',
    },
    {
      eventType: 'Seminar',
      eventDate: '2026-08-25',
      department: 'CS',
    },
  ];

  render(
    <EventAnalytics registrations={registrations} />
  );

  const startDate = screen.getByLabelText('From');
  const endDate = screen.getByLabelText('To');

  // Set the date range directly
  fireEvent.change(startDate, {
    target: { value: '2026-08-20' },
  });

  fireEvent.change(endDate, {
    target: { value: '2026-08-20' },
  });

  // Only the registration on 2026-08-20 should remain
  expect(
    screen.getByTestId('total-registrations')
  ).toHaveTextContent('1');
});
//Clear filter test//
it('clears the selected date filter', async () => {
  const user = userEvent.setup();

  render(
    <EventAnalytics
      registrations={[
        {
          eventType: 'Workshop',
          eventDate: '2026-08-20',
          department: 'SE',
        },
        {
          eventType: 'Seminar',
          eventDate: '2026-08-25',
          department: 'CS',
        },
      ]}
    />
  );

  const startDate = screen.getByLabelText('From');

  await user.type(startDate, '2026-08-20');

  expect(screen.getByRole('button', { name: 'Clear Filter' }))
    .toBeInTheDocument();

  await user.click(
    screen.getByRole('button', { name: 'Clear Filter' })
  );

  expect(startDate).toHaveValue('');
});
//Empty state test//
it('shows empty state when there are no registrations', () => {
  render(<EventAnalytics registrations={[]} />);

  expect(
    screen.getByText('No registration data available')
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Register for an event to see analytics here.'
    )
  ).toBeInTheDocument();
});
