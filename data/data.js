module.exports = {
  truck: {
    statuses: {
      free: 'IS',
      load: 'OL',
    },
    types: ['SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT'],
    dims: [
      {
        name: 'SPRINTER',
        weight: 1700,
        length: 300,
        width: 250,
        height: 170,
      },
      {
        name: 'SMALL STRAIGHT',
        weight: 2500,
        length: 500,
        width: 250,
        height: 170,
      },
      {
        name: 'LARGE STRAIGHT',
        weight: 4000,
        length: 700,
        width: 350,
        height: 200,
      },
    ],
  },
  load: {
    statuses: ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'],
    states: [
      'En route to Pick Up',
      'Arrived to Pick Up',
      'En route to delivery',
      'Arrived to delivery',
    ],
  },
};
