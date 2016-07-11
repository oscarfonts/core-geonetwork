package org.fao.geonet.kernel.search.classifier;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.apache.lucene.facet.taxonomy.CategoryPath;

public class KnownValues implements Classifier {
	private List<String> values;

	public KnownValues(List<String> values) {
		this.values = values;
	}

	@Override
	public List<CategoryPath> classify(String value) {
		if (values.contains(value)) {
			return Collections.singletonList(new CategoryPath(value));
		} else {
			return new ArrayList<CategoryPath>();
		}
	}
}
