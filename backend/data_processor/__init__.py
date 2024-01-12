# __init__.py in the data_processing directory

from .summary import compile_summary
from .DataQuality.quality import data_quality_checks
from .Statistics.stats import perform_statistical_analysis
from .loader import load_data
from .graph_recommendation import recommend_graphs

# You can initialize any variables if required or leave it blank if you don't have any package-wide variables to set.

__all__ = [
    'compile_summary',
    'data_quality_checks',
    'perform_statistical_analysis',
    'recommend_graphs',
    'load_data',
    'celery_utils',
    'object_analysis'
]

# The __all__ list here is used to specify what symbols the package exposes. 
# It tells Python which names should be accessible when 'from data_processing import *' is used.
