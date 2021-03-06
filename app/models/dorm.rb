class Dorm < ApplicationRecord
  has_many :suites
  has_many :rooms

  accepts_nested_attributes_for :rooms, allow_destroy: true
  accepts_nested_attributes_for :suites, allow_destroy: true

  validates :name, :presence => true

	def unassigned_rooms
		self.rooms.select { |r| !r.room_assignments.exists? }
	end

	def unassigned_rooms_number
		ur = self.unassigned_rooms
		ur.length
	end
end
