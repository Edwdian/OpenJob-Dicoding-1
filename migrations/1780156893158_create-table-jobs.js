exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"categories"',
      onDelete: 'SET NULL',
    },
    title: {
      type: 'VARCHAR(200)',
      notNull: true,
    },
    description: {
      type: 'TEXT',
    },
    requirements: {
      type: 'TEXT',
    },
    salary_min: {
      type: 'BIGINT',
    },
    salary_max: {
      type: 'BIGINT',
    },
    location: {
      type: 'VARCHAR(150)',
    },
    type: {
      type: 'VARCHAR(50)',
    },
    status: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: 'open',
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};
