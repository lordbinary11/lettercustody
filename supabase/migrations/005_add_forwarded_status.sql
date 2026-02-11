-- Add 'forwarded' status to letter_status enum
ALTER TYPE letter_status ADD VALUE 'forwarded';

-- Add 'forwarded' status to movement_status enum
ALTER TYPE movement_status ADD VALUE 'forwarded';
