"""initial schema for users, jobs, reports, audit_logs, settings

Revision ID: 001_initial
Revises: 
Create Date: 2026-08-29 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('organization', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('sha256', sa.String(length=64), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(length=512), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('current_step', sa.String(length=100), nullable=False),
        sa.Column('estimated_time_remaining', sa.Integer(), nullable=False),
        sa.Column('logs', sa.JSON(), nullable=False),
        sa.Column('report_id', sa.String(length=36), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
    op.create_index(op.f('ix_jobs_sha256'), 'jobs', ['sha256'], unique=False)
    op.create_index(op.f('ix_jobs_status'), 'jobs', ['status'], unique=False)

    # Reports table
    op.create_table(
        'reports',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('job_id', sa.String(length=36), nullable=False),
        sa.Column('package_name', sa.String(length=255), nullable=False),
        sa.Column('app_name', sa.String(length=255), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('sha256', sa.String(length=64), nullable=False),
        sa.Column('file_size', sa.String(length=50), nullable=False),
        sa.Column('risk_score', sa.Integer(), nullable=False),
        sa.Column('risk_level', sa.String(length=50), nullable=False),
        sa.Column('risk_classification', sa.String(length=100), nullable=False),
        sa.Column('full_report_json', sa.JSON(), nullable=False),
        sa.Column('pdf_path', sa.String(length=512), nullable=True),
        sa.Column('user_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)
    op.create_index(op.f('ix_reports_job_id'), 'reports', ['job_id'], unique=False)
    op.create_index(op.f('ix_reports_package_name'), 'reports', ['package_name'], unique=False)
    op.create_index(op.f('ix_reports_risk_level'), 'reports', ['risk_level'], unique=False)
    op.create_index(op.f('ix_reports_sha256'), 'reports', ['sha256'], unique=False)

    # Audit Logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_email', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('event', sa.String(length=255), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_timestamp'), 'audit_logs', ['timestamp'], unique=False)

    # Settings table
    op.create_table(
        'settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('auto_delete_apks', sa.Boolean(), nullable=False),
        sa.Column('retain_history', sa.Boolean(), nullable=False),
        sa.Column('capability_tuning', sa.JSON(), nullable=False),
        sa.Column('risk_weights', sa.JSON(), nullable=False),
        sa.Column('threat_intel_sources', sa.JSON(), nullable=False),
        sa.Column('global_thresholds', sa.JSON(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('settings')
    op.drop_index(op.f('ix_audit_logs_timestamp'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_index(op.f('ix_reports_sha256'), table_name='reports')
    op.drop_index(op.f('ix_reports_risk_level'), table_name='reports')
    op.drop_index(op.f('ix_reports_package_name'), table_name='reports')
    op.drop_index(op.f('ix_reports_job_id'), table_name='reports')
    op.drop_index(op.f('ix_reports_id'), table_name='reports')
    op.drop_table('reports')
    op.drop_index(op.f('ix_jobs_status'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_sha256'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.drop_table('jobs')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
