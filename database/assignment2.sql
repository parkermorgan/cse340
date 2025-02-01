INSERT INTO account
( account_firstname , account_lastname , account_email , account_password )
VALUES
( 'Tony' , 'Stark' , 'tony@starkent.com' , 'Iam1ronM@n')

UPDATE 
account
SET 
account_type = 'Admin'
WHERE
account_id = 1

DELETE
FROM
account
WHERE
account_id = 1

UPDATE
inventory
SET
inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE
inv_id = 10

SELECT
inv_make,
inv_model,
inventory.classification_id
FROM 
inventory
INNER JOIN classification
ON 
inventory.classification_id = classification.classification_id
WHERE
classification.classification_id = 2

UPDATE inventory
SET
	inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/imagas/vehicles/')