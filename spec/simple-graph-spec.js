(function() {
	describe('Simple graph', function() {
		describe('node creation', function() {
			it('throws exception', function() {
				var nonStringId1 = function() {
					return new SG.Node(2);
				};
				var nonStringId2 = function() {
					return new SG.Node();
				};
				var nonStringId3 = function() {
					return new SG.Node({});
				};
				var emptyStringId = function() {
					return new SG.Node("");
				};

				expect(nonStringId1).toThrow("Invalid value for id.");
				expect(nonStringId2).toThrow("Invalid value for id.");
				expect(nonStringId3).toThrow("Invalid value for id.");
				expect(emptyStringId).toThrow("Invalid value for id.");
			});

			it('getId()', function() {
				var node = new SG.Node("Sofia");
				expect(node.getId()).toBe("Sofia");
			});
		});
	});
}());
